// features/dashboard/components/charts/PhraseGrowthChart.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/features/charts';
import { useStats } from '@/features/data/hooks/useStats';
import { usePhraseGrowth } from '@/features/dashboard/hooks/usePhraseGrowth';

export const PhraseGrowthChart = () => {
  const { stats } = useStats();
  const { phrasesOverTime } = usePhraseGrowth();
  
  // Chart configuration
  const chartConfig = {
    phrases: { label: 'Phrases', color: 'var(--color-phrases)' },
  };

  return (
    <Card className="border rounded-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Total Phrases</CardTitle>
        <CardDescription>Growth trend over time</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <div className="h-[120px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={phrasesOverTime} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid stroke="#3F3F46" strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fill: 'white', fontSize: 10 }} axisLine={{ stroke: '#3F3F46' }} tickLine={{ stroke: '#3F3F46' }} />
                <YAxis tick={{ fill: 'white', fontSize: 10 }} axisLine={{ stroke: '#3F3F46' }} tickLine={{ stroke: '#3F3F46' }} />
                <ChartTooltip content={props => <ChartTooltipContent {...props} config={chartConfig} />} />
                <Line
                  type="monotone"
                  dataKey="phrases"
                  stroke="var(--color-phrases)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-phrases)', r: 4 }}
                  activeDot={{ r: 6, fill: 'var(--color-phrases)' }}
                  isAnimationActive={false}
                />
                {phrasesOverTime[0]?.phrases === null && (
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#FF6B6B"
                    fontSize="14px"
                    fontWeight="bold"
                  >
                    No Data Available
                  </text>
                )}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-0">
            <div className="flex items-center gap-1 font-medium text-lg">
              {stats?.total || 1392} total phrases <TrendingUp className="h-4 w-4 ml-1 text-green-500" />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              Last 6 months
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

// features/dashboard/components/charts/DifficultyDistributionChart.jsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ChartTooltip, ChartTooltipContent } from '@/features/charts';
import { useStats } from '@/features/data/hooks/useStats';

export const DifficultyDistributionChart = () => {
  const { stats } = useStats();
  
  // Chart configuration
  const chartConfig = {
    easy: { label: 'Easy', color: 'hsl(var(--primary) / 60%)' },
    medium: { label: 'Medium', color: 'hsl(var(--primary) / 80%)' },
    hard: { label: 'Hard', color: 'hsl(var(--primary))' }
  };

  return (
    <Card className="border rounded-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Difficulty Distribution</CardTitle>
        <CardDescription>Distribution by difficulty level</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <div className="h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: 'Easy', value: stats?.difficultyBreakdown?.easy || 30 },
                  { name: 'Medium', value: stats?.difficultyBreakdown?.medium || 20 },
                  { name: 'Hard', value: stats?.difficultyBreakdown?.hard || 10 },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={45}
                paddingAngle={2}
                dataKey="value"
                label={({ name }) => name}
              >
                <Cell fill="hsl(var(--primary) / 60%)" />
                <Cell fill="hsl(var(--primary) / 80%)" />
                <Cell fill="hsl(var(--primary))" />
              </Pie>
              <ChartTooltip content={props => <ChartTooltipContent {...props} config={chartConfig} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="pt-3">
        <div className="flex w-full items-center gap-4 text-sm justify-around">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary/60"></div>
            <span className="text-xs">Easy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary/80"></div>
            <span className="text-xs">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-xs">Hard</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

// features/dashboard/components/charts/MonthlyActivityChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChartTooltip, ChartTooltipContent } from '@/features/charts';
import { useMonthlyActivity } from '@/features/dashboard/hooks/useMonthlyActivity';

export const MonthlyActivityChart = () => {
  const { monthlyActivityData } = useMonthlyActivity();
  
  // Chart configuration
  const chartConfig = {
    reviews: { label: 'Reviews', color: 'hsl(var(--primary) / 80%)' },
    additions: { label: 'Additions', color: 'hsl(var(--primary) / 60%)' },
    edits: { label: 'Edits', color: 'hsl(var(--primary) / 40%)' }
  };

  return (
    <Card className="border rounded-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Monthly Activity</CardTitle>
        <CardDescription>Reviews, additions and edits over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyActivityData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid vertical={false} stroke="hsl(var(--muted-foreground) / 20%)" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: "hsl(var(--foreground))" }} tickLine={{ stroke: "hsl(var(--muted-foreground) / 40%)" }} axisLine={{ stroke: "hsl(var(--muted-foreground) / 40%)" }} />
              <YAxis tick={{ fill: "hsl(var(--foreground))" }} tickLine={{ stroke: "hsl(var(--muted-foreground) / 40%)" }} axisLine={{ stroke: "hsl(var(--muted-foreground) / 40%)" }} />
              <ChartTooltip 
                content={props => 
                  <ChartTooltipContent 
                    {...props} 
                    config={chartConfig}
                  />
                }
              />
              <Legend wrapperStyle={{ paddingTop: 20 }} />
              <Bar dataKey="reviews" fill="hsl(var(--primary) / 80%)" />
              <Bar dataKey="additions" fill="hsl(var(--primary) / 60%)" />
              <Bar dataKey="edits" fill="hsl(var(--primary) / 40%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Add more chart components as needed...