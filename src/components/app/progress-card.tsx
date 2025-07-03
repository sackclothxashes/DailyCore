"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function ProgressCard() {
  const [progress, setProgress] = useState(0);
  const [days, setDays] = useState(0);
  const totalDays = 30;
  const startDate = "1st July";
  const endDate = "30th July";

  useEffect(() => {
    const today = new Date().getDate();
    const calculatedDays = Math.min(today, totalDays);
    setDays(calculatedDays);
    setProgress((calculatedDays / totalDays) * 100);
  }, []);

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle className="font-headline">Monthly Goals Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
          <span>{startDate}</span>
          <span>
            {days}/{totalDays} days
          </span>
          <span>{endDate}</span>
        </div>
        <Progress value={progress} />
        <p className="text-center mt-2 text-sm text-foreground">
          You are <span className="font-bold">{Math.round(progress)}%</span> through the month. Keep going!
        </p>
      </CardContent>
    </Card>
  );
}
