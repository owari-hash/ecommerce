'use client'

import { Suspense } from 'react'
import { getSection } from './componentRegistry'
import type { SectionConfig } from './tenantConfig'
import Reveal from '../components/Reveal'

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
  tenantId?: string
}

export function PageRenderer({ sections, tenantId }: PageRendererProps) {
  return (
    <>
      {sections.map((section, i) => {
        const Section = getSection(section.type)
        const content = <Section {...((section.props ?? {}) as Record<string, unknown>)} tenantId={tenantId} />
        // HeroBanner uses an internal `position: sticky` pinned-scroll effect — a `transform`
        // on any ancestor (which Reveal applies for its fade-in) breaks sticky positioning,
        // so it must render without the Reveal wrapper.
        if (section.type === 'HeroBanner') {
          return (
            <Suspense key={`${section.type}_${i}`} fallback={<SectionSkeleton />}>
              {content}
            </Suspense>
          )
        }
        return (
          <Suspense key={`${section.type}_${i}`} fallback={<SectionSkeleton />}>
            <Reveal delay={i === 0 ? 0 : 60}>
              {content}
            </Reveal>
          </Suspense>
        )
      })}
    </>
  )
}
