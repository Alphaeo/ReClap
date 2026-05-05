import Link from "next/link";
import { Clapperboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <Clapperboard className="w-14 h-14 text-primary mb-6 opacity-80" />
      <h1 className="text-7xl font-black text-primary mb-2">404</h1>
      <h2 className="text-2xl font-bold mb-3">Page introuvable</h2>
      <p className="text-muted-foreground max-w-sm mb-8">
        Cette scène a été coupée au montage. Retourne à l&apos;accueil pour continuer ta séance.
      </p>
      <Link href="/fr">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground glow-red">
          Retour à l&apos;accueil
        </Button>
      </Link>
    </div>
  );
}
