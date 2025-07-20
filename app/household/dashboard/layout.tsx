
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
  SidebarGroup,
} from "@/components/ui/sidebar"
import {
  Home,
  Briefcase,
  History,
  Wallet,
  Star,
  Bell,
  Settings,
  LogOut,
  User,
  Search,
  PlusSquare,
  BookMarked,
  UserCog,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogoWithName } from "@/components/logo"
import { useSidebar } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { signOut } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { AuthProvider, useAuth } from "@/hooks/use-auth"
import { Skeleton } from "@/components/ui/skeleton"

function QuickActionsNav() {
    const pathname = usePathname();
    const navItems = [
        { href: "/household/find-worker", icon: <Search className="h-5 w-5" />, label: "Search" },
        { href: "/household/post-job", icon: <PlusSquare className="h-5 w-5" />, label: "Post a Job" },
        { href: "/household/bookings", icon: <BookMarked className="h-5 w-5" />, label: "Bookings" },
        { href: "/household/settings", icon: <UserCog className="h-5 w-5" />, label: "My Profile" },
    ];

    return (
        <div className="mb-6">
            <Card>
                <CardContent className="p-2">
                    <div className="grid grid-cols-4 gap-2">
                        {navItems.map((item) => (
                            <Link href={item.href} key={item.href}>
                                <div className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors hover:bg-muted ${pathname === item.href ? 'bg-muted' : ''}`}>
                                    {item.icon}
                                    <span className="text-xs font-medium mt-1">{item.label}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


function HouseholdSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
    router.push("/household/login");
  };


  const menuItems = [
    { href: "/household/dashboard", icon: <Home />, label: "Dashboard" },
    { href: "/household/find-worker", icon: <Search />, label: "Find a Worker" },
    { href: "/household/post-job", icon: <PlusSquare />, label: "Post a Job" },
    { href: "/household/bookings", icon: <History />, label: "My Bookings" },
    { href: "/household/payments", icon: <Wallet />, label: "Payments" },
    { href: "/household/reviews", icon: <Star />, label: "Reviews" },
    { href: "/household/notifications", icon: <Bell />, label: "Notifications" },
  ]

  const settingsItems = [
     { href: "/household/settings", icon: <Settings />, label: "Settings" },
  ]

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="group-data-[variant=floating]:max-w-60"
    >
      <SidebarHeader>
        <div className="flex w-full items-center justify-between">
          <LogoWithName />
          <SidebarTrigger className="hidden md:flex" />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
             <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
                <Link href={item.href}>
                  {item.icon}
                  {item.label}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarGroup>
          <SidebarMenu>
             {settingsItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
                        <Link href={item.href}>
                            {item.icon}
                            {item.label}
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
             <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut />
                Logout
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-background/70">
           {loading ? (
             <>
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                </div>
             </>
           ) : (
            <>
                <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.photoURL || "https://placehold.co/100x100.png"} />
                    <AvatarFallback>{user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold text-sm">{user?.displayName || 'Household User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
            </>
           )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
        <SidebarProvider>
            <div className="flex min-h-screen">
                <HouseholdSidebar />
                <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/40">
                    <div className="md:hidden mb-4 flex justify-between items-center">
                        <SidebarTrigger/>
                    </div>
                    <QuickActionsNav />
                    {children}
                </main>
            </div>
        </SidebarProvider>
    </AuthProvider>
  )
}
