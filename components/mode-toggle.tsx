'use client'

import * as React from "react"
import { Moon, Sun, Palette } from "lucide-react"
import { useTheme } from "next-themes"

import {  Button  } from '@/components/ui-daisy/button'
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
  DropdownSeparator,
} from "@/components/ui-daisy/dropdown"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Popular DaisyUI themes for quick access
  const popularThemes = [
    { name: "light", icon: Sun, label: "Light" },
    { name: "dark", icon: Moon, label: "Dark" },
    { name: "cupcake", icon: Palette, label: "Cupcake" },
    { name: "cyberpunk", icon: Palette, label: "Cyberpunk" },
    { name: "forest", icon: Palette, label: "Forest" },
    { name: "corporate", icon: Palette, label: "Corporate" },
  ];

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const getCurrentIcon = () => {
    if (!mounted) return Sun; // Default icon during SSR
    if (theme === "dark") return Moon;
    if (theme === "light") return Sun;
    return Palette;
  };

  const CurrentIcon = getCurrentIcon();

  return (
    <Dropdown end>
      <DropdownTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
        >
          <CurrentIcon className="h-[1.2rem] w-[1.2rem] transition-all" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownTrigger>
      <DropdownContent className="w-48">
        {popularThemes.map((themeItem) => {
          const IconComponent = themeItem.icon;
          return (
            <DropdownItem 
              key={themeItem.name}
              onClick={() => setTheme(themeItem.name)}
              className={mounted && theme === themeItem.name ? "active" : ""}
            >
              <IconComponent className="mr-2 h-4 w-4" />
              {themeItem.label}
              {mounted && theme === themeItem.name && (
                <span className="ml-auto text-xs opacity-60">✓</span>
              )}
            </DropdownItem>
          );
        })}
        <DropdownSeparator />
        <DropdownItem onClick={() => setTheme("system")}>
          <Palette className="mr-2 h-4 w-4" />
          System
          {mounted && theme === "system" && (
            <span className="ml-auto text-xs opacity-60">✓</span>
          )}
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  )
} 