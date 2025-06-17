import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { addParty } from "@/app/lib/actions";
import { PartyType } from "@prisma/client";
import { AddPartyForm } from "@/app/_components/AddPartyForm";
import { checkAdminSession } from "@/lib/actions/checkAdminSession";

export default async function AddCustodyPage() {
  await checkAdminSession();

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>إضافة عهدة جديدة</CardTitle>
        </CardHeader>
        <CardContent>
          <AddPartyForm partyType={PartyType.CUSTODY} action={addParty} />
        </CardContent>
      </Card>
    </div>
  );
}
