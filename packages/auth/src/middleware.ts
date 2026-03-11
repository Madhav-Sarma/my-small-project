import type { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  organizationId?: string;
  role?: string;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // Integration point for Clerk/Auth0
  // In production, verify JWT and extract user claims
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Placeholder: extract from verified token
  req.userId = req.headers["x-user-id"] as string;
  req.organizationId = req.headers["x-org-id"] as string;
  req.role = req.headers["x-role"] as string ?? "member";
  next();
}
