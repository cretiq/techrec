"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

// Define template categories and templates
const TEMPLATE_CATEGORIES = [
  { id: "all", name: "All Templates" },
  { id: "algorithms", name: "Algorithms" },
  { id: "frontend", name: "Frontend" },
  { id: "backend", name: "Backend" },
  { id: "database", name: "Database" },
  { id: "system-design", name: "System Design" },
]

// Template interface
interface QuestionTemplate {
  id: string
  title: string
  description: string
  category: string
  difficulty: "easy" | "intermediate" | "hard"
  timeEstimate: number
  popularity: number
}

// Sample templates
const QUESTION_TEMPLATES: QuestionTemplate[] = [
  {
    id: "algo-1",
    title: "Implement a Binary Search Algorithm",
    description:
      "Write a function that performs a binary search on a sorted array to find a target value. Return the index of the target or -1 if not found.",
    category: "algorithms",
    difficulty: "intermediate",
    timeEstimate: 20,
    popularity: 95,
  },
  {
    id: "algo-2",
    title: "Reverse a Linked List",
    description:
      "Implement a function to reverse a singly linked list. The function should take the head of a linked list as input and return the new head of the reversed list.",
    category: "algorithms",
    difficulty: "intermediate",
    timeEstimate: 15,
    popularity: 98,
  },
  {
    id: "algo-3",
    title: "Two Sum Problem",
    description:
      "Given an array of integers and a target sum, return the indices of two numbers that add up to the target.",
    category: "algorithms",
    difficulty: "easy",
    timeEstimate: 10,
    popularity: 100,
  },
  {
    id: "frontend-1",
    title: "Build a Responsive Navigation Component",
    description:
      "Create a responsive navigation bar that collapses into a hamburger menu on mobile devices. Implement smooth transitions for the mobile menu.",
    category: "frontend",
    difficulty: "intermediate",
    timeEstimate: 30,
    popularity: 92,
  },
  {
    id: "frontend-2",
    title: "Implement an Infinite Scroll",
    description:
      "Create a component that loads more content when the user scrolls to the bottom of the page. Use a mock API for data fetching.",
    category: "frontend",
    difficulty: "intermediate",
    timeEstimate: 25,
    popularity: 88,
  },
  {
    id: "backend-1",
    title: "RESTful API Endpoint Implementation",
    description:
      "Design and implement a RESTful API endpoint that handles CRUD operations for a resource of your choice. Include proper error handling and validation.",
    category: "backend",
    difficulty: "intermediate",
    timeEstimate: 35,
    popularity: 90,
  },
  {
    id: "database-1",
    title: "Optimize a SQL Query",
    description:
      "Given a slow SQL query, optimize it to improve performance. Explain your optimization strategy and why it works.",
    category: "database",
    difficulty: "hard",
    timeEstimate: 25,
    popularity: 85,
  },
  {
    id: "system-design-1",
    title: "Design a URL Shortener Service",
    description:
      "Design a URL shortening service like bit.ly. Discuss the system architecture, database schema, and potential scaling issues.",
    category: "system-design",
    difficulty: "hard",
    timeEstimate: 45,
    popularity: 93,
  },
]

interface QuestionTemplateSelectorProps {
  onSelectTemplate: (template: QuestionTemplate) => void
}

export function QuestionTemplateSelector({ onSelectTemplate }: QuestionTemplateSelectorProps) {
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [open, setOpen] = useState(false)

  // Filter templates based on active category and search query
  const filteredTemplates = QUESTION_TEMPLATES.filter((template) => {
    const matchesCategory = activeCategory === "all" || template.category === activeCategory
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleSelectTemplate = (template: QuestionTemplate) => {
    onSelectTemplate(template)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Choose from Templates</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Question Templates</DialogTitle>
          <DialogDescription>
            Choose a template to quickly add a pre-defined question to your assessment.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center border rounded-md px-3 py-2 mb-4">
          <Search className="h-4 w-4 text-muted-foreground mr-2" />
          <Input
            placeholder="Search templates..."
            className="border-0 p-0 shadow-none focus-visible:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="mb-4 flex flex-wrap h-auto">
            {TEMPLATE_CATEGORIES.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="animate-fade-in">
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-list">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="hover-lift cursor-pointer"
                onClick={() => handleSelectTemplate(template)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{template.title}</CardTitle>
                    <Badge
                      variant={
                        template.difficulty === "easy"
                          ? "outline"
                          : template.difficulty === "intermediate"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {template.difficulty}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                </CardHeader>
                <CardFooter className="pt-2 flex justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span>~{template.timeEstimate} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Popularity:</span>
                    <span className="font-medium">{template.popularity}%</span>
                  </div>
                </CardFooter>
              </Card>
            ))}

            {filteredTemplates.length === 0 && (
              <div className="col-span-2 py-12 text-center text-muted-foreground">
                <p>No templates found matching your criteria.</p>
              </div>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

