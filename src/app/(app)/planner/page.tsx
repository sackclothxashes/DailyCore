'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Flame, Dumbbell, BookOpen, Droplets, PlusCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from '@/components/ui/button';

const dailyTasks = [
  { id: 'task-1', title: 'Morning Exercise', icon: Dumbbell, streak: 12 },
  { id: 'task-2', title: 'Read 10 pages', icon: BookOpen, streak: 5 },
  { id: 'task-3', title: 'Drink 8 glasses of water', icon: Droplets, streak: 25 },
];

export default function PlannerPage() {
  const [currentDateString, setCurrentDateString] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  useEffect(() => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentDateString(today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);


  return (
    <div>
      <PageHeader
        title="Daily Planner"
        description="Complete your recurring tasks to build streaks and form habits."
      />
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Today's Plan</CardTitle>
                  <CardDescription>{currentDateString || 'Loading...'}</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {dailyTasks.map((task, index) => (
                  <>
                    <li key={task.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary">
                      <div className="flex items-center gap-4">
                        <Checkbox id={task.id} />
                        <label htmlFor={task.id} className="flex items-center gap-3 cursor-pointer">
                          <task.icon className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">{task.title}</span>
                        </label>
                      </div>
                      <div className="flex items-center gap-2 text-orange-500">
                        <Flame className="w-5 h-5" />
                        <span className="font-semibold">{task.streak}</span>
                      </div>
                    </li>
                    {index < dailyTasks.length - 1 && <Separator />}
                  </>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Completion History</CardTitle>
              <CardDescription>View your progress over the month.</CardDescription>
            </CardHeader>
            <CardContent>
               <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md"
                modifiers={{
                  completed: [new Date(2024, 6, 20), new Date(2024, 6, 21), new Date(2024, 6, 22), new Date(2024, 6, 24)],
                  missed: new Date(2024, 6, 23)
                }}
                modifiersStyles={{
                  completed: { color: 'white', backgroundColor: '#22c55e' },
                  missed: { color: 'white', backgroundColor: '#ef4444' }
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
