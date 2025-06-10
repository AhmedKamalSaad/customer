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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { prisma } from "@/prisma/client";
import {
  addTransaction,
  updateTransactionField,
  deleteTransaction,
} from "@/app/lib/actions";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id: id },
    include: {
      transactions: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!client) return <div>العميل غير موجود</div>;

  // حساب الرصيد التراكمي
  let runningBalance = 0;
  const transactionsWithBalance = client.transactions
    .map((tx) => {
      runningBalance =
        runningBalance + tx.debit.toNumber() - tx.credit.toNumber();
      return {
        ...tx,
        balanceAtTransaction: runningBalance,
      };
    })
    .reverse();

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

      <div className="flex flex-col gap-8">
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bank">البنك</Label>
                <Select name="bank" required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="اختر البنك" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="كاش">كاش</SelectItem>
                    <SelectItem value="بنك البلاد">بنك البلاد</SelectItem>
                    <SelectItem value="بنك الراجحى">بنك الراجحى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">تاريخ المعاملة</Label>
                <Input
                  id="date"
                  name="date"
                  type="datetime-local"
                  required
                  className="mt-1"
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
                <TableHead>البنك</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead className="text-right">الرصيد</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionsWithBalance.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <form
                      className="flex gap-2"
                      action={async (formData: FormData) => {
                        "use server";
                        const newDesc = formData.get("description") as string;
                        await updateTransactionField(
                          transaction.id,
                          "description",
                          newDesc
                        );
                      }}
                    >
                      <Input
                        type="text"
                        name="description"
                        defaultValue={transaction.description}
                      />
                      <Button type="submit" size="sm">
                        حفظ
                      </Button>
                    </form>
                  </TableCell>

                  <TableCell className="text-right text-red-600">
                    <form
                      className="flex gap-2"
                      action={async (formData: FormData) => {
                        "use server";
                        const val = formData.get("debit") as string;
                        await updateTransactionField(
                          transaction.id,
                          "debit",
                          val
                        );
                      }}
                    >
                      <Input
                        type="number"
                        step="0.01"
                        name="debit"
                        defaultValue={transaction.debit.toNumber().toFixed(2)}
                        className="w-full text-right"
                      />
                      <Button type="submit" size="sm">
                        حفظ
                      </Button>
                    </form>
                  </TableCell>

                  <TableCell className="text-right text-green-600">
                    <form
                      className="flex gap-2"
                      action={async (formData: FormData) => {
                        "use server";
                        const val = formData.get("credit") as string;
                        await updateTransactionField(
                          transaction.id,
                          "credit",
                          val
                        );
                      }}
                    >
                      <Input
                        type="number"
                        step="0.01"
                        name="credit"
                        defaultValue={transaction.credit.toNumber().toFixed(2)}
                        className="w-full text-right"
                      />
                      <Button type="submit" size="sm">
                        حفظ
                      </Button>
                    </form>
                  </TableCell>

                  <TableCell>
                    <form
                      className="flex gap-2"
                      action={async (formData: FormData) => {
                        "use server";
                        const val = formData.get("bank") as string;
                        await updateTransactionField(
                          transaction.id,
                          "bank",
                          val
                        );
                      }}
                    >
                      <Select
                        name="bank"
                        defaultValue={transaction.bank || "كاش"}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="اختر البنك" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="كاش">كاش</SelectItem>
                          <SelectItem value="بنك البلاد">بنك البلاد</SelectItem>
                          <SelectItem value="بنك الراجحى">
                            بنك الراجحى
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Button type="submit" size="sm">
                        حفظ
                      </Button>
                    </form>
                  </TableCell>

                  <TableCell>
                    <form
                      className="flex gap-2"
                      action={async (formData: FormData) => {
                        "use server";
                        const val = formData.get("date") as string;
                        await updateTransactionField(
                          transaction.id,
                          "date",
                          val
                        );
                      }}
                    >
                      <Input
                        type="datetime-local"
                        name="date"
                        defaultValue={
                          transaction.date
                            ? new Date(transaction.date)
                                .toISOString()
                                .slice(0, 16)
                            : new Date(transaction.createdAt)
                                .toISOString()
                                .slice(0, 16)
                        }
                      />
                      <Button type="submit" size="sm">
                        حفظ
                      </Button>
                    </form>
                  </TableCell>

                  <TableCell className="text-right">
                    <Badge
                      variant={
                        transaction.balanceAtTransaction >= 0
                          ? "default"
                          : "destructive"
                      }
                    >
                      {transaction.balanceAtTransaction.toFixed(2)}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <form
                      action={async () => {
                        "use server";
                        await deleteTransaction(transaction.id);
                      }}
                    >
                      <Button type="submit" variant="destructive" size="sm">
                        حذف
                      </Button>
                    </form>
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
