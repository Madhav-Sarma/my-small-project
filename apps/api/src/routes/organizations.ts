import { Router } from "express";
import { prisma } from "@aios/database";

export const organizationsRouter = Router();

// Signup flow — create org + wallet + membership
organizationsRouter.post("/", async (req, res) => {
  try {
    const { name, userId, isSolo } = req.body;

    const org = await prisma.organization.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        isSolo: isSolo ?? true,
        members: { create: { userId, role: "owner" } },
        wallet: { create: { creditBalance: 0 } },
        subscription: { create: { tier: "free", status: "active", monthlyCredits: 100 } },
        creditWallet: { create: { balance: 100 } },
      },
      include: { members: true, wallet: true, subscription: true },
    });

    // Create default workspace
    await prisma.workspace.create({
      data: { name: "My Workspace", slug: "my-workspace", organizationId: org.id, createdById: userId },
    });

    res.status(201).json({ data: org });
  } catch (error) {
    res.status(500).json({ error: "Failed to create organization" });
  }
});

organizationsRouter.get("/:id", async (req, res) => {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: req.params.id },
      include: { members: true, wallet: true, subscription: true, workspaces: true },
    });
    if (!org) { res.status(404).json({ error: "Organization not found" }); return; }
    res.json({ data: org });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch organization" });
  }
});

// Add member
organizationsRouter.post("/:id/members", async (req, res) => {
  try {
    const member = await prisma.organizationMember.create({
      data: { organizationId: req.params.id, userId: req.body.userId, role: req.body.role ?? "member" },
    });
    res.status(201).json({ data: member });
  } catch (error) {
    res.status(500).json({ error: "Failed to add member" });
  }
});
