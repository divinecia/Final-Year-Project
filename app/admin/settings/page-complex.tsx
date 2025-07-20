
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { getAdmins, deleteAdmin, type AdminUser } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

const SkeletonRow = () => (
    <TableRow>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
        <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        <TableCell>
            <Skeleton className="h-8 w-8" />
        </TableCell>
    </TableRow>
)

export default function AdminSettingsPage() {
    const [admins, setAdmins] = React.useState<AdminUser[]>([]);
    const [loading, setLoading] = React.useState(true);
    const { toast } = useToast();

    const fetchAdmins = React.useCallback(async () => {
        setLoading(true);
        try {
            const fetchedAdmins = await getAdmins();
            setAdmins(fetchedAdmins);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not fetch admin users.",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    React.useEffect(() => {
        fetchAdmins();
    }, [fetchAdmins]);


    const handleDelete = async (adminId: string, adminName: string) => {
        const result = await deleteAdmin(adminId);
        if (result.success) {
            toast({
                title: "Admin Deleted",
                description: `The account for "${adminName}" has been deleted.`
            });
            fetchAdmins();
        } else {
             toast({
                variant: "destructive",
                title: "Error",
                description: result.error || `Could not delete account for "${adminName}".`
            });
        }
    };

    const getRoleBadge = (role: string) => {
        switch(role) {
            case 'super_admin': return <Badge variant="destructive">Super Admin</Badge>;
            case 'manager': return <Badge variant="default">Manager</Badge>;
            case 'support_agent': return <Badge variant="secondary">Support Agent</Badge>;
            default: return <Badge variant="outline">{role}</Badge>;
        }
    };
    
    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'active': return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
            default: return <Badge variant="outline">Inactive</Badge>;
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage administrator roles and system settings.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Admin User Roles</CardTitle>
                            <CardDescription>Define permissions for different administrator roles.</CardDescription>
                        </div>
                        <Button asChild>
                            <Link href="/admin/register">Add New Admin</Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {loading ? (
                                Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
                           ) : admins.length > 0 ? (
                                admins.map((admin) => (
                                    <TableRow key={admin.id}>
                                        <TableCell className="font-medium">{admin.fullName}</TableCell>
                                        <TableCell>{admin.email}</TableCell>
                                        <TableCell>{getRoleBadge(admin.role)}</TableCell>
                                        <TableCell>{getStatusBadge(admin.status)}</TableCell>
                                        <TableCell>
                                            <AlertDialog>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Toggle menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the admin account for {admin.fullName}.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(admin.id, admin.fullName)}>
                                                            Yes, delete admin
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                           ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        No admin users found.
                                    </TableCell>
                                </TableRow>
                           )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>System Settings</CardTitle>
                    <CardDescription>Configure global platform settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <Label htmlFor="maintenance-mode" className="font-semibold">Maintenance Mode</Label>
                            <p className="text-sm text-muted-foreground">Temporarily disable access to the platform for users.</p>
                        </div>
                        <Switch id="maintenance-mode" />
                    </div>
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                           <Label htmlFor="worker-approval" className="font-semibold">Automatic Worker Approval</Label>
                            <p className="text-sm text-muted-foreground">Automatically approve new worker registrations.</p>
                        </div>
                        <Switch id="worker-approval" checked/>
                    </div>
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                           <Label htmlFor="ip-restriction" className="font-semibold">IP Address Restriction</Label>
                            <p className="text-sm text-muted-foreground">Restrict admin portal access to specific IP addresses.</p>
                        </div>
                        <Switch id="ip-restriction" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
