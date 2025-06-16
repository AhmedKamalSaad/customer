// lib/parties.ts
import { prisma } from "@/prisma/client";
import { Party, PartyType, Transaction } from "@prisma/client";

export async function getPartiesWithSummary(partyType: PartyType, search = "") {
  const parties = await prisma.party.findMany({
    where: {
      type: partyType,
      name: {
        contains: search,
        mode: "insensitive",
      },
    },
    include: { transactions: true },
  });
  return parties.map(party => {
    const totalDebit = party.transactions.reduce((sum, tx) => sum + tx.debit.toNumber(), 0);
    const totalCredit = party.transactions.reduce((sum, tx) => sum + tx.credit.toNumber(), 0);
    const netBalance = totalDebit - totalCredit;
    
    return {
      ...party,
      totalDebit,
      totalCredit,
      netBalance
    };
  });
}


export type TransactionWithBalance = Transaction & {
  balanceAtTransaction: number;
};

export type PartyWithTransactions = Party & {
  transactions: Transaction[];
};

export type TransactionField = 
  | "description" 
  | "debit" 
  | "credit" 
  | "bank" 
  | "date";

export type AddTransactionParams = {
  partyId: string;
  partyType: PartyType;
  description: string;
  amount: number;
  bank: string;
  date: Date;
};