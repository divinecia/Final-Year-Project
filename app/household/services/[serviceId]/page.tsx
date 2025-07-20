
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star } from "lucide-react"
import { services } from "@/lib/services"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

const WorkerCardSkeleton = () => (
    <Card>
        <CardContent className="p-4 flex flex-col items-center text-center">
            <Skeleton className="w-16 h-16 rounded-full mb-4" />
            <Skeleton className="h-5 w-24 mb-1" />
            <Skeleton className="h-4 w-32 mb-3" />
            <div className="flex flex-wrap justify-center gap-1 mb-3 h-10 items-center">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-5 w-16" />
        </CardContent>
        <CardFooter>
            <Skeleton className="h-10 w-full" />
        </CardFooter>
    </Card>
);

export default function ServiceDetailPage({ params }: { params: Promise<{ serviceId: string }> }) {
  const [serviceId, setServiceId] = React.useState<string>("");
  
  React.useEffect(() => {
    params.then((resolvedParams) => {
      setServiceId(resolvedParams.serviceId);
    });
  }, [params]);

  const service = services.find(s => s.id === serviceId);

  if (!serviceId) {
    return <div>Loading...</div>;
  }

  if (!service) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Professionals for {service.name}</h1>
        <p className="text-muted-foreground">Browse workers available for this service.</p>
      </div>

      <div className="flex justify-end">
        <div className="w-full max-w-xs">
          <Select defaultValue="newest">
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Sort by: Newest</SelectItem>
              <SelectItem value="rating">Sort by: Highest Rated</SelectItem>
              <SelectItem value="price_asc">Sort by: Price (Low to High)</SelectItem>
              <SelectItem value="price_desc">Sort by: Price (High to Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => <WorkerCardSkeleton key={i} />)}
      </div>
    </div>
  );
}
