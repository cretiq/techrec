'use client'

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { createContext, useContext, useEffect, useState } from "react"
import { fontObjects } from "@/utils/fonts"

const FONT_STORAGE_KEY = 'selected-font'

type FontContextType = {
  font: string
  setFont: (font: string) => void
}

const FontContext = createContext<FontContextType | undefined>(undefined)

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [font, setFont] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(FONT_STORAGE_KEY) || 'inter'
    }
    return 'inter'
  })

  useEffect(() => {
    const root = document.documentElement
    if (font === 'system') {
      root.style.setProperty('--font-sans', `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`)
    } else {
      const selectedFont = fontOptions.find(f => f.value === font)
      if (selectedFont) {
        root.style.setProperty('--font-sans', `var(--${selectedFont.variable})`)
      }
    }
    localStorage.setItem(FONT_STORAGE_KEY, font)
  }, [font])

  return (
    <FontContext.Provider value={{ font, setFont }}>
      {children}
    </FontContext.Provider>
  )
}

export function useFont() {
  const context = useContext(FontContext)
  if (context === undefined) {
    throw new Error('useFont must be used within a FontProvider')
  }
  return context
}

const fontOptions = [
  { value: "system", label: "System", variable: "system" },
  ...Object.entries(fontObjects).map(([key, font]) => ({
    value: key,
    label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    variable: font.variable.substring(2),
  }))
]

export function FontSwitcher() {
  const [open, setOpen] = useState(false)
  const { font, setFont } = useFont()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[150px] justify-between"
          size="sm"
        >
          {fontOptions.find((f) => f.value === font)?.label || "Select font..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[150px] p-0">
        <Command>
          <CommandInput placeholder="Search font..." />
          <CommandList>
            <CommandEmpty>No font found.</CommandEmpty>
            <CommandGroup>
              {fontOptions.map((f) => (
                <CommandItem
                  key={f.value}
                  value={f.value}
                  onSelect={(currentValue) => {
                    setFont(currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      font === f.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {f.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 