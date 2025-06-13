// app/api/export-parties/route.ts
import { exportPartiesToExcel } from "@/app/lib/export-parties-excel";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { partyType } = await req.json(); // "CUSTOMER" | "SUPPLIER"
  return exportPartiesToExcel(partyType);
}
