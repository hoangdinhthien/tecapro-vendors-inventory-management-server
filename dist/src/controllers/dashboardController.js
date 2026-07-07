"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardMetrics = void 0;
const adapter_pg_1 = require("@prisma/adapter-pg");
const prisma_1 = require("../../generated/prisma");
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
}
const adapter = new adapter_pg_1.PrismaPg({ connectionString });
const prisma = new prisma_1.PrismaClient({ adapter });
const getDashboardMetrics = async (req, res) => {
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
        const expenseByCategorySummaryRaw = await prisma.expenseByCategory.findMany({
            take: 5,
            orderBy: {
                date: "desc",
            },
        });
        const expenseByCategorySummary = expenseByCategorySummaryRaw.map((item) => ({
            ...item,
            amount: item.amount.toString(),
        }));
        res.json({
            popularProducts,
            salesSummary,
            purchaseSummary,
            expenseSummary,
            expenseByCategorySummary,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Error retrieving dashboard metrics" });
    }
};
exports.getDashboardMetrics = getDashboardMetrics;
//# sourceMappingURL=dashboardController.js.map