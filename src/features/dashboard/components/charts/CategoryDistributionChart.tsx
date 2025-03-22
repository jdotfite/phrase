// features/dashboard/components/charts/CategoryDistributionChart.jsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChartTooltip, ChartTooltipContent } from '@/features/charts';
import { useCategoryDistribution } from '@/features/dashboard/hooks/useCategoryDistribution';

export const CategoryDistributionChart = () => {
  const { categoryData } = useCategoryDistribution();
  
  // Chart configuration
  const chartConfig = {
    value: { label: 'Count', color: 'hsl(var(--primary))' }
  };

  return (
    <Card className="border rounded-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Category Distribution</CardTitle>
        <CardDescription>Phrases by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                <Cell fill="hsl(var(--primary))" />
                <Cell fill="hsl(var(--primary) / 90%)" />
                <Cell fill="hsl(var(--primary) / 80%)" />
                <Cell fill="hsl(var(--primary) / 70%)" />
                <Cell fill="hsl(var(--primary) / 60%)" />
              </Pie>
              <ChartTooltip 
                content={props => 
                  <ChartTooltipContent 
                    {...props} 
                    config={chartConfig}
                  />
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// features/dashboard/components/charts/TopReviewersPerformanceChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChartTooltip, ChartTooltipContent } from '@/features/charts';

export const TopReviewersPerformanceChart = () => {
  // Sample data - could be fetched from a hook
  const reviewersData = [
    { name: "Kari", reviews: 120, streak: 14 },
    { name: "Sarah", reviews: 85, streak: 7 },
    { name: "Justin", reviews: 65, streak: 5 },
    { name: "Alex", reviews: 45, streak: 3 },
    { name: "Morgan", reviews: 30, streak: 2 }
  ];
  
  // Chart configuration
  const chartConfig = {
    reviews: { label: 'Reviews', color: 'hsl(var(--primary) / 80%)' },
    streak: { label: 'Streak', color: 'hsl(var(--primary) / 40%)' }
  };

  return (
    <Card className="border rounded-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Top Reviewers Performance</CardTitle>
        <CardDescription>Reviews and streaks by contributor</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={reviewersData}
              margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 20%)" />
              <XAxis
                type="number"
                tick={{ fill: "hsl(var(--foreground))" }}
                tickLine={{ stroke: "hsl(var(--muted-foreground) / 40%)" }}
                axisLine={{ stroke: "hsl(var(--muted-foreground) / 40%)" }}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fill: "hsl(var(--foreground))" }}
                tickLine={{ stroke: "hsl(var(--muted-foreground) / 40%)" }}
                axisLine={{ stroke: "hsl(var(--muted-foreground) / 40%)" }}
              />
              <ChartTooltip 
                content={props => 
                  <ChartTooltipContent 
                    {...props} 
                    config={chartConfig}
                  />
                }
              />
              <Legend />
              <Bar dataKey="reviews" fill="hsl(var(--primary) / 80%)" />
              <Bar dataKey="streak" fill="hsl(var(--primary) / 40%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// features/dashboard/components/charts/WordsAddedChart.jsx
import React from 'react';
import { RadialBarChart, RadialBar, PolarGrid, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export const WordsAddedChart = () => {
  // Sample data - could be fetched from a hook
  const wordsAddedData = [
    { name: "Words Added", value: 45, fill: "hsl(var(--primary))" },
    { name: "Goal", value: 100, fill: "hsl(var(--muted))" },
  ];

  return (
    <Card className="border rounded-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Words Added This Month</CardTitle>
        <CardDescription>Progress towards the goal of 100 words</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={wordsAddedData}
              innerRadius="80%"
              outerRadius="100%"
              startAngle={180}
              endAngle={0}
            >
              <PolarGrid stroke="hsl(var(--muted))" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
              <RadialBar
                dataKey="value"
                cornerRadius={10}
                background
                fill="hsl(var(--primary))"
              />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground text-2xl font-bold"
              >
                {wordsAddedData[0].value} / 100
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Goal: <span className="font-bold text-foreground">100 words</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Remaining: <span className="font-bold text-foreground">{100 - wordsAddedData[0].value}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};