# 🏗️ Component Architecture Guide

**TechRec** uses a **4-layer component architecture** that ensures clean, reusable, and maintainable code.

---

## 📁 Architecture Overview

```
📁 /components/ui-daisy/           ← 🎯 LAYER 1: UI PRIMITIVES (40+ components)
📁 /components/                    ← 🏗️ LAYER 2: BUSINESS COMPONENTS  
📁 /app/components/                ← 📄 LAYER 3: PAGE-SPECIFIC (minimal)
📁 /app/[route]/                   ← 🌐 LAYER 4: PAGES (composition)
```

---

## 🎯 Layer 1: UI Primitives (`/components/ui-daisy/`)

**Purpose**: Reusable, styled UI components with no business logic

### Key Components:
- **`button.tsx`** - 15+ variants (gradient, glass, LinkedIn, etc.)
- **`card.tsx`** - 8 variants (transparent, solid, floating, etc.)
- **`accordion.tsx`** - Professional accordion with variant system
- **`input.tsx`, `textarea.tsx`** - Form components with validation styling
- **`badge.tsx`, `alert.tsx`** - Display components with semantic colors
- **`dialog.tsx`, `popover.tsx`** - Overlay components with animations

### Usage Pattern (98% of imports):
```tsx
import { Button, Card, Accordion } from '@/components/ui-daisy'

<Card variant="gradient" hoverable>
  <Button variant="glass" size="lg" leftIcon={<Play />}>
    Start Analysis
  </Button>
</Card>
```

### Available Variants:
- **Button**: `default`, `outline`, `ghost`, `gradient`, `glass`, `linkedin`
- **Card**: `default`, `transparent`, `glass`, `solid`, `gradient`, `floating`
- **Accordion**: `default`, `glass`, `gradient`, `outlined`, `elevated`

---

## 🏗️ Layer 2: Business Components (`/components/`)

**Purpose**: Domain-specific components that use ui-daisy primitives

### Organization:
```
/components/
├── buttons.tsx              ← Business button wrappers
├── analysis/                ← CV analysis components
├── cv/                     ← CV management components  
├── roles/                  ← Job roles components
├── landing/                ← Landing page components
└── [feature]/              ← Other domain components
```

### Example - Business Wrapper:
```tsx
// /components/buttons.tsx
import { Button } from '@/components/ui-daisy/button'

export function StartAssessmentButton({ onClick, disabled, loading }) {
  return (
    <Button 
      variant="gradient" 
      leftIcon={<Play />} 
      onClick={onClick}
      disabled={disabled}
      loading={loading}
    >
      Start Assessment
    </Button>
  )
}
```

### Example - Feature Component:
```tsx
// /components/analysis/AnalysisResultDisplay.tsx
import { Accordion, AccordionItem, Card } from '@/components/ui-daisy'

export function AnalysisResultDisplay({ data }) {
  return (
    <Card variant="transparent">
      <Accordion type="multiple">
        <AccordionItem variant="glass" value="contact">
          {/* Complex business logic */}
        </AccordionItem>
      </Accordion>
    </Card>
  )
}
```

---

## 📄 Layer 3: Page-Specific (`/app/components/`)

**Purpose**: Components unique to specific pages (use sparingly)

### Current Components:
- **`question-template-selector.tsx`** - Assessment page specific

### When to Use:
- Component is truly unique to one page
- Cannot be generalized for reuse
- Contains page-specific state/logic

```tsx
// /app/components/question-template-selector.tsx
export function QuestionTemplateSelector({ templates, onSelect }) {
  // Page-specific component logic
}
```

---

## 🌐 Layer 4: Pages (`/app/[route]/page.tsx`)

**Purpose**: Orchestrate user experience by composing all layers

```tsx
// /app/developer/cv-management/page.tsx
import { Card, Button } from '@/components/ui-daisy'
import { AnalysisResultDisplay } from '@/components/analysis'
import { StartAssessmentButton } from '@/components/buttons'

export default function CVManagementPage() {
  return (
    <Card variant="transparent">
      <AnalysisResultDisplay />
      <StartAssessmentButton onClick={handleStart} />
    </Card>
  )
}
```

---

## 📋 Component Decision Matrix

| **Need** | **Use** | **Location** | **Example** |
|----------|---------|-------------|-------------|
| Styled button | Existing Button with variant | `ui-daisy/button` | `<Button variant="gradient">` |
| Business-specific button | Wrapper component | `components/buttons.tsx` | `StartAssessmentButton` |
| Complex feature | Feature component | `components/[feature]/` | `AnalysisResultDisplay` |
| Page-unique element | Page-specific component | `app/components/` | `QuestionTemplateSelector` |
| Simple styling | Inline JSX | In page/component | `<div className="...">` |

---

## 🚨 Best Practices

### ✅ DO:
```tsx
// Extend existing components with variants
<Button variant="gradient" size="lg" />

// Create business wrappers for domain logic
<StartAssessmentButton onClick={handleStart} />

// Compose ui-daisy components in features
<Card variant="glass">
  <Accordion variant="gradient">
```

### ❌ DON'T:
```tsx
// Create duplicate UI primitives
// Instead add variant to existing component

// Mix business logic in ui-daisy
// Keep ui-daisy components pure

// Override styles with className
<Button className="bg-red-500" />
// Instead: add variant or use semantic variant
```

---

## 🔍 Before Creating New Component

**Ask these questions in order:**

1. **Can I use existing ui-daisy component?** → Use it with appropriate variant
2. **Can I compose existing components?** → Combine multiple ui-daisy components  
3. **Does this need business logic?** → Create in `/components/[feature]/`
4. **Is this reusable across features?** → Add to `/components/ui-daisy/`
5. **Is this truly page-specific?** → Add to `/app/components/` (rare)

---

## 🎨 Variant System

All ui-daisy components use **CVA (Class Variance Authority)** for consistent variant APIs:

```tsx
// Standard variant props across all components
<Component 
  variant="gradient"      // Visual style
  size="lg"              // Size variation  
  hoverable              // Interactive states
  animated               // Motion effects
  className="..."        // Additional customization
/>
```

**Available Variants**:
- **Visual**: `default`, `gradient`, `glass`, `outline`, `solid`
- **Semantic**: `success`, `warning`, `error`, `info`
- **Interactive**: `hoverable`, `animated`, `interactive`
- **Size**: `sm`, `md`, `lg`, `xl`

---

## 📚 Quick Reference

### Most Common Imports:
```tsx
// UI Primitives (primary pattern)
import { Button, Card, Input, Badge } from '@/components/ui-daisy'

// Business Components (when needed)
import { StartAssessmentButton } from '@/components/buttons'
import { ContactInfoDisplay } from '@/components/analysis/display'
```

### Component Exports:
- **ui-daisy**: All components exported from `index.ts`
- **Business**: Named exports from specific files
- **Features**: Named exports from feature directories

This architecture ensures **scalability**, **maintainability**, and **consistency** across the entire application while providing flexibility for business needs.