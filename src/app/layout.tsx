import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Il Mio Armadio - Virtual Closet",
  description: "Organizza il tuo armadio e prova i vestiti virtualmente",
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, themeColor: '#0d0d12', viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>
          <Header />
          <main className="app-container">
            {children}
          </main>
          <BottomNav />
      </body>
    </html>
  );
}
