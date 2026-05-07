import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Хүргэлтийн нөхцөл | Turbotech' };

export default function DeliveryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-[#1565C0]">Нүүр</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Хүргэлтийн нөхцөл</span>
      </nav>
      <h1 className="text-2xl font-black text-gray-800 mb-8">Хүргэлтийн нөхцөл</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '🚚', title: 'Хурдан хүргэлт', desc: 'Улаанбаатар хотын дотор 1-3 ажлын өдөрт' },
            { icon: '📦', title: 'Аюулгүй савлагаа', desc: 'Бүтээгдэхүүнийг хамгаалалттай савлана' },
            { icon: '📍', title: 'Хаягаар хүргэнэ', desc: 'Таны заасан хаягт хүргэнэ' },
          ].map(c => (
            <div key={c.title} className="text-center p-4 rounded-xl bg-blue-50">
              <div className="text-4xl mb-3">{c.icon}</div>
              <div className="font-bold text-gray-800 mb-1">{c.title}</div>
              <p className="text-sm text-gray-500">{c.desc}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-6 space-y-4">
          {[
            { q: 'Хүргэлтийн төлбөр хэд вэ?', a: 'Улаанбаатар хот дотор 5,000₮ - 10,000₮. 500,000₮-аас дээш захиалгад үнэгүй хүргэнэ.' },
            { q: 'Хэзээ хүргэнэ?', a: 'Захиалга баталгаажсан өдрөөс хойш 1-3 ажлын өдрийн дотор. Ажлын өдрүүдэд 09:00-18:00 цагт хүргэнэ.' },
            { q: 'Орон нутагт хүргэх үү?', a: 'Тийм. Орон нутгийн хүргэлтийн нөхцлийг 7777-7734 дугаараар лавлана уу.' },
            { q: 'Хүргэлтийг хянах боломжтой юу?', a: 'Тийм. Захиалгын дугаараараа вэбсайтаас захиалгынхаа байдлыг шалгаж болно.' },
          ].map(faq => (
            <div key={faq.q} className="border border-gray-100 rounded-xl p-5">
              <div className="font-semibold text-gray-800 mb-2 text-sm">❓ {faq.q}</div>
              <p className="text-sm text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
