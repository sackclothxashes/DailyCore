
'use client';

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, LineChart, CreditCard, Landmark, Plus, PiggyBank, Briefcase } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

// --- Data Types ---
type Account = { name: string; type: string; balance: number };
type Transaction = { description: string; amount: number; date: string };
type Expense = Transaction & { category: string; accountName: string };
type Income = Transaction & { accountName: string };
type Investment = { description: string; amount: number; accountName: string; dayOfMonth: number };


// --- Dynamic Initial Data ---
const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const middleOfMonth = new Date(today.getFullYear(), today.getMonth(), 15);
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const initialAccounts: Account[] = [
    { name: "Main Bank", type: "Savings", balance: 70500 },
    { name: "Credit Card", type: "Credit", balance: 0 },
];

const initialExpenses: Expense[] = [
    { description: "Groceries", category: "Food", amount: 3000, date: formatDate(yesterday), accountName: "Main Bank" },
    { description: "Electricity Bill", category: "Utilities", amount: 1500, date: formatDate(middleOfMonth), accountName: "Main Bank" },
];

const initialIncomes: Income[] = [
    { description: "Monthly Salary", amount: 75000, date: formatDate(firstDayOfMonth), accountName: "Main Bank" },
];

const initialInvestments: Investment[] = [
    { description: "Mutual Fund SIP", amount: 5000, accountName: "Main Bank", dayOfMonth: 5 },
];

// --- Empty States for Forms ---
const emptyAccount: Account = { name: '', type: '', balance: 0 };
const emptyExpense: Omit<Expense, 'date'> = { description: '', category: '', amount: 0, accountName: '' };
const emptyIncome: Omit<Income, 'date'> = { description: '', amount: 0, accountName: '' };
const emptyInvestment: Investment = { description: '', amount: 0, accountName: '', dayOfMonth: 1 };


export default function BudgetPage() {
    const { toast } = useToast();
    const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
    const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
    const [incomes, setIncomes] = useState<Income[]>(initialIncomes);
    const [investments, setInvestments] = useState<Investment[]>(initialInvestments);
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
    const [newInvestment, setNewInvestment] = useState<Investment>(emptyInvestment);

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
    const totalAvailableBalance = useMemo(() => totalAssets, [totalAssets]);

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

    const monthlyInvestments = useMemo(() =>
        investments.reduce((sum, inv) => sum + inv.amount, 0),
        [investments]
    );

    const summaryData = [
      { title: "Total Available balance", value: `INR ${totalAvailableBalance.toLocaleString()}`, description: `From ${assetAccounts.length} asset account(s)`, Icon: LineChart },
      { title: "Total Income", value: `INR ${totalIncomes.toLocaleString()}`, description: "Total income received", Icon: DollarSign },
      { title: "Monthly Expenses", value: `INR ${monthlyExpenses.toLocaleString()}`, description: "This month's spending", Icon: CreditCard },
      { title: "Monthly Investments", value: `INR ${monthlyInvestments.toLocaleString()}`, description: "Planned recurring debits", Icon: Briefcase },
    ];
    
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
        const expenseToAdd: Expense = { ...newExpense, date: formatDate(new Date()) };
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
        const incomeToAdd: Income = { ...newIncome, date: formatDate(new Date()) };
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
        if (!newInvestment.description || !newInvestment.amount || !newInvestment.accountName || !newInvestment.dayOfMonth) {
            toast({ title: "Error", description: "Please fill in all investment details.", variant: "destructive" });
            return;
        }
        if (newInvestment.dayOfMonth < 1 || newInvestment.dayOfMonth > 31) {
            toast({ title: "Error", description: "Day of month must be between 1 and 31.", variant: "destructive" });
            return;
        }
        setInvestments([...investments, newInvestment]);
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
                            <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={() => setNewAccount(emptyAccount)}><Plus className="mr-2 h-4 w-4" /> Add Account</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Account</DialogTitle>
                                        <DialogDescription>Enter the details of your new account.</DialogDescription>
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
                            <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" onClick={() => setNewExpense(emptyExpense)}><Plus className="mr-2 h-4 w-4" /> Add Expense</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Expense</DialogTitle>
                                        <DialogDescription>Enter the details of your new expense.</DialogDescription>
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
                            <Dialog open={isAddIncomeOpen} onOpenChange={setIsAddIncomeOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={() => setNewIncome(emptyIncome)}><Plus className="mr-2 h-4 w-4" /> Add Income</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Income</DialogTitle>
                                        <DialogDescription>Enter the details of your new income source.</DialogDescription>
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
                            <Dialog open={isAddInvestmentOpen} onOpenChange={setIsAddInvestmentOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={() => setNewInvestment(emptyInvestment)}><Plus className="mr-2 h-4 w-4" /> Add Investment</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Recurring Investment</DialogTitle>
                                        <DialogDescription>Set up a new recurring monthly investment or debit.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="inv-desc">Description</Label>
                                            <Input id="inv-desc" placeholder="e.g., Mutual Fund SIP" value={newInvestment.description} onChange={e => setNewInvestment({...newInvestment, description: e.target.value})} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="inv-amount">Monthly Amount (INR)</Label>
                                            <Input id="inv-amount" type="number" placeholder="e.g., 5000" value={newInvestment.amount || ''} onChange={e => setNewInvestment({...newInvestment, amount: Number(e.target.value)})} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="inv-day">Day of Month</Label>
                                            <Input id="inv-day" type="number" placeholder="e.g., 5" value={newInvestment.dayOfMonth || ''} onChange={e => setNewInvestment({...newInvestment, dayOfMonth: Number(e.target.value)})} min="1" max="31" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="inv-account">Debit From Account</Label>
                                            <Select value={newInvestment.accountName} onValueChange={value => setNewInvestment({...newInvestment, accountName: value})}>
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
                                        <Button onClick={handleAddInvestment}>Add Investment</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Debit Account</TableHead>
                                        <TableHead>Day of Month</TableHead>
                                        <TableHead className="text-right">Amount (INR)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {investments.map((inv, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{inv.description}</TableCell>
                                            <TableCell><Badge variant="secondary">{inv.accountName}</Badge></TableCell>
                                            <TableCell>{inv.dayOfMonth}</TableCell>
                                            <TableCell className="text-right text-destructive font-mono">- {inv.amount.toLocaleString()}</TableCell>
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
                  <AlertDialogTitle>Your Financial Snapshot</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your net worth is the value of your assets (e.g. savings) minus your liabilities (e.g. credit card debt).
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
