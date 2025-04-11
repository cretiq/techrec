"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism"
import type { Components } from "react-markdown"

interface ReadmePreviewProps {
  content: string
  onEdit?: () => void
  onSave?: () => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

interface CodeProps {
  node?: any
  inline?: boolean
  className?: string
  children?: React.ReactNode
  [key: string]: any
}

export function ReadmePreview({ content, onEdit, onSave, isOpen, onOpenChange }: ReadmePreviewProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "markdown">("preview")

  const components: Components = {
    code({ node, inline, className, children, ...props }: CodeProps) {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus as unknown as Record<string, React.CSSProperties>}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>README Preview</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end space-x-2 mb-4">
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              Edit
            </Button>
          )}
          {onSave && (
            <Button onClick={onSave}>
              Save Changes
            </Button>
          )}
        </div>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "preview" | "markdown")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="prose dark:prose-invert max-w-none">
            <ReactMarkdown components={components}>
              {content}
            </ReactMarkdown>
          </TabsContent>
          <TabsContent value="markdown">
            <div className="bg-muted p-4 rounded-md">
              <pre className="whitespace-pre-wrap break-words">
                {content}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 