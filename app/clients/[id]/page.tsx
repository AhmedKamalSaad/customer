import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { addTransaction } from "@/app/lib/actions";

export default async function ClientPage({
  params,
}: {
  params: { id: string };
}) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: { 
      transactions: {
        orderBy: { createdAt: 'asc' }
      }
    },
  });

  if (!client) return <div>العميل غير موجود</div>;

  // حساب الرصيد التراكمي
  let runningBalance = 0;
  const transactionsWithBalance = client.transactions.map(tx => {
    runningBalance = runningBalance + tx.debit.toNumber() - tx.credit.toNumber();
    return {
      ...tx,
      balanceAtTransaction: runningBalance
    };
  }).reverse();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">{client.name}</h1>
        <div className="text-xl">
          الرصيد الحالي:{" "}
          <Badge variant={runningBalance >= 0 ? "default" : "destructive"}>
            {runningBalance.toFixed(2)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">إضافة معاملة</h2>
          <form action={addTransaction} className="space-y-4">
            <input type="hidden" name="clientId" value={client.id} />
            <div>
              <Label htmlFor="description">وصف المعاملة</Label>
              <Input
                id="description"
                name="description"
                type="text"
                required
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="debit">مدين (يزيد الرصيد)</Label>
                <Input
                  id="debit"
                  name="debit"
                  type="number"
                  step="0.01"
                  className="mt-1"
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="credit">دائن (يقلل الرصيد)</Label>
                <Input
                  id="credit"
                  name="credit"
                  type="number"
                  step="0.01"
                  className="mt-1"
                  placeholder="0.00"
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              إضافة المعاملة
            </Button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">سجل المعاملات</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الوصف</TableHead>
                <TableHead className="text-right">مدين</TableHead>
                <TableHead className="text-right">دائن</TableHead>
                <TableHead className="text-right">الرصيد</TableHead>
                <TableHead>التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionsWithBalance.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="text-right text-red-600">
                    {transaction.debit.toNumber() > 0
                      ? transaction.debit.toNumber().toFixed(2)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    {transaction.credit.toNumber() > 0
                      ? transaction.credit.toNumber().toFixed(2)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={
                      transaction.balanceAtTransaction >= 0 
                        ? "default" 
                        : "destructive"
                    }>
                      {transaction.balanceAtTransaction.toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}