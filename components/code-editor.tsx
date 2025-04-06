"use client"

import { useState, useRef } from "react"
import { Editor } from "@monaco-editor/react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, XCircle, CheckCircle, Save, RefreshCw, Code, FileText } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CodeEditorProps {
  initialCode?: string
  language?: string
  theme?: string
  height?: string
  tests?: { name: string; test: string; description: string }[]
  onSave?: (code: string, results: TestResult[]) => void
  readOnly?: boolean
}

export interface TestResult {
  name: string
  passed: boolean
  message?: string
  executionTime?: number
}

export function CodeEditor({
  initialCode = "// Write your code here",
  language = "javascript",
  theme = "vs-dark",
  height = "400px",
  tests = [],
  onSave,
  readOnly = false,
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode)
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("editor")
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor
  }

  const runTests = async () => {
    setIsRunning(true)
    setConsoleOutput([])
    setTestResults([])

    // Clear previous results
    const newResults: TestResult[] = []
    const newConsoleOutput: string[] = []

    try {
      // Create a sandbox to run the code safely
      const sandbox = createSandbox(code, newConsoleOutput)

      // Run each test
      for (const test of tests) {
        const startTime = performance.now()
        try {
          // Execute the test
          const result = await sandbox.runTest(test.test)
          const endTime = performance.now()

          newResults.push({
            name: test.name,
            passed: result === true,
            message: typeof result === "string" ? result : result === true ? "Test passed" : "Test failed",
            executionTime: Math.round(endTime - startTime),
          })
        } catch (error) {
          newResults.push({
            name: test.name,
            passed: false,
            message: error instanceof Error ? error.message : String(error),
          })
        }
      }
    } catch (error) {
      newConsoleOutput.push(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }

    setTestResults(newResults)
    setConsoleOutput(newConsoleOutput)
    setIsRunning(false)

    // Auto-switch to results tab if there are results
    if (newResults.length > 0 || newConsoleOutput.length > 0) {
      setActiveTab("results")
    }
  }

  // Create a sandbox to run code safely
  const createSandbox = (userCode: string, consoleOutput: string[]) => {
    // In a real implementation, this would use a secure sandbox
    // This is a simplified version for demonstration
    return {
      runTest: async (testCode: string) => {
        try {
          // Mock implementation - in a real app, this would run in a worker or backend
          const consoleLogs: string[] = []
          const mockConsole = {
            log: (...args: any[]) => {
              const logMessage = args
                .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
                .join(" ")
              consoleLogs.push(logMessage)
              consoleOutput.push(logMessage)
            },
            error: (...args: any[]) => {
              const errorMessage = `ERROR: ${args.map((arg) => String(arg)).join(" ")}`
              consoleLogs.push(errorMessage)
              consoleOutput.push(errorMessage)
            },
          }

          // Create a function from user code and test code
          // This is unsafe for production! Real implementation should use a sandboxed environment
          const combinedCode = `
            ${userCode}
            
            // Test code
            (() => {
              const console = {
                log: ${mockConsole.log.toString()},
                error: ${mockConsole.error.toString()}
              };
              
              try {
                ${testCode}
                return true;
              } catch (error) {
                return error.message;
              }
            })()
          `

          // Execute the combined code
          // eslint-disable-next-line no-new-func
          const result = new Function(combinedCode)()
          return result
        } catch (error) {
          return error instanceof Error ? error.message : String(error)
        }
      },
    }
  }

  const handleSave = () => {
    if (onSave) {
      onSave(code, testResults)
    }
  }

  const passedTests = testResults.filter((result) => result.passed).length
  const totalTests = testResults.length
  const allTestsPassed = totalTests > 0 && passedTests === totalTests

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <CardTitle>{language.charAt(0).toUpperCase() + language.slice(1)} Code Editor</CardTitle>
          </div>
          <Badge variant="outline" className="bg-primary/10">
            {readOnly ? "Read Only" : "Editable"}
          </Badge>
        </div>
      </CardHeader>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-6">
          <TabsList className="w-full grid grid-cols-2 mb-2">
            <TabsTrigger value="editor">
              <FileText className="h-4 w-4 mr-2" />
              Code Editor
            </TabsTrigger>
            <TabsTrigger value="results">
              <div className="flex items-center">
                <Play className="h-4 w-4 mr-2" />
                Results
                {testResults.length > 0 && (
                  <Badge className="ml-2" variant={allTestsPassed ? "default" : "destructive"}>
                    {passedTests}/{totalTests}
                  </Badge>
                )}
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="editor" className="mt-0">
          <div className="border-t">
            <Editor
              height={height}
              defaultLanguage={language}
              defaultValue={initialCode}
              theme={theme}
              onChange={(value) => setCode(value || "")}
              onMount={handleEditorDidMount}
              options={{
                readOnly,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                fontSize: 14,
                automaticLayout: true,
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="results" className="mt-0">
          <div className="border-t p-4">
            <div className="space-y-4">
              {testResults.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Test Results</h3>
                  <div className="space-y-2">
                    {testResults.map((result, index) => (
                      <Collapsible key={index} className="border rounded-md">
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-sm">
                          <div className="flex items-center gap-2">
                            {result.passed ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span>{result.name}</span>
                            {result.executionTime && (
                              <Badge variant="outline" className="text-xs ml-2">
                                {result.executionTime}ms
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">Click to expand</div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="p-3 pt-0 text-sm border-t bg-muted/50">
                            <p className="font-mono whitespace-pre-wrap">{result.message}</p>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </div>
              )}

              {consoleOutput.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Console Output</h3>
                  <ScrollArea className="h-[200px] border rounded-md bg-black p-3">
                    <pre className="font-mono text-xs text-white whitespace-pre-wrap">
                      {consoleOutput.map((line, i) => (
                        <div key={i}>{`> ${line}`}</div>
                      ))}
                    </pre>
                  </ScrollArea>
                </div>
              )}

              {testResults.length === 0 && consoleOutput.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <Play className="h-10 w-10 mb-2 opacity-20" />
                  <p>Run tests to see results here</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <CardFooter className="flex justify-between border-t p-4">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCode(initialCode)}>
            Reset Code
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={runTests} disabled={isRunning || readOnly} className="gap-2">
            {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run Tests
          </Button>
          <Button onClick={handleSave} disabled={isRunning || readOnly} className="gap-2">
            <Save className="h-4 w-4" />
            Save Solution
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

