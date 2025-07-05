
'use client';

import { useState } from 'react';
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Image as ImageIcon, ChevronLeft, ChevronRight, Eye, EyeOff, Trash2, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  format, 
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
import { useToast } from '@/hooks/use-toast';

type Snapshot = {
  id: number;
  src: string;
  alt: string;
  date: Date;
  notes: string;
  hidden?: boolean;
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
  const { toast } = useToast();
  const [images, setImages] = useLocalStorage<Snapshot[]>("diary_snapshots", []);
  
  const [selectedImage, setSelectedImage] = useState<Snapshot | null>(null);
  const [currentNotes, setCurrentNotes] = useState("");

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSnapshotNotes, setNewSnapshotNotes] = useState("");
  const [newSnapshotPreview, setNewSnapshotPreview] = useState<string | null>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [snapshotToDelete, setSnapshotToDelete] = useState<Snapshot | null>(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'visible' | 'hidden'>('visible');
  
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleImageSelect = (image: Snapshot) => {
    setSelectedImage(image);
    setCurrentNotes(image.notes);
  };

  const handleSaveNotes = () => {
    if (!selectedImage) return;
    setImages(images.map(img => img.id === selectedImage.id ? { ...img, notes: currentNotes } : img));
    toast({ title: "Success", description: "Note saved." });
    setSelectedImage(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setNewSnapshotPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };
  
  const handleAddSnapshot = () => {
    const newSnapshot: Snapshot = {
      id: Date.now(),
      src: newSnapshotPreview || `https://placehold.co/600x400.png`,
      alt: "A daily snapshot",
      date: new Date(),
      notes: newSnapshotNotes,
      hidden: false,
    };
    setImages(prevImages => [newSnapshot, ...prevImages].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setNewSnapshotNotes("");
    setNewSnapshotPreview(null);
    setIsAddDialogOpen(false);
  };

  const handleCloseDialog = () => {
    setSelectedImage(null);
  }
  
  const handleDeleteClick = (image: Snapshot | null) => {
    if (!image) return;
    setSnapshotToDelete(image);
    setIsDeleteDialogOpen(true);
    setSelectedImage(null);
  };

  const handleDeleteConfirm = () => {
    if (!snapshotToDelete) return;
    setImages(images.filter(img => img.id !== snapshotToDelete.id));
    toast({ title: "Deleted", description: "Snapshot has been removed.", variant: "destructive" });
    setIsDeleteDialogOpen(false);
    setSnapshotToDelete(null);
  };

  const handleToggleHide = () => {
    if (!selectedImage) return;
    setImages(images.map(img =>
        img.id === selectedImage.id ? { ...img, hidden: !img.hidden } : img
    ));
    toast({ title: "Updated", description: `Snapshot ${selectedImage.hidden ? 'is now visible.' : 'has been hidden.'}` });
    setSelectedImage(null); // Close dialog after action
  };


  const handleTabChange = (value: string) => {
    if (value === 'hidden') {
      if (isUnlocked) {
        setActiveTab('hidden');
      } else {
        setIsPasswordDialogOpen(true);
      }
    } else {
      setActiveTab('visible');
    }
  };

  const handlePasswordCheck = () => {
    if (passwordInput === 'Ashes') {
      setIsUnlocked(true);
      setActiveTab('hidden');
      setIsPasswordDialogOpen(false);
      setPasswordInput('');
    } else {
      toast({ title: "Error", description: "Incorrect password.", variant: "destructive" });
      setPasswordInput('');
    }
  };

  const handlePrevious = () => {
    if (activeTab === 'visible') {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (activeTab === 'visible') {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const visibleSnapshots = (() => {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      return images.filter(image => !image.hidden && isWithinInterval(image.date, { start: monthStart, end: monthEnd }));
  })();

  const hiddenSnapshots = images.filter(image => image.hidden);

  const currentDisplayDate = format(currentDate, 'MMMM yyyy');

  return (
    <>
      <div>
        <PageHeader
          title="Daily Snapshots"
          description="A picture a day. Create a visual journey of your life."
        >
           <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setNewSnapshotPreview(null);
                setNewSnapshotNotes('');
              }}>
                <PlusCircle className="mr-2" />
                Add Snapshot
              </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Today's Snapshot</DialogTitle>
                    <DialogDescription>
                        Upload a photo and add your thoughts for the day.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                     <div className="space-y-2">
                        <Label htmlFor="snapshot-image">Your Photo</Label>
                        <Input id="snapshot-image" type="file" accept="image/*" onChange={handleImageChange} />
                    </div>
                    {newSnapshotPreview && (
                        <div className="mt-4 rounded-md overflow-hidden">
                            <Image
                                src={newSnapshotPreview}
                                alt="Selected snapshot preview"
                                width={600}
                                height={400}
                                className="object-cover w-full h-full"
                            />
                        </div>
                    )}
                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="new-notes">Today's Thoughts</Label>
                        <Textarea
                            id="new-notes"
                            placeholder="What's on your mind today?"
                            value={newSnapshotNotes}
                            onChange={(e) => setNewSnapshotNotes(e.target.value)}
                            rows={5}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleAddSnapshot} disabled={!newSnapshotPreview}>Add Snapshot</Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>
        </PageHeader>
        
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="visible">Snapshots</TabsTrigger>
              <TabsTrigger value="hidden">Hidden</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
              <Button variant="outline" size="icon" onClick={handlePrevious} aria-label="Previous month" disabled={activeTab === 'hidden'}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-semibold text-center w-40 tabular-nums">
                {activeTab === 'visible' ? currentDisplayDate : 'Hidden Archive'}
              </span>
              <Button variant="outline" size="icon" onClick={handleNext} aria-label="Next month" disabled={activeTab === 'hidden'}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="visible" className="mt-4">
            {visibleSnapshots.length > 0 ? (
              <PhotoGrid items={visibleSnapshots} onImageSelect={handleImageSelect} />
            ) : (
              <Card className="flex items-center justify-center h-64">
                <div className="text-center text-muted-foreground">
                  <p>No snapshots for this period.</p>
                  <p className="text-sm">Try navigating to a different date or add one!</p>
                </div>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="hidden" className="mt-4">
            {isUnlocked ? (
              hiddenSnapshots.length > 0 ? (
                <PhotoGrid items={hiddenSnapshots} onImageSelect={handleImageSelect} />
              ) : (
                <Card className="flex items-center justify-center h-64">
                  <div className="text-center text-muted-foreground">
                    <p>No hidden snapshots.</p>
                  </div>
                </Card>
              )
            ) : (
              <Card className="flex flex-col items-center justify-center h-64">
                <Lock className="w-12 h-12 text-muted-foreground mb-4" />
                <div className="text-center text-muted-foreground">
                  <p className="font-semibold">This area is password protected.</p>
                  <p className="text-sm">Click the "Hidden" tab again to enter the password.</p>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>

      </div>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedImage ? format(selectedImage.date, 'PPP') : ''}</DialogTitle>
            <DialogDescription>Add your thoughts and reflections for this day.</DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <>
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
              <DialogFooter className="sm:justify-between">
                <div className="flex gap-1">
                   <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(selectedImage)}>
                      <Trash2 className="text-destructive" />
                   </Button>
                   <Button variant="ghost" size="icon" onClick={handleToggleHide}>
                      {selectedImage.hidden ? <Eye /> : <EyeOff />}
                   </Button>
                </div>
                <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSaveNotes}>Save Note</Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Password</DialogTitle>
            <DialogDescription>
              This section is protected. Please enter the password to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordCheck()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsPasswordDialogOpen(false); setPasswordInput(''); }}>Cancel</Button>
            <Button onClick={handlePasswordCheck}>Unlock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this snapshot.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    