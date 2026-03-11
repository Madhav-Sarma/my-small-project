import { Router } from "express";
import { prisma } from "@aios/database";

export const billingRouter = Router();

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
