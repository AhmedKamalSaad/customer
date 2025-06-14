"use server";

import { prisma } from "@/prisma/client";
import ExcelJS from "exceljs";

// تحويل الأرقام إلى أرقام عربية
function toArabicNumber(value: string | number): string {
  return value
    .toString()
    .replace(/\d/g, (d) => String.fromCharCode(0x0660 + Number(d)));
}

// تنسيق التاريخ بدون وقت
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
      transactions: { orderBy: { date: "asc" } },
    },
  });

  if (!party || !party.transactions.length) {
    return new Response("لا توجد بيانات للتصدير", { status: 400 });
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Transactions");

  // 🔵 إضافة اسم العميل أو المورد في الأعلى
  sheet.mergeCells("A1", "G1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = `${party.name}`;
  titleCell.font = {
    bold: true,
    size: 16,
    color: { argb: "FF000000" },
  };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFBDD7EE" },
  };

  // 🔵 ترويسة الأعمدة تبدأ من الصف الثاني
  sheet.getRow(2).values = [
    "",
    "الوصف",
    "مدين",
    "دائن",
    "البنك",
    "التاريخ",
    "الرصيد",
  ];

  sheet.getRow(2).eachCell((cell) => {
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

  // 🔵 إعداد عرض الأعمدة
  sheet.columns = [
    { key: "description", width: 40 },
    { key: "debit", width: 15 },
    { key: "credit", width: 15 },
    { key: "bank", width: 25 },
    { key: "date", width: 25 },
    { key: "balance", width: 20 },
  ];

  // 🔵 بيانات المعاملات
  let runningBalance = 0;
  let totalDebit = 0;
  let totalCredit = 0;
  let currentRowIndex = 3;

  for (const tx of party.transactions) {
    const debit = Number(tx.debit ?? 0);
    const credit = Number(tx.credit ?? 0);
    totalDebit += debit;
    totalCredit += credit;
    runningBalance += debit - credit;

    const row = sheet.insertRow(currentRowIndex++, {
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

  // 🔵 صف الإجمالي
  const totalRow = sheet.insertRow(currentRowIndex, {
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

  // 🔵 إنشاء الملف للتحميل
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
