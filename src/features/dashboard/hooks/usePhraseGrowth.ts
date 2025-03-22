// features/dashboard/hooks/usePhraseGrowth.js
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/services/supabase';

export const usePhraseGrowth = () => {
  const [phrasesOverTime, setPhrasesOverTime] = useState([]);
  
  // Fetch phrases over time
  useEffect(() => {
    fetchPhrasesOverTime();
  }, []);
  
  /**
   * Fetch phrases over time data for chart
   */
  const fetchPhrasesOverTime = async () => {
    try {
      const { data, error } = await supabase
        .from('phrases')
        .select('created_at')
        .order('created_at');
      if (error) {
        console.error('Error fetching phrase timestamps:', error);
        setPhrasesOverTime(getErrorStateData());
        return;
      }
      if (data && data.length > 0) {
        const monthlyData = processTimestampData(data);
        setPhrasesOverTime(monthlyData);
      } else {
        setPhrasesOverTime(getErrorStateData());
      }
    } catch (err) {
      console.error('Error fetching phrase timestamps:', err);
      setPhrasesOverTime(getErrorStateData());
    }
  };

  /**
   * Process timestamp data for charts
   */
  const processTimestampData = (data) => {
    const monthCounts = {};
    data.forEach(item => {
      if (!item.created_at) return;
      const date = new Date(item.created_at);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const key = `${month} ${year}`;
      if (!monthCounts[key]) {
        monthCounts[key] = { month, year, count: 0, fullDate: date };
      }
      monthCounts[key].count++;
    });
    return Object.values(monthCounts)
      .sort((a, b) => a.fullDate - b.fullDate)
      .map(item => ({ month: item.month, year: item.year, phrases: item.count }))
      .slice(-6);
  };

  /**
   * Get fallback data for charts when error occurs
   */
  const getErrorStateData = () => {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(month => ({
      month,
      year: new Date().getFullYear(),
      phrases: null
    }));
  };
  
  return {
    phrasesOverTime,
    fetchPhrasesOverTime
  };
};

// features/dashboard/hooks/useMonthlyActivity.js
import { useState, useEffect } from 'react';

export const useMonthlyActivity = () => {
  const [monthlyActivityData, setMonthlyActivityData] = useState([]);
  
  // Generate monthly activity data for charts
  useEffect(() => {
    const generateMonthlyActivityData = () => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      return months.map(month => ({
        name: month,
        reviews: Math.floor(Math.random() * 100) + 50,
        additions: Math.floor(Math.random() * 40) + 10,
        edits: Math.floor(Math.random() * 30) + 5,
      }));
    };
    
    setMonthlyActivityData(generateMonthlyActivityData());
  }, []);
  
  return {
    monthlyActivityData
  };
};

// features/dashboard/hooks/useCategoryDistribution.js
import { useState, useEffect } from 'react';
import { usePhraseMetadata } from '@/features/data/hooks/usePhraseMetadata';

export const useCategoryDistribution = () => {
  const [categoryData, setCategoryData] = useState([]);
  const { categories } = usePhraseMetadata();
  
  // Generate category data for charts
  useEffect(() => {
    const generateCategoryData = () => {
      if (categories && categories.length > 0) {
        // You could implement real data fetching here
        return [
          { name: 'Animals & Plants', value: 30 },
          { name: 'Art & Design', value: 22 },
          { name: 'Education & Learning', value: 13 },
          { name: 'Celebrations & Traditions', value: 16 },
          { name: 'Business & Careers', value: 19 },
        ];
      }
      return [
        { name: 'Animals & Plants', value: 30 },
        { name: 'Art & Design', value: 22 },
        { name: 'Education & Learning', value: 13 },
        { name: 'Celebrations & Traditions', value: 16 },
        { name: 'Business & Careers', value: 19 },
      ];
    };
    
    setCategoryData(generateCategoryData());
  }, [categories]);
  
  return {
    categoryData
  };
};

// Add more hooks as needed...