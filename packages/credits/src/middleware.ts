import type { Request, Response, NextFunction } from "express";
import { CreditWalletService } from "./wallet.js";

interface RequestWithContext extends Request {
  organizationId?: string;
  creditBalance?: number;
}

const walletService = new CreditWalletService();

export interface CreditCheckOptions {
  /**
   * Minimum credit balance required to proceed.
   * Requests are rejected with 402 when the org balance falls below this.
   * Default: 0 (any positive balance passes).
   */
  minimumBalance?: number;
}

/**
 * Express middleware that enforces a credit balance check before a request
 * reaches its handler.
 *
 * - Attaches `req.creditBalance` for downstream handlers to inspect.
 * - Responds 402 Payment Required when the balance is insufficient.
 * - Silently skips the check when no `organizationId` is present on the
 *   request (e.g. health-check routes that run before auth).
 *
 * @example
 * router.use(creditCheckMiddleware({ minimumBalance: 1 }));
 */
export function creditCheckMiddleware(options: CreditCheckOptions = {}) {
  const { minimumBalance = 0 } = options;

  return async function checkCredits(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const typedReq = req as RequestWithContext;
    const { organizationId } = typedReq;

    if (!organizationId) {
      next();
      return;
    }

    try {
      const balance = await walletService.getBalance(organizationId);
      typedReq.creditBalance = balance;

      if (balance < minimumBalance) {
        res.status(402).json({
          error: "Payment Required",
          message: `Insufficient credits. Required: ${minimumBalance}, available: ${balance}`,
          balance,
          minimumRequired: minimumBalance,
        });
        return;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Higher-order wrapper that:
 *  1. Checks credits before executing the wrapped handler
 *  2. Deducts the charged amount after a successful response
 *
 * Usage:
 *   router.post("/execute", withCreditDeduction({ cost: 10 }, myHandler));
 */
export function withCreditDeduction(
  options: { cost: number; referenceType?: string },
  handler: (req: Request, res: Response, next: NextFunction) => void | Promise<void>,
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const typedReq = req as RequestWithContext;
    const { organizationId } = typedReq;

    if (!organizationId) {
      return handler(req, res, next);
    }

    const has = await walletService
      .hasEnoughCredits(organizationId, options.cost)
      .catch(() => true); // fail open on wallet service error

    if (!has) {
      res.status(402).json({
        error: "Payment Required",
        message: `Insufficient credits for this operation (requires ${options.cost})`,
      });
      return;
    }

    // Intercept the response to deduct credits after a successful status
    const originalJson = res.json.bind(res);
    res.json = function patchedJson(body) {
      if (res.statusCode < 400 && organizationId) {
        walletService
          .deduct({
            organizationId,
            amount: options.cost,
            referenceType: options.referenceType ?? "api_request",
            description: `${req.method} ${req.path}`,
          })
          .catch((err) => {
            console.error("[Credits] Post-response deduction failed:", err);
          });
      }
      return originalJson(body);
    };

    return handler(req, res, next);
  };
}
