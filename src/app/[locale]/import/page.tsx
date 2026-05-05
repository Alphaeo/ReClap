import { NavBar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NetflixImporter } from "./netflix-importer";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Download, FileText, CheckCircle } from "lucide-react";

type Locale = "fr" | "en";

export default async function ImportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locale as Locale) ?? "fr";
  const session = await getSession();
  if (!session?.user) redirect(`/${l}/auth/signin`);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar locale={l} />
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 pt-24 pb-16">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <span className="text-red-500 font-black text-lg">N</span>
            </div>
            <h1 className="text-3xl font-bold">
              {l === "fr" ? "Importer depuis Netflix" : "Import from Netflix"}
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            {l === "fr"
              ? "Récupère ton historique de visionnage Netflix et importe-le dans ReClap automatiquement."
              : "Retrieve your Netflix viewing history and import it into ReClap automatically."}
          </p>
        </div>

        {/* Instructions */}
        <Card className="border-border/50 bg-card/50 mb-6">
          <CardContent className="p-5 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              {l === "fr" ? "Comment obtenir ton fichier Netflix" : "How to get your Netflix file"}
            </h2>
            <ol className="space-y-3 text-sm text-muted-foreground">
              {(l === "fr" ? [
                "Va sur netflix.com et connecte-toi.",
                "Clique sur ton avatar → Compte.",
                "Dans \"Profil & contrôle parental\", sélectionne ton profil.",
                "Descends jusqu'à \"Visualisation\" → clique sur \"Télécharger tout\".",
                "Un fichier NetflixViewingHistory.csv sera téléchargé.",
                "Reviens ici et uploade ce fichier.",
              ] : [
                "Go to netflix.com and sign in.",
                "Click your avatar → Account.",
                "Under 'Profile & Parental Controls', select your profile.",
                "Scroll to 'Viewing activity' → click 'Download all'.",
                "A NetflixViewingHistory.csv file will be downloaded.",
                "Come back here and upload that file.",
              ]).map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <NetflixImporter locale={l} />
      </main>
    </div>
  );
}
