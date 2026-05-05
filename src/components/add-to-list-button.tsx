"use client";

import { useState, useTransition, useEffect } from "react";
import { ListPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { addFilmToList } from "@/lib/list-actions";
import { useRouter } from "next/navigation";

interface UserList { id: string; name: string; filmCount: number }

interface AddToListButtonProps {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  isLoggedIn: boolean;
  locale: string;
}

export function AddToListButton({ tmdbId, title, posterPath, isLoggedIn, locale }: AddToListButtonProps) {
  const [open, setOpen] = useState(false);
  const [userLists, setUserLists] = useState<UserList[]>([]);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleOpen = async () => {
    if (!isLoggedIn) { router.push(`/${locale}/auth/signin`); return; }
    const res = await fetch("/api/my-lists");
    if (res.ok) setUserLists(await res.json());
    setOpen(true);
  };

  const handleAdd = (listId: string) => {
    startTransition(async () => {
      await addFilmToList({ listId, tmdbId, title, posterPath });
      setAdded((prev) => new Set([...prev, listId]));
    });
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen} className="border-border/60 hover:bg-white/5 gap-2">
        <ListPlus className="w-4 h-4" />
        {locale === "fr" ? "Pelicule" : "Add to list"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border/50">
          <DialogHeader>
            <DialogTitle>
              {locale === "fr" ? "Ajouter à une pelicule" : "Add to a pelicule"}
            </DialogTitle>
          </DialogHeader>
          {userLists.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-muted-foreground text-sm mb-3">
                {locale === "fr" ? "Tu n'as pas encore de pelicule." : "You don't have any pelicule yet."}
              </p>
              <Button size="sm" onClick={() => { setOpen(false); router.push(`/${locale}/pelicules`); }} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {locale === "fr" ? "Créer une pelicule" : "Create a pelicule"}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {userLists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => handleAdd(list.id)}
                  disabled={isPending || added.has(list.id)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-border/30 hover:border-primary/30"
                >
                  <div className="text-left">
                    <p className="font-medium text-sm">{list.name}</p>
                    <p className="text-xs text-muted-foreground">{list.filmCount} film{list.filmCount > 1 ? "s" : ""}</p>
                  </div>
                  {added.has(list.id) && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
