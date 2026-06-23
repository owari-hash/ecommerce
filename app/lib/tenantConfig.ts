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
  shippingFee?: number
  shippingFreeThreshold?: number
}

const DEFAULT_CONFIG: TenantConfig = {
  tenantId: 'default',
  slug: 'default',
  branding: {
    name: 'Их Наяд',
    logo: '',
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
  },
  shippingFee: 15000,
  shippingFreeThreshold: 500000,
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
