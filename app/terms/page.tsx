import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Үйлчилгээний нөхцөл | Turbotech' };

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-[#1565C0]">Нүүр</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Үйлчилгээний нөхцөл</span>
      </nav>
      <h1 className="text-2xl font-black text-gray-800 mb-8">Үйлчилгээний нөхцөл</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
        {[
          { title: '1. Ерөнхий заалт', body: 'Энэхүү үйлчилгээний нөхцөл нь Turbotech (цаашид "Бид" гэх) болон хэрэглэгч (цаашид "Та" гэх) хооронд байгуулагдах харилцааг зохицуулна. Манай вэбсайтыг ашигласнаар та энэхүү нөхцлийг бүрэн хүлээн зөвшөөрч байна гэж үзнэ.' },
          { title: '2. Захиалга хийх', body: 'Та манай вэбсайтаас бараа захиалахдаа бүртгэлтэй хэрэглэгч байх шаардлагатай. Захиалга хийсний дараа манай ажилтан таньд утсаар холбогдон захиалгыг баталгаажуулна.' },
          { title: '3. Төлбөр', body: 'Бараа болон хүргэлтийн төлбөрийг дараах аргаар хийж болно: Бэлэн мөнгө, Карт (Visa, MasterCard, UnionPay), Qpay, SocialPay болон бусад цахим төлбөрийн аргаар.' },
          { title: '4. Хүргэлт', body: 'Улаанбаатар хотын дотор хүргэлт ажлын өдрүүдэд 09:00-18:00 цагт хийгдэнэ. Хүргэлтийн хугацаа захиалга хийснээс хойш 1-3 ажлын өдөр байна.' },
          { title: '5. Баталгаа', body: 'Бүтээгдэхүүн бүр тухайн брэндийн баталгааны нөхцлийн дагуу баталгаалагдана. Баталгааны хугацаанд үйлдвэрлэлийн гэмтэл гарсан тохиолдолд үнэ төлбөргүй засварлана эсвэл солино.' },
          { title: '6. Буцаалт', body: 'Бараа авсан өдрөөс хойш 7 хоногийн дотор буцааж болно. Бараа эх байдлаараа, савлагаагаар байх шаардлагатай. Хэрэглэсэн барааг буцаах боломжгүй.' },
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
