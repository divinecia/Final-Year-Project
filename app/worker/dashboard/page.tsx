
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Briefcase, CalendarCheck2, Star, Wallet, ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { getWorkerDashboardStats, getNewJobOpportunities, type WorkerDashboardStats } from "./actions"
import type { Job } from "../jobs/actions"
import { serviceOptions } from "@/lib/services";
import Link from "next/link";

export default function WorkerDashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [stats, setStats] = React.useState<WorkerDashboardStats | null>(null);
    const [jobs, setJobs] = React.useState<Job[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            if (user) {
                setLoading(true);
                try {
                    const [statsData, jobsData] = await Promise.all([
                        getWorkerDashboardStats(user.uid),
                        getNewJobOpportunities(),
                    ]);
                    setStats(statsData);
                    setJobs(jobsData);
                } catch (error) {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Could not load your dashboard data."
                    });
                } finally {
                    setLoading(false);
                }
            }
        };

        if (!authLoading) {
            fetchData();
        }
    }, [user, authLoading, toast]);
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(amount).replace('RWF', 'RWF ');
    };

    const getServiceName = (serviceId: string) => {
        return serviceOptions.find(s => s.id === serviceId)?.label || serviceId;
    };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome back!</CardTitle>
          <CardDescription>Complete your profile to get more job offers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={75} className="w-full md:w-1/2" />
            <span className="text-sm font-medium">75% Complete</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild><Link href="/worker/settings">Complete Profile <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </CardFooter>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-8" /> : <div className="text-2xl font-bold">{stats?.jobInvitations}</div>}
             <p className="text-xs text-muted-foreground">Available jobs matching your skills</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Jobs</CardTitle>
            <CalendarCheck2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-8" /> : <div className="text-2xl font-bold">{stats?.upcomingJobs}</div>}
            <p className="text-xs text-muted-foreground">Jobs in your schedule</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold flex items-center">{stats?.rating.toFixed(1)} <Star className="h-5 w-5 ml-1 text-yellow-400 fill-yellow-400" /></div>}
            <p className="text-xs text-muted-foreground">Your average review score</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month's Earnings</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-32" /> : <div className="text-2xl font-bold">{formatCurrency(stats?.monthEarnings ?? 0)}</div>}
            <p className="text-xs text-muted-foreground">Total earnings this month</p>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Card>
            <CardHeader>
                <CardTitle>New Job Opportunities</CardTitle>
                <CardDescription>
                    Jobs that match your skills and availability.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="space-y-4">
                    {loading ? (
                        <>
                            <div className="block sm:flex items-start justify-between p-4 border rounded-lg gap-4">
                                <div className="flex-1 mb-4 sm:mb-0">
                                <Skeleton className="h-5 w-1/2 mb-2" />
                                <Skeleton className="h-4 w-1/4" />
                                    <div className="flex items-center flex-wrap gap-2 mt-2">
                                        <Skeleton className="h-5 w-20 rounded-full" />
                                        <Skeleton className="h-5 w-24 rounded-full" />
                                        <Skeleton className="h-5 w-20 rounded-full" />
                                    </div>
                                </div>
                                <div className="text-left sm:text-right flex-shrink-0">
                                    <Skeleton className="h-6 w-32 mb-2" />
                                    <Skeleton className="h-9 w-28" />
                                </div>
                            </div>
                            <div className="block sm:flex items-start justify-between p-4 border rounded-lg gap-4">
                                <div className="flex-1 mb-4 sm:mb-0">
                                    <Skeleton className="h-5 w-1/3 mb-2" />
                                    <Skeleton className="h-4 w-1/4" />
                                    <div className="flex items-center flex-wrap gap-2 mt-2">
                                        <Skeleton className="h-5 w-28 rounded-full" />
                                    </div>
                                </div>
                                <div className="text-left sm:text-right flex-shrink-0">
                                <Skeleton className="h-6 w-24 mb-2" />
                                <Skeleton className="h-9 w-28" />
                                </div>
                            </div>
                        </>
                    ) : jobs.length > 0 ? (
                        jobs.map(job => (
                            <div key={job.id} className="block sm:flex items-start justify-between p-4 border rounded-lg gap-4">
                                <div className="flex-1 mb-4 sm:mb-0">
                                   <p className="font-semibold">{job.jobTitle}</p>
                                   <p className="text-sm text-muted-foreground">{job.householdName}</p>
                                     <div className="flex items-center flex-wrap gap-2 mt-2">
                                        <Badge variant="secondary">{getServiceName(job.serviceType)}</Badge>
                                        <Badge variant="outline" className="capitalize">{job.payFrequency.replace('_', '-')}</Badge>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right flex-shrink-0">
                                    <p className="text-lg font-bold">{formatCurrency(job.salary)}</p>
                                    <Button size="sm" asChild><Link href="/worker/jobs">View & Apply</Link></Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No new job opportunities right now.</p>
                    )}
                 </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                    <Link href="/worker/jobs">See All Jobs</Link>
                </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic';
