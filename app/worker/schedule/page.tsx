
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Clock } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { isSameDay } from "date-fns"
import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"

type ScheduledJob = {
    id: string;
    jobTitle: string;
    householdName: string;
    householdLocation: string;
    status: 'assigned' | 'completed' | 'cancelled';
    jobDate: Date;
    jobTime: string;
};

const JobCard = ({ job }: { job: ScheduledJob }) => (
    <Card>
        <CardHeader className="pb-4">
            <CardTitle className="text-base">{job.jobTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">{job.householdName}</p>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{job.householdLocation}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{job.jobTime}</span>
            </div>
        </CardContent>
    </Card>
);

const JobCardSkeleton = () => (
    <Card>
        <CardHeader className="pb-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
        </CardContent>
    </Card>
);

export default function WorkerSchedulePage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [schedule, setSchedule] = React.useState<ScheduledJob[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchSchedule = async () => {
            if (user) {
                setLoading(true);
                try {
                    // Fetch actual schedule from Firebase jobs collection
                    const jobsQuery = query(
                        collection(db, 'jobs'),
                        where('workerId', '==', user.uid),
                        where('status', 'in', ['assigned', 'active']),
                        orderBy('createdAt', 'desc')
                    );
                    
                    const querySnapshot = await getDocs(jobsQuery);
                    const scheduledJobs: ScheduledJob[] = querySnapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            jobTitle: data.jobTitle || 'Service Job',
                            householdName: data.householdName || 'Customer',
                            householdLocation: data.location || 'Not specified',
                            status: data.status || 'assigned',
                            jobDate: data.startDate?.toDate() || new Date(),
                            jobTime: data.startTime || '9:00 AM'
                        };
                    });
                    
                    setSchedule(scheduledJobs);
                } catch (error) {
                    toast({ 
                        variant: "destructive", 
                        title: "Error", 
                        description: "Could not load your schedule." 
                    });
                } finally {
                    setLoading(false);
                }
            }
        };

        if (!authLoading) {
            fetchSchedule();
        }
    }, [user, authLoading, toast]);

    const jobsForSelectedDate = React.useMemo(() => {
        if (!date) return [];
        return schedule.filter(job => isSameDay(job.jobDate, date));
    }, [schedule, date]);

    const scheduledDays = React.useMemo(() => schedule.map(job => job.jobDate), [schedule]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
                <p className="text-muted-foreground">View and manage your upcoming jobs.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardContent className="p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="w-full"
                                modifiers={{ scheduled: scheduledDays }}
                                modifiersStyles={{
                                    scheduled: {
                                        border: "2px solid hsl(var(--primary))",
                                        borderRadius: 'var(--radius)'
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Jobs for {date ? date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : '...'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {loading ? (
                                <JobCardSkeleton />
                            ) : jobsForSelectedDate.length > 0 ? (
                                jobsForSelectedDate.map(job => <JobCard key={job.id} job={job} />)
                            ) : (
                                <p className="text-center text-muted-foreground py-8">No jobs scheduled for this day.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

// Force dynamic rendering to avoid SSG issues
export const dynamic = 'force-dynamic';
