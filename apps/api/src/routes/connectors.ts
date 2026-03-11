import { Router } from "express";
import { prisma } from "@aios/database";

export const connectorsRouter = Router();

connectorsRouter.get("/", async (_req, res) => {
  try {
    const connectors = await prisma.connector.findMany({
      include: { actions: true, events: true },
      orderBy: { name: "asc" },
    });
    res.json({ data: connectors });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch connectors" });
  }
});

connectorsRouter.get("/:id", async (req, res) => {
  try {
    const connector = await prisma.connector.findUnique({
      where: { id: req.params.id },
      include: { actions: true, events: true },
    });
    if (!connector) { res.status(404).json({ error: "Connector not found" }); return; }
    res.json({ data: connector });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch connector" });
  }
});

connectorsRouter.post("/:id/install", async (req, res) => {
  try {
    const installation = await prisma.connectorInstallation.create({
      data: {
        connectorId: req.params.id,
        workspaceId: req.body.workspaceId,
        credentials: req.body.authData ? JSON.stringify(req.body.authData) : null,
        configuration: req.body.config || {},
      },
    });
    res.status(201).json({ data: installation });
  } catch (error) {
    res.status(500).json({ error: "Failed to install connector" });
  }
});

connectorsRouter.get("/installations/:workspaceId", async (req, res) => {
  try {
    const installations = await prisma.connectorInstallation.findMany({
      where: { workspaceId: req.params.workspaceId },
      include: { connector: { include: { actions: true, events: true } } },
    });
    res.json({ data: installations });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch installations" });
  }
});

connectorsRouter.delete("/installations/:id", async (req, res) => {
  try {
    await prisma.connectorInstallation.delete({ where: { id: req.params.id } });
    res.json({ message: "Connector uninstalled" });
  } catch (error) {
    res.status(500).json({ error: "Failed to uninstall connector" });
  }
});
