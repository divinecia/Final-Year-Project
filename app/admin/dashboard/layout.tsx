
"use client"

import * as React from "react"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
  SidebarGroup,
} from "@/components/ui/sidebar"
import {
  Home,
  Users,
  Briefcase,
  Wallet,
  AreaChart,
  Settings,
  LogOut,
  User,
  GraduationCap,
  Package,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogoWithName } from "@/components/logo"
import { useSidebar } from "@/components/ui/sidebar"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
    router.push("/admin/login");
  };

  const menuItems = [
    { href: "/admin/dashboard", icon: <Home />, label: "Dashboard" },
    { href: "/admin/workers/workermanage", icon: <Users />, label: "Workers" },
    { href: "/admin/households", icon: <Users />, label: "Households" },
    { href: "/admin/jobs", icon: <Briefcase />, label: "Jobs" },
    { href: "/admin/training", icon: <GraduationCap />, label: "Training" },
    { href: "/admin/packages", icon: <Package />, label: "Service Packages" },
    { href: "/admin/payments", icon: <Wallet />, label: "Payments" },
    { href: "/admin/reports", icon: <AreaChart />, label: "Reports" },
  ]

  const settingsItems = [
     { href: "/admin/settings", icon: <Settings />, label: "Settings" },
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
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
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
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://placehold.co/100x100.png" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@househelp.app</p>
          </div>
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
    <SidebarProvider>
        <div className="flex min-h-screen">
            <AdminSidebar />
            <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/40">
                <div className="md:hidden mb-4">
                    <SidebarTrigger/>
                </div>
                {children}
            </main>
        </div>
    </SidebarProvider>
  )
}
