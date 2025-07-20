
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { getDashboardStats } from "../dashboard/actions"

const monthlyData = [
  { month: "Jan", revenue: 400000, jobs: 24 },
  { month: "Feb", revenue: 300000, jobs: 13 },
  { month: "Mar", revenue: 500000, jobs: 38 },
  { month: "Apr", revenue: 478000, jobs: 39 },
  { month: "May", revenue: 689000, jobs: 48 },
  { month: "Jun", revenue: 539000, jobs: 38 },
]

const userGrowthData = [
    { month: "Jan", workers: 20, households: 35 },
    { month: "Feb", workers: 25, households: 42 },
    { month: "Mar", workers: 32, households: 55 },
    { month: "Apr", workers: 40, households: 68 },
    { month: "May", workers: 55, households: 85 },
    { month: "Jun", workers: 62, households: 102 },
]

export default function AdminReportsPage() {
    const [stats, setStats] = React.useState({ jobsCompleted: 0 });
    const [loading, setLoading] = React.useState(true);
    const { toast } = useToast();

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const statsData = await getDashboardStats();
                setStats({ jobsCompleted: statsData.jobsCompleted });
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Failed to load report data." });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [toast]);

    const formatCurrency = (value: number) => `RWF ${new Intl.NumberFormat('en-US').format(value)}`;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground">
                Gain insights into platform performance and user activity.
            </p>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>User Growth</CardTitle>
                        <CardDescription>Worker vs. Household sign-ups over the last 6 months.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       {loading ? <Skeleton className="w-full h-64" /> : (
                           <ResponsiveContainer width="100%" height={250}>
                               <BarChart data={userGrowthData}>
                                   <CartesianGrid strokeDasharray="3 3" />
                                   <XAxis dataKey="month" />
                                   <YAxis />
                                   <Tooltip />
                                   <Legend />
                                   <Bar dataKey="workers" fill="hsl(var(--primary))" name="Workers" />
                                   <Bar dataKey="households" fill="hsl(var(--secondary))" name="Households" />
                               </BarChart>
                           </ResponsiveContainer>
                       )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                        <CardDescription>Monthly revenue from completed jobs.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       {loading ? <Skeleton className="w-full h-64" /> : (
                            <ResponsiveContainer width="100%" height={250}>
                               <BarChart data={monthlyData}>
                                   <CartesianGrid strokeDasharray="3 3" />
                                   <XAxis dataKey="month" />
                                   <YAxis tickFormatter={formatCurrency} />
                                   <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                   <Legend />
                                   <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue (RWF)" />
                               </BarChart>
                           </ResponsiveContainer>
                       )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
