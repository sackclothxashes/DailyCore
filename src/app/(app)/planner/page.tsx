'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Flame, PlusCircle, Trash2, ClipboardCheck } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DailyTask = {
  id: string;
  title: string;
  icon: React.ElementType;
  streak: number;
  completed: boolean;
};


export default function PlannerPage() {
  const [currentDateString, setCurrentDateString] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentDateString(today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: DailyTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      icon: ClipboardCheck,
      streak: 0,
      completed: false
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setIsAddTaskOpen(false);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };
  
  const handleToggleCompletion = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };


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
                <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                  <DialogTrigger asChild>
                     <Button variant="outline" size="sm">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Daily Task</DialogTitle>
                      <DialogDescription>
                        What new habit are you building?
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                       <div className="space-y-2">
                          <Label htmlFor="task-title">Task Title</Label>
                          <Input
                            id="task-title"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="e.g., Meditate for 10 minutes"
                          />
                        </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button onClick={handleAddTask}>Add Task</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {tasks.length > 0 ? (
                <ul className="space-y-4">
                  {tasks.map((task, index) => (
                    <React.Fragment key={task.id}>
                      <li className="flex items-center justify-between p-2 rounded-md hover:bg-secondary">
                        <div className="flex items-center gap-4">
                          <Checkbox id={task.id} checked={task.completed} onCheckedChange={() => handleToggleCompletion(task.id)} />
                          <label htmlFor={task.id} className="flex items-center gap-3 cursor-pointer">
                            <task.icon className="w-5 h-5 text-muted-foreground" />
                            <span className="font-medium">{task.title}</span>
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 text-orange-500">
                            <Flame className="w-5 h-5" />
                            <span className="font-semibold">{task.streak}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTask(task.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </li>
                      {index < tasks.length - 1 && <Separator />}
                    </React.Fragment>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-muted-foreground py-10">
                  <p>No tasks yet.</p>
                  <p className="text-sm">Click "Add Task" to get started.</p>
                </div>
              )}
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
