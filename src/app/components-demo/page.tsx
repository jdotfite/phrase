// app/components-demo/page.tsx
'use client'

import React from 'react'
import { StatCard } from "@/components/ui/stat-card"
import { FileText, Users, Award, ChevronDown, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ComponentsDemo() {
  return (
    <div className="container mx-auto p-6 space-y-10">
      <div>
        <h1 className="text-3xl font-bold mb-6">Components Demo</h1>
        <p className="text-gray-400 mb-10">
          This page demonstrates the new UI components built with Shadcn/UI.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Stat Cards</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Phrases"
            value={1392}
            description="Total catch phrases in database"
            icon={<FileText className="h-4 w-4" />}
          />
          <StatCard
            title="Categories"
            value={13}
            description="Different word categories"
            icon={<ChevronDown className="h-4 w-4" />}
            trend={{ value: 2.5, label: "from last month", direction: "up" }}
          />
          <StatCard
            title="Active Reviewers"
            value={8}
            description="Contributors this month"
            icon={<Users className="h-4 w-4" />}
            trend={{ value: 12, label: "from last month", direction: "up" }}
          />
          <StatCard
            title="Top Contributor"
            value="Sarah"
            description="289 reviews"
            icon={<Award className="h-4 w-4" />}
            trend={{ value: 5, label: "increase in streak", direction: "up" }}
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Cards</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Create New Phrase</CardTitle>
              <CardDescription>Add a new phrase to the database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phrase">Phrase</Label>
                  <Input id="phrase" placeholder="Enter phrase" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="movies">Movies</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="animals">Animals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Create</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Last 5 reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Phrase</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Sarah</TableCell>
                    <TableCell>Mind over matter</TableCell>
                    <TableCell>Today</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>John</TableCell>
                    <TableCell>Break a leg</TableCell>
                    <TableCell>Yesterday</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Emma</TableCell>
                    <TableCell>Piece of cake</TableCell>
                    <TableCell>Mar 3</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="ml-auto">View All</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>
    </div>
  )
}