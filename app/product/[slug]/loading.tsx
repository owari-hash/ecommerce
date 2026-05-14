function Sk({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton ${className ?? ''}`} style={style} />;
}

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-gray-300">/</span>}
            <Sk className="h-3.5 rounded" style={{ width: [40, 60, 80, 120][i] }} />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Images */}
          <div className="flex flex-col gap-3">
            <Sk className="rounded-2xl h-64 sm:h-80 md:h-[400px]" />
            <div className="flex gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Sk key={i} className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl shrink-0" />
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            {/* Brand + title */}
            <div className="space-y-2">
              <Sk className="h-3.5 w-20 rounded" />
              <Sk className="h-7 w-full rounded" />
              <Sk className="h-7 w-4/5 rounded" />
              <Sk className="h-3 w-32 rounded" />
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Sk key={i} className="w-4 h-4 rounded" />
              ))}
              <Sk className="h-3 w-10 rounded ml-1" />
            </div>

            {/* Price box */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3">
              <Sk className="h-3 w-28 rounded" />
              <Sk className="h-9 w-40 rounded" />
              <Sk className="h-11 w-full rounded-xl hidden sm:block" />
            </div>

            {/* Specs */}
            <div className="space-y-2">
              <Sk className="h-4 w-24 rounded" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex justify-between border-b border-gray-100 pb-2">
                    <Sk className="h-3 w-16 rounded" />
                    <Sk className="h-3 w-20 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment options */}
            <div className="space-y-2">
              <Sk className="h-4 w-36 rounded" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Sk key={i} className="h-8 w-20 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related products */}
      <div className="mt-8 space-y-4">
        <Sk className="h-5 w-32 rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3 lg:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <Sk className="aspect-[4/3] rounded-none" />
              <div className="p-2.5 space-y-1.5">
                <Sk className="h-2.5 w-12 rounded" />
                <Sk className="h-3 w-full rounded" />
                <Sk className="h-4 w-20 rounded mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
