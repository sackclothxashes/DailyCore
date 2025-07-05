
'use client';

import * as React from 'react';
import { PageHeader } from '@/components/app/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import useLocalStorage from '@/hooks/use-local-storage';
import { format, parse } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type AttendanceStatus = 'Present' | 'Casual Leave' | 'Earned/Sick Leave' | 'Weekly Off' | 'Transfer';
type AttendanceData = Record<string, AttendanceStatus>; // Key: 'yyyy-MM-dd'

const STATUS_OPTIONS: { label: AttendanceStatus; color: string; textColor: string }[] = [
    { label: 'Present', color: 'bg-green-500', textColor: 'text-white' },
    { label: 'Casual Leave', color: 'bg-blue-500', textColor: 'text-white' },
    { label: 'Earned/Sick Leave', color: 'bg-yellow-500', textColor: 'text-black' },
    { label: 'Weekly Off', color: 'bg-gray-400', textColor: 'text-white' },
    { label: 'Transfer', color: 'bg-purple-500', textColor: 'text-white' },
];

const statusStyles = {
    Present: { backgroundColor: '#22c55e', color: 'white' },
    'Casual Leave': { backgroundColor: '#3b82f6', color: 'white' },
    'Earned/Sick Leave': { backgroundColor: '#eab308', color: 'white' },
    'Weekly Off': { backgroundColor: '#a1a1aa', color: 'white' },
    Transfer: { backgroundColor: '#a855f7', color: 'white' },
};


export default function AttendancePage() {
    const [attendance, setAttendance] = useLocalStorage<AttendanceData>('chronozen_attendance_data', {});
    const [month, setMonth] = React.useState<Date>(new Date(2025, 6, 1));
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date(2025, 6, 1));
    
    const startDate = new Date(2025, 6, 1);

    const handleDateSelect = (date: Date | undefined) => {
        if (date && date >= startDate) {
            setSelectedDate(date);
        } else {
            setSelectedDate(undefined);
        }
    };

    const handleStatusChange = (status: AttendanceStatus) => {
        if (!selectedDate) return;
        const dateKey = format(selectedDate, 'yyyy-MM-dd');
        setAttendance(prev => ({ ...prev, [dateKey]: status }));
    };

    const leaveCounts = React.useMemo(() => {
        return Object.values(attendance).reduce((acc, status) => {
            if (status === 'Casual Leave') {
                acc.casual += 1;
            } else if (status === 'Earned/Sick Leave') {
                acc.earned += 1;
            }
            return acc;
        }, { casual: 0, earned: 0 });
    }, [attendance]);
    
    const modifiers = React.useMemo(() => {
        const mods: Record<string, Date[]> = {
            Present: [],
            'Casual Leave': [],
            'Earned/Sick Leave': [],
            'Weekly Off': [],
            Transfer: [],
        };

        for (const dateKey in attendance) {
            const status = attendance[dateKey];
            if (status && mods[status]) {
                // Adjust for timezone differences by parsing as UTC
                const date = parse(dateKey, 'yyyy-MM-dd', new Date());
                mods[status].push(date);
            }
        }
        return mods;
    }, [attendance]);


    const currentStatus = selectedDate ? attendance[format(selectedDate, 'yyyy-MM-dd')] : undefined;

    return (
        <div>
            <PageHeader
                title="Attendance Tracker"
                description="Mark your attendance starting from July 1, 2025."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Casual Leave Taken</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{leaveCounts.casual}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Earned/Sick Leave Taken</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{leaveCounts.earned}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <Card>
                        <CardContent className="p-2 sm:p-4">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                month={month}
                                onMonthChange={setMonth}
                                fromDate={startDate}
                                modifiers={modifiers}
                                modifiersStyles={statusStyles}
                                className="w-full"
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mark Status</CardTitle>
                            <CardDescription>
                                {selectedDate ? `For ${format(selectedDate, 'PPP')}` : 'Select a date'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                           {selectedDate ? (
                            <>
                                {currentStatus && (
                                    <div className="mb-4">
                                        <p className="text-sm font-medium">Current Status:</p>
                                        <Badge 
                                            className={cn(
                                                STATUS_OPTIONS.find(s => s.label === currentStatus)?.color, 
                                                STATUS_OPTIONS.find(s => s.label === currentStatus)?.textColor,
                                                'border-transparent'
                                            )}
                                        >
                                            {currentStatus}
                                        </Badge>
                                    </div>
                                )}
                                <div className="space-y-2 flex flex-col items-stretch">
                                    {STATUS_OPTIONS.map(({ label, color, textColor }) => (
                                        <Button
                                            key={label}
                                            onClick={() => handleStatusChange(label)}
                                            className={cn(color, textColor, 'justify-start hover:opacity-90 border-transparent')}
                                            variant="secondary"
                                        >
                                            {label}
                                        </Button>
                                    ))}
                                </div>
                            </>
                           ) : (
                            <p className="text-muted-foreground text-sm">
                                Please select a date on or after July 1, 2025 from the calendar to mark its status.
                            </p>
                           )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
