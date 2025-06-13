"use client";

import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { PartyType } from "@prisma/client";

export function ExportPartiesExcelButton({
  partyType,
}: {
  partyType: PartyType;
}) {
  const [isPending, startTransition] = useTransition();

  const handleExport = async () => {
    const res = await fetch("/api/export-parties", {
      method: "POST",
      body: JSON.stringify({ partyType }),
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", `parties-${partyType.toLowerCase()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <Button
      dir="rtl"
      onClick={() => startTransition(handleExport)}
      disabled={isPending}
    >
      {isPending ? "جارٍ التصدير..." : "تصدير لـ Excel"}
    </Button>
  );
}

export default ExportPartiesExcelButton;
