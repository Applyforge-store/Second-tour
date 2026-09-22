import Link from "next/link";
import { requireGarageAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireGarageAdmin();
  return <div className="app-shell">
    <aside className="sidebar">
      <Link className="brand" href="/dashboard"><span className="mark">2</span>Second Tour</Link>
      <nav>
        <Link href="/dashboard">Accueil</Link>
        <Link href="/dashboard/clients">Clients</Link>
        <Link href="/dashboard/reminders">Rappels</Link>
        <Link href="/dashboard/settings">Réglages</Link>
      </nav>
      <footer>{session.email}<form action="/logout" method="post"><button type="submit">Se déconnecter</button></form></footer>
    </aside>
    <main className="main">{children}</main>
  </div>;
}
