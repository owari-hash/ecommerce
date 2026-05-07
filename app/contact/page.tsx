import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Холбоо барих | Turbotech' };

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-[#1565C0]">Нүүр</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Холбоо барих</span>
      </nav>
      <h1 className="text-2xl font-black text-gray-800 mb-8">Холбоо барих</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="space-y-6">
          {[
            { icon: '📞', title: 'Утас', lines: ['7777-7734', '7777-7754'] },
            { icon: '✉️', title: 'И-мэйл', lines: ['info@turbotech.mn'] },
            { icon: '🕐', title: 'Цагийн хуваарь', lines: ['Өдөр бүр 10:00 - 20:00'] },
            { icon: '📍', title: 'Хаяг', lines: ['Улаанбаатар хот, Хан-Уул дүүрэг,', '15-р хороо, Их Наяд худалдааны төв,', 'Зүүн өндөр 3 давхарт 309 тоот'] },
          ].map(c => (
            <div key={c.title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="text-2xl mt-0.5">{c.icon}</div>
              <div>
                <div className="font-bold text-gray-700 text-sm mb-1">{c.title}</div>
                {c.lines.map(l => <p key={l} className="text-gray-600 text-sm">{l}</p>)}
              </div>
            </div>
          ))}
        </div>
        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-5">Санал, хүсэлт илгээх</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Нэр</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]" placeholder="Таны нэр" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Утасны дугаар</label>
              <input type="tel" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]" placeholder="99xxxxxx" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">И-мэйл</label>
              <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]" placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Мессеж</label>
              <textarea rows={4} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] resize-none" placeholder="Таны санал, хүсэлт..." />
            </div>
            <button type="submit" className="w-full bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold py-3 rounded-lg transition-colors">
              Илгээх
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
