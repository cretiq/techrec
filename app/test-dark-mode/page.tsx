'use client'

import { AccordionItem, AccordionTrigger, AccordionContent, Accordion } from '@/components/ui-daisy/accordion'

export default function TestDarkMode() {
  return (
    <div className="min-h-screen p-8 bg-base-100">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-base-content mb-8">Dark Mode Test</h1>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-base-content">Accordion Variants Test</h2>
          
          <Accordion type="multiple" value={["test1", "test2"]}>
            <AccordionItem variant="default" value="test1">
              <AccordionTrigger>Default Variant</AccordionTrigger>
              <AccordionContent>
                This is the default variant. Should adapt to theme automatically.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem variant="hybrid" value="test2">
              <AccordionTrigger>Hybrid Variant (dark: test)</AccordionTrigger>
              <AccordionContent>
                This is the hybrid variant. Should be red in light mode and green in dark mode using dark: classes.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem variant="glass" value="test3">
              <AccordionTrigger>Glass Variant</AccordionTrigger>
              <AccordionContent>
                This is the glass variant with backdrop blur.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-base-content">Manual Dark Classes Test</h2>
          <div className="p-4 bg-red-200 dark:bg-green-300 border border-base-300 rounded-lg">
            <p className="text-base-content">
              This div should be red in light mode and green in dark mode using dark: classes.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-base-content">Base Color Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-base-100 border border-base-300 rounded-lg">
              <h3 className="font-semibold mb-2">bg-base-100</h3>
              <p className="text-sm text-base-content">Pure white background</p>
            </div>
            <div className="p-4 bg-base-200 border border-base-300 rounded-lg">
              <h3 className="font-semibold mb-2">bg-base-200</h3>
              <p className="text-sm text-base-content">Very light gray background</p>
            </div>
            <div className="p-4 bg-base-300 border border-base-300 rounded-lg">
              <h3 className="font-semibold mb-2">bg-base-300</h3>
              <p className="text-sm text-base-content">In light mode: same as base-200. In dark mode: darker gray</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-base-content">✅ WORKING Custom Color Demo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-brand-muted border border-brand-muted rounded-lg">
              <h3 className="font-semibold mb-2 text-base-content">bg-brand-muted</h3>
              <p className="text-sm text-base-content">🎨 This WORKS! Light mode: medium gray. Dark mode: lighter gray</p>
            </div>
            <div className="p-4 border-2 border-brand-muted rounded-lg bg-base-100">
              <h3 className="font-semibold mb-2 text-brand-muted">border-brand-muted & text-brand-muted</h3>
              <p className="text-sm text-base-content">Uses the correct DaisyUI custom color approach</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-base-content">Instructions</h2>
          <div className="p-4 bg-base-200 rounded-lg">
            <p className="text-base-content">
              Use the theme toggle in the top navigation to switch between light and dark themes.
              Notice how:
            </p>
            <ul className="text-base-content list-disc ml-6 mt-2 space-y-1">
              <li>base-200 and base-300 look the same in light mode, but different in dark mode</li>
              <li>brand-muted shifts dramatically: medium gray in light mode → lighter gray in dark mode</li>
              <li>The hybrid accordion uses bg-brand-muted and changes between themes</li>
              <li>The manual test div changes from red to green</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}