
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Search } from "lucide-react"
import { serviceOptions } from "@/lib/services"
import { getOpenJobs, applyForJob, type Job } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

const JobCard = ({ job, onApply }: { job: Job, onApply: (jobId: string) => void }) => {
    const getServiceName = (serviceId: string) => {
        return serviceOptions.find(s => s.id === serviceId)?.label || serviceId;
    }
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(amount).replace('RWF', 'RWF ');
    };

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>{job.jobTitle}</CardTitle>
                <CardDescription className="flex items-center gap-2 pt-1">
                    <MapPin className="h-4 w-4" /> {job.householdLocation}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{getServiceName(job.serviceType)}</Badge>
                    <Badge variant="outline" className="capitalize">{job.payFrequency.replace('_', '-')}</Badge>
                </div>
                <p className="text-lg font-bold">{formatCurrency(job.salary)}</p>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={() => onApply(job.id)}>Apply Now</Button>
            </CardFooter>
        </Card>
    )
}

const JobCardSkeleton = () => (
    <Card className="flex flex-col">
        <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-1" />
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
            <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-6 w-32" />
        </CardContent>
        <CardFooter>
            <Skeleton className="h-10 w-full" />
        </CardFooter>
    </Card>
);

export default function WorkerJobsPage() {
    const [jobs, setJobs] = React.useState<Job[]>([]);
    const [loading, setLoading] = React.useState(true);
    const { toast } = useToast();
    const { user } = useAuth();
    
    const fetchJobs = React.useCallback(async () => {
        setLoading(true);
        try {
            const fetchedJobs = await getOpenJobs();
            setJobs(fetchedJobs);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not fetch jobs." });
        } finally {
            setLoading(false);
        }
    }, [toast]);
    
    React.useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleApply = async (jobId: string) => {
        if (!user) {
            toast({ variant: "destructive", title: "Not logged in", description: "You must be logged in to apply." });
            return;
        }
        
        toast({ title: "Applying for job..." });

        const result = await applyForJob(jobId, user.uid);

        if (result.success) {
            toast({ title: "Success!", description: "Your application has been submitted." });
            fetchJobs(); // Refresh the list of jobs
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Find Job Opportunities</h1>
                <p className="text-muted-foreground">Browse and apply for jobs that match your skills.</p>
            </div>

            <Card>
                <CardContent className="p-4 md:p-6 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Search by title, location, or skill..." className="pl-10 text-base" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Service Type</Label>
                            <Select>
                                <SelectTrigger><SelectValue placeholder="All Services" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Services</SelectItem>
                                    {serviceOptions.map(service => (
                                        <SelectItem key={service.id} value={service.id}>{service.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Job Type</Label>
                            <Select>
                                <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="full-time">Full-time</SelectItem>
                                    <SelectItem value="part-time">Part-time</SelectItem>
                                    <SelectItem value="one-time">One-time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button className="self-end w-full md:w-auto">Apply Filters</Button>
                    </div>
                </CardContent>
            </Card>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
                </div>
            ) : jobs.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map(job => <JobCard key={job.id} job={job} onApply={handleApply} />)}
                </div>
            ) : (
                <div className="text-center py-16 text-muted-foreground">
                    <p>No open jobs found at the moment. Please check back later.</p>
                </div>
            )}
        </div>
    )
}
