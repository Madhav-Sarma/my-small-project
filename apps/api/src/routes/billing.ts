import { Router } from "express";
import crypto from "node:crypto";
import { prisma } from "@aios/database";
import type { AuthenticatedRequest } from "@aios/auth";

export const billingRouter = Router();

// ─── Credit pack pricing (INR paise → credits) ────────────────────────────────
const CREDIT_PACKS: Record<number, { credits: number; amountPaise: number }> = {
  100: { credits: 100, amountPaise: 10000 },     // ₹100
  500: { credits: 550, amountPaise: 50000 },     // ₹500 (10% bonus)
  1000: { credits: 1200, amountPaise: 100000 },  // ₹1000 (20% bonus)
  5000: { credits: 6500, amountPaise: 500000 },  // ₹5000 (30% bonus)
};

// Get credit wallet
billingRouter.get("/wallet/:orgId", async (req, res) => {
  try {
    const wallet = await prisma.creditWallet.findUnique({ where: { organizationId: req.params.orgId } });
    if (!wallet) { res.status(404).json({ error: "Wallet not found" }); return; }
    res.json({ data: wallet });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch wallet" });
  }
});

// Purchase credits
billingRouter.post("/wallet/:orgId/purchase", async (req, res) => {
  try {
    const { amount, userId } = req.body;
    const wallet = await prisma.creditWallet.update({
      where: { organizationId: req.params.orgId },
      data: { balance: { increment: amount } },
    });

    await prisma.creditTransaction.create({
      data: {
        organizationId: req.params.orgId,
        userId,
        type: "purchase",
        amount,
        balanceAfter: wallet.balance,
        description: `Purchased ${amount} credits`,
      },
    });

    res.json({ data: wallet });
  } catch (error) {
    res.status(500).json({ error: "Failed to purchase credits" });
  }
});

// Credit transaction history
billingRouter.get("/transactions/:orgId", async (req, res) => {
  try {
    const transactions = await prisma.creditTransaction.findMany({
      where: { organizationId: req.params.orgId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ data: transactions });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Usage logs
billingRouter.get("/usage/:orgId", async (req, res) => {
  try {
    const logs = await prisma.usageLog.findMany({
      where: { organizationId: req.params.orgId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json({ data: logs });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch usage logs" });
  }
});

// Subscription info
billingRouter.get("/subscription/:orgId", async (req, res) => {
  try {
    const sub = await prisma.organizationSubscription.findUnique({
      where: { organizationId: req.params.orgId },
    });
    res.json({ data: sub });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
});

// ─── Razorpay: Create Order ────────────────────────────────────────────────────
billingRouter.post("/create-order", async (req: AuthenticatedRequest, res) => {
  try {
    const { amount } = req.body as { amount?: number };
    if (!amount || !CREDIT_PACKS[amount]) {
      res.status(400).json({ error: "Invalid credit pack amount. Choose from: " + Object.keys(CREDIT_PACKS).join(", ") });
      return;
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      res.status(503).json({ error: "Payment gateway not configured" });
      return;
    }

    const pack = CREDIT_PACKS[amount];

    // Create Razorpay order via REST API
    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
      },
      body: JSON.stringify({
        amount: pack.amountPaise,
        currency: "INR",
        receipt: `aios_${Date.now()}`,
        notes: {
          organizationId: req.organizationId ?? "default",
          userId: req.userId ?? "anonymous",
          credits: pack.credits,
        },
      }),
    });

    if (!orderRes.ok) {
      res.status(502).json({ error: "Failed to create Razorpay order" });
      return;
    }

    const order = (await orderRes.json()) as { id: string; amount: number; currency: string };

    // Persist payment order record
    await prisma.paymentOrder.create({
      data: {
        razorpayOrderId: order.id,
        organizationId: req.organizationId ?? "default",
        amountInPaisa: BigInt(pack.amountPaise),
        credits: pack.credits,
        status: "created",
        notes: { userId: req.userId ?? "anonymous" },
      },
    });

    res.json({
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId,
        credits: pack.credits,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

// ─── Razorpay: Verify Payment ──────────────────────────────────────────────────
billingRouter.post("/verify-payment", async (req: AuthenticatedRequest, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    };

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ error: "Missing payment verification fields" });
      return;
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      res.status(503).json({ error: "Payment gateway not configured" });
      return;
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      res.status(400).json({ error: "Invalid payment signature" });
      return;
    }

    // Find the payment order
    const paymentOrder = await prisma.paymentOrder.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
    });

    if (!paymentOrder) {
      res.status(404).json({ error: "Payment order not found" });
      return;
    }

    if (paymentOrder.status === "paid") {
      res.json({ data: { success: true, creditsAdded: paymentOrder.credits, alreadyProcessed: true } });
      return;
    }

    // Credit the wallet and update the payment order atomically
    await prisma.$transaction(async (tx) => {
      await tx.paymentOrder.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: { status: "paid", razorpayPaymentId: razorpay_payment_id, paidAt: new Date() },
      });

      await tx.creditWallet.upsert({
        where: { organizationId: paymentOrder.organizationId },
        create: { organizationId: paymentOrder.organizationId, balance: paymentOrder.credits },
        update: { balance: { increment: paymentOrder.credits } },
      });

      await tx.creditTransaction.create({
        data: {
          organizationId: paymentOrder.organizationId,
          userId: ((paymentOrder.notes as Record<string, unknown>)?.userId as string) ?? null,
          type: "purchase",
          amount: paymentOrder.credits,
          balanceAfter: 0,
          description: `Purchased ${paymentOrder.credits} credits via Razorpay`,
          referenceType: "payment",
          referenceId: razorpay_payment_id,
        },
      });
    });

    // Get updated balance for the transaction record
    const updatedWallet = await prisma.creditWallet.findUnique({
      where: { organizationId: paymentOrder.organizationId },
      select: { balance: true },
    });

    res.json({
      data: {
        success: true,
        creditsAdded: paymentOrder.credits,
        newBalance: updatedWallet ? Number(updatedWallet.balance) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Payment verification failed" });
  }
});
