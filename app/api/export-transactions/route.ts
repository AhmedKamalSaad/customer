// app/export-excel/route.ts
import { exportTransactionsToExcel } from "@/app/lib/excel";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { partyId } = await req.json();
  return exportTransactionsToExcel(partyId);
}
