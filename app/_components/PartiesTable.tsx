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
  const typeLabels: Record<PartyType, { list: string; add: string; single: string }> = {
    CUSTOMER: { list: "العملاء", add: "إضافة عميل جديد", single: "العميل" },
    SUPPLIER: { list: "الموردين", add: "إضافة مورد جديد", single: "المورد" },
    CUSTODY: { list: "الأرصدة النقدية", add: "إضافة حساب جديد", single: "الحساب" },
  };

  const typeRoutes: Record<PartyType, string> = {
    CUSTOMER: "clients",
    SUPPLIER: "suppliers",
    CUSTODY: "custodies",
  };

  const typeLabel = typeLabels[partyType];
  const baseRoute = typeRoutes[partyType];

  const addRoute = `/${baseRoute}/add`;
  const detailsRoute = (id: string) => `/${baseRoute}/${id}`;

  const grandTotalDebit = parties.reduce(
    (sum, party) => sum + party.totalDebit,
    0
  );
  const grandTotalCredit = parties.reduce(
    (sum, party) => sum + party.totalCredit,
    0
  );
  const grandNetBalance = grandTotalDebit - grandTotalCredit;

  const isCustody = partyType === "CUSTODY";

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-2">
        <h1 className="text-2xl font-bold">قائمة {typeLabel.list}</h1>
        <div className="flex gap-2 flex-wrap">
          <ExportPartiesExcelButton partyType={partyType} />
          <Link href={addRoute}>
            <Button>{typeLabel.add}</Button>
          </Link>
        </div>
        <PartySearchInput placeholder={`ابحث باسم ${typeLabel.single}`} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>اسم {typeLabel.single}</TableHead>
            {isCustody && <TableHead>نوع المصروف</TableHead>}
            <TableHead className="text-right">إجمالي مدين</TableHead>
            <TableHead className="text-right">إجمالي دائن</TableHead>
            <TableHead className="text-right">صافي الرصيد</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parties.map((party) => {
            const expense =
              isCustody && party.transactions.length > 0
                ? party.transactions[0].expense || "-"
                : null;

            return (
              <TableRow key={party.id}>
                <TableCell>{party.name}</TableCell>
                {isCustody && <TableCell>{expense}</TableCell>}
                <TableCell className="text-right text-red-600">
                  {party.totalDebit.toFixed(2)}
                </TableCell>
                <TableCell className="text-right text-green-600">
                  {party.totalCredit.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={
                      party.netBalance >= 0 ? "default" : "destructive"
                    }
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
            );
          })}
          <TableRow className="font-bold bg-gray-100 dark:bg-gray-800">
            <TableCell>الإجمالي</TableCell>
            {isCustody && <TableCell />}
            <TableCell className="text-right text-red-600">
              {grandTotalDebit.toFixed(2)}
            </TableCell>
            <TableCell className="text-right text-green-600">
              {grandTotalCredit.toFixed(2)}
            </TableCell>
            <TableCell className="text-right">
              <Badge
                variant={grandNetBalance >= 0 ? "default" : "destructive"}
              >
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