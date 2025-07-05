'use client';

import * as React from 'react';
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar";
import { PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import { Task, getColumns } from "@/components/app/tasks/columns";
import { DataTable } from "@/components/app/tasks/data-table";
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const initialData: Task[] = [
    {
      id: "TASK-8782",
      task: "Complete project proposal",
      status: "in-progress",
      priority: "High",
      category: "Work",
      dueDate: "2024-08-15",
    },
    {
      id: "TASK-7878",
      task: "Schedule dentist appointment",
      status: "todo",
      priority: "Medium",
      category: "Health",
      dueDate: "2024-08-10",
    },
    {
      id: "TASK-4532",
      task: "Buy groceries",
      status: "todo",
      priority: "Low",
      category: "Personal",
      dueDate: "2024-08-05",
    },
    {
      id: "TASK-9434",
      task: "Pay electricity bill",
      status: "done",
      priority: "High",
      category: "Finance",
      dueDate: "2024-07-30",
    },
    {
      id: "TASK-5435",
      task: "Team meeting presentation",
      status: "in-progress",
      priority: "Medium",
      category: "Work",
      dueDate: "2024-08-12",
    },
];

const emptyTask: Omit<Task, 'id'> = {
  task: '',
  status: 'todo',
  priority: 'Medium',
  category: '',
  dueDate: format(new Date(), 'yyyy-MM-dd'),
};


export default function TasksPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = React.useState<Task[]>(initialData);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [taskFormData, setTaskFormData] = React.useState<Omit<Task, 'id'>>(emptyTask);
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
    field: keyof Omit<Task, 'id'>
  ) => {
    if (typeof e === 'string') {
        setTaskFormData((prev) => ({...prev, [field]: e }));
    } else {
        setTaskFormData((prev) => ({...prev, [field]: e.target.value }));
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
        setTaskFormData(prev => ({...prev, dueDate: format(date, 'yyyy-MM-dd')}));
    }
    setShowDatePicker(false);
  };
  
  const handleOpenAddDialog = () => {
    setTaskFormData(emptyTask);
    setIsAddDialogOpen(true);
  };

  const handleAddTask = () => {
    if (!taskFormData.task || !taskFormData.category) {
        toast({ title: "Error", description: "Please fill in all task details.", variant: "destructive" });
        return;
    }
    const newIdNumber = Math.max(0, ...tasks.map((t) => parseInt(t.id.split('-')[1], 10))) + 1;
    const newTask: Task = {
        ...taskFormData,
        id: `TASK-${String(newIdNumber).padStart(4, '0')}`,
    };
    setTasks(prev => [newTask, ...prev]);
    toast({ title: "Success", description: "Task added successfully." });
    setIsAddDialogOpen(false);
  };

  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    setTaskFormData(task);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTask = () => {
    if (!selectedTask) return;
    setTasks(tasks.map(t => t.id === selectedTask.id ? { ...selectedTask, ...taskFormData } : t));
    toast({ title: "Success", description: "Task updated successfully." });
    setIsEditDialogOpen(false);
    setSelectedTask(null);
  };

  const handleDeleteClick = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedTask) return;
    setTasks(tasks.filter((t) => t.id !== selectedTask.id));
    toast({ title: "Success", description: "Task deleted successfully.", variant: "destructive" });
    setIsDeleteDialogOpen(false);
    setSelectedTask(null);
  };

  const columns = React.useMemo(
    () => getColumns({ onEdit: handleEditClick, onDelete: handleDeleteClick }),
    []
  );

  const TaskForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="task-name">Task</Label>
        <Input id="task-name" value={taskFormData.task} onChange={(e) => handleFormChange(e, 'task')} placeholder="e.g., Finish report" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="task-priority">Priority</Label>
          <Select value={taskFormData.priority} onValueChange={(value) => handleFormChange(value, 'priority')}>
            <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
         <div className="space-y-2">
          <Label htmlFor="task-status">Status</Label>
          <Select value={taskFormData.status} onValueChange={(value) => handleFormChange(value, 'status')}>
            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="task-category">Category</Label>
        <Input id="task-category" value={taskFormData.category} onChange={(e) => handleFormChange(e, 'category')} placeholder="e.g., Work" />
      </div>
      <div className="space-y-2">
        <Label>Due Date</Label>
        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !taskFormData.dueDate && "text-muted-foreground")} onClick={() => setShowDatePicker(true)}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {taskFormData.dueDate ? format(parseISO(taskFormData.dueDate), "PPP") : <span>Pick a date</span>}
        </Button>
        {showDatePicker && (
            <Calendar
              mode="single"
              selected={taskFormData.dueDate ? parseISO(taskFormData.dueDate) : undefined}
              onSelect={handleDateChange}
              onDayBlur={() => setShowDatePicker(false)}
              initialFocus
            />
        )}
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Task Manager"
        description="Here's a list of your tasks. Stay organized and productive."
      >
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAddDialog}>
              <PlusCircle className="mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>Enter the details for your new task.</DialogDescription>
            </DialogHeader>
            <TaskForm />
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button onClick={handleAddTask}>Add Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>
      <DataTable columns={columns} data={tasks} />

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task: {selectedTask?.task}</DialogTitle>
            <DialogDescription>Update the details of your task.</DialogDescription>
          </DialogHeader>
          <TaskForm isEdit />
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleUpdateTask}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task: <strong>{selectedTask?.task}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
