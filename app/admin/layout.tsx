import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSuperAdmin();
  return <div className="app-shell"><aside className="sidebar"><Link className="brand" href="/admin/garages"><span className="mark">2</span>Second Tour</Link><nav><Link href="/admin/garages">Garages</Link></nav><footer>Administration<br />{session.email}<form action="/logout" method="post"><button type="submit">Se déconnecter</button></form></footer></aside><main className="main">{children}</main></div>;
}
