#!/bin/bash
# Cleanup script for unused shadcn/ui components
# Generated after thorough dependency analysis

echo "Removing unused shadcn/ui components..."

# Components with 0 imports that have DaisyUI equivalents
echo "Removing shadcn components that have DaisyUI replacements..."
rm -f ./components/ui/button.tsx
rm -f ./components/ui/card.tsx
rm -f ./components/ui/input.tsx
rm -f ./components/ui/select.tsx
rm -f ./components/ui/badge.tsx
rm -f ./components/ui/tabs.tsx

# Components with 0 imports and no clear usage
echo "Removing completely unused components..."
rm -f ./components/ui/alert.tsx
rm -f ./components/ui/aspect-ratio.tsx
rm -f ./components/ui/bar-chart-icon.tsx
rm -f ./components/ui/carousel.tsx
rm -f ./components/ui/code-icon.tsx
rm -f ./components/ui/context-menu.tsx
rm -f ./components/ui/drawer.tsx
rm -f ./components/ui/hover-card.tsx
rm -f ./components/ui/input-otp.tsx
rm -f ./components/ui/loader-icon.tsx
rm -f ./components/ui/menubar.tsx
rm -f ./components/ui/navigation-menu.tsx
rm -f ./components/ui/page-transition.tsx
rm -f ./components/ui/pagination.tsx
rm -f ./components/ui/radio-group.tsx
rm -f ./components/ui/resizable.tsx
rm -f ./components/ui/sonner.tsx
rm -f ./components/ui/switch.tsx

echo "✅ Removed 24 unused shadcn/ui components"
echo ""
echo "Components that still need migration:"
echo "- textarea.tsx (10 imports) -> migrate to ui-daisy/textarea.tsx"
echo "- Several components with low usage that might be candidates for future removal"
echo ""
echo "Run 'npm run build' to verify no broken imports"