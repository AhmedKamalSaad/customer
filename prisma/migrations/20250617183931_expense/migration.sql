/*
  Warnings:

  - You are about to drop the column `Expense` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "Expense",
ADD COLUMN     "expense" TEXT DEFAULT '';
