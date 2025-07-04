"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { differenceInDays, format } from "date-fns";
import { Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Goal } from "@/app/(app)/page";

type ProgressCardProps = {
  goal: Goal;
  onUpdate: (goal: Goal) => void;
  onDelete: (id: string) => void;
  className?: string;
};

export function ProgressCard({ goal, onUpdate, onDelete, className }: ProgressCardProps) {
  const [progress, setProgress] = useState(0);
  const [days, setDays] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // State for the edit form
  const [editedTitle, setEditedTitle] = useState(goal.title);
  const [editedStartDate, setEditedStartDate] = useState<Date | undefined>(goal.startDate);
  const [editedEndDate, setEditedEndDate] = useState<Date | undefined>(goal.endDate);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    const start = goal.startDate;
    const end = goal.endDate;
    const today = new Date();

    if (end < start) {
      setProgress(0);
      setDays(0);
      setTotalDays(0);
      return;
    }

    const totalDurationInDays = differenceInDays(end, start) + 1;
    const elapsedDurationInDays = differenceInDays(today, start) + 1;

    const currentDays = Math.min(Math.max(0, elapsedDurationInDays), totalDurationInDays);
    
    setTotalDays(totalDurationInDays);
    setDays(currentDays);
    setProgress(totalDurationInDays > 0 ? (currentDays / totalDurationInDays) * 100 : 0);
  }, [goal.startDate, goal.endDate]);

  const handleSaveChanges = () => {
    if (editedTitle && editedStartDate && editedEndDate) {
      onUpdate({
        ...goal,
        title: editedTitle,
        startDate: editedStartDate,
        endDate: editedEndDate,
      });
      setIsEditDialogOpen(false);
    }
  };
  
  const handleDelete = () => {
      onDelete(goal.id);
      setIsEditDialogOpen(false);
  }

  const openEditDialog = () => {
    setEditedTitle(goal.title);
    setEditedStartDate(goal.startDate);
    setEditedEndDate(goal.endDate);
    setIsEditDialogOpen(true);
  }

  return (
    <>
      <Card className={cn("transition-transform transform hover:-translate-y-1 hover:shadow-lg cursor-pointer", className)} onClick={openEditDialog}>
        <CardHeader>
          <CardTitle className="font-headline">{goal.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
            <span>{format(goal.startDate, "PP")}</span>
            <span>{days}/{totalDays} days</span>
            <span>{format(goal.endDate, "PP")}</span>
          </div>
          <Progress value={progress} />
          <p className="text-center mt-2 text-sm text-foreground">
            You are <span className="font-bold">{Math.round(progress)}%</span> of the way there. Keep going!
          </p>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Progress Goal</DialogTitle>
            <DialogDescription>
              Update your goal's title and dates.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-goal-title">Goal Title</Label>
              <Input
                id="edit-goal-title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="e.g., Q3 Project Deadline"
              />
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !editedStartDate && "text-muted-foreground"
                )}
                onClick={() => setShowStartDatePicker(!showStartDatePicker)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {editedStartDate ? format(editedStartDate, "PPP") : <span>Pick a date</span>}
              </Button>
              {showStartDatePicker && (
                <Calendar
                  mode="single"
                  selected={editedStartDate}
                  onSelect={(date) => {
                    setEditedStartDate(date);
                    setShowStartDatePicker(false);
                  }}
                  initialFocus
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !editedEndDate && "text-muted-foreground"
                )}
                onClick={() => setShowEndDatePicker(!showEndDatePicker)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {editedEndDate ? format(editedEndDate, "PPP") : <span>Pick a date</span>}
              </Button>
              {showEndDatePicker && (
                <Calendar
                  mode="single"
                  selected={editedEndDate}
                  onSelect={(date) => {
                    setEditedEndDate(date);
                    setShowEndDatePicker(false);
                  }}
                  initialFocus
                />
              )}
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="destructive" onClick={handleDelete} className="sm:mr-auto">
                <Trash2 className="mr-2"/> Delete
            </Button>
            <div className="flex gap-2 justify-end">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSaveChanges}>Save Changes</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
