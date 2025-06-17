"use server";

import ExcelJS from "exceljs";
import { prisma } from "@/prisma/client";

// تحويل الأرقام إلى أرقام عربية
function toArabicNumber(value: string | number): string {
  return value
    .toString()
    .replace(/\d/g, (d) => String.fromCharCode(0x0660 + Number(d)));
}

// تنسيق التاريخ
function formatFullDate(date?: Date): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export async function exportTransactionsToExcel(partyId: string) {
  const party = await prisma.party.findUnique({
    where: { id: partyId },
    include: { transactions: { orderBy: { date: "asc" } } },
  });

  if (!party) throw new Error("Party not found");

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("المعاملات");

  sheet.properties.defaultRowHeight = 30;
  sheet.columns = [
    { key: "description", width: 40 },
    { key: "debit", width: 15 },
    { key: "credit", width: 15 },
    { key: "bank", width: 25 },
    ...(party.type === "CUSTODY" ? [{ key: "expense", width: 25 }] : []),
    { key: "date", width: 25 },
  ];

  // 🟦 رؤوس الأعمدة
  const headers =
    party.type === "CUSTODY"
      ? ["الوصف", "مدين", "دائن", "البنك", "نوع المصروف", "التاريخ"]
      : ["الوصف", "مدين", "دائن", "البنك", "التاريخ"];

  const headerRow = sheet.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9E1F2" },
    };
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // 🟩 بيانات المعاملات
  let totalDebit = 0;
  let totalCredit = 0;

  party.transactions.forEach((tx) => {
    totalDebit += Number(tx.debit);
    totalCredit += Number(tx.credit);

    const rowData =
      party.type === "CUSTODY"
        ? {
            description: tx.description,
            debit: toArabicNumber(tx.debit.toFixed(2)),
            credit: toArabicNumber(tx.credit.toFixed(2)),
            bank: tx.bank || "",
            expense: tx.expense || "",
            date: formatFullDate(tx.date),
          }
        : {
            description: tx.description,
            debit: toArabicNumber(tx.debit.toFixed(2)),
            credit: toArabicNumber(tx.credit.toFixed(2)),
            bank: tx.bank || "",
            date: formatFullDate(tx.date),
          };

    const row = sheet.addRow(rowData);
    row.eachCell((cell) => {
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });
  });

  // 🔵 صف الإجمالي في نفس الصف الأخير
  const totalBalance = totalDebit - totalCredit;
  const currentRowIndex = sheet.lastRow!.number + 1;

  const totalRow =
    party.type === "CUSTODY"
      ? sheet.insertRow(currentRowIndex, {
          description: "الإجمالي",
          debit: toArabicNumber(totalDebit.toFixed(2)),
          credit: toArabicNumber(totalCredit.toFixed(2)),
          bank: "",
          expense: "",
          date: `الرصيد: ${toArabicNumber(totalBalance.toFixed(2))}`,
        })
      : sheet.insertRow(currentRowIndex, {
          description: "الإجمالي",
          debit: toArabicNumber(totalDebit.toFixed(2)),
          credit: toArabicNumber(totalCredit.toFixed(2)),
          bank: "",
          date: `الرصيد: ${toArabicNumber(totalBalance.toFixed(2))}`,
        });

  totalRow.font = { bold: true };
  totalRow.eachCell((cell) => {
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE2EFDA" }, // اللون القديم الذي كنت تستخدمه
    };
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "double" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
  });

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
