'use client'

import { createContext, useContext } from 'react'
import type { TenantConfig, TenantFeatures } from './tenantConfig'

const TenantContext = createContext<TenantConfig | null>(null)

export function TenantProvider({
  config,
  children,
}: {
  config: TenantConfig
  children: React.ReactNode
}) {
  return <TenantContext.Provider value={config}>{children}</TenantContext.Provider>
}

export function useTenant(): TenantConfig {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant must be used inside TenantProvider')
  return ctx
}

export function useFeatureFlag(flag: keyof TenantFeatures): boolean {
  const { features } = useTenant()
  return features[flag] ?? false
}
