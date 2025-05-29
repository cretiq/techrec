import {  Card, CardContent, CardHeader, CardTitle, CardDescription  } from '@/components/ui-daisy/card'
import { ReactNode } from "react"

interface FormCardProps {
  title: string
  description?: string
  children: ReactNode
}

export function FormCard({ title, description, children }: FormCardProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 animate-fade-in-up">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
} 