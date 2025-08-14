# Component Development Checklist

Complete checklist to follow before shipping any UI component.

## Pre-Shipping Requirements

Before shipping any UI component, ensure:

- [ ] **Uses object-based variants** with consistent `componentBase` pattern
- [ ] **Includes interactive props** where appropriate (`hoverable`, `animated`, `interactive`)
- [ ] **Follows standardized prop API** patterns (`variant`, `size`, `className`)
- [ ] **Implements unified variant names** (`glass`, `outlined`, `elevated`, etc.)
- [ ] **Uses faint border aesthetic** (`border-base-300/50`)
- [ ] **Has proper TypeScript interfaces** with variant key typing
- [ ] **Includes Framer Motion support** for `animated` prop
- [ ] **Includes accessibility features** (ARIA, focus management)
- [ ] **Added to component library exports** (`/components/ui-daisy/index.ts`)
- [ ] **Documented with usage examples** in showcase
- [ ] **Tested across different screen sizes** and interaction states
- [ ] **Uses `cn()` or similar utilities** for conditional styling when needed

## Object-Based Variant Pattern

Ensure your component follows this pattern:

```tsx
const componentBase = "base-classes transition-all duration-100 ease-smooth"

const componentVariants = {
  default: `${componentBase} bg-base-100 border border-base-300/50`,
  glass: `${componentBase} bg-base-300/60 backdrop-blur-lg`,
  elevated: `${componentBase} shadow-md hover:shadow-lg`,
}

// Usage
<YourComponent variant="glass" hoverable animated />
```

## TypeScript Interface Requirements

```tsx
interface ComponentProps {
  variant?: 'default' | 'glass' | 'elevated'
  size?: 'sm' | 'md' | 'lg'
  hoverable?: boolean
  animated?: boolean
  interactive?: boolean
  className?: string
  children?: React.ReactNode
}
```

## Accessibility Requirements

- **ARIA labels**: Proper labeling for screen readers
- **Focus management**: Keyboard navigation support
- **Color contrast**: Meets WCAG guidelines
- **Semantic HTML**: Use appropriate HTML elements

## Testing Requirements

- **Unit tests**: Component behavior and props
- **Visual regression**: Screenshot testing
- **Accessibility tests**: Screen reader compatibility
- **Interactive tests**: User interaction flows

## Export and Documentation

1. **Add to exports**: Include in `/components/ui-daisy/index.ts`
2. **Create showcase**: Add usage examples
3. **Document variants**: List all available variants and props
4. **Cross-reference**: Link to related components

## Quality Assurance

- **Code review**: Peer review before merge
- **Design review**: Match design specifications exactly
- **Performance**: No unnecessary re-renders
- **Bundle size**: Keep component lightweight

## Related Documentation

- **Object-Based Variants**: See CLAUDE.md for variant architecture
- **Styling Utilities**: See development guide for utility usage
- **Component Architecture**: See CLAUDE.md for 4-layer system
- **Design System Standards**: See CLAUDE.md for theming guidelines