import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useSession(date) {
  const [session, setSession] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    setLoading(true);
    const { data: sessionData } = await supabase
      .from('sessions')
      .select('*')
      .eq('session_date', date)
      .maybeSingle();

    setSession(sessionData);

    if (sessionData) {
      const { data: imagesData } = await supabase
        .from('session_images')
        .select('*')
        .eq('session_id', sessionData.id)
        .order('display_order', { ascending: true });

      setImages(imagesData || []);
    } else {
      setImages([]);
    }
    setLoading(false);
  }, [date]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return { session, images, loading, refetch: fetchSession };
}
