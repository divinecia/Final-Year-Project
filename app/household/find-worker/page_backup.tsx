
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Search, Star } from "lucide-react"
import { serviceOptions, services } from "@/lib/services"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { getActiveWorkers, getPreviouslyHiredWorkers, type Worker } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"

const PreviouslyHiredWorkerCard = ({ worker }: { worker: Worker }) => (
     <Card className="flex flex-col h-full">
        <CardContent className="p-4 flex-grow flex flex-col items-center text-center">
            <Avatar className="w-16 h-16 mb-3">
                <AvatarImage src={worker.profilePictureUrl} />
                <AvatarFallback>{worker.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="text-sm font-medium">{worker.fullName}</p>
        </CardContent>
        <CardFooter className="p-2 pt-0">
            <Button variant="secondary" size="sm" className="w-full" asChild>
                 <Link href={`/household/worker-profile/${worker.id}`}>Re-book</Link>
            </Button>
        </CardFooter>
    </Card>
)

const PreviouslyHiredWorkerCardSkeleton = () => (
    <Card className="flex flex-col h-full">
        <CardContent className="p-4 flex-grow flex flex-col items-center text-center">
            <Skeleton className="w-16 h-16 rounded-full mb-3" />
            <Skeleton className="h-4 w-20" />
        </CardContent>
        <CardFooter className="p-2 pt-0">
            <Skeleton className="h-8 w-full" />
        </CardFooter>
    </Card>
);

const WorkerCard = ({ worker }: { worker: Worker }) => {
    const getSkillLabel = (skillId: string) => {
        return services.find(s => s.id === skillId)?.name || skillId;
    }

    return (
         <Card className="flex flex-col h-full">
            <CardContent className="p-4 flex flex-col items-center text-center flex-grow">
                <Avatar className="w-16 h-16 mb-4">
                    <AvatarImage src={worker.profilePictureUrl} data-ai-hint="portrait" />
                    <AvatarFallback>{worker.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="font-semibold">{worker.fullName}</p>
                 <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <Star className={cn("h-4 w-4", worker.rating > 0 ? "text-yellow-400 fill-yellow-400" : "")} />
                    <span>{worker.rating.toFixed(1)} ({worker.reviewsCount})</span>
                </div>
                <div className="flex flex-wrap justify-center gap-1 mb-3">
                    {worker.skills.slice(0, 2).map(skill => (
                        <Badge key={skill} variant="secondary">{getSkillLabel(skill)}</Badge>
                    ))}
                    {worker.skills.length > 2 && <Badge variant="outline">+{worker.skills.length - 2} more</Badge>}
                </div>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" asChild>
                    <Link href={`/household/worker-profile/${worker.id}`}>View Profile</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}

const WorkerCardSkeleton = () => (
    <Card className="flex flex-col h-full">
        <CardContent className="p-4 flex flex-col items-center text-center flex-grow">
            <Skeleton className="w-16 h-16 rounded-full mb-4" />
            <Skeleton className="h-5 w-24 mb-1" />
            <Skeleton className="h-4 w-16 mb-3" />
            <div className="flex flex-wrap justify-center gap-1 mb-3 h-5 items-center">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
            </div>
        </CardContent>
        <CardFooter>
            <Skeleton className="h-10 w-full" />
        </CardFooter>
    </Card>
);


function FindWorkerPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();

    const [workers, setWorkers] = React.useState<Worker[]>([]);
    const [previouslyHired, setPreviouslyHired] = React.useState<Worker[]>([]);
    const [filteredWorkers, setFilteredWorkers] = React.useState<Worker[]>([]);
    const [loading, setLoading] = React.useState(true);

    const [searchTerm, setSearchTerm] = React.useState("");
    const [serviceFilter, setServiceFilter] = React.useState("all");
    const [distance, setDistance] = React.useState([25]);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const activeWorkersData = await getActiveWorkers();
                setWorkers(activeWorkersData);
                setFilteredWorkers(activeWorkersData);

                if (user) {
                    const previouslyHiredData = await getPreviouslyHiredWorkers(user.uid);
                    setPreviouslyHired(previouslyHiredData);
                }

            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not fetch available workers.",
                });
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchData();
        }
    }, [toast, user, authLoading]);

     React.useEffect(() => {
        let results = workers;

        if (searchTerm) {
            results = results.filter(worker =>
                worker.fullName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (serviceFilter !== "all") {
            results = results.filter(worker =>
                worker.skills.includes(serviceFilter)
            );
        }
        
        // Note: Distance filtering is not implemented on the backend, so this is a UI-only slider for now.

        setFilteredWorkers(results);
    }, [searchTerm, serviceFilter, workers]);


  return (
    <div className="space-y-8">
        <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Previously Hired Professionals</h2>
             <Carousel
                opts={{
                    align: "start",
                    loop: false,
                }}
                className="w-full"
                >
                <CarouselContent>
                    {loading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                            <CarouselItem key={index} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                                <PreviouslyHiredWorkerCardSkeleton />
                            </CarouselItem>
                        ))
                    ) : previouslyHired.length > 0 ? (
                        previouslyHired.map((worker) => (
                             <CarouselItem key={worker.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                                <PreviouslyHiredWorkerCard worker={worker} />
                            </CarouselItem>
                        ))
                    ) : (
                         <CarouselItem className="basis-full">
                            <p className="text-muted-foreground text-center">You haven't hired anyone yet.</p>
                         </CarouselItem>
                    )}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
            </Carousel>
        </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find the Perfect Professional</h1>
        <p className="text-muted-foreground">Search and filter from our list of trusted workers.</p>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="Search by name..." 
                className="pl-10 text-base"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Service Needed</Label>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {serviceOptions.map(service => (
                    <SelectItem key={service.id} value={service.id}>{service.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Availability</Label>
              <Input type="date" placeholder="Select a date"/>
            </div>
             <div className="space-y-2 md:col-span-3 lg:col-span-1">
              <Label htmlFor="distance-slider">Maximum Distance (near by): {distance[0]} km</Label>
              <Slider id="distance-slider" defaultValue={distance} max={50} step={1} onValueChange={setDistance} />
            </div>
          </div>
        </CardContent>
      </Card>
      
        {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => <WorkerCardSkeleton key={i} />)}
            </div>
        ) : filteredWorkers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredWorkers.map((worker) => <WorkerCard key={worker.id} worker={worker} />)}
            </div>
        ) : (
            <div className="text-center py-16 text-muted-foreground">
                <p>No workers found matching your criteria.</p>
            </div>
        )}
    </div>
  )
}

export default FindWorkerPage;

// Force dynamic rendering to avoid SSG issues
export const dynamic = 'force-dynamic';
