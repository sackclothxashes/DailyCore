
'use client';

import { useState, useMemo } from 'react';
import { FeatureCard } from "@/components/app/feature-card";
import { ProgressCard } from "@/components/app/progress-card";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import {
  ListTodo,
  Wallet,
  CalendarCheck,
  User,
  Camera,
  PlusCircle,
  Calendar as CalendarIcon,
  Flame,
  AlertCircle,
  CalendarDays,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useTasks, taskIcons } from "@/hooks/use-tasks";
import Link from 'next/link';
import type { Task } from '@/components/app/tasks/columns';
import useLocalStorage from '@/hooks/use-local-storage';


const features = [
  {
    title: "Task Manager",
    description: "Create, tag, and manage your tasks.",
    href: "/tasks",
    Icon: ListTodo,
  },
  {
    title: "Budget Watcher",
    description: "Track your income and expenses.",
    href: "/budget",
    Icon: Wallet,
  },
  {
    title: "Daily Planner",
    description: "Plan your day and build streaks.",
    href: "/planner",
    Icon: CalendarCheck,
  },
  {
    title: "Patient Log",
    description: "Log and manage patient information.",
    href: "/patients",
    Icon: User,
  },
  {
    title: "Daily Snapshots",
    description: "Create a visual diary of your life.",
    href: "/diary",
    Icon: Camera,
  },
  {
    title: "Attendance",
    description: "Track your personal attendance.",
    href: "/attendance",
    Icon: CalendarDays,
  },
];

export type Goal = {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
};


export default function DashboardPage() {
  const { tasks: dailyTasks } = useTasks();
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", []);
  const [goals, setGoals] = useLocalStorage<Goal[]>("app-goals", []);

  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalStartDate, setNewGoalStartDate] = useState<Date | undefined>();
  const [newGoalEndDate, setNewGoalEndDate] = useState<Date | undefined>();
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const overdueTasksCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today for accurate comparison
    return tasks.filter(
        (task) => task.status !== "done" && new Date(task.dueDate) < today
    ).length;
  }, [tasks]);

  const handleAddGoal = () => {
    if (newGoalTitle && newGoalStartDate && newGoalEndDate) {
      const newGoal: Goal = {
        id: `goal-${Date.now()}`,
        title: newGoalTitle,
        startDate: newGoalStartDate,
        endDate: newGoalEndDate,
      };
      setGoals(prevGoals => [...prevGoals, newGoal]);
      setIsAddGoalDialogOpen(false);
      setNewGoalTitle("");
      setNewGoalStartDate(undefined);
      setNewGoalEndDate(undefined);
    }
  };

  const handleUpdateGoal = (updatedGoal: Goal) => {
    setGoals(prevGoals =>
      prevGoals.map(goal => (goal.id === updatedGoal.id ? updatedGoal : goal))
    );
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(prevGoals => prevGoals.filter(goal => goal.id !== goalId));
  };


  return (
    <div>
      <PageHeader
        title="Welcome to ChronoZen"
        description="Your all-in-one personal management app. Select a module to get started."
      >
        {overdueTasksCount > 0 && (
          <Link href="/tasks" passHref>
            <Button variant="ghost" className="text-destructive hover:bg-destructive/10">
              <AlertCircle className="mr-2" />
              {overdueTasksCount} Overdue Task{overdueTasksCount > 1 ? 's' : ''}
            </Button>
          </Link>
        )}
        <Button onClick={() => setIsAddGoalDialogOpen(true)}>
          <PlusCircle className="mr-2" /> Add Goal
        </Button>
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => (
           <ProgressCard
            key={goal.id}
            goal={goal}
            onUpdate={handleUpdateGoal}
            onDelete={handleDeleteGoal}
            className="col-span-1 md:col-span-2 lg:col-span-3"
          />
        ))}

        {dailyTasks.length > 0 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-wrap items-center gap-x-6 gap-y-4">
                {dailyTasks.map(task => {
                    const IconComponent = taskIcons[task.icon];
                    return (
                        <div key={task.id} title={task.title} className="flex items-center gap-2 p-2 rounded-lg bg-secondary cursor-default">
                            <IconComponent className="w-6 h-6 text-secondary-foreground" />
                            <div className="flex items-center gap-1 text-orange-500">
                                <Flame className="w-5 h-5" />
                                <span className="font-bold text-lg">{task.streak}</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        )}

        {features.map((feature) => (
          <FeatureCard key={feature.href} {...feature} />
        ))}
      </div>

      <Dialog open={isAddGoalDialogOpen} onOpenChange={setIsAddGoalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Progress Goal</DialogTitle>
            <DialogDescription>
              Create a new progress bar to track your goals.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="goal-title">Goal Title</Label>
              <Input
                id="goal-title"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                placeholder="e.g., Q3 Project Deadline"
              />
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !newGoalStartDate && "text-muted-foreground"
                )}
                onClick={() => setShowStartDatePicker(!showStartDatePicker)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {newGoalStartDate ? format(newGoalStartDate, "PPP") : <span>Pick a date</span>}
              </Button>
              {showStartDatePicker && (
                <Calendar
                  mode="single"
                  selected={newGoalStartDate}
                  onSelect={(date) => {
                    setNewGoalStartDate(date);
                    setShowStartDatePicker(false);
                  }}
                  initialFocus
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !newGoalEndDate && "text-muted-foreground"
                )}
                onClick={() => setShowEndDatePicker(!showEndDatePicker)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {newGoalEndDate ? format(newGoalEndDate, "PPP") : <span>Pick a date</span>}
              </Button>
              {showEndDatePicker && (
                <Calendar
                  mode="single"
                  selected={newGoalEndDate}
                  onSelect={(date) => {
                    setNewGoalEndDate(date);
                    setShowEndDatePicker(false);
                  }}
                  initialFocus
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddGoal}>Add Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
