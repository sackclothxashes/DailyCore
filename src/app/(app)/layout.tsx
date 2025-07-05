import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SideNav } from "@/components/app/side-nav";
import { TasksProvider } from "@/hooks/use-tasks";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <SideNav />
      <SidebarInset>
        <TasksProvider>
          <div className="p-4 md:p-8">
              {children}
          </div>
        </TasksProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
