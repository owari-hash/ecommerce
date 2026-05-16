import { cache } from 'react'

export interface TenantBranding {
  logo: string
  primaryColor: string
  font: string
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

export interface TenantConfig {
  tenantId: string
  branding: TenantBranding
  theme: TenantTheme
  features: TenantFeatures
}

const DEFAULT_CONFIG: TenantConfig = {
  tenantId: 'default',
  branding: {
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
      { type: 'GroceryBento', props: {} },
      { type: 'BrandList', props: {} },
    ],
  },
  features: { reviews: false, chat: false, loyaltyProgram: false },
}

// cache() deduplicates per request — layout and page.tsx both call this but hit the API once
export const fetchTenantConfig = cache(async (host: string): Promise<TenantConfig> => {
  if (process.env.USE_MOCK_DATA === 'true') {
    return DEFAULT_CONFIG
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

  try {
    const res = await fetch(`${apiUrl}/api/config`, {
      headers: { host, 'x-tenant-host': host },
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      console.warn(`[tenantConfig] /api/config returned ${res.status} for host ${host}, using default`)
      return DEFAULT_CONFIG
    }

    return res.json()
  } catch (err) {
    console.warn('[tenantConfig] Failed to fetch config, using default:', err)
    return DEFAULT_CONFIG
  }
})
