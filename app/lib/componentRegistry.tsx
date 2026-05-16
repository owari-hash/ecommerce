import { lazy } from 'react'

export type SectionType =
  | 'HeroBanner'
  | 'CategoryList'
  | 'ProductGrid'
  | 'GroceryBento'
  | 'BrandList'
  | 'ServiceBento'
  | 'UnknownSection'

type LazyComponent = React.LazyExoticComponent<React.ComponentType<Record<string, unknown>>>

const REGISTRY: Record<string, () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>> = {
  HeroBanner:   () => import('../sections/HeroBanner'),
  CategoryList: () => import('../sections/CategoryList'),
  ProductGrid:  () => import('../sections/ProductGrid'),
  GroceryBento: () => import('../sections/GroceryBento'),
  BrandList:    () => import('../sections/BrandList'),
  ServiceBento: () => import('../sections/ServiceBentoSection'),
}

export function getSection(type: string): LazyComponent {
  const loader = REGISTRY[type]
  if (!loader) return lazy(() => import('../sections/UnknownSection').then((m) => ({ default: (props: Record<string, unknown>) => <m.default {...props} type={type} /> })))
  return lazy(loader)
}
