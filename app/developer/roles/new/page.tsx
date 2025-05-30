"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {  Input  } from '@/components/ui-daisy/input'
import { Textarea } from "@/components/ui-daisy/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Plus, X } from "lucide-react"
import { PageHeader } from "@/components/page/page-header"
import { FormCard } from "@/components/page/form-card"
import { FormField } from "@/components/page/form-field"
import { FormActions } from "@/components/page/form-actions"
import {  Select, SelectContent, SelectItem, SelectTrigger, SelectValue  } from '@/components/ui-daisy/select'

export default function NewRolePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: [""],
    location: "",
    salary: "",
    type: "FULL_TIME",
    remote: false,
    visaSponsorship: false
  })

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...formData.requirements]
    newRequirements[index] = value
    setFormData(prev => ({ ...prev, requirements: newRequirements }))
  }

  const addRequirement = () => {
    setFormData(prev => ({ ...prev, requirements: [...prev.requirements, ""] }))
  }

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/custom-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          requirements: formData.requirements.filter(req => req.trim() !== '')
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create custom role')
      }

      toast({
        title: 'Success',
        description: 'Custom role created successfully',
      })

      router.push('/developer/roles')
    } catch (error) {
      console.error('Error creating custom role:', error)
      toast({
        title: 'Error',
        description: 'Failed to create custom role',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <PageHeader 
        title="Create New Role"
        description="Fill in the details to create a new role"
      />

      <FormCard title="Role Details" description="Enter the role information below">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Title">
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter role title"
              required
              className="bg-white/50 dark:bg-gray-800/50"
            />
          </FormField>

          <FormField label="Description">
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter role description"
              required
              className="bg-white/50 dark:bg-gray-800/50"
            />
          </FormField>

          <FormField label="Requirements">
            <div className="space-y-2">
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={req}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    placeholder={`Requirement ${index + 1}`}
                    className="bg-white/50 dark:bg-gray-800/50"
                  />
                  {formData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="p-2 hover:bg-primary/10 rounded-md"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addRequirement}
                className="w-full p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-md flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Requirement
              </button>
            </div>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Location">
              <Input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter location"
                required
                className="bg-white/50 dark:bg-gray-800/50"
              />
            </FormField>

            <FormField label="Salary">
              <Input
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                placeholder="Enter salary range"
                required
                className="bg-white/50 dark:bg-gray-800/50"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Job Type">
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="bg-white/50 dark:bg-gray-800/50">
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_TIME">Full Time</SelectItem>
                  <SelectItem value="PART_TIME">Part Time</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                  <SelectItem value="INTERNSHIP">Internship</SelectItem>
                  <SelectItem value="FREELANCE">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remote"
                name="remote"
                checked={formData.remote}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="remote" className="text-sm font-medium">
                Remote Work Available
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="visaSponsorship"
                name="visaSponsorship"
                checked={formData.visaSponsorship}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="visaSponsorship" className="text-sm font-medium">
                Visa Sponsorship Available
              </label>
            </div>
          </div>

          <FormActions
            isLoading={loading}
            onCancel={() => router.back()}
            submitLabel="Create Role"
          />
        </form>
      </FormCard>
    </div>
  )
} 