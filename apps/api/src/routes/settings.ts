import { Router } from "express";
import { prisma } from "@aios/database";
import type { AuthenticatedRequest } from "@aios/auth";

export const settingsRouter = Router();

// GET /settings — current user settings
settingsRouter.get("/", async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    res.json({
      data: settings
        ? { heroView: settings.heroView, theme: settings.theme, ...(settings.settings as Record<string, unknown>) }
        : { heroView: "view1", theme: "dark" },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// PUT /settings — update user settings
settingsRouter.put("/", async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { heroView, theme, ...rest } = req.body as Record<string, unknown>;

    const data: Record<string, unknown> = {};
    if (heroView === "view1" || heroView === "view2") data.heroView = heroView;
    if (typeof theme === "string") data.theme = theme;
    if (Object.keys(rest).length > 0) data.settings = rest;

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...data } as any,
      update: data,
    });

    res.json({
      data: { heroView: settings.heroView, theme: settings.theme, ...(settings.settings as Record<string, unknown>) },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update settings" });
  }
});
