import {  Button  } from '@/components/ui-daisy/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui-daisy/dialog"
import { ScrollArea } from "@/components/ui-daisy/scroll-area"

export interface QuestionTemplate {
  id: string
  title: string
  description: string
  difficulty: string
  timeEstimate: number
}

interface QuestionTemplateSelectorProps {
  onSelect: (template: QuestionTemplate) => void
}

const templates: QuestionTemplate[] = [
  {
    id: "t1",
    title: "Basic React Component",
    description: "Create a simple React component with props and state",
    difficulty: "easy",
    timeEstimate: 15
  },
  {
    id: "t2",
    title: "API Integration",
    description: "Implement data fetching from a REST API",
    difficulty: "medium",
    timeEstimate: 30
  },
  {
    id: "t3",
    title: "State Management",
    description: "Implement complex state management using Redux",
    difficulty: "hard",
    timeEstimate: 45
  }
]

export function QuestionTemplateSelector({ onSelect }: QuestionTemplateSelectorProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Use Template</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Question Templates</DialogTitle>
          <DialogDescription>
            Choose a template to quickly add a pre-configured question.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onSelect(template)}
              >
                <h4 className="font-medium">{template.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div>
                    Difficulty: {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
                  </div>
                  <div>Time: {template.timeEstimate} min</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" type="button">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 