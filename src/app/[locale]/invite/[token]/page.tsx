import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { joinListByToken } from "@/lib/list-actions";

export default async function InvitePage({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale, token } = await params;
  const session = await getSession();

  if (!session?.user) redirect(`/${locale}/auth/signin?redirect=/invite/${token}`);

  try {
    const listId = await joinListByToken(token);
    redirect(`/${locale}/pelicules/${listId}`);
  } catch {
    redirect(`/${locale}/pelicules`);
  }
}
