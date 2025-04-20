"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Calendar,
  Clock,
  Users,
  Edit,
  Copy,
  Trash2,
  Eye,
  FileCheck,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// Mock roles data
const rolesData = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    status: "active",
    createdAt: "2025-03-15",
    applicants: 24,
    views: 156,
    deadline: "2025-04-15",
    location: "San Francisco, CA (Remote)",
    type: "Full-time",
    salary: "$120,000 - $150,000",
    skills: ["React", "TypeScript", "CSS", "Next.js", "Redux"],
    requiresTechnicalAssessment: true,
    technicalAssessment: {
      id: "1",
      title: "Frontend Developer Technical Assessment",
    },
  },
  {
    id: "2",
    title: "Backend Engineer",
    status: "active",
    createdAt: "2025-03-10",
    applicants: 16,
    views: 98,
    deadline: "2025-04-10",
    location: "New York, NY (Hybrid)",
    type: "Full-time",
    salary: "$130,000 - $160,000",
    skills: ["Node.js", "Express", "MongoDB", "AWS", "Docker"],
    requiresTechnicalAssessment: true,
    technicalAssessment: {
      id: "2",
      title: "Backend Node.js Assessment",
    },
  },
  {
    id: "3",
    title: "Full Stack Developer",
    status: "draft",
    createdAt: "2025-03-05",
    applicants: 0,
    views: 0,
    deadline: "2025-04-05",
    location: "Austin, TX (On-site)",
    type: "Full-time",
    salary: "$110,000 - $140,000",
    skills: ["React", "Node.js", "PostgreSQL", "TypeScript", "GraphQL"],
    requiresTechnicalAssessment: false,
    technicalAssessment: null,
  },
  {
    id: "4",
    title: "DevOps Engineer",
    status: "closed",
    createdAt: "2025-02-28",
    applicants: 10,
    views: 87,
    deadline: "2025-03-28",
    location: "Remote",
    type: "Full-time",
    salary: "$125,000 - $155,000",
    skills: ["AWS", "Kubernetes", "Docker", "CI/CD", "Terraform"],
    requiresTechnicalAssessment: true,
    technicalAssessment: {
      id: "4",
      title: "DevOps Engineering Test",
    },
  },
  {
    id: "5",
    title: "Mobile Developer",
    status: "active",
    createdAt: "2025-02-20",
    applicants: 8,
    views: 64,
    deadline: "2025-04-20",
    location: "Seattle, WA (Hybrid)",
    type: "Full-time",
    salary: "$115,000 - $145,000",
    skills: ["React Native", "JavaScript", "iOS", "Android", "Redux"],
    requiresTechnicalAssessment: {
      id: "5",
      title: "Mobile Development Assessment",
    },
  },
]

export default function CompanyRolesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Filter roles based on tab and search
  const filteredRoles = rolesData.filter((role) => {
    // Filter by tab
    if (activeTab !== "all" && role.status !== activeTab) {
      return false
    }

    // Filter by search term
    if (
      searchTerm &&
      !role.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !role.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    ) {
      return false
    }

    return true
  })

  // Get counts for each status
  const counts = {
    all: rolesData.length,
    active: rolesData.filter((r) => r.status === "active").length,
    draft: rolesData.filter((r) => r.status === "draft").length,
    closed: rolesData.filter((r) => r.status === "closed").length,
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Handle role deletion
  const handleDeleteRole = (roleId) => {
    toast({
      title: "Role deleted",
      description: "The role has been deleted successfully.",
    })
  }

  // Handle role duplication
  const handleDuplicateRole = (roleId) => {
    toast({
      title: "Role duplicated",
      description: "The role has been duplicated successfully.",
    })
  }

  // Handle role status change
  const handleChangeStatus = (roleId, newStatus) => {
    toast({
      title: "Status updated",
      description: `The role status has been updated to ${newStatus}.`,
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="w-full flex justify-center">
        <div className="container max-w-6xl py-6 md:py-10 px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Manage Roles</h1>
              <p className="text-muted-foreground">Create and manage job roles for your company</p>
            </div>
            <Button className="gap-1" onClick={() => router.push("/company/roles/new")}>
              <Plus className="h-4 w-4" />
              Create New Role
            </Button>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search roles..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                <Select defaultValue="newest">
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="applicants">Most Applicants</SelectItem>
                    <SelectItem value="views">Most Views</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="flex gap-2 items-center">
                  All Roles
                  <Badge variant="secondary" className="ml-1">
                    {counts.all}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="active" className="flex gap-2 items-center">
                  Active
                  <Badge variant="secondary" className="ml-1">
                    {counts.active}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="draft" className="flex gap-2 items-center">
                  Drafts
                  <Badge variant="secondary" className="ml-1">
                    {counts.draft}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="closed" className="flex gap-2 items-center">
                  Closed
                  <Badge variant="secondary" className="ml-1">
                    {counts.closed}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                <Card>
                  <CardHeader className="px-6 py-4">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl">
                        {activeTab === "all"
                          ? "All Roles"
                          : activeTab === "active"
                            ? "Active Roles"
                            : activeTab === "draft"
                              ? "Draft Roles"
                              : "Closed Roles"}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground">
                        Showing {filteredRoles.length} {filteredRoles.length === 1 ? "role" : "roles"}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-6">
                    {filteredRoles.length > 0 ? (
                      <div className="rounded-md border">
                        <div className="grid grid-cols-8 gap-4 p-4 bg-muted/50 text-sm font-medium">
                          <div className="col-span-2">Role</div>
                          <div className="col-span-1">Status</div>
                          <div className="col-span-1">Created</div>
                          <div className="col-span-1">Applicants</div>
                          <div className="col-span-1">Views</div>
                          <div className="col-span-1">Deadline</div>
                          <div className="col-span-1 text-right">Actions</div>
                        </div>

                        {filteredRoles.map((role) => (
                          <div
                            key={role.id}
                            className="grid grid-cols-8 gap-4 p-4 border-t items-center list-item-hover"
                          >
                            <div className="col-span-2">
                              <div className="font-medium">{role.title}</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {role.skills.slice(0, 3).map((skill, i) => (
                                  <Badge key={i} variant="outline" className="text-xs bg-primary/5">
                                    {skill}
                                  </Badge>
                                ))}
                                {role.skills.length > 3 && (
                                  <Badge variant="outline" className="text-xs bg-primary/5">
                                    +{role.skills.length - 3} more
                                  </Badge>
                                )}
                              </div>
                              {role.requiresTechnicalAssessment && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                                  <FileCheck className="h-3 w-3" />
                                  <span>Assessment required</span>
                                </div>
                              )}
                            </div>
                            <div className="col-span-1">
                              <Badge
                                className={
                                  role.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : role.status === "draft"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-gray-100 text-gray-800"
                                }
                              >
                                {role.status === "active" ? "Active" : role.status === "draft" ? "Draft" : "Closed"}
                              </Badge>
                            </div>
                            <div className="col-span-1 flex items-center gap-1 text-sm">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{formatDate(role.createdAt)}</span>
                            </div>
                            <div className="col-span-1 text-sm">
                              <div className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{role.applicants}</span>
                              </div>
                            </div>
                            <div className="col-span-1 text-sm">
                              <div className="flex items-center gap-1">
                                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{role.views}</span>
                              </div>
                            </div>
                            <div className="col-span-1 flex items-center gap-1 text-sm">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{formatDate(role.deadline)}</span>
                            </div>
                            <div className="col-span-1 flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => router.push(`/company/roles/${role.id}`)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Role
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => router.push(`/company/roles/${role.id}/edit`)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Role
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDuplicateRole(role.id)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {role.status === "active" && (
                                    <DropdownMenuItem onClick={() => handleChangeStatus(role.id, "closed")}>
                                      <Clock className="h-4 w-4 mr-2" />
                                      Close Role
                                    </DropdownMenuItem>
                                  )}
                                  {role.status === "draft" && (
                                    <DropdownMenuItem onClick={() => handleChangeStatus(role.id, "active")}>
                                      <Clock className="h-4 w-4 mr-2" />
                                      Publish Role
                                    </DropdownMenuItem>
                                  )}
                                  {role.status === "closed" && (
                                    <DropdownMenuItem onClick={() => handleChangeStatus(role.id, "active")}>
                                      <Clock className="h-4 w-4 mr-2" />
                                      Reopen Role
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteRole(role.id)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Role
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No roles found</h3>
                        <p className="text-muted-foreground mb-4 max-w-md">
                          {activeTab === "all"
                            ? "You haven't created any roles yet. Create your first role to start attracting candidates."
                            : `You don't have any ${activeTab} roles.`}
                        </p>
                        <Button onClick={() => router.push("/company/roles/new")}>Create New Role</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

