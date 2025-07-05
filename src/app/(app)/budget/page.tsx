'use client';

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, LineChart, CreditCard, Landmark, Plus, PiggyBank } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/app/page-header";

// --- Dynamic Initial Data ---
const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const middleOfMonth = new Date(today.getFullYear(), today.getMonth(), 15);
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const initialAccounts = [
    { name: "Main Bank", type: "Savings", balance: "50000" },
    { name: "Credit Card", type: "Credit", balance: "-15000" },
];

const initialExpenses = [
    { description: "Groceries", category: "Food", amount: "3000", date: formatDate(yesterday) },
    { description: "Electricity Bill", category: "Utilities", amount: "1500", date: formatDate(middleOfMonth) },
];

const initialDeposits = [
    { description: "Monthly Salary", amount: "75000", date: formatDate(firstDayOfMonth) },
];


export default function BudgetPage() {
    const [accounts, setAccounts] = useState(initialAccounts);
    const [expenses, setExpenses] = useState(initialExpenses);
    const [deposits, setDeposits] = useState(initialDeposits);
    const [currentView, setCurrentView] = useState('overview');
    const [showNetWorthDialog, setShowNetWorthDialog] = useState(false);

    const totalBalance = useMemo(() => 
        accounts.reduce((sum, acc) => sum + Number(acc.balance), 0),
        [accounts]
    );

    const monthlyExpenses = useMemo(() => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        return expenses
          .filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
          })
          .reduce((sum, exp) => sum + Number(exp.amount), 0);
    }, [expenses]);
    
    const totalDeposits = useMemo(() =>
        deposits.reduce((sum, dep) => sum + Number(dep.amount), 0),
        [deposits]
    );

    const netWorth = useMemo(() => totalBalance + totalDeposits, [totalBalance, totalDeposits]);

    const summaryData = [
      { title: "Total Available balance", value: `INR ${totalBalance.toLocaleString()}`, description: `Across ${accounts.length} accounts`, Icon: LineChart },
      { title: "Total Deposits", value: `INR ${totalDeposits.toLocaleString()}`, description: "Total income received", Icon: DollarSign },
      { title: "Monthly Expenses", value: `INR ${monthlyExpenses.toLocaleString()}`, description: "This month's spending", Icon: CreditCard },
    ];

    return (
        <div className="space-y-8">
            <PageHeader 
                title="Budget Tracker"
                description="Manage your finances and track expenses in INR"
            />

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

            <Select value={currentView} onValueChange={setCurrentView}>
                <SelectTrigger className="w-full md:max-w-xs">
                    <SelectValue placeholder="Select a view" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="overview">Overview</SelectItem>
                    <SelectItem value="accounts">Accounts</SelectItem>
                    <SelectItem value="expenses">Expenses</SelectItem>
                    <SelectItem value="deposits">Deposits</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                </SelectContent>
            </Select>

            <div className="mt-6">
                {currentView === 'overview' && (
                    <div className="space-y-6">
                        <div className="rounded-lg bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Landmark className="h-8 w-8 text-muted-foreground" />
                                <div>
                                    <h3 className="font-semibold text-card-foreground text-lg">Budget Setup</h3>
                                    <p className="text-sm text-muted-foreground">Set your monthly income and track cash on hand</p>
                                </div>
                            </div>
                            <Button className="w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" />
                                Setup Budget
                            </Button>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-2 text-center py-20">
                            <LineChart className="w-20 h-20 text-muted-foreground/50" />
                            <p className="text-muted-foreground mt-4">Your financial overview will appear here.</p>
                        </div>
                    </div>
                )}
                {currentView === 'accounts' && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button><Plus className="mr-2 h-4 w-4" /> Add Account</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Account</DialogTitle>
                                        <DialogDescription>Enter the details of your new account.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="acc-name">Account Name</Label>
                                            <Input id="acc-name" placeholder="e.g., Savings Account" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="acc-type">Account Type</Label>
                                            <Select>
                                                <SelectTrigger><SelectValue placeholder="Select account type" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="savings">Savings</SelectItem>
                                                    <SelectItem value="checking">Checking</SelectItem>
                                                    <SelectItem value="credit">Credit Card</SelectItem>
                                                    <SelectItem value="investment">Investment</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="acc-balance">Initial Balance (INR)</Label>
                                            <Input id="acc-balance" type="number" placeholder="e.g., 50000" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button>Add Account</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Account Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Balance (INR)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {accounts.map((acc, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{acc.name}</TableCell>
                                            <TableCell><Badge variant="outline">{acc.type}</Badge></TableCell>
                                            <TableCell className="text-right">{Number(acc.balance).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                )}
                {currentView === 'expenses' && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="destructive"><Plus className="mr-2 h-4 w-4" /> Add Expense</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Expense</DialogTitle>
                                        <DialogDescription>Enter the details of your new expense.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="exp-desc">Description</Label>
                                            <Input id="exp-desc" placeholder="e.g., Coffee" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="exp-cat">Category</Label>
                                            <Input id="exp-cat" placeholder="e.g., Food" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="exp-amount">Amount (INR)</Label>
                                            <Input id="exp-amount" type="number" placeholder="e.g., 300" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button variant="destructive">Add Expense</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Amount (INR)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {expenses.map((exp, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{exp.description}</TableCell>
                                            <TableCell><Badge>{exp.category}</Badge></TableCell>
                                            <TableCell>{exp.date}</TableCell>
                                            <TableCell className="text-right text-destructive">- {Number(exp.amount).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                )}
                {currentView === 'deposits' && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button><Plus className="mr-2 h-4 w-4" /> Add Deposit</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Deposit</DialogTitle>
                                        <DialogDescription>Enter the details of your new deposit.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="dep-desc">Description</Label>
                                            <Input id="dep-desc" placeholder="e.g., Monthly Salary" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="dep-amount">Amount (INR)</Label>
                                            <Input id="dep-amount" type="number" placeholder="e.g., 75000" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button>Add Deposit</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Amount (INR)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {deposits.map((dep, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{dep.description}</TableCell>
                                            <TableCell>{dep.date}</TableCell>
                                            <TableCell className="text-right text-primary">+ {Number(dep.amount).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                )}
                {currentView === 'analytics' && (
                    <div className="flex flex-col items-center justify-center gap-2 text-center py-20">
                        <p className="text-muted-foreground">Analytics are not yet available.</p>
                    </div>
                )}
            </div>
            <div className="flex justify-center mt-8">
                <Button onClick={() => setShowNetWorthDialog(true)}>
                    <PiggyBank className="mr-2 h-4 w-4"/> Show Total Net Worth
                </Button>
            </div>
            
            <AlertDialog open={showNetWorthDialog} onOpenChange={setShowNetWorthDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Total Net Worth</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your total net worth is calculated as: Total Available Balance + Total Deposits.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4 text-center">
                    <p className="text-4xl font-bold">INR {netWorth.toLocaleString()}</p>
                </div>
                <AlertDialogFooter>
                  <AlertDialogAction onClick={() => setShowNetWorthDialog(false)}>Close</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
