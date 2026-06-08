import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function useImageUpload(date, onSuccess) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function uploadImages(files) {
    setUploading(true);
    setError(null);

    try {
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .upsert({ session_date: date }, { onConflict: 'session_date' })
        .select()
        .single();

      if (sessionError) throw sessionError;

      for (const file of files) {
        const ext = file.name.split('.').pop().toLowerCase();

        const { data: imgRow, error: insertError } = await supabase
          .from('session_images')
          .insert({ session_id: session.id, storage_path: '_pending' })
          .select()
          .single();

        if (insertError) throw insertError;

        const storagePath = `${date}/${imgRow.id}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('session-images')
          .upload(storagePath, file, { contentType: file.type });

        if (uploadError) throw uploadError;

        await supabase
          .from('session_images')
          .update({ storage_path: storagePath })
          .eq('id', imgRow.id);
      }

      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return { uploadImages, uploading, error };
}
