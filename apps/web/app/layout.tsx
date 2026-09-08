import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = { title: "Kladrichat", description: "Messagerie d’équipe privée" };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="fr"><body>{children}</body></html>; }
