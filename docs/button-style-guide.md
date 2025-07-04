# Button Style Guide

This document outlines the standardized button usage patterns implemented as part of Feature Request #8.

## Button Component Variants

### Primary Variants

- **`default`** - Primary actions with enhanced disabled states
- **`destructive`** - Error/dangerous actions with disabled states
- **`outline`** - Secondary actions with disabled states
- **`secondary`** - Alternative actions with disabled states
- **`ghost`** - Tertiary/minimal actions with disabled states
- **`link`** - Link-style buttons with disabled states

### Specialized Variants

- **`linkedin`** - LinkedIn-style gradient buttons for application actions
- **`gradient`** - General gradient for important actions
- **`gradient-blue`** - Blue gradient variant
- **`glass`** - Modern glass morphism effect
- **`glass-outline`** - Subtle glass outline variant
- **`dashdot`** - Dashed border style

### Sizes

- **`sm`** - Small buttons for compact spaces
- **`default`** - Standard button size
- **`lg`** - Large buttons for prominent actions
- **`xl`** - Extra large buttons with enhanced padding
- **`icon`** - Square icon-only buttons

### Elevation System

- **`none`** - No shadow (ghost, link buttons)
- **`sm`** - Subtle shadow (outline, secondary buttons)
- **`md`** - Standard shadow (**Default** for consistency)
- **`lg`** - Prominent shadow (important actions)
- **`xl`** - Maximum shadow (hero CTAs)
- **`float`** - Animated shadow with hover lift
- **`theme-aware-sm/md/lg`** - Dark/light mode aware shadows

## Enhanced Features

### Loading States
- Buttons support a `loading` prop that shows a spinner
- If icons are present, they animate instead of showing spinner
- Loading state automatically disables the button

### Disabled States
- All variants have properly styled disabled states
- Disabled buttons use toned-down colors (30% opacity)
- Disabled text is at 50% opacity
- Disabled shadows are removed

### Icon Integration
- `leftIcon` and `rightIcon` props for consistent icon placement
- Icons are properly sized and spaced
- Icons support animation when used with loading states

## Usage Examples

### Primary Action Button
```tsx
<Button variant="default" size="lg" elevation="md">
  Submit Application
</Button>
```

### LinkedIn Application Button
```tsx
<Button 
  variant="linkedin" 
  size="lg" 
  elevation="lg"
  leftIcon={<LinkedInIcon />}
  rightIcon={<ArrowRight />}
>
  Apply on LinkedIn
</Button>
```

### Icon Button with Loading
```tsx
<Button 
  variant="outline"
  loading={isGenerating}
  leftIcon={<RefreshCw />}
>
  Regenerate
</Button>
```

### Glass Morphism Button
```tsx
<Button 
  variant="glass"
  elevation="md"
  leftIcon={<Download />}
>
  Export Data
</Button>
```

## Migration Patterns

### Before (Custom Styling)
```tsx
<Button className="bg-gradient-to-r from-[#0077b5] to-[#005885] hover:from-[#005885] hover:to-[#004165] text-white border-0 backdrop-blur-sm shadow-lg hover:shadow-xl">
  <Icon className="mr-2 h-4 w-4" />
  Button Text
</Button>
```

### After (Standardized)
```tsx
<Button 
  variant="linkedin" 
  elevation="lg"
  leftIcon={<Icon className="h-4 w-4" />}
>
  Button Text
</Button>
```

## Design Principles

1. **Consistency** - All buttons use standardized variants
2. **Accessibility** - Proper disabled states and focus indicators
3. **Performance** - Standardized transitions (200ms duration)
4. **Maintainability** - Props-based styling over className overrides
5. **Future-proofing** - Theme-aware variants for dark/light modes

## Restrictions

- **No custom `className` overrides** for standardized properties (padding, shadows, transitions)
- **Maximum 2 gradient variants** throughout the application for coherence
- **No very small buttons** - minimum size is `sm` for usability
- **Consistent icon sizing** - use h-4 w-4 for standard buttons, h-5 w-5 for large buttons

## Testing Requirements

All buttons should have proper `data-testid` attributes for testing:
```tsx
<Button data-testid="action-button-submit-form">
  Submit
</Button>
```

## Implementation Status

✅ **Phase 1**: Enhanced Button component with all variants and features
✅ **Phase 2**: Main pages refactored (search, writing-help, cv-management)  
✅ **Phase 2.5**: Enhanced features implemented (disabled, loading, theme-aware)
✅ **Phase 3**: Component migration (cover-letter-creator, outreach-generator, ApplicationActionButton)
✅ **Phase 4**: Documentation and style guide completed

All button styling is now consistent across the application following these guidelines.