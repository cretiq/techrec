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
  const [newApplication, setNewApplication] = useState<Omit<Application, "id">>({
    companyName: "",
    position: "",
    location: "",
    dateApplied: new Date(),
    status: "applied",
    jobUrl: "",
    notes: "",
    rating: 3,
  })
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showAddForm, setShowAddForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"date" | "rating" | "company">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewApplication((prev) => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (value: string) => {
    setNewApplication((prev) => ({ ...prev, status: value }))
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setDate(date)
      setNewApplication((prev) => ({ ...prev, dateApplied: date }))
    }
  }

  const handleRatingChange = (value: number[]) => {
    setNewApplication((prev) => ({ ...prev, rating: value[0] }))
  }

  const handleUpdateRating = (id: string, rating: number) => {
    setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, rating } : app)))
  }

  const handleAddApplication = () => {
    // Validate required fields
    if (!newApplication.companyName.trim() || !newApplication.position.trim()) {
      toast({
        title: "Missing information",
        description: "Company name and position are required.",
        variant: "destructive",
      })
      return
    }

    const newId = (applications.length + 1).toString()
    const applicationToAdd = {
      id: newId,
      ...newApplication,
    }

    setApplications((prev) => [applicationToAdd, ...prev])

    // Reset form
    setNewApplication({
      companyName: "",
      position: "",
      location: "",
      dateApplied: new Date(),
      status: "applied",
      jobUrl: "",
      notes: "",
      rating: 3,
    })
    setDate(new Date())
    setShowAddForm(false)

    toast({
      title: "Application added",
      description: "Your job application has been successfully added.",
    })
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
        // Sort by company name
        return sortOrder === "asc"
          ? a.companyName.localeCompare(b.companyName)
          : b.companyName.localeCompare(a.companyName)
      }
    })

  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-6xl p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
              <p className="text-muted-foreground">Track and manage your job applications</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode("grid")}
                className={cn(viewMode === "grid" && "bg-primary/10")}
              >
                <Grid className="h-4 w-4" />
                <span className="sr-only">Grid view</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode("list")}
                className={cn(viewMode === "list" && "bg-primary/10")}
              >
                <List className="h-4 w-4" />
                <span className="sr-only">List view</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                    <span className="sr-only">Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Applications</DropdownMenuItem>
                  {statusOptions.map((option) => (
                    <DropdownMenuItem key={option.value} onClick={() => setStatusFilter(option.value)}>
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy("date")
                      setSortOrder("desc")
                    }}
                  >
                    Date (newest first)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy("date")
                      setSortOrder("asc")
                    }}
                  >
                    Date (oldest first)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy("rating")
                      setSortOrder("desc")
                    }}
                  >
                    Rating (highest first)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy("rating")
                      setSortOrder("asc")
                    }}
                  >
                    Rating (lowest first)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy("company")
                      setSortOrder("asc")
                    }}
                  >
                    Company (A-Z)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {showAddForm ? (
            <Card>
              <CardHeader>
                <CardTitle>Add New Application</CardTitle>
                <CardDescription>Keep track of jobs you've applied for outside of this platform.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      placeholder="Enter company name"
                      value={newApplication.companyName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">
                      Position <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="position"
                      name="position"
                      placeholder="Enter job position"
                      value={newApplication.position}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="City, State or Remote"
                      value={newApplication.location}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateApplied">Date Applied</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={date} onSelect={handleDateChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={newApplication.status} onValueChange={handleStatusChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobUrl">Job URL</Label>
                    <Input
                      id="jobUrl"
                      name="jobUrl"
                      placeholder="https://example.com/job"
                      value={newApplication.jobUrl}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>How interested are you in this job? (1-5)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      defaultValue={[newApplication.rating]}
                      max={5}
                      min={1}
                      step={1}
                      onValueChange={handleRatingChange}
                      className="flex-1"
                    />
                    <div className="flex items-center">{getRatingStars(newApplication.rating)}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Add any notes about the application, interviews, etc."
                    value={newApplication.notes}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddApplication}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Application
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <>
              {filteredAndSortedApplications.length === 0 && statusFilter === "all" ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <p className="text-muted-foreground text-center mb-4">
                      You haven't added any job applications yet.
                    </p>
                    <Button onClick={() => setShowAddForm(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add your first application
                    </Button>
                  </CardContent>
                </Card>
              ) : filteredAndSortedApplications.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <p className="text-muted-foreground text-center mb-4">
                      No applications match your current filters.
                    </p>
                    <Button variant="outline" onClick={() => setStatusFilter("all")}>
                      Clear filters
                    </Button>
                  </CardContent>
                </Card>
              ) : viewMode === "grid" ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredAndSortedApplications.map((application) => (
                    <Card key={application.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{application.position}</CardTitle>
                            <CardDescription className="text-sm mt-1">{application.companyName}</CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteApplication(application.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Status</span>
                            {getStatusBadge(application.status)}
                          </div>

                          {application.location && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Location</span>
                              <span className="text-sm">{application.location}</span>
                            </div>
                          )}

                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Applied on</span>
                            <span className="text-sm">{format(application.dateApplied, "MMM d, yyyy")}</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Interest</span>
                            <div className="flex items-center">{getRatingStars(application.rating)}</div>
                          </div>
                        </div>

                        {application.notes && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-1">Notes</h4>
                            <p className="text-sm text-muted-foreground">
                              {application.notes.length > 100
                                ? `${application.notes.substring(0, 100)}...`
                                : application.notes}
                            </p>
                          </div>
                        )}
                      </CardContent>

                      {application.jobUrl && (
                        <CardFooter className="pt-0">
                          <a
                            href={application.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary flex items-center hover:underline"
                          >
                            View job posting
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </CardFooter>
                      )}
                    </Card>
                  ))}

                  {/* Add application card */}
                  <Card
                    className="overflow-hidden border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setShowAddForm(true)}
                  >
                    <div className="py-12 flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Plus className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-muted-foreground font-medium">Add Application</p>
                    </div>
                  </Card>
                </div>
              ) : (
                <div className="space-y-4">
                  <Card>
                    <div className="divide-y">
                      {filteredAndSortedApplications.map((application) => (
                        <div key={application.id} className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex-1">
                            <h3 className="font-medium">{application.position}</h3>
                            <p className="text-sm text-muted-foreground">{application.companyName}</p>
                          </div>

                          <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-center">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(application.status)}
                              <span className="text-sm text-muted-foreground">
                                {format(application.dateApplied, "MMM d, yyyy")}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex">{getRatingStars(application.rating)}</div>
                              <Select
                                value={application.rating.toString()}
                                onValueChange={(value) => handleUpdateRating(application.id, Number.parseInt(value))}
                              >
                                <SelectTrigger className="w-[80px] h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[1, 2, 3, 4, 5].map((rating) => (
                                    <SelectItem key={rating} value={rating.toString()}>
                                      {rating}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center gap-2">
                              {application.jobUrl && (
                                <a
                                  href={application.jobUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary flex items-center hover:underline"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDeleteApplication(application.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add application row */}
                      <div
                        className="p-4 flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setShowAddForm(true)}
                      >
                        <div className="flex items-center gap-2 text-primary">
                          <Plus className="h-5 w-5" />
                          <span>Add Application</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

