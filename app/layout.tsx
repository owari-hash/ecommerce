import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CompareBar from "./components/CompareBar";
import MobileBottomNav from "./components/MobileBottomNav";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Их Наяд | Электрон барааны дэлгүүр",
  description: "ЭЛЕКТРОН БАРААНЫ ДЭЛГҮҮР",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mn" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-[#f5f6f8]">
        <Header />
        <main className="flex-1 pb-24 md:pb-0">{children}</main>
        <Footer />
        <CompareBar />
        <MobileBottomNav />
      </body>
    </html>
  );
}
