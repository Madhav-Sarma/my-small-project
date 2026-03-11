import { prisma } from "@aios/database";
import type { Prisma } from "@aios/database";
import type {
  DeductCreditsOptions,
  AddCreditsOptions,
  WalletOperationResult,
  WalletBalance,
} from "./types.js";

/**
 * CreditWalletService
 *
 * Manages the organization-level credit wallet.  All balance mutations are
 * executed inside Prisma transactions to guarantee atomicity — no lost
 * updates even under concurrent requests.
 */
export class CreditWalletService {
  /**
   * Return the current balance for an organization.  Returns 0 if no wallet
   * record exists yet (rather than throwing).
   */
  async getBalance(organizationId: string): Promise<number> {
    const wallet = await prisma.creditWallet.findUnique({
      where: { organizationId },
      select: { balance: true },
    });
    return wallet ? Number(wallet.balance) : 0;
  }

  async getWallet(organizationId: string): Promise<WalletBalance> {
    const balance = await this.getBalance(organizationId);
    return { organizationId, balance };
  }

  /** Returns true when the org wallet holds at least `amount` credits. */
  async hasEnoughCredits(organizationId: string, amount: number): Promise<boolean> {
    const balance = await this.getBalance(organizationId);
    return balance >= amount;
  }

  /**
   * Atomically deduct `amount` credits from the organization wallet and
   * record a CreditTransaction of type "usage".
   *
   * Throws if the wallet does not exist or the balance is insufficient.
   */
  async deduct(options: DeductCreditsOptions): Promise<WalletOperationResult> {
    const {
      organizationId,
      userId,
      amount,
      description,
      referenceType,
      referenceId,
      metadata,
    } = options;

    const [updatedWallet, transaction] = await prisma.$transaction(async (tx) => {
      const wallet = await tx.creditWallet.findUnique({
        where: { organizationId },
      });

      if (!wallet) {
        throw new Error(
          `No credit wallet found for organization "${organizationId}". ` +
            "Ensure a wallet is created on org setup.",
        );
      }

      const currentBalance = Number(wallet.balance);
      if (currentBalance < amount) {
        throw new Error(
          `Insufficient credits: required ${amount}, available ${currentBalance}`,
        );
      }

      const newBalance = currentBalance - amount;

      const w = await tx.creditWallet.update({
        where: { organizationId },
        data: { balance: newBalance },
      });

      const txRecord = await tx.creditTransaction.create({
        data: {
          organizationId,
          userId: userId ?? null,
          type: "usage",
          // Stored as negative to represent outflow
          amount: -amount,
          balanceAfter: newBalance,
          description: description ?? "Credit deduction",
          referenceType: referenceType ?? null,
          referenceId: referenceId ?? null,
          metadata: (metadata ?? {}) as Prisma.InputJsonValue,
        },
      });

      return [w, txRecord] as const;
    });

    return {
      newBalance: Number(updatedWallet.balance),
      transactionId: transaction.id,
    };
  }

  /**
   * Add credits to an organization wallet (purchase, refund, subscription top-up, etc.).
   * Creates the wallet row if it does not exist yet.
   */
  async add(options: AddCreditsOptions): Promise<WalletOperationResult> {
    const {
      organizationId,
      userId,
      amount,
      type = "purchase",
      description,
      referenceType,
      referenceId,
      metadata,
    } = options;

    const [updatedWallet, transaction] = await prisma.$transaction(async (tx) => {
      const w = await tx.creditWallet.upsert({
        where: { organizationId },
        create: { organizationId, balance: amount },
        update: { balance: { increment: amount } },
      });

      const txRecord = await tx.creditTransaction.create({
        data: {
          organizationId,
          userId: userId ?? null,
          type,
          amount,
          balanceAfter: Number(w.balance),
          description: description ?? "Credit addition",
          referenceType: referenceType ?? null,
          referenceId: referenceId ?? null,
          metadata: (metadata ?? {}) as Prisma.InputJsonValue,
        },
      });

      return [w, txRecord] as const;
    });

    return {
      newBalance: Number(updatedWallet.balance),
      transactionId: transaction.id,
    };
  }

  /**
   * Issue a refund: re-add credits that were previously deducted.
   */
  async refund(options: Omit<AddCreditsOptions, "type">): Promise<WalletOperationResult> {
    return this.add({ ...options, type: "refund" });
  }
}
