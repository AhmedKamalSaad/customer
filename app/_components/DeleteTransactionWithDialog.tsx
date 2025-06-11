"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTransition } from "react";
import { deleteTransaction } from "../lib/actions";

export function DeleteTransactionWithDialog({
  id,
  itemName,
}: {
  id: string;
  itemName: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteTransaction(id);
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          حذف
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تأكيد الحذف</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground mb-4">
          هل أنت متأكد أنك تريد حذف <span className="font-bold">{itemName}</span>؟ لا يمكن التراجع عن هذا الإجراء.
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "جاري الحذف..." : "نعم، احذف"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
