"use server";

import { prisma } from "@/prisma/client";
import ExcelJS from "exceljs";

// تحويل الأرقام إلى أرقام عربية
function toArabicNumber(value: string | number): string {
  return value
    .toString()
    .replace(/\d/g, (d) => String.fromCharCode(0x0660 + Number(d)));
}

function formatFullDate(date?: Date): string {
  if (!date) return "";
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  return d.toLocaleString("ar-EG", options);
}

export async function exportTransactionsToExcel(partyId: string) {
  const party = await prisma.party.findUnique({
    where: { id: partyId },
    include: {
      transactions: { orderBy: { date: "asc" } }, // 🔥 الترتيب من الأقدم للأحدث
    },
  });

  if (!party) {
    throw new Error("Party not found");
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Transactions");

  // رأس الجدول
  sheet.columns = [
    { header: "الوصف", key: "description", width: 40 },
    { header: "مدين", key: "debit", width: 15 },
    { header: "دائن", key: "credit", width: 15 },
    { header: "البنك", key: "bank", width: 25 },
    { header: "التاريخ", key: "date", width: 25 },
    { header: "الرصيد", key: "balance", width: 20 },
  ];

  sheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0070C0" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
  });

  const transactions = party.transactions;
  let runningBalance = 0;
  let totalDebit = 0;
  let totalCredit = 0;

  // 🔥 نحسب الرصيد بشكل تصاعدي حسب العمليات
  for (const tx of transactions) {
    const debit = Number(tx.debit ?? 0);
    const credit = Number(tx.credit ?? 0);
    totalDebit += debit;
    totalCredit += credit;

    runningBalance += debit - credit;

    const row = sheet.addRow({
      description: tx.description,
      debit: debit ? toArabicNumber(debit.toFixed(2)) : "",
      credit: credit ? toArabicNumber(credit.toFixed(2)) : "",
      bank: tx.bank === "none" ? "" : tx.bank,
      date: toArabicNumber(formatFullDate(tx.date)),
      balance: toArabicNumber(runningBalance.toFixed(2)),
    });

    row.getCell("debit").font = { color: { argb: "FFFF0000" } };
    row.getCell("credit").font = { color: { argb: "FF00AA00" } };
    row.getCell("balance").font = { bold: true };
    row.eachCell((cell) => {
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });
  }

  // صف الإجمالي
  const totalRow = sheet.addRow({
    description: "الإجمالي",
    debit: toArabicNumber(totalDebit.toFixed(2)),
    credit: toArabicNumber(totalCredit.toFixed(2)),
    balance: toArabicNumber((totalDebit - totalCredit).toFixed(2)),
  });

  totalRow.font = { bold: true };
  totalRow.eachCell((cell) => {
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE2EFDA" },
    };
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "double" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
  });
  if (!party || !party.transactions.length) {
    return new Response("لا توجد بيانات للتصدير", { status: 400 });
  }
  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
        party.name
      )}-transactions.xlsx`,
    },
  });
}
