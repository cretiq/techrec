/**
 * Component Mapping Utilities for shadcn/ui to DaisyUI Migration
 * 
 * This file contains mapping functions and utilities to help migrate
 * from shadcn/ui components to DaisyUI components.
 */

// Button variant mapping from shadcn to DaisyUI
export const buttonVariantMapping = {
  default: 'btn-primary',
  destructive: 'btn-error',
  outline: 'btn-outline',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  link: 'btn-link',
} as const;

// Button size mapping
export const buttonSizeMapping = {
  default: '',
  sm: 'btn-sm',
  lg: 'btn-lg',
  icon: 'btn-square',
} as const;

// Input variant mapping
export const inputVariantMapping = {
  default: 'input-bordered',
  destructive: 'input-error',
  // DaisyUI doesn't have direct equivalents for all shadcn variants
  // We'll use base classes and add custom styling as needed
} as const;

// Card component mapping
export const cardComponentMapping = {
  Card: 'card',
  CardHeader: 'card-body', // DaisyUI doesn't separate header/body as strictly
  CardTitle: 'card-title',
  CardDescription: 'text-base-content/70',
  CardContent: 'card-body',
  CardFooter: 'card-actions',
} as const;

// Badge variant mapping
export const badgeVariantMapping = {
  default: 'badge',
  secondary: 'badge-secondary',
  destructive: 'badge-error',
  outline: 'badge-outline',
} as const;

// Dialog/Modal mapping
export const dialogComponentMapping = {
  Dialog: 'modal',
  DialogContent: 'modal-box',
  DialogHeader: 'modal-header',
  DialogTitle: 'font-bold text-lg',
  DialogDescription: 'py-4',
  DialogFooter: 'modal-action',
} as const;

// Tabs mapping
export const tabsComponentMapping = {
  Tabs: 'tabs',
  TabsList: 'tabs-boxed', // or 'tabs-bordered'
  TabsTrigger: 'tab',
  TabsContent: 'tab-content',
} as const;

// Select mapping
export const selectComponentMapping = {
  Select: 'select',
  SelectTrigger: 'select-bordered',
  SelectContent: 'dropdown-content',
  SelectItem: 'option',
  SelectValue: '',
} as const;

// Switch mapping
export const switchComponentMapping = {
  Switch: 'toggle',
} as const;

// Checkbox mapping
export const checkboxComponentMapping = {
  Checkbox: 'checkbox',
} as const;

// Progress mapping
export const progressComponentMapping = {
  Progress: 'progress',
} as const;

// Avatar mapping
export const avatarComponentMapping = {
  Avatar: 'avatar',
  AvatarImage: 'w-full rounded-full',
  AvatarFallback: 'placeholder',
} as const;

// Accordion mapping
export const accordionComponentMapping = {
  Accordion: 'collapse',
  AccordionItem: 'collapse',
  AccordionTrigger: 'collapse-title',
  AccordionContent: 'collapse-content',
} as const;

// Alert Dialog mapping
export const alertDialogComponentMapping = {
  AlertDialog: 'modal',
  AlertDialogContent: 'modal-box',
  AlertDialogHeader: 'modal-header',
  AlertDialogTitle: 'font-bold text-lg',
  AlertDialogDescription: 'py-4',
  AlertDialogFooter: 'modal-action',
  AlertDialogAction: 'btn',
  AlertDialogCancel: 'btn btn-outline',
} as const;

// Sheet mapping (DaisyUI uses drawer for similar functionality)
export const sheetComponentMapping = {
  Sheet: 'drawer',
  SheetContent: 'drawer-side',
  SheetHeader: 'drawer-header',
  SheetTitle: 'font-bold text-lg',
  SheetDescription: 'text-base-content/70',
  SheetFooter: 'drawer-footer',
} as const;

// Hover Card mapping (DaisyUI uses tooltip or dropdown)
export const hoverCardComponentMapping = {
  HoverCard: 'tooltip',
  HoverCardContent: 'tooltip-content',
  HoverCardTrigger: 'tooltip-trigger',
} as const;

// Command mapping (DaisyUI doesn't have direct equivalent, use input + dropdown)
export const commandComponentMapping = {
  Command: 'input input-bordered',
  CommandInput: 'input input-bordered',
  CommandList: 'dropdown-content menu',
  CommandItem: 'menu-item',
  CommandEmpty: 'text-center text-base-content/50',
  CommandGroup: 'menu-title',
} as const;

// Utility function to get DaisyUI class for shadcn button
export function getDaisyUIButtonClass(variant?: string, size?: string): string {
  const baseClass = 'btn';
  const variantClass = variant && variant in buttonVariantMapping 
    ? buttonVariantMapping[variant as keyof typeof buttonVariantMapping]
    : '';
  const sizeClass = size && size in buttonSizeMapping
    ? buttonSizeMapping[size as keyof typeof buttonSizeMapping]
    : '';
  
  return [baseClass, variantClass, sizeClass].filter(Boolean).join(' ');
}

// Utility function to get DaisyUI class for shadcn input
export function getDaisyUIInputClass(variant?: string): string {
  const baseClass = 'input';
  const variantClass = variant && variant in inputVariantMapping
    ? inputVariantMapping[variant as keyof typeof inputVariantMapping]
    : 'input-bordered';
  
  return [baseClass, variantClass].filter(Boolean).join(' ');
}

// Utility function to get DaisyUI class for shadcn badge
export function getDaisyUIBadgeClass(variant?: string): string {
  const baseClass = 'badge';
  const variantClass = variant && variant in badgeVariantMapping
    ? badgeVariantMapping[variant as keyof typeof badgeVariantMapping]
    : '';
  
  return [baseClass, variantClass].filter(Boolean).join(' ');
}

// Theme color mapping from shadcn CSS variables to DaisyUI
export const themeColorMapping = {
  // shadcn -> DaisyUI
  'hsl(var(--primary))': 'oklch(var(--p))',
  'hsl(var(--primary-foreground))': 'oklch(var(--pc))',
  'hsl(var(--secondary))': 'oklch(var(--s))',
  'hsl(var(--secondary-foreground))': 'oklch(var(--sc))',
  'hsl(var(--accent))': 'oklch(var(--a))',
  'hsl(var(--accent-foreground))': 'oklch(var(--ac))',
  'hsl(var(--destructive))': 'oklch(var(--er))',
  'hsl(var(--destructive-foreground))': 'oklch(var(--erc))',
  'hsl(var(--background))': 'oklch(var(--b1))',
  'hsl(var(--foreground))': 'oklch(var(--bc))',
  'hsl(var(--card))': 'oklch(var(--b1))',
  'hsl(var(--card-foreground))': 'oklch(var(--bc))',
  'hsl(var(--muted))': 'oklch(var(--b2))',
  'hsl(var(--muted-foreground))': 'oklch(var(--bc) / 0.6)',
  'hsl(var(--border))': 'oklch(var(--b3))',
  'hsl(var(--input))': 'oklch(var(--b3))',
  'hsl(var(--ring))': 'oklch(var(--p))',
} as const;

// Migration status tracking
export interface MigrationStatus {
  component: string;
  status: 'pending' | 'in-progress' | 'completed' | 'needs-review';
  notes?: string;
  daisyUIEquivalent?: string;
  customImplementationNeeded?: boolean;
}

// Component migration checklist
export const migrationChecklist: MigrationStatus[] = [
  { component: 'Button', status: 'pending', daisyUIEquivalent: 'btn' },
  { component: 'Input', status: 'pending', daisyUIEquivalent: 'input' },
  { component: 'Card', status: 'pending', daisyUIEquivalent: 'card' },
  { component: 'Select', status: 'pending', daisyUIEquivalent: 'select' },
  { component: 'Tabs', status: 'pending', daisyUIEquivalent: 'tabs' },
  { component: 'Dialog', status: 'pending', daisyUIEquivalent: 'modal' },
  { component: 'Badge', status: 'pending', daisyUIEquivalent: 'badge' },
  { component: 'Progress', status: 'pending', daisyUIEquivalent: 'progress' },
  { component: 'Avatar', status: 'pending', daisyUIEquivalent: 'avatar' },
  { component: 'Switch', status: 'pending', daisyUIEquivalent: 'toggle' },
  { component: 'Checkbox', status: 'pending', daisyUIEquivalent: 'checkbox' },
  { component: 'Accordion', status: 'pending', daisyUIEquivalent: 'collapse' },
  { component: 'AlertDialog', status: 'pending', daisyUIEquivalent: 'modal' },
  { component: 'Sheet', status: 'pending', daisyUIEquivalent: 'drawer', customImplementationNeeded: true },
  { component: 'HoverCard', status: 'pending', daisyUIEquivalent: 'tooltip', customImplementationNeeded: true },
  { component: 'Command', status: 'pending', daisyUIEquivalent: 'input + dropdown', customImplementationNeeded: true },
  { component: 'Carousel', status: 'pending', daisyUIEquivalent: 'carousel' },
  { component: 'InputOTP', status: 'pending', customImplementationNeeded: true, notes: 'No direct DaisyUI equivalent' },
];

// Helper function to update migration status
export function updateMigrationStatus(component: string, status: MigrationStatus['status'], notes?: string): void {
  const item = migrationChecklist.find(item => item.component === component);
  if (item) {
    item.status = status;
    if (notes) item.notes = notes;
  }
}

// Helper function to get migration progress
export function getMigrationProgress(): { completed: number; total: number; percentage: number } {
  const completed = migrationChecklist.filter(item => item.status === 'completed').length;
  const total = migrationChecklist.length;
  const percentage = Math.round((completed / total) * 100);
  
  return { completed, total, percentage };
} 