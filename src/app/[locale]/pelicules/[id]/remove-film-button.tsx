"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { removeFilmFromList } from "@/lib/list-actions";

export function RemoveFilmButton({ listId, filmId, locale }: { listId: string; filmId: string; locale: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      onClick={(e) => { e.preventDefault(); startTransition(() => removeFilmFromList(listId, filmId)); }}
      disabled={isPending}
      className="w-6 h-6 rounded-full bg-black/80 flex items-center justify-center hover:bg-primary transition-colors"
      title={locale === "fr" ? "Retirer" : "Remove"}
    >
      <X className="w-3 h-3 text-white" />
    </button>
  );
}
