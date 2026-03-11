import { Router } from "express";
import { prisma } from "@aios/database";

export const marketplaceRouter = Router();

marketplaceRouter.get("/", async (req, res) => {
  try {
    const { category, itemType, search } = req.query;
    const where: Record<string, unknown> = { status: "published" };
    if (category) where.category = category;
    if (itemType) where.itemType = itemType;
    if (search) where.title = { contains: search as string, mode: "insensitive" };

    const listings = await prisma.marketplaceListing.findMany({
      where,
      orderBy: { totalInstalls: "desc" },
      take: 50,
    });
    res.json({ data: listings });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch marketplace listings" });
  }
});

marketplaceRouter.get("/:id", async (req, res) => {
  try {
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: req.params.id },
      include: { reviews: { orderBy: { createdAt: "desc" }, take: 10 } },
    });
    if (!listing) { res.status(404).json({ error: "Listing not found" }); return; }
    res.json({ data: listing });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch listing" });
  }
});

marketplaceRouter.post("/:id/reviews", async (req, res) => {
  try {
    const review = await prisma.marketplaceReview.create({
      data: { listingId: req.params.id, userId: req.body.userId, rating: req.body.rating, comment: req.body.comment },
    });
    res.status(201).json({ data: review });
  } catch (error) {
    res.status(500).json({ error: "Failed to create review" });
  }
});

// Get marketplace categories
marketplaceRouter.get("/categories/all", async (_req, res) => {
  try {
    const categories = await prisma.marketplaceCategory.findMany({ orderBy: { order: "asc" } });
    res.json({ data: categories });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});
