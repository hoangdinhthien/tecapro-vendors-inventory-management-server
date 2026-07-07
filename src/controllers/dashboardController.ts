import { Request, Response } from "express";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export const getDashboardMetrics = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const popularProducts = await prisma.products.findMany({
      take: 15,
      orderBy: {
        stockQuantity: "desc",
      },
    });
    const salesSummary = await prisma.salesSummary.findMany({
      take: 5,
      orderBy: {
        date: "desc",
      },
    });
    const purchaseSummary = await prisma.purchasesSummary.findMany({
      take: 30,
      orderBy: {
        date: "desc",
      },
    });
    const expenseSummary = await prisma.expensesSummary.findMany({
      take: 5,
      orderBy: {
        date: "desc",
      },
    });
    const expenseByCategorySummaryRaw = await prisma.expenseByCategory.findMany(
      {
        take: 5,
        orderBy: {
          date: "desc",
        },
      },
    );

    const expenseByCategorySummary = expenseByCategorySummaryRaw.map(
      (item: any) => ({
        ...item,
        amount: item.amount.toString(),
      }),
    );

    res.json({
      popularProducts,
      salesSummary,
      purchaseSummary,
      expenseSummary,
      expenseByCategorySummary,
    });
  } catch (error) {
    res.status(500).json({ error: "Error retrieving dashboard metrics" });
  }
};
