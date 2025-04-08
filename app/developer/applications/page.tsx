"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, ExternalLink, Filter, Grid, List, Plus, Star, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Slider } from "@/components/ui/slider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Application status options with their respective colors
const statusOptions = [
  { value: "applied", label: "Applied", color: "bg-blue-100 text-blue-800" },
  { value: "screening", label: "Screening", color: "bg-purple-100 text-purple-800" },
  { value: "interview", label: "Interview", color: "bg-amber-100 text-amber-800" },
  { value: "offer", label: "Offer", color: "bg-green-100 text-green-800" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" },
  { value: "accepted", label: "Accepted", color: "bg-emerald-100 text-emerald-800" },
  { value: "declined", label: "Declined", color: "bg-gray-100 text-gray-800" },
]

// Sample application data
const initialApplications = [
  {
    id: "1",
    companyName: "TechCorp Inc.",
    position: "Senior Frontend Developer",
    location: "San Francisco, CA",
    dateApplied: new Date(2023, 2, 15),
    status: "interview",
    jobUrl: "https://example.com/job/123",
    notes: "Had a great first interview. Second round scheduled for next week.",
    rating: 4,
  },
  {
    id: "2",
    companyName: "DataSystems LLC",
    position: "Full Stack Engineer",
    location: "Remote",
    dateApplied: new Date(2023, 3, 2),
    status: "screening",
    jobUrl: "https://example.com/job/456",
    notes: "Technical screening scheduled for April 10th.",
    rating: 3,
  },
  {
    id: "3",
    companyName: "InnovateTech",
    position: "React Developer",
    location: "New York, NY",
    dateApplied: new Date(2023, 2, 28),
    status: "applied",
    jobUrl: "",
    notes: "",
    rating: 5,
  },
]

type Application = {
  id: string
  companyName: string
  position: string
  location: string
  dateApplied: Date
  status: string
  jobUrl: string
  notes: string
  rating: number
}

export default function ApplicationsPage() {
  const { toast } = useToast()
  const [applications, setApplications] = useState<Application[]>(initialApplications)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"date" | "rating" | "company">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const handleUpdateRating = (id: string, rating: number) => {
    setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, rating } : app)))
  }

  const handleDeleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id))
    toast({
      title: "Application removed",
      description: "The job application has been removed from your list.",
    })
  }

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find((option) => option.value === status)
    return <Badge className={cn("font-normal", statusOption?.color)}>{statusOption?.label || status}</Badge>
  }

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={cn("h-4 w-4", i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300")} />
        ))}
      </div>
    )
  }

  // Filter and sort applications
  const filteredAndSortedApplications = applications
    .filter((app) => statusFilter === "all" || app.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "asc"
          ? a.dateApplied.getTime() - b.dateApplied.getTime()
          : b.dateApplied.getTime() - a.dateApplied.getTime()
      } else if (sortBy === "rating") {
        return sortOrder === "asc" ? a.rating - b.rating : b.rating - a.rating
      } else {
        return sortOrder === "asc"
          ? a.companyName.localeCompare(b.companyName)
          : b.companyName.localeCompare(a.companyName)
      }
    })

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Applications</h1>
        <p className="text-muted-foreground">Track and manage your job applications</p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Filter by Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All Applications
              </DropdownMenuItem>
              {statusOptions.map((option) => (
                <DropdownMenuItem key={option.value} onClick={() => setStatusFilter(option.value)}>
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Sort by {sortBy === "date" ? "Date" : sortBy === "rating" ? "Rating" : "Company"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy("date")}>Date</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("rating")}>Rating</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("company")}>Company</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                {sortOrder === "asc" ? "Ascending" : "Descending"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedApplications.map((application) => (
          <Card key={application.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{application.companyName}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteApplication(application.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>{application.position}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{application.location}</p>
                  {getStatusBadge(application.status)}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Applied: {application.dateApplied.toLocaleDateString()}
                  </p>
                  {getRatingStars(application.rating)}
                </div>
                {application.notes && (
                  <p className="text-sm text-muted-foreground">{application.notes}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              {application.jobUrl && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={application.jobUrl} target="_blank" rel="noopener noreferrer">
                    View Job Posting
                  </a>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

