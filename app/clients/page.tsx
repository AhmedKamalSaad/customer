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

export default async function ClientsPage() {
  const clients = await prisma.client.findMany();

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
            <TableHead>الرصيد</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>{client.name}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    client.balance.toNumber() >= 0 ? "default" : "destructive"
                  }
                >
                  {client.balance.toNumber().toFixed(2)}
                </Badge>
              </TableCell>
              <TableCell>
                <Link href={`/clients/${client.id}`}>
                  <Button variant="outline">عرض التفاصيل</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}