import type { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = { title: 'Сагс' };

export default function CheckoutPage() {
  return <CheckoutClient />;
}
