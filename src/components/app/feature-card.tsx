import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type FeatureCardProps = {
  title: string;
  description: string;
  href: string;
  Icon: LucideIcon;
};

export function FeatureCard({ title, description, href, Icon }: FeatureCardProps) {
  return (
    <Card className="flex flex-col h-full transition-transform transform hover:-translate-y-1 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="p-3 rounded-md bg-secondary">
          <Icon className="w-6 h-6 text-secondary-foreground" />
        </div>
        <div>
          <CardTitle className="font-headline">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex items-end justify-end">
        <Link href={href} passHref>
          <Button variant="ghost" size="sm">
            Go to {title} <ArrowRight className="ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
