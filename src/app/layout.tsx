import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SkipNavLink } from "@/components/accessibility/skip-nav-link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KN Biosciences - Agricultural & Aquaculture Solutions",
  description:
    "Leading provider of bio-fertilizers, pre-probiotics, and sustainable agricultural solutions for farmers and businesses.",
  keywords:
    "bio-fertilizers, pre-probiotics, agriculture, aquaculture, sustainable farming, organic farming",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body 
        className={inter.className}
        suppressHydrationWarning={true}
      >
        <SkipNavLink targetId="main-content" />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
