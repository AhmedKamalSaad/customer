// components/DeletePartyConfirmDialog.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { deleteParty } from "../lib/actions";

export function DeletePartyConfirmDialog({ partyId }: { partyId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">حذف</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>هل أنت متأكد من حذف العميل؟</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            await deleteParty(formData);
            setOpen(false);
          }}
        >
          <input type="hidden" name="id" value={partyId} />
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" variant="destructive">
              تأكيد الحذف
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
