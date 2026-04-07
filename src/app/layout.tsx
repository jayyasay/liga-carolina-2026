import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Liga Stats Recorder",
  description: "Premium Basketball Statistics & Match Scheduling",
  icons: {
    icon: '/favicon.png',
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="app-container">
          <main>{children}</main>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
