"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Clapperboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { signIn } from "@/lib/auth-client";

export default function SignInPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn.email({ email, password });
    setLoading(false);
    if (res.error) {
      setError(t("errorInvalid"));
    } else {
      router.push(`/${locale}/dashboard`);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href={`/${locale}`} className="flex items-center justify-center gap-2 mb-8">
          <Clapperboard className="w-7 h-7 text-primary" />
          <span className="text-2xl font-bold">ReClap</span>
        </Link>

        <Card className="border-border/50 bg-card/80">
          <CardContent className="pt-6">
            <h1 className="text-xl font-bold mb-6 text-center">{t("signin")}</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">{t("email")}</label>
                <Input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">{t("password")}</label>
                <Input
                  type="password"
                  placeholder={t("passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>

              {error && <p className="text-sm text-primary text-center">{error}</p>}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-red"
                disabled={loading}
              >
                {loading ? "..." : t("signinBtn")}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {t("noAccount")}{" "}
              <Link href={`/${locale}/auth/signup`} className="text-primary hover:underline">
                {t("signupLink")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
