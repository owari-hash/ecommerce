'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import { useTenant } from '../lib/TenantContext';
import { useTenantHref } from '../lib/useTenantHref';
import { resolveUploadUrl } from '../lib/apiClient';

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
    <footer className="relative bg-[#0a1628] text-gray-300 mt-6 mb-16 md:mb-0 overflow-hidden">
      {/* Top accent line + soft glow */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[560px] h-[280px] bg-primary/10 blur-[100px] rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-10 text-center sm:text-left">
          {/* Brand */}
          <div className="lg:col-span-4 flex flex-col items-center sm:items-start">
            {branding.logo ? (
              <span className="inline-flex items-center bg-white rounded-xl px-3 py-2 shadow-sm mb-4">
                <Image src={resolveUploadUrl(branding.logo)} alt={branding.name || 'Logo'} width={140} height={28} className="h-6 w-auto object-contain max-w-[120px]" style={{ width: 'auto' }} />
              </span>
            ) : (
              <span className="font-black text-xl text-white block mb-4">{branding.name}</span>
            )}
            <p className="text-sm text-gray-500 leading-relaxed mb-5 max-w-[280px]">
              Чанартай бараа, хурдан хүргэлт. Таны найдвартай онлайн дэлгүүр.
            </p>
            <div className="flex flex-col items-center sm:items-start gap-2">
              {contact?.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white group"
                >
                  <span className="w-7 h-7 rounded-full bg-white/[0.06] group-hover:bg-primary/20 flex items-center justify-center shrink-0 transition-colors">
                    <Phone className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
                  </span>
                  {contact.phone}
                </a>
              )}
              {contact?.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white group"
                >
                  <span className="w-7 h-7 rounded-full bg-white/[0.06] group-hover:bg-primary/20 flex items-center justify-center shrink-0 transition-colors">
                    <Mail className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
                  </span>
                  {contact.email}
                </a>
              )}
              {contact?.address && (
                <span className="inline-flex items-center gap-2 text-xs font-medium text-gray-400">
                  <span className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
                  </span>
                  {contact.address}
                </span>
              )}
            </div>
          </div>

          {/* Link groups */}
          {footerSections.map(section => (
            <div key={section.title} className="lg:col-span-2 flex flex-col items-center sm:items-start">
              <h3 className="text-white font-bold mb-4 text-[11px] tracking-[0.15em] uppercase">{section.title}</h3>
              <ul className="flex flex-col items-center sm:items-start gap-2.5">
                {section.links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={tenantHref(link.href)}
                      className="group inline-flex items-center gap-1 text-sm text-gray-500 hover:text-white transition-colors whitespace-nowrap"
                    >
                      {link.label}
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" strokeWidth={2.5} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter / CTA */}
          <div className="lg:col-span-4 flex flex-col items-center sm:items-start">
            <h3 className="text-white font-bold mb-4 text-[11px] tracking-[0.15em] uppercase">Холбоотой байх</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4 max-w-[280px]">
              Хямдрал, шинэ бараа, урамшууллын мэдээллийг эхнийх нь хүлээн аваарай.
            </p>
            <a
              href={contact?.phone ? `tel:${contact.phone}` : tenantHref('/contact')}
              className="inline-flex items-center gap-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-full px-5 py-2.5 transition-colors shadow-lg shadow-primary/20"
            >
              Бидэнтэй холбогдох
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/[0.06] text-[11px] text-gray-600 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 text-center">
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
