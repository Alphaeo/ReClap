"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, BookmarkPlus, BookmarkCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { markWatched, removeWatched, toggleWatchlist } from "@/lib/actions";

interface FilmActionsProps {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  runtime?: number;
  genres?: string[];
  releaseYear?: number;
  initialWatched: boolean;
  initialInWatchlist: boolean;
  initialRating?: number | null;
  initialReview?: string | null;
  isLoggedIn: boolean;
  locale: string;
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
        >
          <Star className={`w-6 h-6 transition-colors ${s <= (hover || value) ? "text-primary fill-primary" : "text-white/20"}`} />
        </button>
      ))}
    </div>
  );
}

export function FilmActions({
  tmdbId, title, posterPath, runtime, genres, releaseYear,
  initialWatched, initialInWatchlist, initialRating, initialReview,
  isLoggedIn, locale,
}: FilmActionsProps) {
  const t = useTranslations("film");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [watched, setWatched] = useState(initialWatched);
  const [inWatchlist, setInWatchlist] = useState(initialInWatchlist);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(initialRating ?? 0);
  const [review, setReview] = useState(initialReview ?? "");

  const handleWatched = () => {
    if (!isLoggedIn) { router.push(`/${locale}/auth/signin`); return; }
    startTransition(async () => {
      if (watched) {
        await removeWatched(tmdbId);
        setWatched(false);
      } else {
        await markWatched({ tmdbId, title, posterPath, runtime, genres, releaseYear });
        setWatched(true);
        setShowReviewForm(true);
      }
    });
  };

  const handleWatchlist = () => {
    if (!isLoggedIn) { router.push(`/${locale}/auth/signin`); return; }
    startTransition(async () => {
      await toggleWatchlist({ tmdbId, title, posterPath });
      setInWatchlist((v) => !v);
    });
  };

  const handleSubmitReview = () => {
    startTransition(async () => {
      await markWatched({ tmdbId, title, posterPath, runtime, genres, releaseYear, rating: rating || undefined, review: review || undefined });
      setShowReviewForm(false);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleWatched}
          disabled={isPending}
          className={watched
            ? "bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 gap-2"
            : "bg-primary hover:bg-primary/90 text-primary-foreground gap-2 glow-red"}
        >
          {watched ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {watched ? t("removeWatched") : t("markWatched")}
        </Button>

        <Button
          onClick={handleWatchlist}
          disabled={isPending}
          variant="outline"
          className={`border-border/60 hover:bg-white/5 gap-2 ${inWatchlist ? "text-primary border-primary/30" : ""}`}
        >
          {inWatchlist ? <BookmarkCheck className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
          {inWatchlist ? t("removeFromWatchlist") : t("addToWatchlist")}
        </Button>

        {watched && !showReviewForm && (
          <Button variant="ghost" size="sm" onClick={() => setShowReviewForm(true)} className="text-muted-foreground">
            <Star className="w-4 h-4 mr-1.5" /> {t("writeReview")}
          </Button>
        )}
      </div>

      {showReviewForm && (
        <div className="border border-border/50 rounded-lg p-4 bg-card/50 space-y-3 max-w-xl">
          <div>
            <p className="text-sm font-medium mb-2">{t("rateFilm")}</p>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <div>
            <p className="text-sm font-medium mb-2">{t("yourReview")}</p>
            <Textarea
              placeholder={t("reviewPlaceholder")}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="bg-background/50 resize-none"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmitReview} disabled={isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {t("submitReview")}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowReviewForm(false)}>{locale === "fr" ? "Annuler" : "Cancel"}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
