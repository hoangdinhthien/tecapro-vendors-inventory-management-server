"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const adapter_pg_1 = require("@prisma/adapter-pg");
const prisma_1 = require("../generated/prisma");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
}
const adapter = new adapter_pg_1.PrismaPg({ connectionString });
const prisma = new prisma_1.PrismaClient({ adapter });
const modelNameMap = {
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
function transformSeedData(modelName, data) {
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
        if (normalized.totalPurchased !== undefined &&
            normalized.totalValue === undefined) {
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
async function deleteAllData(orderedFileNames) {
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
        const model = prisma[modelName];
        if (model) {
            await model.deleteMany({});
            console.log(`Cleared data from ${modelName}`);
        }
        else {
            console.error(`Model ${modelName} not found. Please ensure the model name is correctly specified.`);
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
        const modelName = modelNameMap[baseName] ??
            baseName.charAt(0).toUpperCase() + baseName.slice(1);
        const model = prisma[modelName];
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
//# sourceMappingURL=seed.js.map