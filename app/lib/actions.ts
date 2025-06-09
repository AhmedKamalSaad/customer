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

// إضافة معاملة جديدة (نفس الكود السابق)
export async function addTransaction(formData: FormData) {
  const clientId = formData.get("clientId") as string;
  const description = formData.get("description") as string;
  const credit = parseFloat(formData.get("credit") as string) || 0;
  const debit = parseFloat(formData.get("debit") as string) || 0;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
  });

  if (!client) throw new Error("Client not found");

  const currentBalance = client.balance.toNumber();
  const newBalance = currentBalance + debit - credit;

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        description,
        credit,
        debit,
        clientId,
      },
    }),
    prisma.client.update({
      where: { id: clientId },
      data: { balance: newBalance },
    }),
  ]);

  revalidatePath(`/clients/${clientId}`);
}