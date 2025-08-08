// Accessibility utilities and helpers for TechRec

export const ARIA_LABELS = {
  // Navigation
  MAIN_NAV: "Main navigation",
  BREADCRUMB: "Breadcrumb navigation",
  PAGINATION: "Pagination navigation",
  
  // Forms
  REQUIRED_FIELD: "Required field",
  SEARCH_INPUT: "Search",
  FILTER_CONTROLS: "Filter options",
  
  // Buttons
  CLOSE_MODAL: "Close modal",
  TOGGLE_MENU: "Toggle menu",
  SORT_ASCENDING: "Sort ascending",
  SORT_DESCENDING: "Sort descending",
  
  // Content
  LOADING: "Loading content",
  ERROR_MESSAGE: "Error message",
  SUCCESS_MESSAGE: "Success message",
  WARNING_MESSAGE: "Warning message",
} as const

export const FOCUS_MANAGEMENT = {
  // Focus trap for modals
  trapFocus: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }

    element.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => element.removeEventListener('keydown', handleTabKey)
  },

  // Restore focus after modal close
  restoreFocus: (previousElement: HTMLElement | null) => {
    if (previousElement && document.contains(previousElement)) {
      previousElement.focus()
    }
  }
}

export const KEYBOARD_HANDLERS = {
  // Handle escape key
  handleEscape: (callback: () => void) => {
    return (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        callback()
      }
    }
  },

  // Handle arrow navigation
  handleArrowKeys: (
    elements: NodeListOf<HTMLElement> | HTMLElement[], 
    currentIndex: number,
    onNavigate: (newIndex: number) => void
  ) => {
    return (e: KeyboardEvent) => {
      let newIndex = currentIndex

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          newIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : 0
          break
        case 'ArrowUp':
        case 'ArrowLeft':
          newIndex = currentIndex > 0 ? currentIndex - 1 : elements.length - 1
          break
        case 'Home':
          newIndex = 0
          break
        case 'End':
          newIndex = elements.length - 1
          break
        default:
          return
      }

      e.preventDefault()
      onNavigate(newIndex)
      ;(elements[newIndex] as HTMLElement)?.focus()
    }
  }
}

export const SCREEN_READER = {
  // Announce content to screen readers
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div')
    announcer.setAttribute('aria-live', priority)
    announcer.setAttribute('aria-atomic', 'true')
    announcer.className = 'sr-only'
    announcer.textContent = message

    document.body.appendChild(announcer)
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer)
    }, 1000)
  },

  // Create screen reader only text
  createSROnlyText: (text: string) => {
    const span = document.createElement('span')
    span.className = 'sr-only'
    span.textContent = text
    return span
  }
}

export const COLOR_CONTRAST = {
  // Check if colors meet WCAG AA standards
  checkContrast: (foreground: string, background: string): boolean => {
    // Simplified contrast ratio check
    // In production, use a proper color contrast library
    const getLuminance = (color: string): number => {
      // Convert hex to RGB and calculate luminance
      const hex = color.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16) / 255
      const g = parseInt(hex.substr(2, 2), 16) / 255
      const b = parseInt(hex.substr(4, 2), 16) / 255

      const getRGB = (c: number) => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      }

      return 0.2126 * getRGB(r) + 0.7152 * getRGB(g) + 0.0722 * getRGB(b)
    }

    const l1 = getLuminance(foreground)
    const l2 = getLuminance(background)
    const contrast = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)

    return contrast >= 4.5 // WCAG AA standard
  }
}

export const MOTION_PREFERENCES = {
  // Check for reduced motion preference
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },

  // Create motion-safe animations
  getMotionSafeProps: (normalProps: any, reducedProps: any = {}) => {
    return MOTION_PREFERENCES.prefersReducedMotion() ? reducedProps : normalProps
  }
}

export const SEMANTIC_HTML = {
  // Common ARIA patterns
  button: {
    role: 'button',
    tabIndex: 0
  },
  
  link: {
    role: 'link'
  },
  
  heading: (level: 1 | 2 | 3 | 4 | 5 | 6) => ({
    role: 'heading',
    'aria-level': level
  }),
  
  list: {
    role: 'list'
  },
  
  listItem: {
    role: 'listitem'
  },
  
  dialog: {
    role: 'dialog',
    'aria-modal': true
  },
  
  alert: {
    role: 'alert',
    'aria-live': 'assertive'
  },
  
  status: {
    role: 'status',
    'aria-live': 'polite'
  }
}

// Accessibility testing helpers
export const A11Y_TESTING = {
  // Check for missing alt text
  checkAltText: () => {
    const images = document.querySelectorAll('img')
    const missingAlt: HTMLImageElement[] = []
    
    images.forEach(img => {
      if (!img.alt && !img.getAttribute('aria-label') && !img.getAttribute('aria-labelledby')) {
        missingAlt.push(img)
      }
    })
    
    if (missingAlt.length > 0) {
      console.warn('Images missing alt text:', missingAlt)
    }
    
    return missingAlt
  },

  // Check for proper heading hierarchy
  checkHeadingHierarchy: () => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const levels: number[] = []
    
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1))
      levels.push(level)
    })
    
    // Check for skipped levels
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] - levels[i - 1] > 1) {
        console.warn(`Heading hierarchy issue: h${levels[i - 1]} followed by h${levels[i]}`)
      }
    }
    
    return levels
  },

  // Check for interactive elements without proper labels
  checkInteractiveLabels: () => {
    const interactive = document.querySelectorAll('button, input, select, textarea, a')
    const unlabeled: Element[] = []
    
    interactive.forEach(element => {
      const hasLabel = element.getAttribute('aria-label') ||
                      element.getAttribute('aria-labelledby') ||
                      element.querySelector('label') ||
                      (element as HTMLElement).textContent?.trim()
      
      if (!hasLabel) {
        unlabeled.push(element)
      }
    })
    
    if (unlabeled.length > 0) {
      console.warn('Interactive elements without labels:', unlabeled)
    }
    
    return unlabeled
  }
}

// Development-only accessibility checker
export const runA11yCheck = () => {
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      A11Y_TESTING.checkAltText()
      A11Y_TESTING.checkHeadingHierarchy()
      A11Y_TESTING.checkInteractiveLabels()
    }, 1000)
  }
}