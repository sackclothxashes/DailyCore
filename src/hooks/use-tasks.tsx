
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { 
  ClipboardCheck, 
  Brain, 
  Droplets, 
  Dumbbell, 
  BookOpen, 
  Repeat, 
  Coffee,
  Bed,
  Utensils,
  Heart,
  Sprout,
  Paintbrush,
  Music,
  Code,
  Smile,
  Sunrise,
  Sunset,
  Dog,
  Cat,
  Route
} from 'lucide-react';
import useLocalStorage from './use-local-storage';

// Define the icons that can be used for tasks
export const taskIcons = {
  'ClipboardCheck': ClipboardCheck,
  'Brain': Brain,
  'Droplets': Droplets,
  'Dumbbell': Dumbbell,
  'BookOpen': BookOpen,
  'Repeat': Repeat,
  'Coffee': Coffee,
  'Bed': Bed,
  'Utensils': Utensils,
  'Heart': Heart,
  'Sprout': Sprout,
  'Paintbrush': Paintbrush,
  'Music': Music,
  'Code': Code,
  'Smile': Smile,
  'Sunrise': Sunrise,
  'Sunset': Sunset,
  'Dog': Dog,
  'Cat': Cat,
  'Route': Route,
};

export type TaskIconName = keyof typeof taskIcons;

export type DailyTask = {
  id: string;
  title: string;
  icon: TaskIconName;
  streak: number;
  completed: boolean;
};

type TasksContextType = {
  tasks: DailyTask[];
  addTask: (title: string, icon: TaskIconName) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskCompletion: (taskId: string) => void;
};

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useLocalStorage<DailyTask[]>('dailyTasks', []);

  const addTask = (title: string, icon: TaskIconName) => {
    const newTask: DailyTask = {
      id: `task-${Date.now()}`,
      title,
      icon,
      streak: 0,
      completed: false,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const wasCompleted = task.completed;
          const isCompleted = !wasCompleted;
          // Increment streak on completion, decrement on un-completion
          const newStreak = isCompleted ? task.streak + 1 : Math.max(0, task.streak - 1);
          return { ...task, completed: isCompleted, streak: newStreak };
        }
        return task;
      })
    );
  };
  
  return (
    <TasksContext.Provider value={{ tasks, addTask, deleteTask, toggleTaskCompletion }}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};
