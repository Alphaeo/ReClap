"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle, AlertCircle, Film, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ParsedEntry { title: string; date: string; matched?: boolean; tmdbId?: number; posterPath?: string | null }

export function NetflixImporter({ locale }: { locale: string }) {
  const [entries, setEntries] = useState<ParsedEntry[]>([]);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(0);
  const [phase, setPhase] = useState<"idle" | "parsed" | "matching" | "done">("idle");
  const fileRef = useRef<HTMLInputElement>(null);
  const l = locale;

  const parseCSV = (text: string): ParsedEntry[] => {
    const lines = text.split("\n").slice(1).filter(Boolean);
    return lines
      .map((line) => {
        const parts = line.split(",");
        const title = parts[0]?.replace(/"/g, "").trim();
        const date = parts[1]?.replace(/"/g, "").trim();
        if (!title || !date) return null;
        // Filter out series episodes (contain ":")
        if (title.includes(":") && title.match(/Season|Episode|Saison|Épisode/i)) return null;
        return { title, date };
      })
      .filter(Boolean) as ParsedEntry[];
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      // Deduplicate by title
      const seen = new Set<string>();
      const unique = parsed.filter((e) => {
        if (seen.has(e.title)) return false;
        seen.add(e.title);
        return true;
      });
      setEntries(unique.slice(0, 100));
      setPhase("parsed");
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) handleFile(file);
  };

  const handleImport = async () => {
    setPhase("matching");
    setImporting(true);
    let count = 0;

    for (const entry of entries.slice(0, 50)) {
      try {
        const res = await fetch(`/api/import-netflix`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: entry.title, date: entry.date }),
        });
        if (res.ok) count++;
        setImported(count);
      } catch { /* skip */ }
      await new Promise((r) => setTimeout(r, 100));
    }

    setImporting(false);
    setPhase("done");
  };

  if (phase === "done") {
    return (
      <Card className="border-border/50 bg-card/50 text-center p-8">
        <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">{l === "fr" ? "Import terminé !" : "Import complete!"}</h2>
        <p className="text-muted-foreground text-sm mb-6">
          {l === "fr" ? `${imported} films importés dans ton journal.` : `${imported} films imported to your journal.`}
        </p>
        <Button onClick={() => { setPhase("idle"); setEntries([]); setImported(0); }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground">
          {l === "fr" ? "Importer un autre fichier" : "Import another file"}
        </Button>
      </Card>
    );
  }

  if (phase === "parsed" || phase === "matching") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {entries.length} {l === "fr" ? "films détectés" : "films detected"}
          </p>
          <Button onClick={handleImport} disabled={importing}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
            {importing
              ? `${l === "fr" ? "Import" : "Importing"}... ${imported}/${Math.min(entries.length, 50)}`
              : l === "fr" ? "Importer dans ReClap" : "Import to ReClap"}
          </Button>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-1 border border-border/50 rounded-lg p-2">
          {entries.map((entry, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-sm">
              <Film className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="flex-1 truncate">{entry.title}</span>
              <span className="text-xs text-muted-foreground shrink-0">{entry.date}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => fileRef.current?.click()}
      className="border-2 border-dashed border-border/50 hover:border-primary/50 rounded-xl p-12 text-center cursor-pointer transition-colors group"
    >
      <input ref={fileRef} type="file" accept=".csv" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground group-hover:text-primary transition-colors" />
      <p className="font-medium mb-1">
        {l === "fr" ? "Dépose ton fichier CSV ici" : "Drop your CSV file here"}
      </p>
      <p className="text-sm text-muted-foreground">
        {l === "fr" ? "ou clique pour sélectionner" : "or click to select"}
      </p>
      <Badge variant="outline" className="mt-4 border-border/50 text-xs">NetflixViewingHistory.csv</Badge>
    </div>
  );
}
