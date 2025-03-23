// features/dashboard/components/AnalyticsSection/AnalyticsSection.tsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  PieChart, Pie, Cell, BarChart, Bar, 
  ResponsiveContainer, Tooltip, Legend, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { supabase } from '@/lib/services/supabase';
import { cn } from '@/lib/utils';

export const AnalyticsSection = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [difficultyData, setDifficultyData] = useState([]);
  const [phrasesAdded, setPhrasesAdded] = useState(0);
  const [reviewsCompleted, setReviewsCompleted] = useState(0);
  const [loading, setLoading] = useState(true);
  const { accent } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories data
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('phrases')
          .select('category_id, categories:category_id(name)');

        if (categoriesError) throw categoriesError;

        // Count frequency of each category
        const categoryCounts = {};
        categoriesData.forEach(item => {
          const categoryName = item.categories?.name || 'Uncategorized';
          categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
        });

        // Convert to array format for Bar Chart and sort by value (descending)
        const categoryDataArray = Object.entries(categoryCounts)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10); // Take top 10 categories for better visualization

        setCategoryData(categoryDataArray);

        // Fetch difficulty data
        const { data: difficultyRawData, error: difficultyError } = await supabase
          .from('phrases')
          .select('difficulty');

        if (difficultyError) throw difficultyError;

        // Count frequency of each difficulty level
        const difficultyCounts = { 'Easy': 0, 'Medium': 0, 'Hard': 0 };
        difficultyRawData.forEach(item => {
          const diffLevel = item.difficulty === 1 ? 'Easy' : 
                           item.difficulty === 2 ? 'Medium' : 
                           item.difficulty === 3 ? 'Hard' : 'Unknown';
          difficultyCounts[diffLevel] = (difficultyCounts[diffLevel] || 0) + 1;
        });

        // Convert to array format for PieChart
        const difficultyDataArray = Object.entries(difficultyCounts).map(([name, value]) => ({
          name,
          value
        }));

        setDifficultyData(difficultyDataArray);

        // Get phrases added this month
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        firstDayOfMonth.setHours(0, 0, 0, 0);

        const { data: phrasesThisMonth, error: phrasesError } = await supabase
          .from('phrases')
          .select('id')
          .gte('created_at', firstDayOfMonth.toISOString());

        if (phrasesError) throw phrasesError;
        setPhrasesAdded(phrasesThisMonth?.length || 0);

        // Get reviews completed this month
        const { data: reviewsThisMonth, error: reviewsError } = await supabase
          .from('votes')
          .select('id')
          .gte('created_at', firstDayOfMonth.toISOString());

        if (reviewsError) throw reviewsError;
        setReviewsCompleted(reviewsThisMonth?.length || 0);

      } catch (error) {
        console.error('Error fetching stats data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get colors based on the current accent
  const getChartColors = () => {
    switch (accent) {
      case 'blue':
        return ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'];
      case 'green':
        return ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'];
      case 'purple':
        return ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'];
      case 'orange':
        return ['#F97316', '#FB923C', '#FDBA74', '#FED7AA', '#FFEDD5'];
      default: // grayscale
        return ['#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB'];
    }
  };

  // Generate accent-specific chart colors
  const COLORS = getChartColors();

  // Get the appropriate border color for cards
  const getCardBorderClass = () => {
    switch (accent) {
      case 'blue': return 'border-blue-500/30';
      case 'green': return 'border-emerald-500/30';
      case 'purple': return 'border-purple-500/30';
      case 'orange': return 'border-orange-500/30';
      default: return 'border-gray-500/30';
    }
  };

  // If loading, show skeleton state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full bg-gray-100 dark:bg-gray-800 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate percentage for gauges
  const phrasesPercentage = Math.min(100, Math.round((phrasesAdded / 100) * 100));
  const reviewsPercentage = Math.min(100, Math.round((reviewsCompleted / 100) * 100));

  // Gauge chart needle renderer
  const renderNeedle = (value, data, cx, cy, iRadius, oRadius, color) => {
    const angle = 180 - value * 1.8; // Convert percentage to angle (180 to 0)
    const length = oRadius * 0.8; // Length of the needle
    const sin = Math.sin(-angle * Math.PI / 180);
    const cos = Math.cos(-angle * Math.PI / 180);
    const r = 5; // Needle base radius
    const x0 = cx;
    const y0 = cy;
    const xba = x0 + r * sin;
    const yba = y0 - r * cos;
    const xbb = x0 - r * sin;
    const ybb = y0 + r * cos;
    const xp = x0 + length * sin;
    const yp = y0 - length * cos;

    // Use the first color from the COLORS array
    const needleColor = COLORS[0];

    return [
      <circle cx={x0} cy={y0} r={r + 2} fill={needleColor} stroke="none" key="needle-center" />,
      <path d={`M${xba} ${yba}L${xbb} ${ybb}L${xp} ${yp}Z`} fill={needleColor} key="needle-path" />
    ];
  };

  // Get accent-specific empty gauge color
  const getEmptyGaugeColor = () => {
    return accent === 'default' ? '#E5E7EB' : '#E5E7EB';
  };

  // Get accent-specific filled gauge color
  const getFilledGaugeColor = () => {
    return COLORS[0];
  };

  const cardBorderClass = getCardBorderClass();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Category Bar Chart - horizontal layout for better category name display */}
      <Card className={cn("border rounded-md border-2", cardBorderClass)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Category Distribution</CardTitle>
          <CardDescription>Top categories by phrase count</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={categoryData}
                margin={{ top: 5, right: 30, left: 75, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#555" opacity={0.2} />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={75}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value) => [`${value} phrases`, 'Count']}
                  contentStyle={{ backgroundColor: '#333', border: '1px solid #444' }}
                />
                <Bar dataKey="value" fill={COLORS[0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Pie Chart */}
      <Card className={cn("border rounded-md border-2", cardBorderClass)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Difficulty Distribution</CardTitle>
          <CardDescription>Breakdown by difficulty level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#000"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} phrases`, 'Count']}
                  contentStyle={{ backgroundColor: '#333', border: '1px solid #444' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Phrases Goal Gauge */}
      <Card className={cn("border rounded-md border-2", cardBorderClass)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Words Added This Month</CardTitle>
          <CardDescription>Progress towards the goal of 100 words</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  startAngle={180}
                  endAngle={0}
                  data={[
                    { name: 'Empty', value: 100 - phrasesPercentage, fill: getEmptyGaugeColor() },
                    { name: 'Progress', value: phrasesPercentage, fill: getFilledGaugeColor() }
                  ]}
                  cx="50%"
                  cy="80%"
                  innerRadius={70}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                </Pie>
                {renderNeedle(phrasesPercentage, null, '50%', '80%', 70, 90, COLORS[0])}
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground font-bold"
                  fontSize="24"
                >
                  {phrasesPercentage}%
                </text>
                <text
                  x="50%"
                  y="75%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground"
                  fontSize="14"
                >
                  {phrasesAdded}/100 words
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Reviews Goal Gauge */}
      <Card className={cn("border rounded-md border-2", cardBorderClass)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Reviews Completed This Month</CardTitle>
          <CardDescription>Progress towards 100 reviews this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  startAngle={180}
                  endAngle={0}
                  data={[
                    { name: 'Empty', value: 100 - reviewsPercentage, fill: getEmptyGaugeColor() },
                    { name: 'Progress', value: reviewsPercentage, fill: getFilledGaugeColor() }
                  ]}
                  cx="50%"
                  cy="80%"
                  innerRadius={70}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                </Pie>
                {renderNeedle(reviewsPercentage, null, '50%', '80%', 70, 90, COLORS[0])}
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground font-bold"
                  fontSize="24"
                >
                  {reviewsPercentage}%
                </text>
                <text
                  x="50%"
                  y="75%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground"
                  fontSize="14"
                >
                  {reviewsCompleted}/100 reviews
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsSection;