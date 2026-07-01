import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Лизинг үйлчилгээ' };

const banks = [
  { name: 'Хаан банк', logo: '🏦', rate: '0%', term: '12 сар хүртэл' },
  { name: 'Голомт банк', logo: '🏦', rate: '0%', term: '18 сар хүртэл' },
  { name: 'ХХБ', logo: '🏦', rate: '0%', term: '12 сар хүртэл' },
  { name: 'Төрийн банк', logo: '🏦', rate: '0%', term: '24 сар хүртэл' },
  { name: 'Капитал банк', logo: '🏦', rate: '0%', term: '12 сар хүртэл' },
  { name: 'Богд банк', logo: '🏦', rate: '0%', term: '18 сар хүртэл' },
];

export default function LeasingAllPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-[#1565C0]">Нүүр</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Лизинг үйлчилгээ</span>
      </nav>
      <h1 className="text-2xl font-black text-gray-800 mb-2">Лизинг үйлчилгээ</h1>
      <p className="text-gray-500 mb-8">Хамтрагч банкуудаар дамжуулан хялбар лизингийн үйлчилгээ</p>

      <div className="bg-gradient-to-br from-[#1565C0] to-[#0D47A1] rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div>
            <div className="text-4xl font-black mb-2">0% хүүтэй</div>
            <p className="text-blue-200 text-lg">Лизинг үйлчилгээ</p>
            <p className="text-blue-300 text-sm mt-2">Хамтрагч банкуудаар дамжуулан хялбар болгосон</p>
          </div>
          <div className="text-8xl opacity-20">🏦</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {banks.map(bank => (
          <div key={bank.name} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-xl">{bank.logo}</div>
              <div className="font-bold text-gray-800">{bank.name}</div>
            </div>
            <div className="flex justify-between text-sm">
              <div>
                <div className="text-gray-400 text-xs mb-0.5">Хүү</div>
                <div className="font-bold text-green-600 text-lg">{bank.rate}</div>
              </div>
              <div className="text-right">
                <div className="text-gray-400 text-xs mb-0.5">Хугацаа</div>
                <div className="font-semibold text-gray-700">{bank.term}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-4">Лизингийн нөхцөл</h2>
        <ul className="space-y-3">
          {[
            'Монгол улсын иргэн байх',
            'Орлогын баримт бичиг шаардлагатай',
            'Анхны төлбөр: нийт дүнгийн 20%-иас эхлэх',
            'Лизингийн дүн: 200,000₮ - 10,000,000₮',
            'Шийдвэрлэх хугацаа: 1-3 ажлын өдөр',
          ].map(item => (
            <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-green-500 mt-0.5">✓</span>
              {item}
            </li>
          ))}
        </ul>
        <Link href="/leasing-form" className="mt-6 inline-block bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold px-8 py-3 rounded-xl transition-colors">
          Лизинг хүсэлт гаргах 
        </Link>
      </div>
    </div>
  );
}
