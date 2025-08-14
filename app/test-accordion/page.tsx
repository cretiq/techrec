"use client"

import React, { useState } from 'react'
import { DaisyAccordion, DaisyAccordionItem, DaisyAccordionTrigger, DaisyAccordionContent } from '@/components/ui-daisy/accordion-daisyui'
import { Badge } from '@/components/ui-daisy/badge'

export default function TestAccordionPage() {
  const [singleValue, setSingleValue] = useState("")
  const [multipleValue, setMultipleValue] = useState<string[]>([])

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">DaisyUI Accordion Test</h1>

      {/* Single Accordion */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Single Accordion (DaisyUI-based)</h2>
        <DaisyAccordion 
          type="single" 
          value={singleValue} 
          onValueChange={(value) => setSingleValue(value as string)}
        >
          <DaisyAccordionItem 
            value="item1" 
            variant="default"
          >
            <DaisyAccordionTrigger>
              <div className="flex items-center justify-between w-full">
                <span>Default Variant with Arrow Icon</span>
                <Badge variant="outline" size="sm">Default</Badge>
              </div>
            </DaisyAccordionTrigger>
            <DaisyAccordionContent>
              <p>This is the content for the default variant accordion item. It uses DaisyUI's built-in collapse classes with arrow icon.</p>
            </DaisyAccordionContent>
          </DaisyAccordionItem>

          <DaisyAccordionItem 
            value="item2" 
            variant="filters"
          >
            <DaisyAccordionTrigger>
              <div className="flex items-center justify-between w-full">
                <span>Filters Variant for Settings</span>
                <Badge variant="outline" size="sm">Filters</Badge>
              </div>
            </DaisyAccordionTrigger>
            <DaisyAccordionContent>
              <p>This accordion item uses the filters variant designed for settings and controls. Built with native DaisyUI collapse system!</p>
            </DaisyAccordionContent>
          </DaisyAccordionItem>

          <DaisyAccordionItem 
            value="item3" 
            variant="elevated"
          >
            <DaisyAccordionTrigger>
              <div className="flex items-center justify-between w-full">
                <span>Elevated Variant</span>
                <Badge variant="outline" size="sm">Elevated</Badge>
              </div>
            </DaisyAccordionTrigger>
            <DaisyAccordionContent>
              <p>This item has elevated styling with shadow effects. All using DaisyUI's collapse foundation.</p>
            </DaisyAccordionContent>
          </DaisyAccordionItem>

          <DaisyAccordionItem 
            value="item4" 
            variant="glass"
          >
            <DaisyAccordionTrigger>
              <div className="flex items-center justify-between w-full">
                <span>Glass Effect Variant</span>
                <Badge variant="outline" size="sm">Glass</Badge>
              </div>
            </DaisyAccordionTrigger>
            <DaisyAccordionContent>
              <p>Glass morphism effect with backdrop blur. Perfect for modern UIs.</p>
            </DaisyAccordionContent>
          </DaisyAccordionItem>

          <DaisyAccordionItem 
            value="item5" 
            variant="gradient"
          >
            <DaisyAccordionTrigger>
              <div className="flex items-center justify-between w-full">
                <span>Gradient Variant</span>
                <Badge variant="outline" size="sm">Gradient</Badge>
              </div>
            </DaisyAccordionTrigger>
            <DaisyAccordionContent>
              <p>Gradient background from base-100 to base-200 for subtle visual interest.</p>
            </DaisyAccordionContent>
          </DaisyAccordionItem>
        </DaisyAccordion>
      </section>

      {/* State Debug */}
      <section className="mb-8">
        <h3 className="text-lg font-medium mb-2">Debug State</h3>
        <div className="bg-base-200 p-4 rounded-lg">
          <p><strong>Single Accordion Value:</strong> {singleValue || "None"}</p>
          <p><strong>Multiple Accordion Values:</strong> {multipleValue.join(", ") || "None"}</p>
        </div>
      </section>

      {/* Comparison with Original */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Benefits of DaisyUI-Based Approach</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 mb-3">❌ Old System</h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• 20+ custom variants</li>
              <li>• Complex hover system integration</li>
              <li>• 260+ lines of component code</li>
              <li>• Custom CSS and styling logic</li>
              <li>• Hard to maintain consistency</li>
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-3">✅ New System</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• 8 strategic variants</li>
              <li>• Native DaisyUI collapse system</li>
              <li>• 60% complexity reduction</li>
              <li>• Context-driven variant naming</li>
              <li>• Unified design system approach</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}