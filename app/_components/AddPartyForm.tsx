"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PartyType } from "@prisma/client";
import { toLocalDatetimeString } from "../lib/DateToLocal";

export function AddPartyForm({
  partyType,
  action,
}: {
  partyType: PartyType;
  action: (formData: FormData) => void;
}) {
  const isSupplier = partyType === PartyType.SUPPLIER;
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(() => {
      action(formData);
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="type" value={partyType} />

      <div>
        <Label htmlFor="name">{isSupplier ? "اسم المورد" : "اسم العميل"}</Label>
        <Input id="name" name="name" type="text" required className="mt-1" />
      </div>

      <div>
        <Label htmlFor="balance">الرصيد المدين الأولي</Label>
        <Input
          id="balance"
          name="balance"
          type="number"
          step="0.01"
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="bank">البنك</Label>
        <Select name="bank" required={false}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="اختر البنك" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">بدون بنك</SelectItem>
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

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "جاري الإضافة..." : isSupplier ? "إضافة المورد" : "إضافة العميل"}
      </Button>
    </form>
  );
}
