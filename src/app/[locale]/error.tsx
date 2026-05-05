"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Clapperboard, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <Clapperboard className="w-12 h-12 text-primary mb-6 opacity-60" />
      <h1 className="text-2xl font-bold mb-3">Une erreur est survenue</h1>
      <p className="text-muted-foreground max-w-sm mb-8">
        Le projecteur a disjoncté. Réessaie ou retourne à l&apos;accueil.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline" className="gap-2 border-border/60">
          <RefreshCw className="w-4 h-4" /> Réessayer
        </Button>
        <Link href="/fr">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Accueil</Button>
        </Link>
      </div>
    </div>
  );
}
