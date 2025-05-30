# ShadCN/UI Component Cleanup Analysis

## Summary

This analysis identifies which shadcn/ui components can be safely removed based on import analysis across the codebase.

## Components Safe to Remove (No imports found)

### 1. Components with DaisyUI equivalents (0 imports each):
- ✅ **button.tsx** - Use `ui-daisy/button.tsx` instead
- ✅ **card.tsx** - Use `ui-daisy/card.tsx` instead  
- ✅ **input.tsx** - Use `ui-daisy/input.tsx` instead
- ✅ **select.tsx** - Use `ui-daisy/select.tsx` instead
- ✅ **badge.tsx** - Use `ui-daisy/badge.tsx` instead
- ✅ **tabs.tsx** - Use `ui-daisy/tabs.tsx` instead

### 2. Unused components (0 imports):
- ✅ alert.tsx
- ✅ aspect-ratio.tsx
- ✅ bar-chart-icon.tsx
- ✅ carousel.tsx
- ✅ code-icon.tsx
- ✅ context-menu.tsx
- ✅ drawer.tsx
- ✅ hover-card.tsx
- ✅ input-otp.tsx
- ✅ loader-icon.tsx
- ✅ menubar.tsx
- ✅ navigation-menu.tsx
- ✅ page-transition.tsx
- ✅ pagination.tsx
- ✅ radio-group.tsx
- ✅ resizable.tsx
- ✅ sonner.tsx
- ✅ switch.tsx

## Components Still in Use (Keep for now)

### High usage:
- **textarea.tsx** (10 imports) - Has DaisyUI equivalent but still heavily used
- **label.tsx** (11 imports)
- **use-toast.ts** (11 imports) + toast.tsx + toaster.tsx
- **dropdown-menu.tsx** (6 imports)
- **scroll-area.tsx** (6 imports)
- **progress.tsx** (7 imports)
- **skeleton.tsx** (5 imports)

### Moderate usage:
- **dialog.tsx** (3 imports)
- **popover.tsx** (5 imports)
- **command.tsx** (4 imports)
- **accordion.tsx** (2 imports)
- **avatar.tsx** (3 imports)
- **slider.tsx** (3 imports)
- **checkbox.tsx** (2 imports)
- **collapsible.tsx** (2 imports)
- **sheet.tsx** (2 imports)
- **tooltip.tsx** (2 imports)

### Low usage:
- **breadcrumb.tsx** (1 import)
- **calendar.tsx** (1 import)
- **separator.tsx** (1 import)
- **table.tsx** (1 import)
- **toggle.tsx** (1 import via toggle-group)
- **form.tsx** (1 import)

### Special components (custom implementations):
- AnalysisResultCard.tsx (with stories & tests)
- Feedback.tsx (with stories & tests)
- Navigation.tsx (with stories & tests)
- ProgressIndicator.tsx (with stories & tests)
- SuggestionCard.tsx (with stories & tests)

## Migration Strategy

1. **Immediate removal (24 components)**: Delete all components with 0 imports
2. **Phase 1 migration**: Replace textarea.tsx usage with ui-daisy/textarea.tsx
3. **Phase 2 migration**: Evaluate remaining components for DaisyUI alternatives
4. **Keep**: Toast system, modal/dialog components, and specialized UI components

## Command to Remove Unused Components

```bash
# Remove components with DaisyUI equivalents (0 imports)
rm components/ui/button.tsx
rm components/ui/card.tsx
rm components/ui/input.tsx
rm components/ui/select.tsx
rm components/ui/badge.tsx
rm components/ui/tabs.tsx

# Remove completely unused components
rm components/ui/alert.tsx
rm components/ui/aspect-ratio.tsx
rm components/ui/bar-chart-icon.tsx
rm components/ui/carousel.tsx
rm components/ui/code-icon.tsx
rm components/ui/context-menu.tsx
rm components/ui/drawer.tsx
rm components/ui/hover-card.tsx
rm components/ui/input-otp.tsx
rm components/ui/loader-icon.tsx
rm components/ui/menubar.tsx
rm components/ui/navigation-menu.tsx
rm components/ui/page-transition.tsx
rm components/ui/pagination.tsx
rm components/ui/radio-group.tsx
rm components/ui/resizable.tsx
rm components/ui/sonner.tsx
rm components/ui/switch.tsx
```

## Notes

- The migration script in `/scripts/migrate-components.js` references some of these components but is only used for migration purposes
- All actively used components should remain until proper migration is completed
- Consider creating a unified component export in `ui-daisy/index.ts` for easier imports