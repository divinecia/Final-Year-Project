
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, Wallet, CheckCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { getDashboardStats, getRecentWorkerRegistrations, getRecentJobPostings, type DashboardStats } from "./actions"
import type { Worker } from "../workers/workermanage/actions"
import type { Job } from "../jobs/actions"
import { useToast } from "@/hooks/use-toast"

export default function AdminDashboardPage() {
    const [stats, setStats] = React.useState<DashboardStats | null>(null);
    const [recentWorkers, setRecentWorkers] = React.useState<Worker[]>([]);
    const [recentJobs, setRecentJobs] = React.useState<Job[]>([]);
    const [loading, setLoading] = React.useState(true);
    const { toast } = useToast();

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [statsData, workersData, jobsData] = await Promise.all([
                    getDashboardStats(),
                    getRecentWorkerRegistrations(),
                    getRecentJobPostings(),
                ]);
                setStats(statsData);
                setRecentWorkers(workersData);
                setRecentJobs(jobsData);
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load dashboard data."
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [toast]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(amount).replace('RWF', 'RWF ');
    };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{stats?.totalWorkers}</div>}
            <p className="text-xs text-muted-foreground">+2 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Households</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{stats?.totalHouseholds}</div>}
            <p className="text-xs text-muted-foreground">+5 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{stats?.jobsCompleted}</div>}
            <p className="text-xs text-muted-foreground">+10 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-32" /> : <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue ?? 0)}</div>}
            <p className="text-xs text-muted-foreground">Based on completed jobs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Recent Worker Registrations</CardTitle>
            </CardHeader>
            <CardContent>
               <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Date Joined</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            </TableRow>
                        ))
                    ) : recentWorkers.length > 0 ? (
                        recentWorkers.map(worker => (
                             <TableRow key={worker.id}>
                                <TableCell className="font-medium">{worker.fullName}</TableCell>
                                <TableCell>{worker.email}</TableCell>
                                <TableCell>{worker.dateJoined}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                         <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">No recent registrations.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
               </Table>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Recent Job Postings</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                     {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                             <div key={i} className="flex justify-between items-center">
                                <div>
                                    <Skeleton className="h-5 w-40 mb-1" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <Skeleton className="h-8 w-20" />
                            </div>
                        ))
                     ) : recentJobs.length > 0 ? (
                        recentJobs.map(job => (
                             <div key={job.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{job.jobTitle}</p>
                                    <p className="text-sm text-muted-foreground">{job.householdName}</p>
                                </div>
                                <Button variant="outline" size="sm">View</Button>
                            </div>
                        ))
                     ) : (
                        <div className="text-center text-muted-foreground py-10">No recent jobs.</div>
                     )}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
