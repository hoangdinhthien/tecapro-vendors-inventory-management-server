/*
  Warnings:

  - You are about to drop the column `expensesSummaryId` on the `ExpenseByCategory` table. All the data in the column will be lost.
  - You are about to drop the column `productsProductId` on the `SalesSummary` table. All the data in the column will be lost.
  - You are about to drop the `ExpensesSummary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PurchasesSummary` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `expenseSummaryId` to the `ExpenseByCategory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ExpenseByCategory" DROP CONSTRAINT "ExpenseByCategory_expensesSummaryId_fkey";

-- DropForeignKey
ALTER TABLE "SalesSummary" DROP CONSTRAINT "SalesSummary_productsProductId_fkey";

-- AlterTable
ALTER TABLE "ExpenseByCategory" DROP COLUMN "expensesSummaryId",
ADD COLUMN     "expenseSummaryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SalesSummary" DROP COLUMN "productsProductId";

-- DropTable
DROP TABLE "ExpensesSummary";

-- DropTable
DROP TABLE "PurchasesSummary";

-- CreateTable
CREATE TABLE "PurchaseSummary" (
    "purchaseSummaryId" TEXT NOT NULL,
    "totalPurchased" DOUBLE PRECISION NOT NULL,
    "changePercentage" DOUBLE PRECISION,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseSummary_pkey" PRIMARY KEY ("purchaseSummaryId")
);

-- CreateTable
CREATE TABLE "ExpenseSummary" (
    "expenseSummaryId" TEXT NOT NULL,
    "totalExpenses" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseSummary_pkey" PRIMARY KEY ("expenseSummaryId")
);

-- AddForeignKey
ALTER TABLE "ExpenseByCategory" ADD CONSTRAINT "ExpenseByCategory_expenseSummaryId_fkey" FOREIGN KEY ("expenseSummaryId") REFERENCES "ExpenseSummary"("expenseSummaryId") ON DELETE RESTRICT ON UPDATE CASCADE;
