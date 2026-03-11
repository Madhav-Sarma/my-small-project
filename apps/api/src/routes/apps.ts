import { Router } from "express";
import { prisma } from "@aios/database";

export const appsRouter = Router();

appsRouter.get("/", async (_req, res) => {
  try {
    const apps = await prisma.app.findMany({ orderBy: { name: "asc" } });
    res.json({ data: apps });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch apps" });
  }
});

appsRouter.get("/:id", async (req, res) => {
  try {
    const app = await prisma.app.findUnique({ where: { id: req.params.id } });
    if (!app) { res.status(404).json({ error: "App not found" }); return; }
    res.json({ data: app });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch app" });
  }
});

appsRouter.post("/:id/install", async (req, res) => {
  try {
    const installation = await prisma.appInstallation.create({
      data: {
        appId: req.params.id,
        workspaceId: req.body.workspaceId,
        configuration: req.body.config || {},
      },
    });
    res.status(201).json({ data: installation });
  } catch (error) {
    res.status(500).json({ error: "Failed to install app" });
  }
});

appsRouter.get("/installations/:workspaceId", async (req, res) => {
  try {
    const installations = await prisma.appInstallation.findMany({
      where: { workspaceId: req.params.workspaceId },
      include: { app: true },
    });
    res.json({ data: installations });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch app installations" });
  }
});

appsRouter.delete("/installations/:id", async (req, res) => {
  try {
    await prisma.appInstallation.delete({ where: { id: req.params.id } });
    res.json({ message: "App uninstalled" });
  } catch (error) {
    res.status(500).json({ error: "Failed to uninstall app" });
  }
});
