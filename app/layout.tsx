import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MobileBottomNav from "./components/MobileBottomNav";
import CompareBar from "./components/CompareBar";
import ScrollToTop from "./components/ScrollToTop";
import NavigationProgress from "./components/NavigationProgress";
import { TenantProvider } from "./lib/TenantContext";
import { fetchTenantConfig } from "./lib/tenantConfig";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Их Наяд Плаза",
  description: "Бүх төрлийн бараа, хэрэгсэл",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#D32F2F",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers();
  const host = headersList.get("x-tenant-host") ?? headersList.get("host") ?? "localhost";
  const config = await fetchTenantConfig(host);

  // Override Tailwind @theme defaults with tenant branding
  const cssVars = `
    --color-primary: ${config.branding.primaryColor};
    --color-primary-dark: color-mix(in srgb, ${config.branding.primaryColor} 85%, black);
    --color-primary-light: color-mix(in srgb, ${config.branding.primaryColor} 85%, white);
    --font-body: '${config.branding.font}', sans-serif;
  `;

  return (
    <html lang="mn" className={inter.variable}>
      <head>
        <style>{`:root { ${cssVars} }`}</style>
      </head>
      <body className="min-h-screen flex flex-col bg-[#f5f6f8] overflow-x-hidden">
        <TenantProvider config={config}>
          <NavigationProgress />
          <Header />
          <main className="flex-1 pb-24 md:pb-0">{children}</main>
          <Footer />
          <MobileBottomNav />
          <CompareBar />
          <ScrollToTop />
        </TenantProvider>
      </body>
    </html>
  );
}
