
'use client';

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, LineChart, CreditCard, Landmark, Plus, PiggyBank, Briefcase, BarChart } from "lucide-react";
import { PieChart, Pie, Cell, Legend, CartesianGrid, XAxis, YAxis, Line as RechartsLine } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription as DialogDescriptionComponent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { format } from 'date-fns';
import useLocalStorage from "@/hooks/use-local-storage";


// --- Data Types ---
type Account = { name: string; type: string; balance: number };
type Transaction = { description: string; amount: number; date: string };
type Expense = Transaction & { category: string; accountName: string };
type Income = Transaction & { accountName: string };
type InvestmentTransaction = { description: string; amount: number; date: string; sourceAccountName: string; };


// --- Dynamic Initial Data ---
const formatDateString = (date: Date) => date.toISOString().split('T')[0];

// --- Empty States for Forms ---
const emptyAccount: Account = { name: '', type: '', balance: 0 };
const emptyExpense: Omit<Expense, 'date'> = { description: '', category: '', amount: 0, accountName: '' };
const emptyIncome: Omit<Income, 'date'> = { description: '', amount: 0, accountName: '' };
const emptyInvestment: Omit<InvestmentTransaction, 'date'> = { description: '', amount: 0, sourceAccountName: '' };


export default function BudgetPage() {
    const { toast } = useToast();
    const [accounts, setAccounts] = useLocalStorage<Account[]>("budget_accounts", []);
    const [expenses, setExpenses] = useLocalStorage<Expense[]>("budget_expenses", []);
    const [incomes, setIncomes] = useLocalStorage<Income[]>("budget_incomes", []);
    const [investmentTransactions, setInvestmentTransactions] = useLocalStorage<InvestmentTransaction[]>("budget_investmentTransactions", []);
    const [currentView, setCurrentView] = useState('overview');

    // Dialog states
    const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
    const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
    const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
    const [isAddInvestmentOpen, setIsAddInvestmentOpen] = useState(false);
    const [showNetWorthDialog, setShowNetWorthDialog] = useState(false);

    // Form states
    const [newAccount, setNewAccount] = useState<Account>(emptyAccount);
    const [newExpense, setNewExpense] = useState(emptyExpense);
    const [newIncome, setNewIncome] = useState<Omit<Income, 'date'>>(emptyIncome);
    const [newInvestment, setNewInvestment] = useState(emptyInvestment);

    // --- Corrected Financial Calculations ---
    const assetAccounts = useMemo(() => 
        accounts.filter(acc => acc.type !== 'Credit'), 
        [accounts]
    );

    const liabilityAccounts = useMemo(() =>
        accounts.filter(acc => acc.type === 'Credit'),
        [accounts]
    );

    const totalAssets = useMemo(() =>
        assetAccounts.reduce((sum, acc) => sum + acc.balance, 0),
        [assetAccounts]
    );

    const totalLiabilities = useMemo(() =>
        liabilityAccounts.reduce((sum, acc) => sum + acc.balance, 0),
        [liabilityAccounts]
    );

    const netWorth = useMemo(() => totalAssets - totalLiabilities, [totalAssets, totalLiabilities]);
    const totalAvailableBalance = useMemo(() => accounts.filter(acc => acc.type === 'Savings' || acc.type === 'Checking').reduce((sum, acc) => sum + acc.balance, 0), [accounts]);

    const monthlyExpenses = useMemo(() => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        return expenses
          .filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
          })
          .reduce((sum, exp) => sum + exp.amount, 0);
    }, [expenses]);
    
    const totalIncomes = useMemo(() =>
        incomes.reduce((sum, inc) => sum + inc.amount, 0),
        [incomes]
    );
    
    const totalInvestments = useMemo(() =>
        accounts.filter(acc => acc.type === 'Investment').reduce((sum, acc) => sum + acc.balance, 0),
        [accounts]
    );


    const summaryData = [
      { title: "Total Available balance", value: `INR ${totalAvailableBalance.toLocaleString()}`, description: `From savings/checking accounts`, Icon: LineChart },
      { title: "Total Income", value: `INR ${totalIncomes.toLocaleString()}`, description: "Total income received", Icon: DollarSign },
      { title: "Monthly Expenses", value: `INR ${monthlyExpenses.toLocaleString()}`, description: "This month's spending", Icon: CreditCard },
      { title: "Total Investments", value: `INR ${totalInvestments.toLocaleString()}`, description: "Value of all investments", Icon: Briefcase },
    ];

    const expensesByCategory = useMemo(() => {
        return monthlyExpenses > 0 ? expenses.reduce((acc, expense) => {
            const category = expense.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += expense.amount;
            return acc;
        }, {} as Record<string, number>) : {};
    }, [expenses, monthlyExpenses]);

    const expenseChartData = useMemo(() => {
        const data = Object.entries(expensesByCategory).map(([name, value], index) => ({
             name, 
             value, 
             fill: `var(--chart-${(index % 5) + 1})` 
        }));
        return data;
    }, [expensesByCategory]);

    const chartConfig = useMemo(() => {
        if (expenseChartData.length === 0) return {};
        const config: ChartConfig = {};
        expenseChartData.forEach(item => {
            config[item.name] = {
                label: item.name,
                color: item.fill,
            };
        });
        return { ...config, value: { label: 'Amount' } };
    }, [expenseChartData]);

    const analyticsData = useMemo(() => {
        const combinedTransactions = [
          ...incomes.map(i => ({ ...i, type: 'income' })),
          ...expenses.map(e => ({ ...e, type: 'expense' }))
        ];
    
        if (combinedTransactions.length === 0) return [];
    
        const monthlyData: Record<string, { income: number, expenses: number }> = {};
    
        combinedTransactions.forEach(t => {
          const date = new Date(t.date);
          const monthYear = format(date, 'yyyy-MM');
          if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = { income: 0, expenses: 0 };
          }
          if (t.type === 'income') {
            monthlyData[monthYear].income += t.amount;
          } else {
            monthlyData[monthYear].expenses += t.amount;
          }
        });
        
        const sortedMonths = Object.keys(monthlyData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
        return sortedMonths.map(monthYear => ({
          name: format(new Date(`${monthYear}-02`), 'MMM yy'),
          Income: monthlyData[monthYear].income,
          Expenses: monthlyData[monthYear].expenses,
        }));
    }, [incomes, expenses]);

    const analyticsChartConfig = {
        Income: {
          label: 'Income',
          color: 'hsl(var(--primary))',
        },
        Expenses: {
          label: 'Expenses',
          color: 'hsl(var(--destructive))',
        },
      } satisfies ChartConfig;

    
    const handleAddAccount = () => {
        if (!newAccount.name || !newAccount.type) {
            toast({ title: "Error", description: "Please fill in all account details.", variant: "destructive" });
            return;
        }
        setAccounts([...accounts, newAccount]);
        setNewAccount(emptyAccount);
        setIsAddAccountOpen(false);
    };

    const handleAddExpense = () => {
        if (!newExpense.description || !newExpense.amount || !newExpense.accountName || !newExpense.category) {
            toast({ title: "Error", description: "Please fill in all expense details.", variant: "destructive" });
            return;
        }
        const expenseToAdd: Expense = { ...newExpense, date: formatDateString(new Date()) };
        setExpenses([...expenses, expenseToAdd]);

        const updatedAccounts = accounts.map(acc => {
            if (acc.name === newExpense.accountName) {
                if (acc.type === 'Credit') {
                    return { ...acc, balance: acc.balance + newExpense.amount }; // Increase liability
                } else {
                    return { ...acc, balance: acc.balance - newExpense.amount }; // Decrease asset
                }
            }
            return acc;
        });
        setAccounts(updatedAccounts);
        
        setNewExpense(emptyExpense);
        setIsAddExpenseOpen(false);
    };
    
    const handleAddIncome = () => {
        if (!newIncome.description || !newIncome.amount || !newIncome.accountName) {
            toast({ title: "Error", description: "Please fill in all income details.", variant: "destructive" });
            return;
        }
        const incomeToAdd: Income = { ...newIncome, date: formatDateString(new Date()) };
        setIncomes([...incomes, incomeToAdd]);

        const updatedAccounts = accounts.map(acc => {
            if (acc.name === newIncome.accountName) {
                if (acc.type === 'Credit') {
                    return { ...acc, balance: acc.balance - newIncome.amount }; // Paying down liability
                } else {
                    return { ...acc, balance: acc.balance + newIncome.amount }; // Increasing asset
                }
            }
            return acc;
        });
        setAccounts(updatedAccounts);

        setNewIncome(emptyIncome);
        setIsAddIncomeOpen(false);
    };

    const handleAddInvestment = () => {
        if (!newInvestment.description || !newInvestment.amount || !newInvestment.sourceAccountName) {
            toast({ title: "Error", description: "Please fill in all investment details.", variant: "destructive" });
            return;
        }
        const sourceAccount = accounts.find(acc => acc.name === newInvestment.sourceAccountName);
        if (!sourceAccount || sourceAccount.balance < newInvestment.amount) {
            toast({ title: "Error", description: "Insufficient balance in the source account.", variant: "destructive" });
            return;
        }

        let tempAccounts = accounts.map(acc => {
            if (acc.name === newInvestment.sourceAccountName) {
                return { ...acc, balance: acc.balance - newInvestment.amount };
            }
            return acc;
        });

        const investmentAccountIndex = tempAccounts.findIndex(
            (acc) => acc.name === newInvestment.description && acc.type === 'Investment'
        );

        if (investmentAccountIndex > -1) {
            tempAccounts[investmentAccountIndex] = {
                ...tempAccounts[investmentAccountIndex],
                balance: tempAccounts[investmentAccountIndex].balance + newInvestment.amount
            };
        } else {
            tempAccounts.push({
                name: newInvestment.description,
                type: 'Investment',
                balance: newInvestment.amount
            });
        }
        
        setAccounts(tempAccounts);

        const investmentToAdd: InvestmentTransaction = { ...newInvestment, date: formatDateString(new Date()) };
        setInvestmentTransactions([...investmentTransactions, investmentToAdd]);

        setNewInvestment(emptyInvestment);
        setIsAddInvestmentOpen(false);
    };


    return (
        <div className="space-y-8">
            <PageHeader 
                title="Budget Tracker"
                description="Manage your finances and track expenses in INR"
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="investments">Investments</SelectItem>
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
                            <Button className="w-full sm:w-auto" onClick={() => setIsAddAccountOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Setup Budget
                            </Button>
                        </div>

                        {expenseChartData.length > 0 ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Expense Breakdown</CardTitle>
                                    <CardDescription>A look at your spending by category.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex items-center justify-center">
                                    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[300px]">
                                        <PieChart>
                                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                            <Pie data={expenseChartData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                                                {expenseChartData.map((entry) => (
                                                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                                        </PieChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-2 text-center py-20 rounded-lg bg-card">
                                <LineChart className="w-20 h-20 text-muted-foreground/50" />
                                <p className="text-muted-foreground mt-4">Your financial overview will appear here once you add some expenses.</p>
                            </div>
                        )}
                    </div>
                )}
                {currentView === 'accounts' && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <Button onClick={() => { setIsAddAccountOpen(true); setNewAccount(emptyAccount); }}><Plus className="mr-2 h-4 w-4" /> Add Account</Button>
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
                                            <TableCell><Badge variant={acc.type === 'Investment' ? 'default' : 'outline'}>{acc.type}</Badge></TableCell>
                                            <TableCell className={`text-right font-mono ${(acc.type === 'Credit' && acc.balance > 0) || (acc.type !== 'Credit' && acc.balance < 0) ? 'text-destructive' : ''}`}>
                                                {acc.balance.toLocaleString()}
                                            </TableCell>
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
                            <Button variant="destructive" onClick={() => { setIsAddExpenseOpen(true); setNewExpense(emptyExpense); }}><Plus className="mr-2 h-4 w-4" /> Add Expense</Button>
                        </div>
                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Account</TableHead>
                                        <TableHead className="text-right">Amount (INR)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((exp, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{exp.description}</TableCell>
                                            <TableCell><Badge>{exp.category}</Badge></TableCell>
                                            <TableCell>{exp.date}</TableCell>
                                            <TableCell><Badge variant="secondary">{exp.accountName}</Badge></TableCell>
                                            <TableCell className="text-right text-destructive font-mono">- {exp.amount.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                )}
                {currentView === 'income' && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <Button onClick={() => { setIsAddIncomeOpen(true); setNewIncome(emptyIncome); }}><Plus className="mr-2 h-4 w-4" /> Add Income</Button>
                        </div>
                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Account</TableHead>
                                        <TableHead className="text-right">Amount (INR)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {incomes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((inc, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{inc.description}</TableCell>
                                            <TableCell>{inc.date}</TableCell>
                                            <TableCell><Badge variant="secondary">{inc.accountName}</Badge></TableCell>
                                            <TableCell className="text-right text-primary font-mono">+ {inc.amount.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                )}
                 {currentView === 'investments' && (
                    <div>
                        <div className="flex justify-end mb-4">
                             <Button onClick={() => { setIsAddInvestmentOpen(true); setNewInvestment(emptyInvestment); }}><Plus className="mr-2 h-4 w-4" /> Log Investment</Button>
                        </div>
                        <Card>
                             <CardHeader>
                                <CardTitle>Investment History</CardTitle>
                                <CardDescription>A record of all your investment transactions.</CardDescription>
                            </CardHeader>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Source Account</TableHead>
                                        <TableHead className="text-right">Amount (INR)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {investmentTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((inv, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{inv.description}</TableCell>
                                            <TableCell>{inv.date}</TableCell>
                                            <TableCell><Badge variant="secondary">{inv.sourceAccountName}</Badge></TableCell>
                                            <TableCell className="text-right font-mono">+ {inv.amount.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                )}
                {currentView === 'analytics' && (
                    <div>
                        {analyticsData.length > 0 ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Income vs. Expenses</CardTitle>
                                    <CardDescription>A monthly comparison of your cash flow.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer config={analyticsChartConfig} className="h-[350px] w-full">
                                        <LineChart data={analyticsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                            <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                                            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                                            <Legend />
                                            <RechartsLine type="monotone" dataKey="Income" stroke="var(--color-primary)" strokeWidth={2} activeDot={{ r: 8 }} />
                                            <RechartsLine type="monotone" dataKey="Expenses" stroke="var(--color-destructive)" strokeWidth={2} activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-2 text-center py-20 rounded-lg bg-card">
                                <BarChart className="w-20 h-20 text-muted-foreground/50" />
                                <p className="text-muted-foreground mt-4">Your financial analytics will appear here once you have some income and expense data.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="flex justify-center mt-8">
                <Button onClick={() => setShowNetWorthDialog(true)}>
                    <PiggyBank className="mr-2 h-4 w-4"/> Show Total Net Worth
                </Button>
            </div>

            {/* --- Dialogs --- */}
            <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Account</DialogTitle>
                        <DialogDescriptionComponent>Enter the details of your new account.</DialogDescriptionComponent>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="acc-name">Account Name</Label>
                            <Input id="acc-name" placeholder="e.g., Savings Account" value={newAccount.name} onChange={e => setNewAccount({...newAccount, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="acc-type">Account Type</Label>
                            <Select value={newAccount.type} onValueChange={value => setNewAccount({...newAccount, type: value})}>
                                <SelectTrigger><SelectValue placeholder="Select account type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Savings">Savings</SelectItem>
                                    <SelectItem value="Checking">Checking</SelectItem>
                                    <SelectItem value="Credit">Credit Card</SelectItem>
                                    <SelectItem value="Investment">Investment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="acc-balance">Initial Balance (INR)</Label>
                            <Input id="acc-balance" type="number" placeholder="e.g., 50000" value={newAccount.balance || ''} onChange={e => setNewAccount({...newAccount, balance: Number(e.target.value)})} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddAccountOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddAccount}>Add Account</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Expense</DialogTitle>
                        <DialogDescriptionComponent>Enter the details of your new expense.</DialogDescriptionComponent>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="exp-desc">Description</Label>
                            <Input id="exp-desc" placeholder="e.g., Coffee" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="exp-cat">Category</Label>
                            <Input id="exp-cat" placeholder="e.g., Food" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="exp-amount">Amount (INR)</Label>
                            <Input id="exp-amount" type="number" placeholder="e.g., 300" value={newExpense.amount || ''} onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="exp-account">Account</Label>
                            <Select value={newExpense.accountName} onValueChange={value => setNewExpense({...newExpense, accountName: value})}>
                                <SelectTrigger id="exp-account">
                                    <SelectValue placeholder="Select an account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map(acc => (
                                        <SelectItem key={acc.name} value={acc.name}>{acc.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleAddExpense}>Add Expense</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isAddIncomeOpen} onOpenChange={setIsAddIncomeOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Income</DialogTitle>
                        <DialogDescriptionComponent>Enter the details of your new income source.</DialogDescriptionComponent>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="inc-desc">Description</Label>
                            <Input id="inc-desc" placeholder="e.g., Monthly Salary" value={newIncome.description} onChange={e => setNewIncome({...newIncome, description: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="inc-amount">Amount (INR)</Label>
                            <Input id="inc-amount" type="number" placeholder="e.g., 75000" value={newIncome.amount || ''} onChange={e => setNewIncome({...newIncome, amount: Number(e.target.value)})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="inc-account">Account</Label>
                            <Select value={newIncome.accountName} onValueChange={value => setNewIncome({...newIncome, accountName: value})}>
                                <SelectTrigger id="inc-account">
                                    <SelectValue placeholder="Select an account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map(acc => (
                                        <SelectItem key={acc.name} value={acc.name}>{acc.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddIncomeOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddIncome}>Add Income</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isAddInvestmentOpen} onOpenChange={setIsAddInvestmentOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Log a New Investment</DialogTitle>
                        <DialogDescriptionComponent>Record a new investment transaction.</DialogDescriptionComponent>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="inv-desc">Description</Label>
                            <Input id="inv-desc" placeholder="e.g., Mutual Fund SIP" value={newInvestment.description} onChange={e => setNewInvestment({...newInvestment, description: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="inv-amount">Amount (INR)</Label>
                            <Input id="inv-amount" type="number" placeholder="e.g., 5000" value={newInvestment.amount || ''} onChange={e => setNewInvestment({...newInvestment, amount: Number(e.target.value)})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="inv-account">Debit From Account</Label>
                            <Select value={newInvestment.sourceAccountName} onValueChange={value => setNewInvestment({...newInvestment, sourceAccountName: value})}>
                                <SelectTrigger id="inv-account">
                                    <SelectValue placeholder="Select an account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {assetAccounts.map(acc => (
                                        <SelectItem key={acc.name} value={acc.name}>{acc.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddInvestmentOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddInvestment}>Log Investment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showNetWorthDialog} onOpenChange={setShowNetWorthDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Your Financial Snapshot</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your net worth is the value of your assets (e.g. savings, investments) minus your liabilities (e.g. credit card debt).
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total Assets</span>
                            <span className="font-medium font-mono text-primary">+ INR {totalAssets.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total Liabilities</span>
                            <span className="font-medium font-mono text-destructive">- INR {totalLiabilities.toLocaleString()}</span>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">Net Worth</span>
                        <span className="font-bold text-2xl font-mono">INR {netWorth.toLocaleString()}</span>
                    </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogAction onClick={() => setShowNetWorthDialog(false)}>Close</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
