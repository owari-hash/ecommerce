import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Лизинг хүсэлт | Turbotech' };

export default function LeasingFormPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-[#1565C0]">Нүүр</Link>
        <span>/</span>
        <Link href="/leasing-all" className="hover:text-[#1565C0]">Лизинг үйлчилгээ</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Лизинг хүсэлт</span>
      </nav>
      <h1 className="text-2xl font-black text-gray-800 mb-2">Лизинг хүсэлт</h1>
      <p className="text-gray-500 mb-8">Доорх маягтыг бөглөн хүсэлтээ илгээнэ үү. Бид 1-3 ажлын өдрийн дотор холбогдох болно.</p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <form className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Овог</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]" placeholder="Овог" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Нэр</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]" placeholder="Нэр" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Утасны дугаар</label>
              <input type="tel" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]" placeholder="99xxxxxx" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">И-мэйл</label>
              <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]" placeholder="email@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Регистрийн дугаар</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]" placeholder="AA12345678" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Хамтрагч банк</label>
            <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] bg-white">
              <option value="">Банк сонгох</option>
              {['Хаан банк', 'Голомт банк', 'ХХБ', 'Төрийн банк', 'Капитал банк', 'Богд банк'].map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Хүссэн бараа / дүн</label>
            <textarea rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] resize-none" placeholder="Авахыг хүссэн бараа болон тооны талаар бичнэ үү" />
          </div>
          <div className="flex items-start gap-2">
            <input type="checkbox" id="agree" className="mt-1" />
            <label htmlFor="agree" className="text-sm text-gray-600">
              <Link href="/terms" className="text-[#1565C0] hover:underline">Үйлчилгээний нөхцөл</Link>-тэй танилцаж зөвшөөрч байна
            </label>
          </div>
          <button type="submit" className="w-full bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold py-3 rounded-xl transition-colors text-base">
            Хүсэлт илгээх
          </button>
        </form>
      </div>
    </div>
  );
}
