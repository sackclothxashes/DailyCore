import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SideNav } from "@/components/app/side-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <SideNav />
      <SidebarInset>
        <div className="p-4 md:p-8">
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
