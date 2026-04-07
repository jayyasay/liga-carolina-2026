import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Liga Stats Recorder",
  description: "Premium Basketball Statistics & Match Scheduling",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="app-container">
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
