import type { ReactNode } from "react"

interface DashboardWrapperProps {
  children: ReactNode
  heading?: string
  action?: ReactNode
}

export function DashboardWrapper({ children, heading, action }: DashboardWrapperProps) {
  return (
    <div className="md:pl-64 w-full">
      <div className="container py-6 md:py-10 px-4 md:px-6">
        {(heading || action) && (
          <div className="flex items-center justify-between mb-8">
            {heading && <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>}
            {action && <div>{action}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

