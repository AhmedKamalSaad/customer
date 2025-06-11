-- CreateEnum
CREATE TYPE "PartyType" AS ENUM ('CUSTOMER', 'SUPPLIER');

-- CreateTable
CREATE TABLE "Party" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PartyType" NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "credit" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "debit" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "bank" TEXT NOT NULL DEFAULT 'كاش',
    "partyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
