import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Second Tour", template: "%s · Second Tour" },
  description: "Rappels d’entretien simples pour garages indépendants.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
