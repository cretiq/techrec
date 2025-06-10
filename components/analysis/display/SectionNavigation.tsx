'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from "@/lib/utils"; // Utility for conditional class names

interface Section {
  id: string;
  title: string;
}

interface SectionNavigationProps {
  sections: Section[];
  containerSelector?: string; // Optional: CSS selector for the scrollable container, defaults to window
  offset?: number; // Optional: Offset for scroll position calculation (e.g., for sticky headers)
}

export const SectionNavigation: React.FC<SectionNavigationProps> = ({ 
  sections, 
  containerSelector,
  offset = 80 // Default offset, adjust as needed
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(sections[0]?.id || null);

  const handleScroll = useCallback(() => {
    const scrollContainer = containerSelector ? document.querySelector(containerSelector) : window;
    const scrollY = containerSelector ? (scrollContainer as Element).scrollTop : window.scrollY;
    
    let currentSection: string | null = null;

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        const elementTop = element.offsetTop - offset;
        
        if (scrollY >= elementTop) {
          currentSection = section.id;
        }
      }
    });

    if (scrollY < offset && sections.length > 0) {
        currentSection = sections[0].id;
    }

    setActiveSection(currentSection);
  }, [sections, offset, containerSelector]);

  useEffect(() => {
    const scrollElement = containerSelector ? document.querySelector(containerSelector) : window;
    if (scrollElement) {
        scrollElement.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check
    }

    return () => {
        if (scrollElement) {
            scrollElement.removeEventListener('scroll', handleScroll);
        }
    };
  }, [handleScroll, containerSelector]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
        const elementPosition = element.offsetTop - offset;
        const scrollContainer = containerSelector ? document.querySelector(containerSelector) : window;
        
        if (scrollContainer) {
            scrollContainer.scrollTo({
                top: elementPosition,
                behavior: 'smooth',
            });
            setActiveSection(id);
        }
    }
  };

  return (
    <nav className="sticky top-6 h-fit">
        <div className="p-4 rounded-lg bg-white/20 dark:bg-black/20">
            <h3 className="text-lg font-semibold text-foreground mb-4">Sections</h3>
            <ul className="space-y-1">
                {sections.map(section => (
                    <li key={section.id}>
                        <button 
                            onClick={() => scrollToSection(section.id)}
                            className={cn(
                                "w-full text-left px-3 py-1.5 text-sm rounded transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 dark:focus:ring-offset-background",
                                activeSection === section.id 
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            {section.title}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    </nav>
  );
}; 