import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useSessions() {
  const [sessionDates, setSessionDates] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    const { data } = await supabase
      .from('sessions')
      .select('session_date, notes, is_complete, is_reviewed, session_images(id)')
      .order('session_date', { ascending: false });

    if (data) {
      setSessions(data);
      setSessionDates(
        data
          .filter(s => s.session_images && s.session_images.length > 0)
          .map(s => s.session_date)
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { sessionDates, sessions, loading, refetch: fetchSessions };
}
