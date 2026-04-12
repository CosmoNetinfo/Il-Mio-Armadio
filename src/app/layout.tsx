import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { AuthProvider } from "@/context/AuthContext";
import AuthOverlay from "@/components/AuthOverlay";

export const metadata: Metadata = {
  title: "IL MIO ARMADIO - Virtual Closet",
  description: "Il tuo guardaroba virtuale sempre con te",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>
        <AuthProvider>
          <AuthOverlay />
          <Header />
          <main className="app-container">
            {children}
          </main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
