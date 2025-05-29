"use client"

import { CoverLetterCreator } from "../developer/writing-help/components/cover-letter-creator"
import { Role } from "@/types/role"

// Mock role data for demo
const mockRole: Role = {
  id: "demo-role-1",
  title: "Senior Full Stack Developer",
  description: "We are looking for an experienced Full Stack Developer to join our growing team. You'll work on cutting-edge AI products and help shape the future of our platform.",
  requirements: [
    "5+ years of experience with React and Node.js",
    "Strong TypeScript skills",
    "Experience with cloud platforms (AWS/GCP)",
    "Excellent problem-solving abilities"
  ],
  skills: [
    { id: "1", name: "React", type: "technical" },
    { id: "2", name: "Node.js", type: "technical" },
    { id: "3", name: "TypeScript", type: "technical" },
    { id: "4", name: "AWS", type: "technical" }
  ],
  company: {
    id: "demo-company",
    name: "TechCorp AI",
    logo: "/placeholder-logo.png",
    description: "Leading AI innovation company"
  },
  location: "San Francisco, CA",
  remote: true,
  salary: {
    min: 150000,
    max: 200000,
    currency: "USD"
  },
  benefits: ["Health Insurance", "401k", "Remote Work", "Stock Options"],
  postedDate: new Date().toISOString(),
  applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  status: "active",
  applicants: 42,
  views: 156,
  source: "Company Website",
  externalUrl: "https://techcorp.ai/careers",
  type: "full-time",
  experienceLevel: "senior",
  customRoleId: null,
  questions: []
}

export default function DemoCoverLetterPage() {
  return (
    <div className="container max-w-7xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cover Letter Creator Demo</h1>
        <p className="text-muted-foreground">
          This is a demo of the AI-powered cover letter creator component
        </p>
      </div>
      
      <CoverLetterCreator role={mockRole} />
    </div>
  )
}