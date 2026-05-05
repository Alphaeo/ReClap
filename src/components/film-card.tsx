import Link from "next/link";
import Image from "next/image";
import { tmdbImage } from "@/lib/tmdb";
import { Star } from "lucide-react";

interface FilmCardProps {
  film: {
    id: number;
    title: string;
    poster_path: string | null;
    release_date?: string;
    vote_average?: number;
  };
  locale: string;
  rank?: number;
  size?: "sm" | "md" | "lg";
}

export function FilmCard({ film, locale, rank, size = "md" }: FilmCardProps) {
  const poster = tmdbImage(film.poster_path, size === "lg" ? "w500" : "w342");
  const heightClass = size === "sm" ? "h-44" : size === "lg" ? "h-64" : "h-52";

  return (
    <Link href={`/${locale}/film/${film.id}`}>
      <div className="film-card group relative overflow-hidden bg-card cursor-pointer">
        <div className={`relative ${heightClass} overflow-hidden`}>
          {poster ? (
            <Image
              src={poster}
              alt={film.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes={size === "lg" ? "400px" : size === "sm" ? "150px" : "200px"}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="font-display text-3xl text-muted-foreground/30">
                {film.title[0]}
              </span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Rank badge */}
          {rank && (
            <div className="absolute top-2 left-2 font-mono text-[10px] text-white/60 bg-black/50 backdrop-blur-sm px-1.5 py-0.5">
              #{rank}
            </div>
          )}

          {/* Rating */}
          {film.vote_average && film.vote_average > 0 && (
            <div className="absolute top-2 right-2 font-mono text-[10px] text-white/80 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 flex items-center gap-1">
              <Star className="w-2.5 h-2.5 fill-primary text-primary" />
              {film.vote_average.toFixed(1)}
            </div>
          )}

          {/* Info on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <p className="font-display text-sm text-white font-semibold leading-tight line-clamp-2">{film.title}</p>
            {film.release_date && (
              <p className="font-mono text-[10px] text-white/50 mt-1">{film.release_date.slice(0, 4)}</p>
            )}
          </div>
        </div>

        {/* Title below poster (always visible on mobile) */}
        <div className="p-2 lg:hidden">
          <p className="font-sans text-xs font-medium leading-tight line-clamp-1 group-hover:text-primary transition-colors">{film.title}</p>
          {film.release_date && (
            <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{film.release_date.slice(0, 4)}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
