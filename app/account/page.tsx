import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Бүртгэл | Turbotech' };

export default function AccountPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-black text-gray-800 mb-8 text-center">Нэвтрэх / Бүртгүүлэх</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="flex gap-2 mb-6">
          <button className="flex-1 py-2.5 text-sm font-bold bg-[#1565C0] text-white rounded-lg">Нэвтрэх</button>
          <button className="flex-1 py-2.5 text-sm font-bold bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">Бүртгүүлэх</button>
        </div>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Утасны дугаар / И-мэйл</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]" placeholder="99xxxxxx эсвэл email@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Нууц үг</label>
            <input type="password" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]" placeholder="••••••••" />
          </div>
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-1.5 text-gray-500 cursor-pointer">
              <input type="checkbox" /> Намайг сана
            </label>
            <button type="button" className="text-[#1565C0] hover:underline">Нууц үг мартсан?</button>
          </div>
          <button type="submit" className="w-full bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold py-3 rounded-xl transition-colors">
            Нэвтрэх
          </button>
        </form>
      </div>
    </div>
  );
}
