import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Бидний тухай | Turbotech' };

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-[#1565C0]">Нүүр</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Бидний тухай</span>
      </nav>
      <h1 className="text-2xl font-black text-gray-800 mb-8">Бидний тухай</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="grid md:grid-cols-2 gap-10 items-center mb-10">
          <div>
            <h2 className="text-xl font-bold text-[#1565C0] mb-4">TURBOTECH — Электрон барааны дэлгүүр</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Turbotech нь Монгол улсын зах зээлд үйл ажиллагаа явуулдаг тэргүүлэх электроник барааны дэлгүүр юм. Бид таны амьдралыг илүү хялбар, тухтай болгох технологийн шийдлүүдийг санал болгодог.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Манай дэлгүүрт зөөврийн компьютер, суурин компьютер, ухаалаг гар утас, аудио төхөөрөмж, консоль болон бусад олон төрлийн электроник бараа байна.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Бид дэлхийн тэргүүлэх брэндүүд болох Apple, Samsung, ASUS, Dell, Lenovo, HP болон бусад брэндүүдийн албан ёсны борлуулагч юм.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-[#1565C0] to-[#0D47A1] flex items-center justify-center shadow-2xl">
              <span className="text-white text-6xl font-black">TT</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-gray-100">
          {[
            { num: '50+', label: 'Брэнд' },
            { num: '1000+', label: 'Бүтээгдэхүүн' },
            { num: '5+', label: 'Жил туршлага' },
            { num: '10000+', label: 'Хэрэглэгч' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-black text-[#1565C0] mb-1">{stat.num}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {[
          { icon: '🏆', title: 'Чанар', desc: 'Зөвхөн жинхэнэ, баталгаат бараа борлуулдаг' },
          { icon: '🚚', title: 'Хүргэлт', desc: 'Улаанбаатар хотын дотор хурдан хүргэлт' },
          { icon: '🛡️', title: 'Баталгаа', desc: 'Бүтээгдэхүүн бүрт баталгааны хугацаа' },
        ].map(f => (
          <div key={f.title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center">
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="font-bold text-gray-800 mb-2">{f.title}</h3>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
