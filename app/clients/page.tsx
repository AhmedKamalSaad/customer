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
import { prisma } from "@/prisma/client";
import { deleteClient } from "@/app/lib/actions";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: {
      transactions: true,
    },
  });

  const clientsWithSummary = clients.map(client => {
    const totalDebit = client.transactions.reduce((sum, tx) => sum + tx.debit.toNumber(), 0);
    const totalCredit = client.transactions.reduce((sum, tx) => sum + tx.credit.toNumber(), 0);
    const netBalance = totalDebit - totalCredit;
    
    return {
      ...client,
      totalDebit,
      totalCredit,
      netBalance
    };
  });

  // Calculate grand totals
  const grandTotalDebit = clientsWithSummary.reduce((sum, client) => sum + client.totalDebit, 0);
  const grandTotalCredit = clientsWithSummary.reduce((sum, client) => sum + client.totalCredit, 0);
  const grandNetBalance = grandTotalDebit - grandTotalCredit;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">قائمة العملاء</h1>
        <Link href="/clients/add">
          <Button>إضافة عميل جديد</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>اسم العميل</TableHead>
            <TableHead className="text-right">إجمالي مدين</TableHead>
            <TableHead className="text-right">إجمالي دائن</TableHead>
            <TableHead className="text-right">صافي الرصيد</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientsWithSummary.map((client) => (
            <TableRow key={client.id}>
              <TableCell>{client.name}</TableCell>
              <TableCell className="text-right text-red-600">
                {client.totalDebit.toFixed(2)}
              </TableCell>
              <TableCell className="text-right text-green-600">
                {client.totalCredit.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant={client.netBalance >= 0 ? "default" : "destructive"}>
                  {client.netBalance.toFixed(2)}
                </Badge>
              </TableCell>
              <TableCell className="flex gap-2">
                <Link href={`/clients/${client.id}`}>
                  <Button variant="outline">عرض التفاصيل</Button>
                </Link>
                <form action={deleteClient}>
                  <input type="hidden" name="id" value={client.id} />
                  <Button type="submit" variant="destructive">
                    حذف
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
          {/* Grand Totals Row */}
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