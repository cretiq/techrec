import { ComponentShowcase } from "@/components/ui-components"

export default function ComponentShowcasePage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2">UI Component Showcase</h1>
      <p className="text-gray-500 mb-8">
        A comprehensive collection of UI components for the technical assessment platform.
      </p>

      <ComponentShowcase />
    </div>
  )
}

