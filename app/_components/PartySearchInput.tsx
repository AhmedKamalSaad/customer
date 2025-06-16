"use client";

import { useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";

export default function PartySearchInput({
  placeholder,
}: {
  placeholder: string;
}) {
  const [search, setSearch] = useQueryState("search", {
    defaultValue: "",
    shallow: false,
  });

  return (
    <Input
      dir="rtl"
      value={search}
      onChange={(e) => setSearch(e.target.value || null)}
      placeholder={placeholder}
      className="max-w-xs"
    />
  );
}
