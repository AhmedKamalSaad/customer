// app/clients/[id]/page.tsx
import { PartyPage } from "@/app/_components/PartyDetails";
import { prisma } from "@/prisma/client";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
        })),
      }}
      partyType="CUSTOMER"
    />
  );
}
