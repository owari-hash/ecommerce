'use client'

import { Suspense } from 'react'
import { getSection } from './componentRegistry'
import type { SectionConfig } from './tenantConfig'

function SectionSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl aspect-square" />
          ))}
        </div>
      </div>
    </div>
  )
}

interface PageRendererProps {
  sections: SectionConfig[]
}

export function PageRenderer({ sections }: PageRendererProps) {
  return (
    <>
      {sections.map((section, i) => {
        const Section = getSection(section.type)
        return (
          <Suspense key={`${section.type}_${i}`} fallback={<SectionSkeleton />}>
            <Section {...((section.props ?? {}) as Record<string, unknown>)} />
          </Suspense>
        )
      })}
    </>
  )
}
