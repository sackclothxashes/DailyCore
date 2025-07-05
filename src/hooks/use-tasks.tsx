'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ClipboardCheck, Brain, Droplets, Dumbbell, BookOpen, Repeat, Coffee } from 'lucide-react';

// Define the icons that can be used for tasks
export const taskIcons = {
  'ClipboardCheck': ClipboardCheck,
  'Brain': Brain,
  'Droplets': Droplets,
  'Dumbbell': Dumbbell,
  'BookOpen': BookOpen,
  'Repeat': Repeat,
  'Coffee': Coffee,
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

// Helper to get initial state from localStorage
const getInitialState = (): DailyTask[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const item = window.localStorage.getItem('dailyTasks');
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error("Error reading from localStorage", error);
    return [];
  }
};


export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<DailyTask[]>([]);

  // Load state from localStorage on initial render
  useEffect(() => {
    setTasks(getInitialState());
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (tasks.length > 0 || localStorage.getItem('dailyTasks')) {
      try {
        window.localStorage.setItem('dailyTasks', JSON.stringify(tasks));
      } catch (error) {
        console.error("Error writing to localStorage", error);
      }
    }
  }, [tasks]);


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
