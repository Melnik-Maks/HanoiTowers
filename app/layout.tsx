import type { Metadata } from "next";

import "@/app/globals.css";
import { APP_NAME } from "@/lib/constants";
import { AppHeader } from "@/components/layout/app-header";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Гра Ханойські вежі з рівнями, турнірами та leaderboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body>
        <div className="min-h-screen bg-gradient-to-br from-orange-100 via-cyan-50 to-rose-100">
          <AppHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
