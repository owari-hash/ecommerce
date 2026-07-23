'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, Mail } from 'lucide-react';
import { useTenant } from '../lib/TenantContext';
import { useTenantHref } from '../lib/useTenantHref';

const footerSections = [
  {
    title: 'Компани',
    links: [
      { label: 'Бидний тухай', href: '/aboutus' },
      { label: 'Салбар дэлгүүр', href: '/store-locations' },
      { label: 'Брэндүүд', href: '/brands' },
      { label: 'Холбоо барих', href: '/contact' },
    ],
  },
  {
    title: 'Тусламж',
    links: [
      { label: 'Хүргэлтийн нөхцөл', href: '/delivery' },
      { label: 'Төлбөр буцаах хүсэлт', href: '/refund' },
      { label: 'Үйлчилгээний нөхцөл', href: '/terms' },
      { label: 'Нууцлалын баталгаа', href: '/privacy' },
    ],
  },
];

export default function Footer() {
  const { branding, contact } = useTenant();
  const tenantHref = useTenantHref();
  return (
    <footer className="relative bg-[#0a1628] text-gray-300 mt-6 mb-16 md:mb-0">
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
        <div className="flex flex-wrap items-start justify-between gap-x-12 gap-y-6">
          {/* Brand */}
          <div className="max-w-[260px]">
            {branding.logo ? (
              <span className="inline-flex items-center bg-white rounded-lg px-2.5 py-1.5 shadow-sm mb-3">
                <Image src={branding.logo} alt={branding.name || 'Logo'} width={140} height={28} className="h-6 w-auto object-contain max-w-[120px]" style={{ width: 'auto' }} />
              </span>
            ) : (
              <span className="font-black text-lg text-white block mb-3">{branding.name}</span>
            )}
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Чанартай бараа, хурдан хүргэлт. Таны найдвартай онлайн дэлгүүр.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {contact?.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-full px-3 py-1.5 transition-colors"
                >
                  <Phone className="w-3 h-3 text-primary" strokeWidth={2} />
                  {contact.phone}
                </a>
              )}
              {contact?.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-full px-3 py-1.5 transition-colors"
                >
                  <Mail className="w-3 h-3 text-primary" strokeWidth={2} />
                  {contact.email}
                </a>
              )}
            </div>
          </div>

          {/* Link groups */}
          <div className="flex flex-wrap gap-x-14 gap-y-6">
            {footerSections.map(section => (
              <div key={section.title}>
                <h3 className="text-white font-bold mb-3 text-[11px] tracking-[0.15em] uppercase">{section.title}</h3>
                <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 max-w-[220px]">
                  {section.links.map(link => (
                    <li key={link.href}>
                      <Link href={tenantHref(link.href)} className="text-xs text-gray-500 hover:text-white transition-colors whitespace-nowrap">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-5 border-t border-white/[0.06] text-[11px] text-gray-600 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} <span className="text-gray-400 font-semibold">{branding.name || 'Дэлгүүр'}</span>. Бүх эрх хуулиар хамгаалагдсан.</span>
          <div className="flex items-center gap-1.5 text-gray-700">
            <span>Powered by</span>
            <span className="font-black text-white tracking-tight">Zevtabs</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
