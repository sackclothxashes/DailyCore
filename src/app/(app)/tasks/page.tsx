import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Task, columns } from "@/components/app/tasks/columns";
import { DataTable } from "@/components/app/tasks/data-table";

async function getData(): Promise<Task[]> {
  // Fetch data from your API here.
  // This is just mock data.
  return [
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
  ]
}

export default async function TasksPage() {
  const data = await getData();

  return (
    <div>
      <PageHeader
        title="Task Manager"
        description="Here's a list of your tasks. Stay organized and productive."
      >
        <Button>
          <PlusCircle className="mr-2" />
          Add Task
        </Button>
      </PageHeader>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
