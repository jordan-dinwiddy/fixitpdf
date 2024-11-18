/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey]` on the table `AccountBalanceTransaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AccountBalanceTransaction" ADD COLUMN     "idempotencyKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AccountBalanceTransaction_idempotencyKey_key" ON "AccountBalanceTransaction"("idempotencyKey");
