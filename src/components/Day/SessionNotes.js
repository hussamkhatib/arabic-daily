import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

export default function SessionNotes({ session, date }) {
  const [notes, setNotes] = useState(session?.notes || '');
  const [saved, setSaved] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setNotes(session?.notes || '');
  }, [session]);

  async function saveNotes(value) {
    if (session) {
      await supabase.from('sessions').update({ notes: value, updated_at: new Date().toISOString() }).eq('id', session.id);
    } else {
      await supabase.from('sessions').upsert({ session_date: date, notes: value }, { onConflict: 'session_date' });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleChange(e) {
    const value = e.target.value;
    setNotes(value);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => saveNotes(value), 500);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-gray-700">Session Notes</label>
        {saved && <span className="text-xs text-emerald-500">Saved</span>}
      </div>
      <textarea
        value={notes}
        onChange={handleChange}
        placeholder="Add notes about today's session..."
        rows={4}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 resize-none"
      />
    </div>
  );
}
