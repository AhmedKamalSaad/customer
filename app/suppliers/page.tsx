export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
import { PartyType } from "@prisma/client";
import { PartiesTable } from "../_components/PartiesTable";
import { getPartiesWithSummary } from "../lib/parties";

export default async function SuppliersPage() {
  const parties = await getPartiesWithSummary(PartyType.SUPPLIER);
  return <PartiesTable parties={parties} partyType={PartyType.SUPPLIER} />;
}
