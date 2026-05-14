function Sk({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton ${className ?? ''}`} style={style} />;
}

function ProductCardSk() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <Sk className="aspect-[4/3] rounded-none" />
      <div className="p-2.5 space-y-1.5">
        <Sk className="h-2.5 w-12 rounded" />
        <Sk className="h-3 w-full rounded" />
        <Sk className="h-3 w-3/4 rounded" />
        <Sk className="h-4 w-20 rounded mt-1" />
      </div>
    </div>
  );
}

function ProductRowSk() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Sk className="h-5 w-40 rounded" />
        <Sk className="h-4 w-20 rounded" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3 lg:gap-4">
        {Array.from({ length: 6 }).map((_, i) => <ProductCardSk key={i} />)}
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="animate-pulse-none">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 pt-4 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Sk className="h-48 sm:h-56 md:h-72 rounded-2xl" />
          </div>
          <Sk className="h-48 sm:h-56 lg:h-72 rounded-2xl" />
        </div>
      </div>

      {/* Grocery dark band */}
      <div className="bg-[#0d1117] py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <Sk className="h-6 w-44 rounded" style={{ background: 'linear-gradient(90deg,#1e2430 25%,#262d3a 50%,#1e2430 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease-in-out infinite' }} />
            <Sk className="h-4 w-24 rounded" style={{ background: 'linear-gradient(90deg,#1e2430 25%,#262d3a 50%,#1e2430 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease-in-out infinite' }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ height: i < 2 ? 180 : 140, background: 'linear-gradient(90deg,#1e2430 25%,#262d3a 50%,#1e2430 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease-in-out infinite' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Product sections */}
      <div className="max-w-7xl mx-auto px-4 mt-10 space-y-10">
        <ProductRowSk />

        {/* Full-width banner */}
        <Sk className="h-52 sm:h-64 md:h-80 rounded-none w-screen -mx-4" />

        <ProductRowSk />

        {/* Service cards */}
        <div className="space-y-3">
          <Sk className="h-5 w-32 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ aspectRatio: '16/7' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Sk key={i} className="rounded-2xl" />
            ))}
          </div>
        </div>

        <ProductRowSk />
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 mt-12 mb-8 space-y-5">
        <div className="flex items-center justify-between">
          <Sk className="h-6 w-28 rounded" />
          <Sk className="h-4 w-24 rounded" />
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-9 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Sk className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl" />
              <Sk className="h-3 w-12 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
