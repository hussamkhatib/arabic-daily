import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { getDayNumber } from '../../lib/utils';

export default function DayList({ sessions }) {
  const navigate = useNavigate();

  if (sessions.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">No sessions yet. Upload your first image today!</p>
    );
  }

  return (
    <ul className="space-y-2">
      {sessions.map(s => (
        <li key={s.session_date}>
          <button
            onClick={() => navigate(`/day/${s.session_date}`)}
            className="w-full text-left px-4 py-3 rounded-lg bg-white border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50 transition-colors flex items-center gap-3"
          >
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5 flex-shrink-0">
              Day {getDayNumber(s.session_date)}
            </span>
            <div className="min-w-0">
              <span className="text-sm font-medium text-gray-800">
                {format(parseISO(s.session_date), 'EEE, MMM d, yyyy')}
              </span>
              {s.notes && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">{s.notes}</p>
              )}
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
