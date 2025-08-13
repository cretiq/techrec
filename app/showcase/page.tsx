"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { 
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
  Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Component imports
import { Button } from '@/components/ui-daisy/button';
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
  const { theme, setTheme, resolvedTheme } = useTheme();
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
    <div className="min-h-screen text-base-content transition-colors duration-100">
      <div className="container mx-auto flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto border-r border-base-300/30 p-4 transition-colors duration-100">
          <nav className="space-y-1">
            {filteredSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-100 border border-transparent",
                    "hover:bg-base-200/50 hover:border-base-300/50 text-base-content/60 hover:text-base-content",
                    isActive && "bg-base-200/80 border-base-300/50 text-base-content font-medium"
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
              <ActiveComponent onCopyCode={handleCopyCode} copiedCode={copiedCode} theme={resolvedTheme} />
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
          variant="default"
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