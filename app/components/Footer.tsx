'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useTenant } from '../lib/TenantContext';
import { useTenantHref } from '../lib/useTenantHref';

const footerSections = [
  {
    title: 'Танилцуулга',
    links: [
      { label: 'Бидний тухай', href: '/aboutus' },
      { label: 'Хамтран ажиллах', href: '/' },
      { label: 'Салбар дэлгүүр', href: '/store-locations' },
    ],
  },
  {
    title: 'Тусламж',
    links: [
      { label: 'Үйлчилгээний нөхцөл', href: '/terms' },
      { label: 'Нууцлалын баталгаа', href: '/privacy' },
      { label: 'Төлбөр буцаах хүсэлт', href: '/refund' },
    ],
  },
  {
    title: 'Онцлох',
    links: [
      { label: 'Брэндүүд', href: '/brands' },
      { label: 'Лизинг хүсэлт', href: '/leasing-form' },
      { label: 'Лизинг үйлчилгээ', href: '/leasing-all' },
    ],
  },
  {
    title: 'Илүү их',
    links: [
      { label: 'Мэдээ', href: '/news' },
      { label: 'Баталгааны нөхцөл', href: '/' },
      { label: 'Хүргэлтийн нөхцөл', href: '/delivery' },
    ],
  },
];

export default function Footer() {
  const { branding, contact } = useTenant();
  const tenantHref = useTenantHref();
  return (
    <footer className="bg-[#0a1628] text-gray-300 mt-10 mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-6 md:pt-14 md:pb-8">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 md:gap-10">
          {/* Brand column */}
          <div className="col-span-2">
            <div className="mb-5 flex items-center gap-3">
              {branding.logo ? (
                <Image src={branding.logo} alt={branding.name || 'Logo'} width={160} height={36} className="h-9 w-auto object-contain max-w-[160px] brightness-0 invert" style={{ width: 'auto' }} />
              ) : (
                <span className="font-black text-xl text-white">{branding.name}</span>
              )}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-5 max-w-[220px]">
              Чанартай бараа, хурдан хүргэлт. Таны найдвартай онлайн дэлгүүр.
            </p>
            <div className="space-y-2 text-sm">
              {contact?.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors group">
                  <span className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                  </span>
                  {contact.phone}
                </a>
              )}
              {contact?.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors group">
                  <span className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </span>
                  <span className="truncate">{contact.email}</span>
                </a>
              )}
              {contact?.address && (
                <p className="flex items-start gap-2.5 text-xs text-gray-500 leading-relaxed">
                  <span className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </span>
                  {contact.address}
                </p>
              )}
            </div>
          </div>

          {/* Link columns */}
          {footerSections.map(section => (
            <div key={section.title}>
              <h3 className="text-white font-bold mb-4 text-sm tracking-wide">{section.title}</h3>
              <ul className="space-y-2.5">
                {section.links.map(link => (
                  <li key={link.href}>
                    <Link href={tenantHref(link.href)} className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-1.5 group">
                      <span className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-primary transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider + bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <span>© 2026 {branding.name || 'Дэлгүүр'}. Бүх эрх хуулиар хамгаалагдсан.</span>
          <div className="flex items-center gap-4">
            <Link href={tenantHref('/privacy')} className="hover:text-gray-400 transition-colors">Нууцлал</Link>
            <Link href={tenantHref('/terms')} className="hover:text-gray-400 transition-colors">Нөхцөл</Link>
            <span className="text-gray-700">Powered by <span className="text-gray-400 font-semibold">Zevtabs</span></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
