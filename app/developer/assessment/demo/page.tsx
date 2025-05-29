"use client"

import { useState } from "react"
import Link from "next/link"
import {  Button  } from '@/components/ui-daisy/button'
import {  Card, CardContent, CardDescription, CardHeader, CardTitle  } from '@/components/ui-daisy/card'
import { FileText, ArrowLeft } from "lucide-react"
import { CodeEditor } from "@/components/code-editor"
import { useToast } from "@/hooks/use-toast"

export default function CodeEditorDemoPage() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const initialCode = `function fibonacci(n) {
  // Write a function that returns the nth number in the Fibonacci sequence
  // The Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, 13, 21, ...
  
  // Your code here
}`

  const tests = [
    {
      name: "Basic test cases",
      test: `
if (fibonacci(0) !== 0) throw new Error("fibonacci(0) should return 0");
if (fibonacci(1) !== 1) throw new Error("fibonacci(1) should return 1");
if (fibonacci(2) !== 1) throw new Error("fibonacci(2) should return 1");
if (fibonacci(3) !== 2) throw new Error("fibonacci(3) should return 2");
if (fibonacci(10) !== 55) throw new Error("fibonacci(10) should return 55");
      `,
      description: "Tests basic Fibonacci sequence values",
    },
    {
      name: "Edge cases",
      test: `
try {
  fibonacci(-1);
  throw new Error("Should throw an error for negative numbers");
} catch (e) {
  // Expected error
}
      `,
      description: "Tests handling of invalid inputs",
    },
  ]

  const handleSave = (code, results) => {
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Solution saved",
        description: "Your code has been saved successfully",
      })
      setIsSaving(false)
    }, 1000)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <FileText className="h-6 w-6" />
            <span>DevAssess</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6 md:py-10 px-4 md:px-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Code Editor Demo</h1>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Fibonacci Sequence Challenge</CardTitle>
              <CardDescription>
                Implement a function that returns the nth number in the Fibonacci sequence.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-gray-500">
                    The Fibonacci sequence is a series of numbers where each number is the sum of the two preceding
                    ones, usually starting with 0 and 1. Your task is to write a function that returns the nth number in
                    this sequence.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Examples</h3>
                  <div className="bg-gray-50 p-4 rounded-md font-mono text-sm">
                    <pre>{`fibonacci(0) → 0
fibonacci(1) → 1
fibonacci(2) → 1
fibonacci(3) → 2
fibonacci(4) → 3
fibonacci(5) → 5
fibonacci(10) → 55`}</pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <CodeEditor initialCode={initialCode} language="javascript" tests={tests} onSave={handleSave} />
        </div>
      </main>
    </div>
  )
}

