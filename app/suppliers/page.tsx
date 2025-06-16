export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
import { PartyType } from "@prisma/client";
import { PartiesTable } from "../_components/PartiesTable";
import { getPartiesWithSummary } from "../lib/parties";
import { checkAdminSession } from "@/lib/actions/checkAdminSession";

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await checkAdminSession();
  const { search } = await searchParams;
  const searchText = typeof search === "string" ? search : "";
  const parties = await getPartiesWithSummary(PartyType.SUPPLIER, searchText);
  return <PartiesTable parties={parties} partyType={PartyType.SUPPLIER} />;
}
