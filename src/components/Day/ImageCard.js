import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function ImageCard({ image, session, onDelete }) {
  const navigate = useNavigate();

  function getUrl(path) {
    return supabase.storage.from('session-images').getPublicUrl(path).data.publicUrl;
  }

  const displayPath = image.annotated_path || image.storage_path;
  const imageUrl = getUrl(displayPath);

  async function handleDelete() {
    if (!window.confirm('Delete this image?')) return;

    await supabase.storage.from('session-images').remove([image.storage_path]);
    if (image.annotated_path) {
      await supabase.storage.from('session-images').remove([image.annotated_path]);
    }
    await supabase.from('session_images').delete().eq('id', image.id);
    onDelete?.();
  }

  return (
    <div className="relative group rounded-lg overflow-hidden bg-gray-100 aspect-square">
      <img
        src={imageUrl}
        alt="Writing practice"
        className="w-full h-full object-cover"
      />
      {image.annotated_path && (
        <span className="absolute top-1.5 left-1.5 bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded">
          Annotated
        </span>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
        <button
          onClick={() => navigate(`/editor/${session.id}/${image.id}`)}
          className="bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-md hover:bg-emerald-50 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
