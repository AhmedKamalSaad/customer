"use client";

import { Button } from "@/components/ui/button";
import { useTransition } from "react";

export function ExportExcelButton({ partyId }: { partyId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleExport = async () => {
    const res = await fetch("/api/export-transactions", {
      method: "POST",
      body: JSON.stringify({ partyId }),
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", `transactions.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <Button dir="rtl" onClick={() => startTransition(handleExport)} disabled={isPending}>
      {isPending ? "جارٍ التصدير..." : "تصدير إلى Excel"}
    </Button>
  );
}
