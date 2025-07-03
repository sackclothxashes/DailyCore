import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

const summaryData = [
  { title: "Total Balance", value: "₹1,50,000", change: "+5.2% from last month" },
  { title: "Monthly Income", value: "₹75,000", change: "+10% from last month" },
  { title: "Monthly Expenses", value: "₹42,500", change: "-3% from last month" },
  { title: "Savings Rate", value: "43.3%", change: "+4.5% from last month" },
];

const transactions = [
  { id: 1, type: "deposit", description: "Monthly Salary", date: "2024-07-01", amount: "₹75,000" },
  { id: 2, type: "expense", description: "Rent", date: "2024-07-05", amount: "-₹20,000" },
  { id: 3, type: "expense", description: "Groceries", date: "2024-07-07", amount: "-₹8,000" },
  { id: 4, type: "expense", description: "Utilities", date: "2024-07-10", amount: "-₹4,500" },
  { id: 5, type: "expense", description: "Dining Out", date: "2024-07-12", amount: "-₹3,000" },
  { id: 6, type: "expense", description: "Mutual Fund SIP", date: "2024-07-15", amount: "-₹10,000" },
];

export default function BudgetPage() {
  return (
    <div>
      <PageHeader
        title="Budget Watcher"
        description="Keep an eye on your finances. Here's your current financial status."
      >
        <Button>
          <PlusCircle className="mr-2" />
          Add Transaction
        </Button>
      </PageHeader>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {summaryData.map(item => (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">{item.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map(t => (
                <TableRow key={t.id}>
                  <TableCell>
                    {t.type === 'deposit' ? 
                      <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        <ArrowUpCircle className="mr-1 h-4 w-4"/> Deposit
                      </Badge> : 
                      <Badge variant="secondary" className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                        <ArrowDownCircle className="mr-1 h-4 w-4"/> Expense
                      </Badge>
                    }
                  </TableCell>
                  <TableCell className="font-medium">{t.description}</TableCell>
                  <TableCell>{t.date}</TableCell>
                  <TableCell className={`text-right font-semibold ${t.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>{t.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
