'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import {  Button  } from '@/components/ui-daisy/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {  Badge  } from '@/components/ui-daisy/badge'

export interface ComboboxOption {
  value: string // Typically the unique ID or code (e.g., country code, tech slug, company name)
  label: string // The display name
  icon?: React.ReactNode // Optional icon (e.g., flag emoji, tech icon)
}

interface MultipleComboboxProps {
  options: ComboboxOption[];
  selected: string[]; // Array of selected values (codes/slugs/names)
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyPlaceholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MultipleCombobox({
  options,
  selected,
  onChange,
  placeholder = 'Select options...',
  searchPlaceholder = 'Search options...',
  emptyPlaceholder = 'No options found.',
  className,
  disabled = false
}: MultipleComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (value: string) => {
    onChange([...selected, value])
  }

  const handleDeselect = (value: string) => {
    onChange(selected.filter((s) => s !== value))
  }

  // Find the full option objects for selected values to display labels/icons
  const selectedOptions = selected
    .map(value => options.find(option => option.value === value))
    .filter((option): option is ComboboxOption => option !== undefined);

  return (
    <div className={cn('relative', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-[2.5rem] flex-wrap px-3 py-2 bg-white/50 dark:bg-gray-800/50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
          >
            {selectedOptions.length > 0 ? (
              <div className="flex gap-1 flex-wrap">
                {selectedOptions.map((option) => (
                  <Badge
                    variant="secondary"
                    key={option.value}
                    className="mr-1 mb-1"
                    onClick={(e) => {
                      e.preventDefault(); // Prevent popover from closing
                      handleDeselect(option.value);
                    }}
                  >
                    {option.icon}
                    <span className="ml-1">{option.label}</span>
                    <X className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive" />
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground font-normal">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label} // Search based on label
                      onSelect={() => {
                        if (isSelected) {
                          handleDeselect(option.value)
                        } else {
                          handleSelect(option.value)
                        }
                        // Keep popover open for multi-select
                        // setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          isSelected ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex items-center">
                         {option.icon}
                         <span className="ml-2">{option.label}</span>
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
} 