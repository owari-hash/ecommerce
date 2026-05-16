interface UnknownSectionProps {
  type?: string
  [key: string]: unknown
}

export default function UnknownSection({ type }: UnknownSectionProps) {
  if (process.env.NODE_ENV !== 'development') return null
  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="border-2 border-dashed border-yellow-400 rounded-xl p-4 text-yellow-700 bg-yellow-50 text-sm font-mono">
        Unknown section type: <strong>{type ?? 'undefined'}</strong>
      </div>
    </div>
  )
}
