// components/PartiesTable.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Party, PartyType, Transaction } from "@prisma/client";
import { DeletePartyConfirmDialog } from "./DeletePartyConfirmDialog";
import { ExportExcelButton } from "./ExcelButton";
import ExportPartiesExcelButton from "./ExportPartiesExcelButton";
import PartySearchInput from "./PartySearchInput";

interface PartyWithTransactions extends Party {
  transactions: Transaction[];
  totalDebit: number;
  totalCredit: number;
  netBalance: number;
}

export function PartiesTable({
  parties,
  partyType,
}: {
  parties: PartyWithTransactions[];
  partyType: PartyType;
}) {
  const typeLabel = partyType === PartyType.CUSTOMER ? "عميل" : "مورد";
  const addRoute =
    partyType === PartyType.CUSTOMER ? "/clients/add" : "/suppliers/add";
  const detailsRoute = (id: string) =>
    partyType === PartyType.CUSTOMER ? `/clients/${id}` : `/suppliers/${id}`;

  // Calculate grand totals
  const grandTotalDebit = parties.reduce(
    (sum, party) => sum + party.totalDebit,
    0
  );
  const grandTotalCredit = parties.reduce(
    (sum, party) => sum + party.totalCredit,
    0
  );
  const grandNetBalance = grandTotalDebit - grandTotalCredit;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-2">
        <h1 className="text-2xl font-bold">
          قائمة {partyType === PartyType.CUSTOMER ? "العملاء" : "الموردين"}
        </h1>
        <div className="flex gap-2 flex-wrap">
          <ExportPartiesExcelButton partyType={partyType} />
          <Link href={addRoute}>
            <Button>إضافة {typeLabel} جديد</Button>
          </Link>
        </div>
        <PartySearchInput placeholder={`ابحث باسم ${typeLabel}`} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>اسم {typeLabel}</TableHead>
            <TableHead className="text-right">إجمالي مدين</TableHead>
            <TableHead className="text-right">إجمالي دائن</TableHead>
            <TableHead className="text-right">صافي الرصيد</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parties.map((party) => (
            <TableRow key={party.id}>
              <TableCell>{party.name}</TableCell>
              <TableCell className="text-right text-red-600">
                {party.totalDebit.toFixed(2)}
              </TableCell>
              <TableCell className="text-right text-green-600">
                {party.totalCredit.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                <Badge
                  variant={party.netBalance >= 0 ? "default" : "destructive"}
                >
                  {party.netBalance.toFixed(2)}
                </Badge>
              </TableCell>
              <TableCell className="flex gap-2">
                <Link href={detailsRoute(party.id)}>
                  <Button variant="outline">عرض التفاصيل</Button>
                </Link>
                <ExportExcelButton partyId={party.id} />
                <DeletePartyConfirmDialog partyId={party.id} />
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="font-bold bg-gray-100 dark:bg-gray-800">
            <TableCell>الإجمالي</TableCell>
            <TableCell className="text-right text-red-600">
              {grandTotalDebit.toFixed(2)}
            </TableCell>
            <TableCell className="text-right text-green-600">
              {grandTotalCredit.toFixed(2)}
            </TableCell>
            <TableCell className="text-right">
              <Badge variant={grandNetBalance >= 0 ? "default" : "destructive"}>
                {grandNetBalance.toFixed(2)}
              </Badge>
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
