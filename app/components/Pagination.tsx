'use client';

/** Compact, tenant-themed pager. Renders nothing when there's a single page. */
export default function Pagination({
  page,
  pageCount,
  onPage,
  className = '',
}: {
  page: number;
  pageCount: number;
  onPage: (p: number) => void;
  className?: string;
}) {
  if (pageCount <= 1) return null;

  // Windowed page numbers: first, last, and neighbours of the current page.
  const nums: (number | '…')[] = [];
  const push = (n: number | '…') => nums.push(n);
  const window = 1;
  for (let i = 1; i <= pageCount; i++) {
    if (i === 1 || i === pageCount || (i >= page - window && i <= page + window)) {
      push(i);
    } else if (nums[nums.length - 1] !== '…') {
      push('…');
    }
  }

  const btn = 'min-w-9 h-9 px-3 rounded-lg text-sm font-bold flex items-center justify-center transition-colors';

  return (
    <div className={`flex items-center justify-center gap-1.5 flex-wrap ${className}`}>
      <button
        type="button"
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        className={`${btn} border border-gray-200 text-gray-600 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-600`}
        aria-label="Өмнөх"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
      </button>

      {nums.map((n, i) =>
        n === '…' ? (
          <span key={`e${i}`} className="min-w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
        ) : (
          <button
            key={n}
            type="button"
            onClick={() => onPage(n)}
            aria-current={n === page ? 'page' : undefined}
            className={`${btn} ${n === page ? 'bg-primary text-white' : 'border border-gray-200 text-gray-700 hover:border-primary hover:text-primary'}`}
          >
            {n}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPage(page + 1)}
        disabled={page >= pageCount}
        className={`${btn} border border-gray-200 text-gray-600 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-600`}
        aria-label="Дараах"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
}
