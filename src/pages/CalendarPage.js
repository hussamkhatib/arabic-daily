import { useNavigate } from 'react-router-dom';
import { format, addDays, subDays } from 'date-fns';
import Layout from '../components/Layout';
import { useSessions } from '../hooks/useSessions';
import { getDayNumber, calcStreak, calcMissed } from '../lib/utils';

export default function CalendarPage() {
  const navigate = useNavigate();
  const { sessionDates, loading } = useSessions();

  const today = format(new Date(), 'yyyy-MM-dd');

  const quickDays = [
    { date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), label: '2 days ago' },
    { date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), label: 'Yesterday' },
    { date: today, label: 'Today' },
    { date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), label: 'Tomorrow' },
  ];

  const streak = calcStreak(sessionDates, today);
  const missed = calcMissed(sessionDates, today);

  return (
    <Layout>
      {/* Streak + missed */}
      <div className="flex items-center gap-5 mb-5">
        <div className="flex items-center gap-1.5">
          <span className="text-xl">🔥</span>
          <span className="text-sm font-semibold text-gray-700">{streak} day streak</span>
        </div>
        {missed > 0 && (
          <span className="text-sm font-medium text-red-400">
            {missed} missed {missed === 1 ? 'day' : 'days'}
          </span>
        )}
      </div>

      {missed > 2 && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
          ⚠️ You're {missed} days behind — catch up before it gets harder!
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickDays.map(({ date, label }) => {
            const dayNum = getDayNumber(date);
            const uploaded = sessionDates.includes(date);
            const isToday = date === today;

            return (
              <button
                key={date}
                onClick={() => navigate(`/day/${date}`)}
                className={`flex flex-col items-start gap-1 px-4 py-4 rounded-xl border-2 transition-all text-left
                  ${isToday
                    ? 'border-emerald-400 bg-emerald-50 hover:bg-emerald-100'
                    : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-gray-50'
                  }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs font-bold tracking-wide ${isToday ? 'text-emerald-600' : 'text-gray-400'}`}>
                    Day {dayNum}
                  </span>
                  {uploaded
                    ? <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" title="Uploaded" />
                    : <span className="h-2.5 w-2.5 rounded-full border-2 border-gray-300" title="Not uploaded" />
                  }
                </div>
                <span className={`text-sm font-semibold ${isToday ? 'text-emerald-700' : 'text-gray-700'}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
