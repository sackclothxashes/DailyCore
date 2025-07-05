
'use client';

import { useState } from 'react';
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  format, 
  addDays, 
  subMonths, 
  addMonths, 
  subWeeks, 
  addWeeks, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isWithinInterval 
} from 'date-fns';
import useLocalStorage from '@/hooks/use-local-storage';

type Snapshot = {
  id: number;
  src: string;
  alt: string;
  date: Date;
  hint: string;
  notes: string;
};

function PhotoGrid({ items, onImageSelect }: { items: Snapshot[]; onImageSelect: (image: Snapshot) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((image) => (
        <Card key={image.id} className="overflow-hidden group cursor-pointer" onClick={() => onImageSelect(image)}>
          <CardContent className="p-0">
            <div className="aspect-w-16 aspect-h-9 relative">
              <Image
                src={image.src}
                alt={image.alt}
                width={600}
                height={400}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={image.hint}
              />
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-sm font-semibold">{format(image.date, 'MMMM d, yyyy')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DiaryPage() {
  const [images, setImages] = useLocalStorage<Snapshot[]>("diary_snapshots", []);
  const [selectedImage, setSelectedImage] = useState<Snapshot | null>(null);
  const [currentNotes, setCurrentNotes] = useState("");

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  const handleImageSelect = (image: Snapshot) => {
    setSelectedImage(image);
    setCurrentNotes(image.notes);
  };

  const handleSaveNotes = () => {
    if (!selectedImage) return;
    setImages(images.map(img => img.id === selectedImage.id ? { ...img, notes: currentNotes } : img));
    setSelectedImage(null);
  };

  const handleCloseDialog = () => {
    setSelectedImage(null);
  }

  const handlePrevious = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const visibleImages = (() => {
    if (view === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      return images.filter(image => isWithinInterval(image.date, { start: monthStart, end: monthEnd }));
    } else { // week view
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      return images.filter(image => isWithinInterval(image.date, { start: weekStart, end: weekEnd }));
    }
  })();

  const currentDisplayDate = () => {
    if (view === 'month') {
      return format(currentDate, 'MMMM yyyy');
    } else {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      if (format(weekStart, 'yyyy') !== format(weekEnd, 'yyyy')) {
        return `${format(weekStart, 'MMM d, yyyy')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      }
      if (format(weekStart, 'MMM') !== format(weekEnd, 'MMM')) {
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      }
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'd, yyyy')}`;
    }
  };

  return (
    <>
      <div>
        <PageHeader
          title="Daily Snapshots"
          description="A picture a day. Create a visual journey of your life."
        >
          <Button>
            <PlusCircle className="mr-2" />
            Add Snapshot
          </Button>
        </PageHeader>
        <Alert className="mb-8 bg-primary/20 border-primary/40">
          <ImageIcon className="h-4 w-4" />
          <AlertTitle className="font-headline">Daily Reminder</AlertTitle>
          <AlertDescription>
            Don't forget to capture today's moment! A small snapshot can hold a big memory.
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <Tabs defaultValue={view} onValueChange={(v) => setView(v as 'month' | 'week')} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
            <Button variant="outline" size="icon" onClick={handlePrevious} aria-label="Previous period">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-center w-48 tabular-nums">
              {currentDisplayDate()}
            </span>
            <Button variant="outline" size="icon" onClick={handleNext} aria-label="Next period">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4">
          {visibleImages.length > 0 ? (
            <PhotoGrid items={visibleImages} onImageSelect={handleImageSelect} />
          ) : (
            <Card className="flex items-center justify-center h-64">
              <div className="text-center text-muted-foreground">
                <p>No snapshots for this period.</p>
                <p className="text-sm">Try navigating to a different date.</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedImage ? format(selectedImage.date, 'PPP') : ''}</DialogTitle>
            <DialogDescription>Add your thoughts and reflections for this day.</DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4 py-4">
              <div className="rounded-md overflow-hidden">
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  width={600}
                  height={400}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="grid w-full gap-1.5">
                <Label htmlFor="notes">Today's Thoughts</Label>
                <Textarea
                  id="notes"
                  placeholder="What's on your mind today?"
                  value={currentNotes}
                  onChange={(e) => setCurrentNotes(e.target.value)}
                  rows={5}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSaveNotes}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
