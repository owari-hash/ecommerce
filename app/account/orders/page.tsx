import { Suspense } from 'react';
import OrdersClient from '../orders/OrdersClient';

export const metadata = {
  title: 'Захиалгын түүх',
  description: 'Таны захиалгуудын жагсаалт',
};

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20 text-gray-400">Ачаалж байна...</div>}>
      <OrdersClient />
    </Suspense>
  );
}
