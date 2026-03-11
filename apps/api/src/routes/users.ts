import { Router } from "express";
import { prisma } from "@aios/database";
import type { AuthenticatedRequest } from "@aios/auth";

export const usersRouter = Router();

/**
 * POST /users/bootstrap
 *
 * Called from the frontend after Clerk sign-in.
 * Ensures the authenticated user has a matching User, Organization,
 * CreditWallet, and Workspace row in the database.  If they already
 * exist the endpoint is a no-op and simply returns the profile.
 */
usersRouter.post("/bootstrap", async (req: AuthenticatedRequest, res) => {
  try {
    const clerkId = req.userId;
    if (!clerkId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Check if user already provisioned
    const existing = await prisma.user.findUnique({
      where: { externalId: clerkId },
      include: {
        organizationMemberships: { include: { organization: true } },
        workspaceMemberships: { include: { workspace: true } },
      },
    });

    if (existing) {
      res.json({ data: formatProfile(existing) });
      return;
    }

    // First login — provision inside a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          externalId: clerkId,
          email: (req.body as Record<string, unknown>).email as string ?? `${clerkId}@user.aios`,
          name: (req.body as Record<string, unknown>).name as string ?? "AIOS User",
          avatarUrl: (req.body as Record<string, unknown>).avatarUrl as string ?? null,
        },
      });

      const orgSlug = `org-${user.id.slice(0, 8)}`;
      const org = await tx.organization.create({
        data: {
          name: `${user.name}'s Org`,
          slug: orgSlug,
          isSolo: true,
          members: { create: { userId: user.id, role: "owner" } },
        },
      });

      // Seed a credit wallet with starter credits
      await tx.creditWallet.create({
        data: { organizationId: org.id, balance: 100 },
      });

      const workspace = await tx.workspace.create({
        data: {
          organizationId: org.id,
          name: "My Workspace",
          slug: "default",
          createdById: user.id,
          members: { create: { userId: user.id, role: "owner" } },
        },
      });

      return { user, org, workspace };
    });

    res.status(201).json({
      data: {
        id: result.user.id,
        externalId: result.user.externalId,
        email: result.user.email,
        name: result.user.name,
        organizationId: result.org.id,
        workspaceId: result.workspace.id,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bootstrap failed";
    res.status(500).json({ error: message });
  }
});

function formatProfile(user: any) {
  const org = user.organizationMemberships?.[0]?.organization;
  const ws = user.workspaceMemberships?.[0]?.workspace;
  return {
    id: user.id,
    externalId: user.externalId,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    organizationId: org?.id ?? null,
    workspaceId: ws?.id ?? null,
  };
}
