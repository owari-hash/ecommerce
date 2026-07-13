/**
 * Clean, neutral image placeholder used when a product/category has no image.
 * Renders a subtle "photo" glyph on a soft gradient — looks intentional
 * instead of an emoji box. Fills its (relatively positioned) parent.
 */
export default function ImagePlaceholder({
  label,
  className = '',
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-300 ${className}`}
      aria-hidden="true"
    >
      <svg className="w-1/3 max-w-[64px] min-w-[28px] aspect-square" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <rect x="3" y="4" width="18" height="16" rx="2.5" />
        <circle cx="8.5" cy="9.5" r="1.6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 17l4.5-4.5a2 2 0 012.8 0L16 17m-1.5-2l1.7-1.7a2 2 0 012.8 0L21 15" />
      </svg>
      {label && <span className="text-[10px] font-semibold text-gray-300 px-2 text-center truncate max-w-full">{label}</span>}
    </div>
  );
}
