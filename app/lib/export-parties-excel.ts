"use server";

import { prisma } from "@/prisma/client";
import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { PartyType } from "@prisma/client";

function toArabicNumber(value: string | number): string {
  return value.toString().replace(/\d/g, (d) => String.fromCharCode(0x0660 + Number(d)));
}

export async function exportPartiesToExcel(partyType: PartyType) {
  const parties = await prisma.party.findMany({
    where: { type: partyType },
    include: {
      transactions: true,
    },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(partyType === "CUSTOMER" ? "العملاء" : "الموردين");

  sheet.columns = [
    { header: "الاسم", key: "name", width: 30 },
    { header: "إجمالي مدين", key: "totalDebit", width: 20 },
    { header: "إجمالي دائن", key: "totalCredit", width: 20 },
    { header: "صافي الرصيد", key: "netBalance", width: 20 },
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

  let totalDebit = 0;
  let totalCredit = 0;

  for (const party of parties) {
    const debit = party.transactions.reduce((sum, t) => sum + Number(t.debit ?? 0), 0);
    const credit = party.transactions.reduce((sum, t) => sum + Number(t.credit ?? 0), 0);
    const netBalance = debit - credit;

    totalDebit += debit;
    totalCredit += credit;

    const row = sheet.addRow({
      name: party.name,
      totalDebit: toArabicNumber(debit.toFixed(2)),
      totalCredit: toArabicNumber(credit.toFixed(2)),
      netBalance: toArabicNumber(netBalance.toFixed(2)),
    });

    row.getCell("totalDebit").font = { color: { argb: "FFFF0000" } };
    row.getCell("totalCredit").font = { color: { argb: "FF00AA00" } };
    row.getCell("netBalance").font = { bold: true };
    row.eachCell((cell) => {
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });
  }

  const totalRow = sheet.addRow({
    name: "الإجمالي",
    totalDebit: toArabicNumber(totalDebit.toFixed(2)),
    totalCredit: toArabicNumber(totalCredit.toFixed(2)),
    netBalance: toArabicNumber((totalDebit - totalCredit).toFixed(2)),
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

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="parties-${partyType.toLowerCase()}.xlsx"`,
    },
  });
}
