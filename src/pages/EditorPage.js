import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ImageEditor from '../components/Editor/ImageEditor';
import EditorToolbar from '../components/Editor/EditorToolbar';
import { supabase } from '../lib/supabase';
import { getDayNumber } from '../lib/utils';

export default function EditorPage() {
  const { sessionId, imageId } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const notesTimer = useRef(null);

  const [imageRecord, setImageRecord] = useState(null);
  const [currentDate, setCurrentDate] = useState(null);
  const [prevSession, setPrevSession] = useState(null);
  const [nextSession, setNextSession] = useState(null);
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const isDirtyRef = useRef(false);
  const savingRef = useRef(false);
  const imageRecordRef = useRef(null);

  // Keep refs in sync so the interval can read latest values without stale closures
  useEffect(() => { imageRecordRef.current = imageRecord; }, [imageRecord]);
  useEffect(() => { savingRef.current = saving; }, [saving]);

  function handleModified() {
    isDirtyRef.current = true;
    setIsDirty(true);
  }

  // Auto-save every 40 seconds if dirty and not already saving
  const handleSaveRef = useRef(null);
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirtyRef.current && !savingRef.current && imageRecordRef.current) {
        handleSaveRef.current?.();
      }
    }, 40000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data: img } = await supabase
        .from('session_images')
        .select('*')
        .eq('id', imageId)
        .single();
      setImageRecord(img || null);

      const { data: sess } = await supabase
        .from('sessions')
        .select('session_date, notes')
        .eq('id', sessionId)
        .single();

      const date = sess?.session_date;
      setCurrentDate(date);
      setNotes(sess?.notes || '');

      if (date) {
        const { data: prevRows } = await supabase
          .from('sessions')
          .select('id, session_date, session_images(id)')
          .lt('session_date', date)
          .order('session_date', { ascending: false })
          .limit(10);
        setPrevSession(prevRows?.find(s => s.session_images?.length > 0) || null);

        const { data: nextRows } = await supabase
          .from('sessions')
          .select('id, session_date, session_images(id)')
          .gt('session_date', date)
          .order('session_date', { ascending: true })
          .limit(10);
        setNextSession(nextRows?.find(s => s.session_images?.length > 0) || null);
      }

      setLoading(false);
    }
    load();
  }, [sessionId, imageId]);

  function handleNotesChange(e) {
    const value = e.target.value;
    setNotes(value);
    clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(async () => {
      await supabase
        .from('sessions')
        .update({ notes: value, updated_at: new Date().toISOString() })
        .eq('id', sessionId);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    }, 500);
  }

  function getPublicUrl(path) {
    return supabase.storage.from('session-images').getPublicUrl(path).data.publicUrl;
  }

  handleSaveRef.current = handleSave;

  function goToSession(session) {
    navigate(`/editor/${session.id}/${session.session_images[0].id}`);
  }

  async function handleSave() {
    const record = imageRecordRef.current;
    if (!record) return;
    setSaving(true);
    setSaveError(null);
    try {
      const dataUrl = editorRef.current?.exportPng();
      if (!dataUrl) throw new Error('Failed to export canvas');

      const blob = await (await fetch(dataUrl)).blob();
      const annotatedPath = record.storage_path.replace(/\.[^.]+$/, '_annotated.png');

      const { error: uploadError } = await supabase.storage
        .from('session-images')
        .upload(annotatedPath, blob, { contentType: 'image/png', upsert: true });

      if (uploadError) throw uploadError;

      await supabase
        .from('session_images')
        .update({ annotated_path: annotatedPath })
        .eq('id', record.id);

      isDirtyRef.current = false;
      setIsDirty(false);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!imageRecord) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-gray-500">Image not found.</p>
        <Link to="/" className="text-emerald-600 text-sm hover:underline">Go home</Link>
      </div>
    );
  }

  const imageUrl = getPublicUrl(imageRecord.annotated_path || imageRecord.storage_path);
  const dayNum = currentDate ? getDayNumber(currentDate) : '…';

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => navigate(currentDate ? `/day/${currentDate}` : '/')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors w-16"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => prevSession && goToSession(prevSession)}
            disabled={!prevSession}
            title={prevSession ? `Day ${getDayNumber(prevSession.session_date)}` : undefined}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1 rounded-lg hover:bg-gray-100 disabled:hover:bg-transparent"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {prevSession && <span className="text-xs font-medium">Day {getDayNumber(prevSession.session_date)}</span>}
          </button>

          <span className="text-sm font-semibold text-gray-800 px-2 flex items-center gap-1.5">
            Day {dayNum}
            {isDirty && !saving && (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" title="Unsaved changes" />
            )}
            {saving && (
              <span className="h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            )}
          </span>

          <button
            onClick={() => nextSession && goToSession(nextSession)}
            disabled={!nextSession}
            title={nextSession ? `Day ${getDayNumber(nextSession.session_date)}` : undefined}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1 rounded-lg hover:bg-gray-100 disabled:hover:bg-transparent"
          >
            {nextSession && <span className="text-xs font-medium">Day {getDayNumber(nextSession.session_date)}</span>}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="w-16" />
      </header>

      {saveError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-600 flex-shrink-0">
          {saveError}
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        <ImageEditor ref={editorRef} imageUrl={imageUrl} onModified={handleModified} />
      </div>

      {/* Bottom bar: notes (left) + tools (right) */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 flex">
        {/* Notes column */}
        <div className="flex-1 p-3 border-r border-gray-100 flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Notes</span>
            {notesSaved && <span className="text-xs text-emerald-500">Saved</span>}
          </div>
          <textarea
            value={notes}
            onChange={handleNotesChange}
            placeholder="Session notes…"
            rows={3}
            className="w-full text-sm text-gray-700 placeholder-gray-300 border border-gray-200 rounded-lg px-2.5 py-1.5 resize-none focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
          />
        </div>

        {/* Tools column */}
        <div className="flex-shrink-0">
          <EditorToolbar
            getCanvas={() => editorRef.current?.getCanvas()}
            onSave={handleSave}
            saving={saving}
          />
        </div>
      </div>
    </div>
  );
}
