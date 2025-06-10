"use server";

import { prisma } from "@/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// إضافة عميل جديد مع رصيد مدين أولي
export async function addClient(formData: FormData) {
  const name = formData.get("name") as string;
  const initialDebit = parseFloat(formData.get("balance") as string);

  // إنشاء العميل أولاً
  const client = await prisma.client.create({
    data: {
      name,
      balance: initialDebit,
    },
  });

  // ثم إنشاء المعاملة الأولية المرتبطة به
  await prisma.transaction.create({
    data: {
      description: "رصيد أولي",
      debit: initialDebit,
      credit: 0,
      clientId: client.id, // استخدام معرف العميل مباشرة
    },
  });

  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

// حذف عميل

export async function deleteClient(formData: FormData) {
  const id = formData.get("id") as string;
  
  // First delete all transactions for this client
  await prisma.transaction.deleteMany({
    where: { clientId: id }
  });

  // Then delete the client
  await prisma.client.delete({
    where: { id }
  });

  revalidatePath("/clients");
  redirect("/clients");
}
// إضافة معاملة جديدة

export async function addTransaction(formData: FormData) {
  const clientId = formData.get("clientId") as string;
  const description = formData.get("description") as string;
  const credit = parseFloat(formData.get("credit") as string) || 0;
  const debit = parseFloat(formData.get("debit") as string) || 0;
  const bank = formData.get("bank") as string;
  const dateStr = formData.get("date") as string;

  const date = dateStr ? new Date(dateStr) : new Date();

  const client = await prisma.client.findUnique({
    where: { id: clientId },
  });

  if (!client) throw new Error("Client not found");

  const currentBalance = client.balance.toNumber();
  const newBalance = currentBalance + debit - credit;

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        description: `${description} - ${bank}`, // Include bank in description
        credit,
        debit,
        bank,
        clientId,
        createdAt: date,
        date,
      },
    }),
    prisma.client.update({
      where: { id: clientId },
      data: { balance: newBalance },
    }),
  ]);

  revalidatePath(`/clients/${clientId}`);
}
export async function updateTransactionField(
  id: string,
  field: "description" | "debit" | "credit" | "bank" | "date",
  value: string
) {
  const tx = await prisma.transaction.findUnique({ where: { id } });
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

  await recalculateClientBalance(tx.clientId);
  revalidatePath(`/clients/${tx.clientId}`);
}
export async function deleteTransaction(id: string) {
  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx) throw new Error("Transaction not found");

  await prisma.transaction.delete({ where: { id } });
  await recalculateClientBalance(tx.clientId);
  revalidatePath(`/clients/${tx.clientId}`);
}

export async function recalculateClientBalance(clientId: string) {
  const transactions = await prisma.transaction.findMany({
    where: { clientId },
    orderBy: { createdAt: "asc" },
  });

  const balance = transactions.reduce(
    (acc, tx) => acc + tx.debit.toNumber() - tx.credit.toNumber(),
    0
  );

  await prisma.client.update({
    where: { id: clientId },
    data: { balance },
  });
}
