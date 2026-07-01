// Shared order/payment status metadata — used by the account orders list and
// the public /order/[orderNumber] tracking page so labels/colors stay in sync.

export type StatusMeta = { label: string; color: string; bg: string };

export const ORDER_STATUS: Record<string, StatusMeta> = {
  pending: { label: 'Хүлээгдэж байна', color: '#D97706', bg: '#FEF3C7' },
  processing: { label: 'Боловсруулж байна', color: '#2563EB', bg: '#DBEAFE' },
  shipped: { label: 'Хүргэлтэд гарсан', color: '#7C3AED', bg: '#EDE9FE' },
  delivered: { label: 'Хүргэгдсэн', color: '#059669', bg: '#D1FAE5' },
  cancelled: { label: 'Цуцлагдсан', color: '#DC2626', bg: '#FEE2E2' },
};

export const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Төлөгдөөгүй', color: '#D97706' },
  paid: { label: 'Төлөгдсөн', color: '#059669' },
  refunded: { label: 'Буцаагдсан', color: '#6B7280' },
};

/** Forward progression used to render the tracking stepper (cancelled is out-of-band). */
export const ORDER_FLOW = ['pending', 'processing', 'shipped', 'delivered'] as const;

export function orderStatusMeta(status: string): StatusMeta {
  return ORDER_STATUS[status] ?? { label: status, color: '#6B7280', bg: '#F3F4F6' };
}

export function paymentStatusMeta(status: string): { label: string; color: string } {
  return PAYMENT_STATUS[status] ?? { label: status, color: '#6B7280' };
}
