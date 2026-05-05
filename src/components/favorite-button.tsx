"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/lib/list-actions";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  type: "film" | "actor" | "director";
  tmdbId: number;
  name: string;
  imagePath?: string | null;
  initialFavorited: boolean;
  isLoggedIn: boolean;
  locale: string;
  size?: "sm" | "md";
}

export function FavoriteButton({ type, tmdbId, name, imagePath, initialFavorited, isLoggedIn, locale, size = "md" }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    if (!isLoggedIn) { router.push(`/${locale}/auth/signin`); return; }
    startTransition(async () => {
      const newState = await toggleFavorite({ type, tmdbId, name, imagePath });
      setFavorited(newState);
    });
  };

  const cls = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title={favorited ? (locale === "fr" ? "Retirer des favoris" : "Remove from favorites") : (locale === "fr" ? "Ajouter aux favoris" : "Add to favorites")}
      className={`transition-colors ${favorited ? "text-primary" : "text-white/30 hover:text-primary"}`}
    >
      <Heart className={`${cls} ${favorited ? "fill-primary" : ""} transition-all`} />
    </button>
  );
}
