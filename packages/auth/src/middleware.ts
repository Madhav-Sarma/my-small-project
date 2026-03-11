import type { Request, Response, NextFunction } from "express";
import { verifyToken, type ClerkJWTPayload } from "./clerk.js";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  organizationId?: string;
  role?: string;
}

/**
 * Production authentication middleware.
 * Verifies Clerk JWT and attaches user identity to the request.
 * No development bypass — all requests must include a valid Bearer token.
 */
export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyToken(token);
    req.userId = payload.sub;
    req.organizationId = payload.org_id;
    req.role = payload.org_role ?? "member";
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
}
