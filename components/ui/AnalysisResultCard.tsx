import React from 'react';
import {  Card, CardContent, CardHeader, CardTitle  } from '@/components/ui-daisy/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {  Button  } from '@/components/ui-daisy/button'
import { ChevronsUpDown } from "lucide-react"

export interface AnalysisResultCardProps {
  title: string;
  score?: number; // Optional score display
  category?: string; // Optional category badge/tag
  children?: React.ReactNode; // Main content when expanded
  summary?: React.ReactNode; // Content to show when collapsed
}

export const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({
  title,
  score,
  category,
  children,
  summary
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full space-y-2"
    >
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          {/* Placeholder for score/category indicators */}
          <div className="flex items-center space-x-2">
            {category && <span className="text-xs text-muted-foreground dark:text-gray-400">{category}</span>}
            {score !== undefined && (
              <span className="text-sm font-semibold">{score}/100</span>
            )}
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                <ChevronsUpDown className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CardContent>
          {!isOpen && (summary || <p className="text-sm text-muted-foreground dark:text-gray-400">Click to expand for details.</p>)}
          <CollapsibleContent>
            {children || <p className="text-sm text-muted-foreground dark:text-gray-400">No detailed content available.</p>}
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
}; 