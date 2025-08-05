"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Palette, 
  Type, 
  MousePointer, 
  Layout, 
  Zap, 
  Eye,
  Code,
  Component,
  Layers,
  Settings,
  ChevronRight,
  Copy,
  Check,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Component imports
import { Button } from '@/components/ui-daisy/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui-daisy/card';
import { Input } from '@/components/ui-daisy/input';
import { Textarea } from '@/components/ui-daisy/textarea';
import { Select } from '@/components/ui-daisy/select';
import { RadioGroup } from '@/components/ui-daisy/radio-group';
import { Badge } from '@/components/ui-daisy/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui-daisy/tabs';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from '@/components/ui-daisy/dropdown';

// Animation imports
import * as animations from '@/lib/animations';

// Types
type Section = {
  id: string;
  title: string;
  icon: React.ElementType;
  component: React.ComponentType<any>;
};

// Section Components
import ButtonShowcase from './components/ButtonShowcase';
import CardShowcase from './components/CardShowcase';
import FormShowcase from './components/FormShowcase';
import ColorShowcase from './components/ColorShowcase';
import TypographyShowcase from './components/TypographyShowcase';
import AnimationShowcase from './components/AnimationShowcase';
import ComponentsShowcase from './components/ComponentsShowcase';
import AccessibilityShowcase from './components/AccessibilityShowcase';
import LayoutShowcase from './components/LayoutShowcase';
import InteractivePlayground from './components/InteractivePlayground';

const sections: Record<string, Section> = {
  components: {
    id: 'components',
    title: 'Components',
    icon: Component,
    component: ComponentsShowcase
  },
  buttons: {
    id: 'buttons',
    title: 'Buttons',
    icon: MousePointer,
    component: ButtonShowcase
  },
  cards: {
    id: 'cards',
    title: 'Cards',
    icon: Layers,
    component: CardShowcase
  },
  forms: {
    id: 'forms',
    title: 'Form Elements',
    icon: Settings,
    component: FormShowcase
  },
  colors: {
    id: 'colors',
    title: 'Color System',
    icon: Palette,
    component: ColorShowcase
  },
  typography: {
    id: 'typography',
    title: 'Typography',
    icon: Type,
    component: TypographyShowcase
  },
  animations: {
    id: 'animations',
    title: 'Animations',
    icon: Zap,
    component: AnimationShowcase
  },
  layout: {
    id: 'layout',
    title: 'Layout & Spacing',
    icon: Layout,
    component: LayoutShowcase
  },
  accessibility: {
    id: 'accessibility',
    title: 'Accessibility',
    icon: Eye,
    component: AccessibilityShowcase
  },
  playground: {
    id: 'playground',
    title: 'Interactive Playground',
    icon: Code,
    component: InteractivePlayground
  }
};

export default function ShowcasePage() {
  const [activeSection, setActiveSection] = useState('components');
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const ActiveComponent = sections[activeSection]?.component || sections.components.component;

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredSections = Object.values(sections).filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-lg border-b border-gray-800/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-100">
                TechRec Design System
              </h1>
              <Badge variant="gradient-brand" size="sm">v2.0</Badge>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search components..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 bg-gray-900/30 border border-gray-800/50 rounded-lg text-gray-100 placeholder-gray-500 focus:border-gray-700/50 focus:outline-none transition-colors"
                />
              </div>

              {/* Theme Switcher */}
              <Dropdown>
                <DropdownTrigger asChild>
                  <Button variant="glass" size="icon">
                    {theme === 'light' ? <Sun className="h-4 w-4" /> : 
                     theme === 'dark' ? <Moon className="h-4 w-4" /> : 
                     <Monitor className="h-4 w-4" />}
                  </Button>
                </DropdownTrigger>
                <DropdownContent align="end">
                  <DropdownItem onClick={() => setTheme('light')} leftIcon={<Sun className="h-4 w-4" />}>
                    Light
                  </DropdownItem>
                  <DropdownItem onClick={() => setTheme('dark')} leftIcon={<Moon className="h-4 w-4" />}>
                    Dark
                  </DropdownItem>
                  <DropdownItem onClick={() => setTheme('system')} leftIcon={<Monitor className="h-4 w-4" />}>
                    System
                  </DropdownItem>
                </DropdownContent>
              </Dropdown>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto border-r border-gray-800/30 bg-[#050505]/50 p-4">
          <nav className="space-y-1">
            {filteredSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 border border-transparent",
                    "hover:bg-gray-800/20 hover:border-gray-700/30 text-gray-400 hover:text-gray-200",
                    isActive && "bg-gray-800/30 border-gray-700/30 text-gray-100 font-medium"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{section.title}</span>
                  {isActive && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ActiveComponent onCopyCode={handleCopyCode} copiedCode={copiedCode} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Action Button for Quick Actions */}
      <motion.div
        className="fixed bottom-8 right-8"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
      >
        <Button
          variant="gradient-brand"
          size="icon"
          className="rounded-full shadow-lg"
          onClick={() => handleCopyCode('// All component examples', 'all')}
          title="Copy all examples"
        >
          <Copy className="h-5 w-5" />
        </Button>
      </motion.div>
    </div>
  );
}