import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import Layout from '../components/Layout';
import ImageUploader from '../components/Day/ImageUploader';
import ImageGrid from '../components/Day/ImageGrid';
import SessionNotes from '../components/Day/SessionNotes';
import { useSession } from '../hooks/useSession';
import { useImageUpload } from '../hooks/useImageUpload';
import { getDayNumber } from '../lib/utils';
import { supabase } from '../lib/supabase';

export default function DayPage() {
  const { date } = useParams();
  const navigate = useNavigate();
  const { session, images, loading, refetch } = useSession(date);
  const { uploadImages, uploading, error } = useImageUpload(date, refetch);
  const [marking, setMarking] = useState(false);

  const dayNum = getDayNumber(date);
  const formattedDate = format(parseISO(date), 'EEE, MMM d, yyyy');
  const isComplete = session?.is_complete ?? false;

  async function toggleComplete() {
    setMarking(true);
    if (session) {
      await supabase.from('sessions').update({ is_complete: !isComplete }).eq('id', session.id);
    } else {
      await supabase.from('sessions').insert({ session_date: date, is_complete: true });
    }
    await refetch();
    setMarking(false);
  }

  return (
    <Layout>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Back"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">
            Day {dayNum}
          </span>
          <h1 className="text-lg font-semibold text-gray-900">{formattedDate}</h1>
        </div>
        <button
          onClick={toggleComplete}
          disabled={marking || loading}
          className={`flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50
            ${isComplete
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
              : 'bg-white border border-gray-200 text-gray-500 hover:border-emerald-400 hover:text-emerald-600'
            }`}
        >
          {marking
            ? <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            : isComplete
              ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              : null
          }
          {isComplete ? 'Done' : 'Mark done'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {images.length > 0 && (
            <ImageGrid images={images} session={session} onDelete={refetch} />
          )}

          <ImageUploader
            currentCount={images.length}
            onDrop={uploadImages}
            uploading={uploading}
            error={error}
          />

          <SessionNotes session={session} date={date} />
        </div>
      )}
    </Layout>
  );
}
