import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma";
import * as fs from "fs";
import * as path from "path";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const modelNameMap: Record<string, string> = {
  expenseSummary: "ExpensesSummary",
  expenseByCategory: "ExpenseByCategory",
  salesSummary: "SalesSummary",
  purchaseSummary: "PurchasesSummary",
  users: "Users",
  products: "Products",
  sales: "Sales",
  purchases: "Purchases",
  expenses: "Expenses",
};

function transformSeedData(modelName: string, data: Record<string, any>) {
  const normalized = { ...data };

  if (modelName === "ExpensesSummary") {
    if (normalized.expenseSummaryId && !normalized.expensesSummaryId) {
      normalized.expensesSummaryId = normalized.expenseSummaryId;
      delete normalized.expenseSummaryId;
    }
  }

  if (modelName === "PurchasesSummary") {
    if (normalized.purchaseSummaryId && !normalized.purchasesSummaryId) {
      normalized.purchasesSummaryId = normalized.purchaseSummaryId;
      delete normalized.purchaseSummaryId;
    }
    if (
      normalized.totalPurchased !== undefined &&
      normalized.totalValue === undefined
    ) {
      normalized.totalValue = normalized.totalPurchased;
      delete normalized.totalPurchased;
    }
  }

  if (modelName === "ExpenseByCategory") {
    if (normalized.expenseSummaryId && !normalized.expensesSummaryId) {
      normalized.expensesSummary = {
        connect: { expensesSummaryId: normalized.expenseSummaryId },
      };
      delete normalized.expenseSummaryId;
    }
  }

  return normalized;
}

async function deleteAllData(orderedFileNames: string[]) {
  const deleteOrder = [
    "ExpenseByCategory",
    "Sales",
    "Purchases",
    "Expenses",
    "SalesSummary",
    "PurchasesSummary",
    "ExpensesSummary",
    "Products",
    "Users",
  ];

  for (const modelName of deleteOrder) {
    const model: any = prisma[modelName as keyof typeof prisma];
    if (model) {
      await model.deleteMany({});
      console.log(`Cleared data from ${modelName}`);
    } else {
      console.error(
        `Model ${modelName} not found. Please ensure the model name is correctly specified.`,
      );
    }
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, "seedData");

  const orderedFileNames = [
    "products.json",
    "expenseSummary.json",
    "sales.json",
    "salesSummary.json",
    "purchases.json",
    "purchaseSummary.json",
    "users.json",
    "expenses.json",
    "expenseByCategory.json",
  ];

  await deleteAllData(orderedFileNames);

  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const baseName = path.basename(fileName, path.extname(fileName));
    const modelName =
      modelNameMap[baseName] ??
      baseName.charAt(0).toUpperCase() + baseName.slice(1);
    const model: any = prisma[modelName as keyof typeof prisma];

    if (!model) {
      console.error(`No Prisma model matches the file name: ${fileName}`);
      continue;
    }

    for (const data of jsonData) {
      const normalizedData = transformSeedData(modelName, data);
      await model.create({
        data: normalizedData,
      });
    }

    console.log(`Seeded ${modelName} with data from ${fileName}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
