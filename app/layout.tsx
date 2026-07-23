import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Veille Kiné Sport",
  description: "Veille recrutement — kinésithérapie du sport de haut niveau",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
