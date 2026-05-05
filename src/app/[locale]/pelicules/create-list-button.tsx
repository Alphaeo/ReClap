"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createList } from "@/lib/list-actions";

export function CreateListButton({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreate = () => {
    if (!name.trim()) return;
    startTransition(async () => {
      const id = await createList({ name: name.trim(), description: description.trim() || undefined });
      setOpen(false);
      setName("");
      setDescription("");
      router.push(`/${locale}/pelicules/${id}`);
    });
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 glow-red">
        <Plus className="w-4 h-4" />
        {locale === "fr" ? "Nouvelle pelicule" : "New pelicule"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border/50">
          <DialogHeader>
            <DialogTitle>{locale === "fr" ? "Créer une pelicule" : "Create a pelicule"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                {locale === "fr" ? "Nom de la pelicule" : "Pelicule name"}
              </label>
              <Input
                placeholder={locale === "fr" ? "Ex : Films à voir cet été" : "E.g. Films to watch this summer"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background/50"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                {locale === "fr" ? "Description (optionnel)" : "Description (optional)"}
              </label>
              <Textarea
                placeholder={locale === "fr" ? "Décris ta liste..." : "Describe your list..."}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-background/50 resize-none"
                rows={2}
              />
            </div>
            <Button
              onClick={handleCreate}
              disabled={isPending || !name.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isPending ? "..." : locale === "fr" ? "Créer" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
