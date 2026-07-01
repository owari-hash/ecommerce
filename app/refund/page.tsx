import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Төлбөр буцаах хүсэлт' };

export default function RefundPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-[#1565C0]">Нүүр</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Төлбөр буцаах хүсэлт</span>
      </nav>
      <h1 className="text-2xl font-black text-gray-800 mb-8">Төлбөр буцаах хүсэлт</h1>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {[
          { icon: '📦', title: 'Барааны нөхцөл', desc: 'Бараа эх байдлаараа, гэмтэлгүй, бүрэн савлагаатай байх ёстой.' },
          { icon: '📅', title: 'Хугацаа', desc: 'Бараа авснаас хойш 7 хоногийн дотор буцаах хүсэлт гаргана.' },
          { icon: '🧾', title: 'Баримт', desc: 'Худалдан авалтын баримт, гэрчилгээ бүрэн байх шаардлагатай.' },
          { icon: '💳', title: 'Буцаалтын хугацаа', desc: 'Хүсэлтийг хүлээн авснаас хойш 3-5 ажлын өдрийн дотор буцаана.' },
        ].map(c => (
          <div key={c.title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex gap-4 items-start">
            <div className="text-3xl">{c.icon}</div>
            <div>
              <div className="font-bold text-gray-800 mb-1 text-sm">{c.title}</div>
              <p className="text-sm text-gray-500">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-5">Буцаах хүсэлт илгээх</h2>
        <form className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Захиалгын дугаар</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]" placeholder="#ORDER-XXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Утасны дугаар</label>
              <input type="tel" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]" placeholder="99xxxxxx" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Буцаах шалтгаан</label>
            <textarea rows={4} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] resize-none" placeholder="Буцаах шалтгаанаа дэлгэрэнгүй бичнэ үү..." />
          </div>
          <button type="submit" className="w-full bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold py-3 rounded-lg transition-colors">
            Хүсэлт илгээх
          </button>
        </form>
      </div>
    </div>
  );
}
