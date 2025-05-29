# TechRec Design System Specification

## Core Design Principles

### 1. Visual Hierarchy
- **Dark-first design** with high contrast text
- **Minimal shadows** - prefer subtle borders over drop shadows
- **Consistent spacing** using 4px base unit (0.25rem)
- **Clear visual boundaries** without overwhelming the user

### 2. Color Palette

#### Base Colors
```css
--color-background: #0a0a0a;      /* Main background */
--color-surface-1: #141414;       /* Card backgrounds */
--color-surface-2: #1f1f1f;       /* Elevated surfaces */
--color-surface-3: #2a2a2a;       /* Hover states */

--color-border: rgba(255, 255, 255, 0.1);     /* Subtle borders */
--color-border-hover: rgba(255, 255, 255, 0.2); /* Hover borders */

--color-text-primary: #ffffff;     /* Primary text */
--color-text-secondary: #a3a3a3;   /* Secondary text */
--color-text-muted: #6b6b6b;      /* Muted text */
```

#### Accent Colors (Gradients)
```css
--gradient-primary: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);    /* Violet-Purple */
--gradient-secondary: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%);  /* Pink-Rose */
--gradient-accent: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);     /* Blue-Cyan */
--gradient-success: linear-gradient(135deg, #10b981 0%, #34d399 100%);    /* Green */
```

### 3. Typography

#### Font Stack
```css
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", monospace;
```

#### Type Scale
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

### 4. Spacing System

Base unit: 4px (0.25rem)

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
```

### 5. Border Radius

```css
--radius-sm: 0.375rem;   /* 6px - Buttons, inputs */
--radius-md: 0.5rem;     /* 8px - Cards inner elements */
--radius-lg: 0.75rem;    /* 12px - Cards, modals */
--radius-xl: 1rem;       /* 16px - Large cards */
--radius-2xl: 1.5rem;    /* 24px - Special elements */
```

### 6. Shadows (Minimal Usage)

```css
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
--shadow-glass: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
```

### 7. Component Patterns

#### Cards
```css
.card {
  background: var(--color-surface-1);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  transition: all 0.2s ease;
}

.card:hover {
  background: var(--color-surface-2);
  border-color: var(--color-border-hover);
}
```

#### Buttons
```css
.button {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.button-primary {
  background: var(--gradient-primary);
  color: white;
}

.button-ghost {
  background: transparent;
  border-color: var(--color-border);
  color: var(--color-text-secondary);
}

.button-ghost:hover {
  background: var(--color-surface-2);
  border-color: var(--color-border-hover);
  color: var(--color-text-primary);
}
```

#### Inputs
```css
.input {
  background: var(--color-surface-1);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  transition: all 0.2s ease;
}

.input:focus {
  border-color: var(--color-border-hover);
  outline: 2px solid rgba(99, 102, 241, 0.2);
  outline-offset: 2px;
}
```

### 8. Glass Morphism

```css
.glass {
  background: rgba(20, 20, 20, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### 9. Animation Principles

- **Duration**: 150-300ms for micro-interactions
- **Easing**: ease-out for entrances, ease-in for exits
- **Properties**: Transform and opacity preferred over layout properties

```css
--transition-fast: 150ms ease-out;
--transition-base: 200ms ease-out;
--transition-slow: 300ms ease-out;
```

## Implementation Guidelines

### Do's:
1. ✅ Use subtle borders instead of heavy shadows
2. ✅ Maintain consistent spacing using the 4px grid
3. ✅ Apply transitions to interactive elements
4. ✅ Use glass morphism for overlays and modals
5. ✅ Keep color usage minimal and purposeful

### Don'ts:
1. ❌ Don't use shadows as primary visual separators
2. ❌ Don't mix border radius sizes within the same component
3. ❌ Don't use pure white (#fff) - use #ffffff with opacity
4. ❌ Don't create visual noise with too many gradients
5. ❌ Don't forget hover and focus states

## Component-Specific Guidelines

### Navigation
- Fixed header with glass morphism effect
- Subtle bottom border
- Smooth transitions on scroll

### Forms
- Group related fields with subtle backgrounds
- Clear visual hierarchy with labels
- Inline validation with color coding

### Tables
- Alternate row backgrounds using surface colors
- Hover states for interactive rows
- Sticky headers with glass effect

### Modals/Dialogs
- Dark overlay with blur
- Centered card with subtle border
- Smooth entrance/exit animations