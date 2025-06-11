'use client'

import * as React from "react"
import { Moon, Sun, Palette } from "lucide-react"
import { useTheme } from "next-themes"

import {  Button  } from '@/components/ui-daisy/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  // Popular DaisyUI themes for quick access
  const popularThemes = [
    { name: "light", icon: Sun, label: "Light" },
    { name: "dark", icon: Moon, label: "Dark" },
    { name: "cupcake", icon: Palette, label: "Cupcake" },
    { name: "cyberpunk", icon: Palette, label: "Cyberpunk" },
    { name: "forest", icon: Palette, label: "Forest" },
    { name: "corporate", icon: Palette, label: "Corporate" },
  ];

  const getCurrentIcon = () => {
    if (theme === "dark") return Moon;
    if (theme === "light") return Sun;
    return Palette;
  };

  const CurrentIcon = getCurrentIcon();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <CurrentIcon className="h-[1.2rem] w-[1.2rem] transition-all" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {popularThemes.map((themeItem) => {
          const IconComponent = themeItem.icon;
          return (
            <DropdownMenuItem 
              key={themeItem.name}
              onClick={() => setTheme(themeItem.name)}
              className={theme === themeItem.name ? "bg-primary/10" : ""}
            >
              <IconComponent className="mr-2 h-4 w-4" />
              {themeItem.label}
              {theme === themeItem.name && (
                <span className="ml-auto text-xs opacity-60">✓</span>
              )}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Palette className="mr-2 h-4 w-4" />
          System
          {theme === "system" && (
            <span className="ml-auto text-xs opacity-60">✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 