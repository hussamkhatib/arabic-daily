import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ImageEditor from '../components/Editor/ImageEditor';
import EditorToolbar from '../components/Editor/EditorToolbar';
import { supabase } from '../lib/supabase';

export default function EditorPage() {
  const { sessionId, imageId } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [allImages, setAllImages] = useState([]);
  const [imageRecord, setImageRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    async function load() {
      const { data: imgs } = await supabase
        .from('session_images')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      const images = imgs || [];
      setAllImages(images);
      setImageRecord(images.find(i => i.id === imageId) || null);
      setLoading(false);
    }
    load();
  }, [sessionId, imageId]);

  const currentIndex = allImages.findIndex(i => i.id === imageId);
  const prevImage = currentIndex > 0 ? allImages[currentIndex - 1] : null;
  const nextImage = currentIndex < allImages.length - 1 ? allImages[currentIndex + 1] : null;

  function getPublicUrl(path) {
    return supabase.storage.from('session-images').getPublicUrl(path).data.publicUrl;
  }

  function goToImage(img) {
    navigate(`/editor/${sessionId}/${img.id}`);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const dataUrl = editorRef.current?.exportPng();
      if (!dataUrl) throw new Error('Failed to export canvas');

      const blob = await (await fetch(dataUrl)).blob();
      const annotatedPath = imageRecord.storage_path.replace(/\.[^.]+$/, '_annotated.png');

      const { error: uploadError } = await supabase.storage
        .from('session-images')
        .upload(annotatedPath, blob, { contentType: 'image/png', upsert: true });

      if (uploadError) throw uploadError;

      await supabase
        .from('session_images')
        .update({ annotated_path: annotatedPath })
        .eq('id', imageId);

      const { data: session } = await supabase
        .from('sessions')
        .select('session_date')
        .eq('id', sessionId)
        .single();

      navigate(`/day/${session.session_date}`);
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

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Image navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => prevImage && goToImage(prevImage)}
            disabled={!prevImage}
            className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous image"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <span className="text-sm text-gray-500 min-w-[3rem] text-center">
            {currentIndex + 1} / {allImages.length}
          </span>

          <button
            onClick={() => nextImage && goToImage(nextImage)}
            disabled={!nextImage}
            className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next image"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="w-14" />
      </header>

      {saveError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-600 flex-shrink-0">
          {saveError}
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <ImageEditor ref={editorRef} imageUrl={imageUrl} />
      </div>

      <EditorToolbar
        getCanvas={() => editorRef.current?.getCanvas()}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}
