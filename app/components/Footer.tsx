import Link from 'next/link';

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
  return (
    <footer className="bg-[#0a1628] text-gray-300 mt-10">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Logo & Contact */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <span className="text-2xl font-black text-white tracking-tight">
                TURBO<span className="text-orange-500">TECH</span>
              </span>
              <div className="text-[10px] text-gray-400 tracking-widest mt-0.5">ЭЛЕКТРОН БАРААНЫ ДЭЛГҮҮР</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="font-semibold text-white mb-2">Холбоо барих</div>
              <a href="tel:77777734" className="flex items-center gap-2 hover:text-white transition-colors">
                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                7777-7734
              </a>
              <a href="mailto:info@turbotech.mn" className="flex items-center gap-2 hover:text-white transition-colors">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                info@turbotech.mn
              </a>
              <p className="flex items-start gap-2 text-xs text-gray-400 mt-3 leading-relaxed">
                <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Улаанбаатар хот, Хан-Уул дүүрэг, 15-р хороо, Их Наяд худалдааны төв, Зүүн өндөр 3 давхарт 309 тоот
              </p>
            </div>
          </div>

          {/* Link columns */}
          {footerSections.map(section => (
            <div key={section.title}>
              <h3 className="text-white font-semibold mb-4 text-sm">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
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
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <span>© 2026. Бүх эрх хуулиар хамгаалагдсан.</span>
          <span>Powered by Turbotech</span>
        </div>
      </div>
    </footer>
  );
}
