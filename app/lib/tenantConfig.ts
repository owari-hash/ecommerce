import { cache } from 'react'

export interface TenantBranding {
  name?: string
  logo: string
  primaryColor: string
  secondaryColor?: string
  accentColor?: string
  font: string
  description?: string
}

export interface SectionConfig {
  type: string
  props?: Record<string, unknown>
}

export interface TenantTheme {
  layout: 'modern' | 'minimal' | 'bold'
  homepageSections: SectionConfig[]
}

export interface TenantFeatures {
  reviews: boolean
  chat: boolean
  loyaltyProgram: boolean
}

export interface TenantContact {
  email: string
  phone: string
  address: string
}

export interface TenantLocation {
  name: string
  district: string
  address: string
  phone: string
  hours: string
}

export interface TenantPromo {
  visible: boolean
  label: string
  discount: string
  subtitle: string
  href: string
}

export interface TenantConfig {
  tenantId: string
  slug: string
  branding: TenantBranding
  theme: TenantTheme
  features: TenantFeatures
  contact?: TenantContact
  promo?: TenantPromo
  locations?: TenantLocation[]
}

const DEFAULT_CONFIG: TenantConfig = {
  tenantId: 'default',
  slug: 'default',
  branding: {
    name: 'Их Наяд',
    logo: '/logo.png',
    primaryColor: '#D32F2F',
    font: 'Inter',
  },
  theme: {
    layout: 'modern',
    homepageSections: [
      { type: 'HeroBanner', props: {} },
      { type: 'CategoryList', props: {} },
      { type: 'ProductGrid', props: { title: 'Шинэ бараа', isNew: true, limit: 8 } },
      { type: 'ProductGrid', props: { title: 'Хямдралтай', isSale: true, limit: 8 } },
      { type: 'ProductGrid', props: { title: 'Бүх бүтээгдэхүүн', limit: 12 } },
      { type: 'GroceryBento', props: {} },
      { type: 'BrandList', props: {} },
    ],
  },
  features: { reviews: false, chat: false, loyaltyProgram: false },
  contact: {
    email: 'info@ikhnayd.mn',
    phone: '7709 1155',
    address: 'Улаанбаатар',
  }
}

const PREVIEW_CONFIGS: Record<string, TenantConfig> = {
  foodcity: {
    tenantId: 'foodcity',
    slug: 'foodcity',
    branding: {
      name: 'FoodCity',
      logo: '/fc.jpg',
      primaryColor: '#2E7D32',
      secondaryColor: '#1B5E20',
      accentColor: '#F9A825',
      font: 'Inter',
      description: 'Таны хүнсний хэрэгцээний бүхнийг нэг дороос',
    },
    theme: {
      layout: 'modern',
      homepageSections: [
        {
          type: 'HeroBanner',
          props: {
            bigSlides: [
              { href: '/fresh-fruits', title: 'Шинэ ирэлт', subtitle: 'Шинэхэн жимс & ногоо', emoji: '🍎', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=600&fit=crop' },
              { href: '/meat-poultry', title: 'Мах & Бүтээгдэхүүн', subtitle: 'Шинэхэн, чанартай мах', emoji: '🥩', image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1200&h=600&fit=crop' },
              { href: '/bakery', title: 'Бэйкери', subtitle: 'Өдөр бүр шинэхэн талх', emoji: '🥐', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=600&fit=crop' },
            ],
            smallSlides: [
              { href: '/fresh-fruits', title: 'Шинэ ирэлт', subtitle: 'Органик жимс', emoji: '🍓', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&h=700&fit=crop' },
              { href: '/vegetables', title: 'Органик ногоо', subtitle: 'Дотоодоос шууд', emoji: '🥦', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=700&fit=crop' },
              { href: '/dairy-eggs', title: 'Сүүн бүтээгдэхүүн', subtitle: 'Өглөөний цайнд', emoji: '🥛', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&h=700&fit=crop' },
            ],
          },
        },
        { type: 'CategoryList', props: {} },
        { type: 'ProductGrid', props: { title: 'Шинэ бараа', isNew: true, limit: 12, mockFilter: 'food' } },
        { type: 'ProductGrid', props: { title: 'Өнөөдрийн санал', isSale: true, limit: 12, mockFilter: 'food' } },
        { type: 'ProductGrid', props: { title: 'Бүх бараа', limit: 12, mockFilter: 'food' } },
        { type: 'GroceryBento', props: { sectionTitle: '🛒 FoodCity — Ангилал' } },
        { type: 'BrandList', props: { title: 'Бидний брэндүүд' } },
      ],
    },
    features: { reviews: true, chat: false, loyaltyProgram: true },
    contact: { email: 'info@foodcity.mn', phone: '7777 7777', address: 'Улаанбаатар, Баянгол дүүрэг' },
    promo: { visible: true, label: 'FoodCity', discount: '20% хямдрал', subtitle: 'Шинэ гишүүнчлэлд', href: '/fresh-fruits' },
  },

  'goto-market': {
    tenantId: 'goto-market',
    slug: 'goto-market',
    branding: {
      name: 'GoTo Market',
      logo: '/goto.jpg',
      primaryColor: '#0D47A1',
      secondaryColor: '#1565C0',
      accentColor: '#FF6F00',
      font: 'Inter',
      description: 'Технологийн дэлхий нэг дороос',
    },
    theme: {
      layout: 'modern',
      homepageSections: [
        {
          type: 'HeroBanner',
          props: {
            bigSlides: [
              { href: '/laptop', title: 'Шинэ загвар', subtitle: 'MacBook & Gaming Laptops', emoji: '💻', image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&h=600&fit=crop' },
              { href: '/smartphone-and-tablet', title: 'Ухаалаг утас', subtitle: 'iPhone 16 Pro & Galaxy S25', emoji: '📱', image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1200&h=600&fit=crop' },
              { href: '/console', title: 'Gaming', subtitle: 'PS5 Slim & Xbox Series X', emoji: '🎮', image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200&h=600&fit=crop' },
            ],
            smallSlides: [
              { href: '/laptop', title: 'Шинэ ирэлт', subtitle: 'MacBook Air M3', emoji: '💻', image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&h=700&fit=crop' },
              { href: '/smartphone-and-tablet', title: 'iPhone 16 Pro', subtitle: 'A18 Pro chip', emoji: '📱', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=700&fit=crop' },
              { href: '/audio-equipment', title: 'Аудио', subtitle: 'Sony WH-1000XM5', emoji: '🎧', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=700&fit=crop' },
            ],
          },
        },
        { type: 'CategoryList', props: {} },
        { type: 'ProductGrid', props: { title: 'Шинэ ирэлт', isNew: true, limit: 12, mockFilter: 'tech' } },
        { type: 'ProductGrid', props: { title: 'Хямдралтай санал', isSale: true, limit: 12, mockFilter: 'tech' } },
        { type: 'ProductGrid', props: { title: 'Бүх бараа', limit: 12, mockFilter: 'tech' } },
        { type: 'BrandList', props: {} },
      ],
    },
    features: { reviews: true, chat: true, loyaltyProgram: false },
    contact: { email: 'info@goto-market.mn', phone: '7700 0000', address: 'Улаанбаатар, Сүхбаатар дүүрэг' },
  },

  ikhnayd: {
    tenantId: 'ikhnayd',
    slug: 'ikhnayd',
    branding: {
      name: 'Их Наяд',
      logo: '/logo.png',
      primaryColor: '#D32F2F',
      secondaryColor: '#B71C1C',
      font: 'Inter',
      description: 'Таны хамгийн дуртай дэлгүүр',
    },
    theme: {
      layout: 'modern',
      homepageSections: [
        { type: 'HeroBanner', props: {} },
        { type: 'CategoryList', props: {} },
        { type: 'ProductGrid', props: { title: 'Шинэ бараа', isNew: true, limit: 12 } },
        { type: 'ProductGrid', props: { title: 'Хямдралтай', isSale: true, limit: 12 } },
        { type: 'ProductGrid', props: { title: 'Бүх бүтээгдэхүүн', limit: 12 } },
        { type: 'GroceryBento', props: {} },
        { type: 'BrandList', props: {} },
      ],
    },
    features: { reviews: true, chat: false, loyaltyProgram: true },
    contact: { email: 'info@ikhnayd.mn', phone: '7709 1155', address: 'Улаанбаатар' },
  },
}

import fs from "fs";
import path from "path";

function logDebug(msg: string) {
  try {
    const logPath = path.join(process.cwd(), "debug.log");
    fs.appendFileSync(logPath, `${new Date().toISOString()} [tenantConfig] ${msg}\n`);
  } catch (e) {}
}

export const fetchTenantConfig = cache(async (host: string, tenantSlug?: string | null): Promise<TenantConfig | null> => {
  // Return hardcoded preview config immediately — no API call needed
  if (tenantSlug && PREVIEW_CONFIGS[tenantSlug]) {
    logDebug(`Returning preview config for slug: ${tenantSlug}`)
    return PREVIEW_CONFIGS[tenantSlug]
  }

  if (process.env.USE_MOCK_DATA === 'true') {
    return DEFAULT_CONFIG
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
  const url = tenantSlug 
    ? `${apiUrl}/api/config?tenant=${encodeURIComponent(tenantSlug)}`
    : `${apiUrl}/api/config`

  logDebug(`Fetching config from: ${url}`);

  try {
    const res = await fetch(url, {
      headers: { host, 'x-tenant-host': host },
      cache: 'no-store',
    })

    logDebug(`Fetch status: ${res.status} for URL: ${url}`);

    if (!res.ok) {
      logDebug(`Fetch failed, status: ${res.status}`);
      if (res.status === 404) {
        return null
      }
      return DEFAULT_CONFIG
    }

    const data = await res.json()
    logDebug(`Fetch successful, tenantId: ${data.tenantId}`);
    return data
  } catch (err: any) {
    logDebug(`Fetch catch error: ${err.message}`);
    return DEFAULT_CONFIG
  }
})
