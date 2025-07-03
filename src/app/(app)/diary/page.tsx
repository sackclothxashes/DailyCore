import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Image as ImageIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";

const images = Array.from({ length: 21 }, (_, i) => ({
  id: i + 1,
  src: `https://placehold.co/600x400.png?text=Day+${i + 1}`,
  alt: `Snapshot for day ${i + 1}`,
  date: `July ${i + 1}, 2024`,
  hint: `day ${i+1}`
}));

function PhotoGrid({ items }: { items: typeof images }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((image) => (
        <Card key={image.id} className="overflow-hidden group">
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
                <p className="text-white text-sm font-semibold">{image.date}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DiaryPage() {
  return (
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
      <Tabs defaultValue="month" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-grid md:grid-cols-3 mb-4">
          <TabsTrigger value="year">Year</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
        </TabsList>
        <TabsContent value="year">
          <PhotoGrid items={images} />
        </TabsContent>
        <TabsContent value="month">
          <PhotoGrid items={images.slice(0, 14)} />
        </TabsContent>
        <TabsContent value="week">
          <PhotoGrid items={images.slice(0, 7)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
