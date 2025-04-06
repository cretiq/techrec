"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FileText,
  Users,
  Settings,
  BarChart3,
  Briefcase,
  GraduationCap,
  Menu,
  X,
  User,
  Code,
  LogOut,
  ClipboardList,
  PenLine,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { ThemeToggle } from "./theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function DashboardSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isCompanyDashboard = pathname?.includes("/company/")
  const isDeveloperDashboard = pathname?.includes("/developer/")

  if (!isCompanyDashboard && !isDeveloperDashboard) {
    return null
  }

  const companyLinks = [
    {
      title: "Dashboard",
      href: "/company/dashboard",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: "Assessments",
      href: "/company/assessments",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Candidates",
      href: "/company/candidates",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Roles",
      href: "/company/roles",
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/company/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  const developerLinks = [
    {
      title: "Dashboard",
      href: "/developer/dashboard",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: "Browse Roles",
      href: "/developer/roles",
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      title: "Assessments",
      href: "/developer/assessments",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Applications",
      href: "/developer/applications",
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      title: "Cover Letter",
      href: "/developer/cover-letter",
      icon: <PenLine className="h-5 w-5" />,
    },
    {
      title: "Profile",
      href: "/developer/profile",
      icon: <User className="h-5 w-5" />,
    },
  ]

  const links = isCompanyDashboard ? companyLinks : developerLinks
  const dashboardType = isCompanyDashboard ? "Company" : "Developer"
  const userName = isCompanyDashboard ? "RightHub" : "John Doe"
  const userEmail = isCompanyDashboard ? "company@righthub.com" : "john.doe@example.com"

  return (
    <>
      {/* Mobile sidebar trigger */}
      <div className="md:hidden absolute left-4 top-4 z-40">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <div className="flex flex-col h-full py-4">
              <div className="mb-4 flex items-center justify-between border-b pb-4">
                <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-[1.02]">
                  <Code className="h-5 w-5" />
                  <span className="font-medium">DevAssess</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>

              <div className="flex items-center justify-between mb-4 px-3">
                <div className="flex items-center gap-2">
                  {isCompanyDashboard ? <Briefcase className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
                  <span className="font-medium">{dashboardType} Dashboard</span>
                </div>
                <ThemeToggle />
              </div>

              <nav className="flex flex-col gap-1 px-2">
                {links.map((link, index) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                      pathname === link.href
                        ? "bg-primary/10 text-primary scale-[1.02]"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground hover:scale-[1.02]",
                      "animate-slide-in",
                      { "animation-delay-[100ms]": index % 3 === 1, "animation-delay-[200ms]": index % 3 === 2 }
                    )}
                  >
                    {link.icon}
                    {link.title}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto pt-4 border-t">
                <div className="px-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 transition-transform hover:scale-110">
                      <AvatarImage src="" />
                      <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{userName}</span>
                      <span className="text-xs text-muted-foreground">{userEmail}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="hover:rotate-12 transition-transform">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block w-64 shrink-0">
        <div className="fixed inset-y-0 z-30 w-64 border-r bg-background">
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-[1.02]">
              <Code className="h-5 w-5" />
              <span className="font-medium">DevAssess</span>
            </Link>
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-2 h-14 border-b px-6">
            {isCompanyDashboard ? <Briefcase className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
            <span className="font-medium">{dashboardType} Dashboard</span>
          </div>

          <nav className="p-4">
            <div className="space-y-1">
              {links.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                    pathname === link.href
                      ? "bg-primary/10 text-primary scale-[1.02]"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground hover:scale-[1.02]",
                    "animate-slide-in",
                    { "animation-delay-[100ms]": index % 3 === 1, "animation-delay-[200ms]": index % 3 === 2 }
                  )}
                >
                  {link.icon}
                  {link.title}
                </Link>
              ))}
            </div>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center justify-between px-3 py-2 transition-all duration-200 hover:scale-[1.02]">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 transition-transform hover:scale-110">
                      <AvatarImage src="" />
                      <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{userName}</span>
                      <span className="text-xs text-muted-foreground">{userEmail}</span>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 animate-scale-in">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="transition-colors hover:bg-primary/5">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="transition-colors hover:bg-primary/5">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="transition-colors hover:bg-destructive/10 hover:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </>
  )
}

