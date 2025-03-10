import { useState, useEffect } from 'react';
import { DashboardDataService } from '@/services/dashboard-data-service';

export const usePhraseTimeline = () => {
  const [phrasesOverTime, setPhrasesOverTime] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await DashboardDataService.fetchPhrasesOverTime();
      
      if (error || !data) {
        setPhrasesOverTime(DashboardDataService.getErrorStateData());
        setError(error);
      } else {
        const monthlyData = DashboardDataService.processTimestampData(data);
        setPhrasesOverTime(monthlyData);
      }
      setLoading(false);
    };
    
    fetchData();
  }, []);

  return { phrasesOverTime, loading, error };
};
