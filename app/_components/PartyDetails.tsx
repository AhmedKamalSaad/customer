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
import { PartyType } from "@prisma/client";
import { addTransaction, updateTransactionField } from "@/app/lib/actions";
import { ExportExcelButton } from "./ExcelButton";
import { toLocalDatetimeString } from "../lib/DateToLocal";
import { DeleteTransactionWithDialog } from "./DeleteTransactionWithDialog";

interface Transaction {
  id: string;
  description: string;
  debit: number;
  credit: number;
  bank: string;
  date: Date | null;
  createdAt: Date;
}

interface PartyPageProps {
  party: {
    id: string;
    name: string;
    type: PartyType;
    transactions: Transaction[];
  };
  partyType: PartyType;
}

export function PartyPage({ party, partyType }: PartyPageProps) {
  let runningBalance = 0;
  const transactionsWithBalance = party.transactions.map((tx) => {
    runningBalance += tx.debit - tx.credit;
    return {
      ...tx,
      balanceAtTransaction: runningBalance,
    };
  }).reverse();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">{party.name}</h1>
        <div className="text-xl">
          الرصيد الحالي:{" "}
          <Badge variant={runningBalance >= 0 ? "default" : "destructive"}>
            {runningBalance.toFixed(2)}
          </Badge>
        </div>
        <ExportExcelButton partyId={party.id} />
      </div>

      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">إضافة معاملة</h2>
          <form action={addTransaction} className="space-y-4">
            <input type="hidden" name="partyId" value={party.id} />
            <input type="hidden" name="partyType" value={partyType} />

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
                <Label htmlFor="debit">مدين</Label>
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
                <Label htmlFor="credit">دائن</Label>
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
                <Select name="bank" required={false}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="اختر البنك" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none"></SelectItem>
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
                  type="date"
                  required
                  className="mt-1"
                  defaultValue={toLocalDatetimeString(new Date())}
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              إضافة معاملة
            </Button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">سجل المعاملات</h2>
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[800px]">
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
                          className="min-w-[200px] w-full"
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
                          defaultValue={transaction.debit.toFixed(2)}
                          className="min-w-[100px] w-full text-right"
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
                          defaultValue={transaction.credit.toFixed(2)}
                          className="min-w-[100px] w-full text-right"
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
                          defaultValue={transaction.bank || ""}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="اختر البنك" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none"></SelectItem>
                            <SelectItem value="كاش">كاش</SelectItem>
                            <SelectItem value="بنك البلاد">
                              بنك البلاد
                            </SelectItem>
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
                          type="date"
                          className="min-w-[180px] w-full"
                          name="date"
                          defaultValue={toLocalDatetimeString(
                            transaction.date
                              ? new Date(transaction.date)
                              : new Date(transaction.createdAt)
                          )}
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
                      <DeleteTransactionWithDialog
                        id={transaction.id}
                        itemName={transaction.description}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
