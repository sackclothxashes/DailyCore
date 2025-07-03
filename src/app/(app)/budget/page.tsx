import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, LineChart, CreditCard, Landmark, Plus } from "lucide-react";

const summaryData = [
  { title: "Total Balance", value: "$0", description: "Across 0 accounts", Icon: LineChart },
  { title: "Monthly Salary", value: "$0", description: "Set your monthly income", Icon: DollarSign },
  { title: "Monthly Expenses", value: "$0", description: "This month's spending", Icon: CreditCard },
];

export default function BudgetPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="bg-primary p-3 rounded-full flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Budget Tracker</h1>
          <p className="text-muted-foreground">Manage your finances and track expenses</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {summaryData.map(item => (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <item.Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <div className="rounded-lg bg-card p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Landmark className="h-8 w-8 text-muted-foreground" />
              <div>
                <h3 className="font-semibold text-card-foreground text-lg">Budget Setup</h3>
                <p className="text-sm text-muted-foreground">Set your monthly income and track cash on hand</p>
              </div>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Setup Budget
            </Button>
          </div>
  
          <div className="flex flex-col items-center justify-center gap-2 text-center py-20">
            <LineChart className="w-20 h-20 text-muted-foreground/50" />
            <p className="text-muted-foreground mt-4">Set up your budget to start tracking your finances</p>
          </div>
        </TabsContent>
        <TabsContent value="accounts">
          <div className="flex flex-col items-center justify-center gap-2 text-center py-20">
            <p className="text-muted-foreground">No accounts to display.</p>
          </div>
        </TabsContent>
        <TabsContent value="expenses">
          <div className="flex flex-col items-center justify-center gap-2 text-center py-20">
            <p className="text-muted-foreground">No expenses to display.</p>
          </div>
        </TabsContent>
        <TabsContent value="deposits">
          <div className="flex flex-col items-center justify-center gap-2 text-center py-20">
            <p className="text-muted-foreground">No deposits to display.</p>
          </div>
        </TabsContent>
        <TabsContent value="analytics">
          <div className="flex flex-col items-center justify-center gap-2 text-center py-20">
            <p className="text-muted-foreground">No analytics to display.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
