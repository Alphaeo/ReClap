"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchInput({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("q", value);
      else params.delete("q");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    }, 350);
  };

  return (
    <div className="relative max-w-xl">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        defaultValue={searchParams.get("q") ?? ""}
        onChange={handleChange}
        className="pl-10 h-11 bg-card/50 border-border/60 text-base"
        autoFocus
      />
    </div>
  );
}
