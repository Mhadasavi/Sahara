import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SAHARA – Your Simple Digital Companion",
  description: "An intelligent, accessible, and protective companion designed for senior citizens.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 selection:bg-amber-200">
        {children}
      </body>
    </html>
  );
}
