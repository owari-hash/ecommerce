import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { fetchTenantConfig } from '../lib/tenantConfig';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('x-tenant-host') ?? headersList.get('host') ?? 'localhost';
  const tenantSlug = headersList.get('x-tenant-slug');
  const config = await fetchTenantConfig(host, tenantSlug);
  const name = config?.branding?.name ?? 'Дэлгүүр';
  return { title: `Бидний тухай | ${name}` };
}

export default async function AboutPage() {
  const headersList = await headers();
  const host = headersList.get('x-tenant-host') ?? headersList.get('host') ?? 'localhost';
  const tenantSlug = headersList.get('x-tenant-slug');
  const config = await fetchTenantConfig(host, tenantSlug);

  const name = config?.branding?.name ?? 'Дэлгүүр';
  const logo = config?.branding?.logo ?? '';
  const primaryColor = config?.branding?.primaryColor ?? '#D32F2F';
  const initials = name.slice(0, 2).toUpperCase();

  // Split description by newline into paragraphs; fall back to placeholdersss
  const rawDesc = config?.branding?.description ?? '';
  const paragraphs = rawDesc
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const phone = config?.contact?.phone ?? '';
  const email = config?.contact?.email ?? '';
  const address = config?.contact?.address ?? '';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-primary">Нүүр</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Бидний тухай</span>
      </nav>

      <h1 className="text-2xl font-black text-gray-800 mb-8">Бидний тухай</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="grid md:grid-cols-2 gap-10 items-center mb-10">
          {/* Text */}
          <div>
            <h2 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>{name}</h2>
            {paragraphs.length > 0 ? (
              paragraphs.map((para, i) => (
                <p key={i} className="text-gray-600 leading-relaxed mb-4 last:mb-0">
                  {para}
                </p>
              ))
            ) : (
              <p className="text-gray-400 italic text-sm">
                Дэлгүүрийн тухай мэдээлэл удахгүй нэмэгдэнэ.
              </p>
            )}
          </div>

          {/* Logo / monogram */}
          <div className="flex items-center justify-center">
            {logo ? (
              <div className="relative w-48 h-48 rounded-2xl overflow-hidden border border-gray-100 shadow-lg">
                <Image src={logo} alt={name} fill className="object-contain p-4" sizes="192px" />
              </div>
            ) : (
              <div
                className="w-48 h-48 rounded-full flex items-center justify-center shadow-2xl"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}99)` }}
              >
                <span className="text-white text-6xl font-black">{initials}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact strip — only show if any contact info exists */}
        {(phone || email || address) && (
          <div className="pt-6 border-t border-gray-100 flex flex-wrap gap-6 text-sm text-gray-600">
            {phone && (
              <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {phone}
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {email}
              </a>
            )}
            {address && (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {address}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
