import type { PrismaClient, Prisma } from "@prisma/client";
import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./middleware.js";

/** Wallet context attached to a request by {@link WalletMiddleware.checkCredits}. */
export interface WalletContext {
  organizationId: string;
  userId: string;
  requiredCredits: number;
}

/** Extended request type carrying the wallet context. */
export interface WalletRequest extends AuthenticatedRequest {
  walletContext?: WalletContext;
}

/** Returned by {@link createWalletMiddleware}. */
export interface WalletMiddleware {
  /**
   * Express middleware that verifies the organization has enough credits before execution.
   *
   * Attaches `req.walletContext` so downstream handlers know the reservation details.
   * Responds with HTTP 402 if the wallet is missing or the balance is insufficient.
   *
   * @param getRequired - Static credit count or a function deriving it from the request.
   */
  checkCredits(getRequired: number | ((req: WalletRequest) => number)): (
    req: WalletRequest,
    res: Response,
    next: NextFunction,
  ) => Promise<void>;

  /**
   * Deducts credits from the org wallet and persists a `usage` transaction.
   * Must be called after a successful tool / agent / workflow execution.
   *
   * @param organizationId - Owning organization.
   * @param userId         - User who triggered the execution.
   * @param amount         - Positive credit amount to deduct.
   * @param description    - Human-readable label for the transaction.
   * @param metadata       - Optional arbitrary JSON stored with the transaction.
   */
  deductCredits(
    organizationId: string,
    userId: string,
    amount: number,
    description: string,
    metadata?: Record<string, unknown>,
  ): Promise<void>;
}

/**
 * Creates wallet check/deduct middleware bound to a Prisma client instance.
 *
 * Designed to be used in two places within a tool-execution route:
 *   1. As pre-execution middleware via `checkCredits` to gate insufficient-balance requests early.
 *   2. After successful execution by calling `deductCredits` to record the actual spend.
 *
 * @example
 * const wallet = createWalletMiddleware(prisma);
 *
 * toolsRouter.post(
 *   "/:id/execute",
 *   authMiddleware,
 *   wallet.checkCredits((req) => req.body.estimatedCredits ?? 1),
 *   async (req: WalletRequest, res) => {
 *     const result = await engine.execute(...);
 *     if (result.success) {
 *       await wallet.deductCredits(req.walletContext!.organizationId, req.userId!, result.creditsCharged, "Tool execution");
 *     }
 *     res.json({ data: result });
 *   },
 * );
 */
export function createWalletMiddleware(prisma: PrismaClient): WalletMiddleware {
  function checkCredits(getRequired: number | ((req: WalletRequest) => number)) {
    return async (req: WalletRequest, res: Response, next: NextFunction): Promise<void> => {
      const { organizationId, userId } = req;

      if (!organizationId) {
        res.status(401).json({ error: "Organization ID required for credit check" });
        return;
      }

      const required = typeof getRequired === "function" ? getRequired(req) : getRequired;

      let balance: number;
      try {
        const wallet = await prisma.creditWallet.findUnique({
          where: { organizationId },
          select: { balance: true },
        });

        if (!wallet) {
          res.status(402).json({ error: "No credit wallet found for this organization" });
          return;
        }

        balance = Number(wallet.balance);
      } catch {
        res.status(500).json({ error: "Failed to verify credit balance" });
        return;
      }

      if (balance < required) {
        res.status(402).json({
          error: "Insufficient credits",
          balance,
          required,
          shortfall: required - balance,
        });
        return;
      }

      req.walletContext = { organizationId, userId: userId!, requiredCredits: required };
      next();
    };
  }

  async function deductCredits(
    organizationId: string,
    userId: string,
    amount: number,
    description: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    const wallet = await prisma.creditWallet.update({
      where: { organizationId },
      data: { balance: { decrement: amount } },
      select: { balance: true },
    });

    await prisma.creditTransaction.create({
      data: {
        organizationId,
        userId,
        type: "usage",
        amount,
        balanceAfter: wallet.balance,
        description,
      metadata: (metadata ?? {}) as Prisma.InputJsonObject,
      },
    });
  }

  return { checkCredits, deductCredits };
}
