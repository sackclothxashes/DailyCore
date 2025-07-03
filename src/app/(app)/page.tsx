import { FeatureCard } from "@/components/app/feature-card";
import { ProgressCard } from "@/components/app/progress-card";
import { PageHeader } from "@/components/app/page-header";
import {
  ListTodo,
  Wallet,
  CalendarCheck,
  User,
  Camera,
} from "lucide-react";

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
];

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Welcome to ChronoZen"
        description="Your all-in-one personal management app. Select a module to get started."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProgressCard />
        {features.map((feature) => (
          <FeatureCard key={feature.href} {...feature} />
        ))}
      </div>
    </div>
  );
}
