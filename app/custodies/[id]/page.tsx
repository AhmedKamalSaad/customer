// app/clients/[id]/page.tsx
import { PartyPage } from "@/app/_components/PartyDetails";
import { checkAdminSession } from "@/lib/actions/checkAdminSession";
import { prisma } from "@/prisma/client";

export default async function CustodyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await checkAdminSession();

  const { id } = await params;
  const custody = await prisma.party.findUnique({
    where: { id: id },
    include: {
      transactions: {
        orderBy: { date: "asc" },
      },
    },
  });

  if (!custody) return <div>العهدة غير موجودة</div>;

  return (
    <PartyPage
      party={{
        ...custody,
        transactions: custody.transactions.map((tx) => ({
          ...tx,
          debit: tx.debit.toNumber(),
          credit: tx.credit.toNumber(),
          bank: tx.bank ?? "",
        })),
      }}
      partyType="CUSTODY"
    />
  );
}
