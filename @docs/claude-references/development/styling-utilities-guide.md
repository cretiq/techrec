# Styling Utilities & Best Practices

**🚀 MANDATORY: Use Styling Utilities Where Applicable**

## Core Utilities Available
```tsx
import { cn } from '@/lib/utils'           // clsx/classnames wrapper
import { twMerge } from 'tailwind-merge'   // Intelligent class merging
```

## Recommended Usage Patterns

### Conditional Styling with cn()
```tsx
// ✅ Conditional styling with cn()
const className = cn(
  'base-classes',
  isActive && 'bg-primary text-primary-content',
  disabled && 'opacity-50 cursor-not-allowed',
  size === 'large' && 'text-lg p-4'
)

// ✅ Object-based conditionals (cleaner than ternaries)
const className = cn('btn', {
  'btn-primary': variant === 'primary',
  'btn-secondary': variant === 'secondary',
  'btn-loading': isLoading,
  'btn-disabled': disabled
})

// ✅ Array support for complex conditions
const className = cn([
  'base-class',
  condition1 && 'conditional-class-1',
  condition2 && 'conditional-class-2',
  null, // Automatically filtered out
  undefined // Automatically filtered out
])
```

### Combining Variants with Dynamic Utilities
```tsx
// ✅ Combining variants with dynamic utilities
<Button 
  variant="glass" 
  className={cn(isHighlighted && 'ring-2 ring-accent')}
/>
```

### Smart Conflict Resolution with tailwind-merge
```tsx
// ✅ Smart conflict resolution with tailwind-merge
const mergedClasses = twMerge(
  'p-4 bg-red-500',    // Base styles
  'p-2 bg-blue-500'    // Override: results in 'p-2 bg-blue-500'
)
```

## When to Use Each Utility

- **`cn()` (clsx/classnames)**: Conditional logic, object-based classes, array handling
- **`twMerge()`**: When class conflicts need intelligent resolution
- **Object variants**: For predictable, reusable component APIs
- **Direct className**: For simple, static styling

## Essential Development Patterns

### Component Usage Examples
```tsx
// ✅ Use cn() for conditional styling
const buttonClass = cn(
  'btn btn-primary',
  isLoading && 'loading',
  disabled && 'btn-disabled'
)

// ✅ Combine variants with utility functions
<Button 
  variant="primary" 
  className={cn(baseStyles, isActive && 'ring-2 ring-primary')} 
/>

// ✅ Smart class merging with tailwind-merge
import { twMerge } from 'tailwind-merge'
const mergedClasses = twMerge('p-4 p-2 bg-red-500 bg-blue-500')

// ✅ Fixed table layouts prevent width flickering
<Table className="table-fixed w-full">

// ✅ Cross-component communication
window.dispatchEvent(new CustomEvent('expandAllSections'));

// ✅ Comprehensive test coverage
<Button data-testid={`action-button-${action}-${id}`}>
```

## Design System Integration

These utilities work seamlessly with our object-based variant system:

```tsx
const componentBase = "base-classes transition-all duration-100 ease-smooth"

const componentVariants = {
  default: `${componentBase} bg-base-100 border border-base-300/50`,
  glass: `${componentBase} bg-base-300/60 backdrop-blur-lg`,
  elevated: `${componentBase} shadow-md hover:shadow-lg`,
}

// Usage with utilities
<Button 
  variant="glass" 
  className={cn(
    isActive && 'ring-2 ring-primary',
    disabled && 'opacity-50'
  )}
/>
```

## Related Documentation

- **Component Architecture**: See CLAUDE.md for overall component system
- **Object-Based Variants**: See CLAUDE.md for variant architecture
- **Design System Standards**: See CLAUDE.md for glass morphism and animation standards