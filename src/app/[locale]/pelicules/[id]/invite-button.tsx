"use client";

import { useState, useTransition } from "react";
import { Link2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createInviteLink } from "@/lib/list-actions";

export function InviteButton({ listId, locale }: { listId: string; locale: string }) {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    startTransition(async () => {
      const token = await createInviteLink(listId);
      const base = window.location.origin;
      setLink(`${base}/${locale}/invite/${token}`);
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => { setOpen(true); handleGenerate(); }} className="gap-2 border-border/60">
        <Link2 className="w-4 h-4" />
        {locale === "fr" ? "Inviter" : "Invite"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border/50">
          <DialogHeader>
            <DialogTitle>{locale === "fr" ? "Inviter des membres" : "Invite members"}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {locale === "fr"
              ? "Partage ce lien. Il expire dans 7 jours. Les personnes invitées pourront ajouter et modifier des films."
              : "Share this link. It expires in 7 days. Invited people will be able to add and edit films."}
          </p>
          {isPending ? (
            <div className="h-10 bg-muted animate-pulse rounded-md" />
          ) : link ? (
            <div className="flex gap-2">
              <Input value={link} readOnly className="bg-background/50 text-xs" />
              <Button size="sm" onClick={handleCopy} className="shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
