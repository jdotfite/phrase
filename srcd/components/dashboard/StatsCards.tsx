// src/components/dashboard/StatsCards.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from "lucide-react";

interface StatsCardsProps {
  phrasesOverTime: any[];
  stats: any;
  reviewers: any[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ phrasesOverTime, stats, reviewers }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Phrases Chart */}
      <Card className="border rounded-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Total Phrases</CardTitle>
          <CardDescription>Growth trend over time</CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={phrasesOverTime} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid stroke="#3F3F46" strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fill: 'white', fontSize: 10 }} axisLine={{ stroke: '#3F3F46' }} tickLine={{ stroke: '#3F3F46' }} />
                <YAxis tick={{ fill: 'white', fontSize: 10 }} axisLine={{ stroke: '#3F3F46' }} tickLine={{ stroke: '#3F3F46' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: 'white', fontSize: '12px' }} 
                  labelStyle={{ fontWeight: 'bold' }}
                  formatter={(value) => value === null ? 'N/A' : value} 
                />
                <Line 
                  type="monotone" 
                  dataKey="phrases" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8', r: 4 }}
                  activeDot={{ r: 6, fill: '#8884d8' }}
                  isAnimationActive={false}
                />
                
                {/* Add text overlay when data is null/error state */}
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

      {/* Difficulty Radar Chart */}
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
                  <Cell fill="#D4D4D8" />
                  <Cell fill="#A1A1AA" />
                  <Cell fill="#71717A" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: 'white', borderRadius: '0.5rem', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
        <CardFooter className="pt-3">
          <div className="flex w-full items-center gap-4 text-sm justify-around">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#D4D4D8" }}></div>
              <span className="text-xs">Easy</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#A1A1AA" }}></div>
              <span className="text-xs">Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#71717A" }}></div>
              <span className="text-xs">Hard</span>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Top Reviewers */}
      <Card className="border rounded-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Top Reviewers</CardTitle>
          <CardDescription>Most active contributors</CardDescription>
        </CardHeader>
        <CardContent className="p-2 pb-4">
          <div className="space-y-2 mt-2">
            {reviewers?.slice(0, 3).map((reviewer, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs">
                    {reviewer.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{reviewer.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-bold">{reviewer.total_reviews || index === 0 ? 4 : index === 1 ? 1 : 0}</span>
                  <span className="text-xs text-muted-foreground ml-1">reviews</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};