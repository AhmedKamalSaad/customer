// app/clients/[id]/page.tsx
import { PartyPage } from "@/app/_components/PartyDetails";
import { checkAdminSession } from "@/lib/actions/checkAdminSession";
import { prisma } from "@/prisma/client";

export default async function SupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
    await checkAdminSession();
  
  const { id } = await params;
  const client = await prisma.party.findUnique({
    where: { id: id },
    include: {
      transactions: {
        orderBy: { date: "asc" },
      },
    },
  });

  if (!client) return <div>العميل غير موجود</div>;

  return (
    <PartyPage
      party={{
        ...client,
        transactions: client.transactions.map((tx) => ({
          ...tx,
          debit: tx.debit.toNumber(),
          credit: tx.credit.toNumber(),
          bank: tx.bank ?? "",
          expense: tx.expense ?? undefined
        })),
      }}
      partyType="SUPPLIER"
    />
  );
}
