// src/components/dashboard/AnalyticsCharts.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  BarChart, Bar, PieChart, Pie, RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, Legend, PolarGrid, PolarRadiusAxis
} from 'recharts';

interface AnalyticsChartsProps {
  monthlyActivityData: any[];
  categoryData: any[];
  wordsAddedData: any[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ 
  monthlyActivityData, categoryData, wordsAddedData 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Monthly Activity */}
      <Card className="border rounded-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Monthly Activity</CardTitle>
          <CardDescription>Reviews, additions and edits over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyActivityData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid vertical={false} stroke="#3F3F46" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: "white" }} tickLine={{ stroke: "#3F3F46" }} axisLine={{ stroke: "#3F3F46" }} />
                <YAxis tick={{ fill: "white" }} tickLine={{ stroke: "#3F3F46" }} axisLine={{ stroke: "#3F3F46" }} />
                <Tooltip contentStyle={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: 'white', borderRadius: '0.5rem' }} />
                <Legend wrapperStyle={{ paddingTop: 20 }} />
                <Bar dataKey="reviews" fill="#71717A" />
                <Bar dataKey="additions" fill="#3F3F46" />
                <Bar dataKey="edits" fill="#18181B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Distribution */}
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
                  <Cell fill="#D4D4D8" />
                  <Cell fill="#A1A1AA" />
                  <Cell fill="#71717A" />
                  <Cell fill="#3F3F46" />
                  <Cell fill="#18181B" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: 'white', borderRadius: '0.5rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Top Reviewers Performance */}
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
                data={[
                  { name: "Kari", reviews: 120, streak: 14 },
                  { name: "Sarah", reviews: 85, streak: 7 },
                  { name: "Justin", reviews: 65, streak: 5 },
                  { name: "Alex", reviews: 45, streak: 3 },
                  { name: "Morgan", reviews: 30, streak: 2 }
                ]}
                margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#3F3F46" />
                <XAxis 
                  type="number"
                  tick={{ fill: "white" }}
                  tickLine={{ stroke: "#3F3F46" }}
                  axisLine={{ stroke: "#3F3F46" }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category"
                  tick={{ fill: "white" }}
                  tickLine={{ stroke: "#3F3F46" }}
                  axisLine={{ stroke: "#3F3F46" }}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#27272A', 
                    borderColor: '#3F3F46',
                    color: 'white',
                    borderRadius: '0.5rem' 
                  }}
                />
                <Legend />
                <Bar dataKey="reviews" fill="#71717A" />
                <Bar dataKey="streak" fill="#18181B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Words Added This Month */}
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
              Goal: <span className="font-bold text-white">100 words</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Remaining: <span className="font-bold text-white">{100 - wordsAddedData[0].value}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};