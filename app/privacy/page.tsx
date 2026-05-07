import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Нууцлалын баталгаа | Turbotech' };

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-[#1565C0]">Нүүр</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Нууцлалын баталгаа</span>
      </nav>
      <h1 className="text-2xl font-black text-gray-800 mb-8">Нууцлалын баталгаа</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
        {[
          { title: '1. Мэдээлэл цуглуулалт', body: 'Бид таны нэр, утасны дугаар, и-мэйл хаяг, хүргэлтийн хаяг зэрэг мэдээллийг захиалга хийх үед цуглуулна. Энэ мэдээлэл нь захиалгыг боловсруулахад шаардлагатай.' },
          { title: '2. Мэдээлэл ашиглалт', body: 'Бид таны мэдээллийг зөвхөн захиалга боловсруулах, хүргэлт хийх, таньд мэдэгдэл илгээх зорилгоор ашиглана. Таны мэдээллийг гуравдагч этгээдэд дамжуулахгүй.' },
          { title: '3. Мэдээллийн аюулгүй байдал', body: 'Бид таны хувийн мэдээллийг хамгаалахын тулд техникийн болон зохион байгуулалтын арга хэмжээ авдаг. SSL шифрлэлт ашиглан өгөгдлийг аюулгүй дамжуулна.' },
          { title: '4. Күүки ашиглалт', body: 'Манай вэбсайт таны туршлагыг сайжруулахын тулд күүки (cookie) ашигладаг. Та хөтчийнхөө тохиргоогоор күүкиг хааж болно.' },
          { title: '5. Холбоо барих', body: 'Нууцлалын бодлогтой холбоотой асуулт байвал info@turbotech.mn хаягаар эсвэл 7777-7734 дугаараар холбогдоно уу.' },
        ].map(s => (
          <div key={s.title}>
            <h2 className="font-bold text-gray-800 mb-2">{s.title}</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
