"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search, MapPin, Briefcase, Clock, Building, ArrowRight, X, Code, BarChart, Bookmark, BookmarkCheck, Send } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useSession } from 'next-auth/react'

interface Role {
  _id: string
  title: string
  description: string
  skills: string[]
  company: {
    _id: string
    name: string
  }
  status: string
}

interface SavedRole {
  roleId: string
  savedAt: Date
}

export default function RolesPage() {
  const { data: session, status } = useSession()
  const [roles, setRoles] = useState<Role[]>([])
  const [savedRoles, setSavedRoles] = useState<SavedRole[]>([])
  const [loading, setLoading] = useState(true)
  const [savedRolesLoading, setSavedRolesLoading] = useState(false)
  const [savedRolesError, setSavedRolesError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedJobType, setSelectedJobType] = useState("all")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [minMatchPercentage, setMinMatchPercentage] = useState(0)
  const [activeFilters, setActiveFilters] = useState(0)

  // Extract unique locations, job types, and skills for filters
  const locations = Array.from(new Set(roles.map((role) => role.company.name)))
  const jobTypes = Array.from(new Set(roles.map((role) => role.status)))
  const allSkills = Array.from(new Set(roles.flatMap((role) => role.skills)))

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    const fetchRoles = async () => {
      try {
        const response = await fetch('/api/roles')
        const data = await response.json()
        setRoles(data)
      } catch (error) {
        console.error('Error fetching roles:', error)
        toast({
          title: 'Error',
          description: 'Failed to load roles',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    const fetchSavedRoles = async () => {
      try {
        setSavedRolesLoading(true)
        setSavedRolesError(null)
        const response = await fetch('/api/developers/me/saved-roles')
        if (!response.ok) {
          throw new Error('Failed to fetch saved roles')
        }
        const data = await response.json()
        // Convert the array of role IDs to SavedRole objects
        const savedRolesData = data.map((roleId: string) => ({
          roleId,
          savedAt: new Date()
        }))
        setSavedRoles(savedRolesData)
      } catch (error) {
        console.error('Error fetching saved roles:', error)
        setSavedRolesError('Failed to load saved roles')
        toast({
          title: 'Error',
          description: 'Failed to load saved roles',
          variant: 'destructive',
        })
      } finally {
        setSavedRolesLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchRoles()
      fetchSavedRoles()
    }
  }, [status, router, toast])

  // Filter roles based on search and filters
  const filteredRoles = roles.filter((role) => {
    // Search term filter
    const matchesSearch =
      searchTerm === "" ||
      role.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))

    // Location filter
    const matchesLocation = selectedLocation === "all" || role.company.name.includes(selectedLocation)

    // Job type filter
    const matchesJobType = selectedJobType === "all" || role.status === selectedJobType

    // Skills filter
    const matchesSkills = selectedSkills.length === 0 || selectedSkills.every((skill) => role.skills.includes(skill))

    // Match percentage filter
    const matchesPercentage = role.skills.length >= minMatchPercentage

    return matchesSearch && matchesLocation && matchesJobType && matchesSkills && matchesPercentage
  })

  // Update active filters count
  React.useEffect(() => {
    let count = 0
    if (selectedLocation !== "all") count++
    if (selectedJobType !== "all") count++
    if (selectedSkills.length > 0) count++
    if (minMatchPercentage > 0) count++
    setActiveFilters(count)
  }, [selectedLocation, selectedJobType, selectedSkills, minMatchPercentage])

  // Clear all filters
  const clearFilters = () => {
    setSelectedLocation("all")
    setSelectedJobType("all")
    setSelectedSkills([])
    setMinMatchPercentage(0)
  }

  // Toggle skill selection
  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]))
  }

  const handleSaveRole = async (roleId: string) => {
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    try {
      const isSaved = savedRoles.some(role => role.roleId === roleId)
      const response = await fetch(`/api/roles/${roleId}/save`, {
        method: isSaved ? 'DELETE' : 'POST',
      })

      if (response.ok) {
        if (isSaved) {
          setSavedRoles(savedRoles.filter(role => role.roleId !== roleId))
          toast({
            title: 'Success',
            description: 'Role removed from saved roles',
          })
        } else {
          setSavedRoles([...savedRoles, { roleId, savedAt: new Date() }])
          toast({
            title: 'Success',
            description: 'Role saved successfully',
          })
        }
      }
    } catch (error) {
      console.error('Error saving role:', error)
      toast({
        title: 'Error',
        description: 'Failed to save role',
        variant: 'destructive',
      })
    }
  }

  const handleApply = (roleId: string) => {
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }
    router.push(`/developer/roles/${roleId}/apply`)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Section */}
        <div className="w-full lg:w-1/4 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Location Filter */}
              <div>
                <Label>Location</Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Job Type Filter */}
              <div>
                <Label>Job Type</Label>
                <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {jobTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Skills Filter */}
              <div>
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {allSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant={selectedSkills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Match Percentage Slider */}
              <div>
                <Label>Minimum Match Percentage</Label>
                <Slider
                  value={[minMatchPercentage]}
                  onValueChange={([value]) => setMinMatchPercentage(value)}
                  min={0}
                  max={100}
                  step={10}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {minMatchPercentage}% match
                </p>
              </div>

              {/* Clear Filters Button */}
              {activeFilters > 0 && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear Filters ({activeFilters})
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="w-full lg:w-3/4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRoles.map((role) => (
              <Card key={role._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{role.title}</CardTitle>
                      <CardDescription className="mt-2">{role.company.name}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSaveRole(role._id)}
                      className="hover:bg-transparent"
                      disabled={savedRolesLoading}
                    >
                      {savedRolesLoading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ) : savedRoles.some(saved => saved.roleId === role._id) ? (
                        <BookmarkCheck className="h-5 w-5 text-primary" />
                      ) : (
                        <Bookmark className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{role.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {role.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant={role.status === 'open' ? 'default' : 'secondary'}>
                      {role.status}
                    </Badge>
                    <Button
                      onClick={() => handleApply(role._id)}
                      disabled={role.status !== 'open'}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

