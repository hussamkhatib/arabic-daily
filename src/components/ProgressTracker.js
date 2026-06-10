// Update these two constants as you progress through the course
const DONE_THROUGH = 40;   // last fully completed lesson
const CURRENT = 41;        // lesson currently in progress (not yet complete)

const TOTAL = 70;

export default function ProgressTracker() {
  const pct = Math.round((DONE_THROUGH / TOTAL) * 100);

  return (
    <div className="mt-8 bg-white rounded-xl border border-gray-200 p-5 w-fit">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Andalus Institute</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {DONE_THROUGH} of {TOTAL} lessons complete
          </p>
        </div>
        <span className="text-sm font-bold text-emerald-600">{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 rounded-full mb-5">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Lesson grid — 7 rows × 10 */}
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: TOTAL }, (_, i) => i + 1).map(n => {
          const done = n <= DONE_THROUGH;
          const current = n === CURRENT;

          return (
            <div key={n} className="relative group">
              <div
                className={`w-5 h-5 rounded transition-colors
                  ${done ? 'bg-emerald-500' : ''}
                  ${current ? 'bg-amber-400 ring-2 ring-amber-300 ring-offset-1' : ''}
                  ${!done && !current ? 'bg-gray-100' : ''}
                `}
              />
              {/* Tooltip */}
              <div className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-gray-900 text-white text-xs font-medium px-2 py-1 rounded whitespace-nowrap">
                  Lesson {n}
                  {done && ' ✓'}
                  {current && ' ← current'}
                </div>
                <div className="w-1.5 h-1.5 bg-gray-900 rotate-45 mx-auto -mt-0.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <div className="h-3 w-3 rounded bg-emerald-500" />
          Complete
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <div className="h-3 w-3 rounded bg-amber-400" />
          In progress
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <div className="h-3 w-3 rounded bg-gray-100 border border-gray-200" />
          Upcoming
        </div>
      </div>
    </div>
  );
}
