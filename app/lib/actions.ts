"use server";

import { prisma } from "@/prisma/client";
import { PartyType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
export async function addParty(formData: FormData) {
  const name = formData.get("name") as string;
  const type = formData.get("type") as PartyType;
  const initialDebit = parseFloat(formData.get("debit") as string) || 0;
  const initialCredit = parseFloat(formData.get("credit") as string) || 0;
  const bankValue = formData.get("bank") as string;
  const bank = bankValue === "none" ? "" : bankValue;
  const dateInput = formData.get("date") as string;
  const date = dateInput ? new Date(dateInput) : new Date();

  const party = await prisma.party.create({
    data: {
      name,
      type,
      balance: initialDebit - initialCredit,
    },
  });

  await prisma.transaction.create({
    data: {
      description:
        type === PartyType.CUSTOMER ? "رصيد أولي عميل" : "رصيد أولي مورد",
      debit: initialDebit,
      credit: initialCredit,
      bank,
      partyId: party.id,
      date: date,
    },
  });

  const redirectPath =
    type === PartyType.CUSTOMER
      ? `/clients/${party.id}`
      : `/suppliers/${party.id}`;

  revalidatePath(type === PartyType.CUSTOMER ? "/clients" : "/suppliers");
  redirect(redirectPath);
}

export async function deleteParty(formData: FormData) {
  const id = formData.get("id") as string;

  try {
    const party = await prisma.party.findUnique({
      where: { id },
      select: { type: true },
    });

    if (!party) throw new Error("Party not found");

    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { partyId: id } }),
      prisma.party.delete({ where: { id } }),
    ]);

    const isCustomer = party.type === PartyType.CUSTOMER;
    revalidatePath(isCustomer ? "/clients" : "/suppliers");
  } catch (error) {
    console.error("Failed to delete party:", error);
    throw error;
  }
}

export async function addTransaction(formData: FormData) {
  const rawData = {
    partyId: formData.get("partyId") as string,
    partyType: formData.get("partyType") as PartyType,
    description: formData.get("description") as string,
    debit: parseFloat(formData.get("debit") as string) || 0,
    credit: parseFloat(formData.get("credit") as string) || 0,
    bank: formData.get("bank") as string,
    date: formData.get("date") as string,
  };

  if (!rawData.partyId || !rawData.description) {
    throw new Error("Missing required fields");
  }

  const date = rawData.date ? new Date(rawData.date) : new Date();
  const redirectPath = `/${
    rawData.partyType === PartyType.SUPPLIER ? "suppliers" : "clients"
  }/${rawData.partyId}`;

  try {
    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          description: rawData.description,
          debit: rawData.debit,
          credit: rawData.credit,
          bank: rawData.bank,
          date,
          partyId: rawData.partyId,
        },
      }),
      prisma.party.update({
        where: { id: rawData.partyId },
        data: {
          balance: {
            increment: rawData.debit - rawData.credit,
          },
        },
      }),
    ]);

    revalidatePath(redirectPath);
  } catch (error) {
    console.error("Failed to add transaction:", error);
    throw error;
  }
}

export async function updateTransactionField(
  id: string,
  field: "description" | "debit" | "credit" | "bank" | "date",
  value: string
) {
  const tx = await prisma.transaction.findUnique({
    where: { id },
    include: { party: true },
  });

  if (!tx) throw new Error("Transaction not found");

  const updatedData = {
    [field]:
      field === "description" || field === "bank"
        ? value
        : field === "date"
        ? new Date(value)
        : parseFloat(value) || 0,
  };

  await prisma.transaction.update({
    where: { id },
    data: updatedData,
  });

  await recalculatePartyBalance(tx.partyId);
  revalidatePath(
    `/${tx.party.type === PartyType.CUSTOMER ? "clients" : "suppliers"}/${
      tx.partyId
    }`
  );
}

export async function deleteTransaction(id: string) {
  const tx = await prisma.transaction.findUnique({
    where: { id },
    include: { party: true },
  });

  if (!tx) throw new Error("Transaction not found");

  await prisma.transaction.delete({ where: { id } });
  await recalculatePartyBalance(tx.partyId);
  revalidatePath(
    `/${tx.party.type === PartyType.CUSTOMER ? "clients" : "suppliers"}/${
      tx.partyId
    }`
  );
}

async function recalculatePartyBalance(partyId: string) {
  const party = await prisma.party.findUnique({
    where: { id: partyId },
    include: { transactions: true },
  });

  if (!party) throw new Error("Party not found");

  const balance = party.transactions.reduce(
    (acc, tx) => acc + tx.debit.toNumber() - tx.credit.toNumber(),
    0
  );

  await prisma.party.update({
    where: { id: partyId },
    data: { balance },
  });
}
