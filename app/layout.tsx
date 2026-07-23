import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import { headers } from "next/headers";
import { SearchX } from "lucide-react";
import "./globals.css";
import Header from "./components/Header";
import HeaderSpacer from "./components/HeaderSpacer";
import Footer from "./components/Footer";
import MobileBottomNav from "./components/MobileBottomNav";
import ScrollToTop from "./components/ScrollToTop";
import NavigationProgress from "./components/NavigationProgress";
import { TenantProvider } from "./lib/TenantContext";
import { fetchTenantConfig } from "./lib/tenantConfig";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
});

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("x-tenant-host") ?? headersList.get("host") ?? "localhost";
  const tenantSlug = headersList.get("x-tenant-slug");
  
  const config = await fetchTenantConfig(host, tenantSlug);

  const tenantName = config?.branding?.name || "Дэлгүүр";
  const logo = config?.branding?.logo || "/logo.png";

  return {
    // `%s | <tenant>` so each route's own title shows with the tenant name;
    // pages without a title fall back to just the tenant name.
    title: {
      default: tenantName,
      template: `%s | ${tenantName}`,
    },
    description: config?.branding?.description || "Бүх төрлийн бараа, хэрэгсэл",
    icons: {
      icon: logo,
      shortcut: logo,
      apple: logo,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#D32F2F",
};

import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";

function logDebug(msg: string) {
  try {
    const logPath = path.join(process.cwd(), "debug.log");
    fs.appendFileSync(logPath, `${new Date().toISOString()} [layout] ${msg}\n`);
  } catch (e: any) {
    console.error("DEBUG LOG WRITE FAILED:", e.message);
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers();
  const host = headersList.get("x-tenant-host") ?? headersList.get("host") ?? "localhost";
  const tenantSlug = headersList.get("x-tenant-slug");

  const allHeaders: Record<string, string> = {};
  headersList.forEach((value, key) => {
    allHeaders[key] = value;
  });

  logDebug(`host: ${host}, tenantSlug: ${tenantSlug}`);
  logDebug(`Headers: ${JSON.stringify(allHeaders)}`);

  const config = await fetchTenantConfig(host, tenantSlug);
  logDebug(`Resolved config tenantId: ${config ? config.tenantId : 'null'}`);

  if (!config) {
    return (
      <html lang="mn" className={roboto.variable} data-scroll-behavior="smooth">
        <head>
          <title>Суваг олдсонгүй | Их Наяд Плаза</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
          <style>{`
            body {
              font-family: var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 0;
            }
          `}</style>
        </head>
        <body className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
          <div className="max-w-md w-full text-center bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100/80 transition-all">
            <SearchX className="w-20 h-20 mx-auto mb-6 text-rose-300 select-none animate-bounce" strokeWidth={1.4} style={{ animationDuration: '3s' }} />
            <h1 className="text-6xl font-black text-rose-600 mb-4 tracking-tight">404</h1>
            <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-wide">Сайт олдсонгүй</h2>
            <p className="text-slate-400 mb-8 leading-relaxed text-sm">
              Таны хандахыг хүссэн цахим дэлгүүр (суваг) олдсонгүй. Хаягаа зөв оруулсан эсэхээ шалгана уу.
            </p>
            <a 
              href="http://103.236.194.106:7000/"
              className="inline-block w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-[0_10px_20px_rgba(225,29,72,0.2)] hover:shadow-[0_10px_25px_rgba(225,29,72,0.3)] hover:-translate-y-0.5 active:translate-y-0 select-none text-sm tracking-wide"
              style={{ textDecoration: 'none' }}
            >
              Үндсэн сайт руу буцах
            </a>
          </div>
        </body>
      </html>
    );
  }

  // Override Tailwind @theme defaults with tenant branding
  const cssVars = `
    --color-primary: ${config.branding.primaryColor};
    --color-primary-dark: color-mix(in srgb, ${config.branding.primaryColor} 85%, black);
    --color-primary-light: color-mix(in srgb, ${config.branding.primaryColor} 85%, white);
    --font-body: '${config.branding.font}', sans-serif;
  `;

  return (
    <html lang="mn" className={roboto.variable}>
      <head>
        <style>{`:root { ${cssVars} }`}</style>
      </head>
      <body className="min-h-screen flex flex-col bg-[#faf8f5] overflow-x-clip">
        <TenantProvider config={config}>
          <NavigationProgress />
          <Header />
          <HeaderSpacer />
          <main className="flex-1 pb-24 md:pb-0">{children}</main>
          <Footer />
          <MobileBottomNav />
          <ScrollToTop />
        </TenantProvider>
      </body>
    </html>
  );
}
