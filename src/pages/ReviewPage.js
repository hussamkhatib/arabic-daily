import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import Calendar from 'react-calendar';
import { supabase } from '../lib/supabase';
import { useSession } from '../hooks/useSession';
import { useSessions } from '../hooks/useSessions';
import { getDayNumber, START_DATE } from '../lib/utils';

export default function ReviewPage() {
  const navigate = useNavigate();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const [marking, setMarking] = useState(false);

  const { sessionDates, sessions, refetch: refetchAll } = useSessions();
  const { session, images, loading, refetch } = useSession(selectedDate);

  const dayNum = getDayNumber(selectedDate);
  const isReviewed = session?.is_reviewed ?? false;

  function getPublicUrl(path) {
    return supabase.storage.from('session-images').getPublicUrl(path).data.publicUrl;
  }

  async function toggleReviewed() {
    setMarking(true);
    if (session) {
      await supabase.from('sessions').update({ is_reviewed: !isReviewed }).eq('id', session.id);
    } else {
      await supabase.from('sessions').insert({ session_date: selectedDate, is_reviewed: true });
    }
    await Promise.all([refetch(), refetchAll()]);
    setMarking(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-base font-semibold text-gray-900">Instructor Review</span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Student view
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Calendar panel */}
          <div className="lg:w-72 w-full flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 pt-4 pb-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Sessions</p>
              </div>
              <div className="review-calendar">
                <Calendar
                  onChange={(date) => setSelectedDate(format(date, 'yyyy-MM-dd'))}
                  value={parseISO(selectedDate)}
                  minDate={parseISO(START_DATE)}
                  prev2Label={null}
                  next2Label={null}
                  tileContent={({ date, view }) => {
                    if (view !== 'month') return null;
                    const str = format(date, 'yyyy-MM-dd');
                    const s = sessions.find(x => x.session_date === str);
                    const hasUpload = sessionDates.includes(str);
                    if (!hasUpload && !s?.is_reviewed) return null;
                    return (
                      <div className="flex justify-center gap-0.5 mt-0.5">
                        {hasUpload && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                        {s?.is_reviewed && <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
                      </div>
                    );
                  }}
                />
              </div>
              {/* Legend */}
              <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-5">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  Uploaded
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  Reviewed
                </div>
              </div>
            </div>
          </div>

          {/* Day content panel */}
          <div className="flex-1 min-w-0">
            {/* Day header card */}
            <div className={`rounded-2xl p-5 mb-5 flex items-center justify-between gap-4
              ${isReviewed
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-white border border-gray-200 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full
                    ${isReviewed ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                    Day {dayNum}
                  </span>
                  {isReviewed && (
                    <span className="text-xs font-medium text-blue-100">✓ Reviewed</span>
                  )}
                </div>
                <h2 className={`text-xl font-bold ${isReviewed ? 'text-white' : 'text-gray-900'}`}>
                  {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
                </h2>
              </div>

              <button
                onClick={toggleReviewed}
                disabled={marking}
                className={`flex-shrink-0 flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-60
                  ${isReviewed
                    ? 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                  }`}
              >
                {marking
                  ? <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  : isReviewed
                    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                }
                {isReviewed ? 'Reviewed' : 'Mark reviewed'}
              </button>
            </div>

            {/* Images */}
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : images.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
                <p className="text-3xl mb-3">📭</p>
                <p className="text-gray-400 text-sm">No images uploaded for this day</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {images.map(img => {
                    const displayPath = img.annotated_path || img.storage_path;
                    const url = getPublicUrl(displayPath);
                    return (
                      <div
                        key={img.id}
                        className="group relative rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100"
                        style={{ aspectRatio: '4/3' }}
                      >
                        <img
                          src={url}
                          alt="Writing practice"
                          className="w-full h-full object-contain bg-gray-50"
                        />
                        {img.annotated_path && (
                          <span className="absolute top-3 left-3 bg-blue-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full shadow">
                            Annotated
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => navigate(`/editor/${session.id}/${img.id}`)}
                            className="bg-white text-gray-900 text-sm font-semibold px-5 py-2 rounded-xl shadow-lg hover:bg-blue-50 transition-colors"
                          >
                            Annotate
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {session?.notes && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Session Notes</h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{session.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
