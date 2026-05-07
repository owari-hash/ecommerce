import type { Metadata } from 'next';
import ComparePageClient from './pageClient';

export const metadata: Metadata = { title: 'Харьцуулах | Turbotech' };

export default function ComparePage() {
  return <ComparePageClient />;
}
