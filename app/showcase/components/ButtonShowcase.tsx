"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui-daisy/button';
import { 
  ArrowRight, 
  Download, 
  Heart, 
  Linkedin, 
  Star, 
  Upload,
  Trash2,
  Plus,
  Settings,
  Check,
  Copy
} from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface ButtonShowcaseProps {
  onCopyCode: (code: string, id: string) => void;
  copiedCode: string | null;
  theme?: 'light' | 'dark';
}

export default function ButtonShowcase({ onCopyCode, copiedCode, theme }: ButtonShowcaseProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const handleLoadingClick = (id: string) => {
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const basicVariants = [
    { variant: 'default', label: 'Default' },
    { variant: 'transparent', label: 'Transparent' },
    { variant: 'glass', label: 'Glass' },
    { variant: 'solid', label: 'Solid' },
    { variant: 'hybrid', label: 'Hybrid' },
    { variant: 'outlined', label: 'Outlined' },
    { variant: 'elevated', label: 'Elevated' },
    { variant: 'floating', label: 'Floating' },
    { variant: 'gradient', label: 'Gradient' },
    { variant: 'primary', label: 'Primary' },
    { variant: 'secondary', label: 'Secondary' },
    { variant: 'success', label: 'Success' },
    { variant: 'warning', label: 'Warning' },
    { variant: 'error', label: 'Error' },
    { variant: 'info', label: 'Info' },
    { variant: 'ghost', label: 'Ghost' },
    { variant: 'link', label: 'Link' },
    { variant: 'linkedin', label: 'LinkedIn' },
  ];

  const interactiveVariants = [
    { variant: 'default-interactive', label: 'Default Interactive', description: 'Shadow lift and background change on hover' },
    { variant: 'elevated-interactive', label: 'Elevated Interactive', description: 'Enhanced shadow lift and lightening on hover' },
    { variant: 'gradient-interactive', label: 'Gradient Interactive', description: 'Subtle scale and gradient shift on hover' },
    { variant: 'outlined-interactive', label: 'Outlined Interactive', description: 'Border glow and background fill on hover' },
    { variant: 'ghost-interactive', label: 'Ghost Interactive', description: 'Background appears with shadow on hover' },
    { variant: 'primary-interactive', label: 'Primary Interactive', description: 'Scale and shadow enhancement on hover' },
    { variant: 'secondary-interactive', label: 'Secondary Interactive', description: 'Scale and shadow enhancement on hover' },
    { variant: 'success-interactive', label: 'Success Interactive', description: 'Scale and shadow enhancement on hover' },
    { variant: 'linkedin-interactive', label: 'LinkedIn Interactive', description: 'Lift with gradient darkening on hover' },
  ];

  const sizes = ['sm', 'default', 'lg', 'xl'];
  const specialFeatures = ['hoverable', 'animated', 'interactive'];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-base-content">Button Component</h2>
        <p className="text-base-content/70 mb-6">
          A comprehensive button system with consistent borders and minimal design. Now featuring a centralized
          hover system with interactive variants that provide consistent, reusable hover behaviors across the application.
        </p>
      </div>

      {/* Basic Variants Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">Basic Button Variants</h3>
          <button
            onClick={() => onCopyCode(
              `import { Button } from '@/components/ui-daisy/button';

// Basic variants (no hover effects)
<Button variant="default">Default</Button>
<Button variant="glass">Glass</Button>
<Button variant="outlined">Outlined</Button>
<Button variant="primary">Primary</Button>
<Button variant="linkedin">LinkedIn</Button>

// Interactive variants (with built-in hover effects) ✨
<Button variant="default-interactive">Hover-enabled default</Button>
<Button variant="elevated-interactive">Hover-enabled elevated</Button>
<Button variant="primary-interactive">Hover-enabled primary</Button>
<Button variant="linkedin-interactive">Hover-enabled LinkedIn</Button>`,
              'button-variants'
            )}
            className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'button-variants' ? (
              <>
                <Check className="h-3 w-3" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy code
              </>
            )}
          </button>
        </div>
        
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {basicVariants.map(({ variant, label }) => (
            <motion.div key={variant} variants={staggerItem}>
              <Button variant={variant as any} className="w-full">
                {label}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Interactive Variants - NEW HOVER SYSTEM */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">Interactive Button Variants ✨</h3>
          <button
            onClick={() => onCopyCode(
              `// New Interactive Variants - Built-in Hover Effects
<Button variant="default-interactive">Default with hover effects</Button>
<Button variant="elevated-interactive">Elevated with hover effects</Button>
<Button variant="gradient-interactive">Gradient with hover effects</Button>
<Button variant="outlined-interactive">Outlined with hover effects</Button>
<Button variant="ghost-interactive">Ghost with hover effects</Button>
<Button variant="primary-interactive">Primary with hover effects</Button>
<Button variant="linkedin-interactive">LinkedIn with hover effects</Button>

// Clean API - No manual hover classes needed!
// Hover effects are built into the variant`,
              'interactive-button-variants'
            )}
            className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'interactive-button-variants' ? (
              <>
                <Check className="h-3 w-3" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy code
              </>
            )}
          </button>
        </div>
        
        <div className="bg-info/10 border border-info/20 rounded-lg p-4 mb-4">
          <p className="text-sm text-info-content">
            <strong>✨ New Hover System:</strong> Interactive button variants have built-in hover effects that are consistent 
            across the entire application. No need for manual hover classes - just use the 
            <code className="bg-info/20 px-1 rounded text-xs mx-1">-interactive</code> suffix!
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {interactiveVariants.map(({ variant, label, description }) => (
            <motion.div key={variant} variants={staggerItem} className="space-y-2">
              <Button variant={variant as any} className="w-full">
                {label}
              </Button>
              <div className="text-center">
                <p className="text-xs text-base-content/70 mb-1">
                  {description}
                </p>
                <div className="bg-base-200/50 rounded p-2">
                  <code className="text-xs text-base-content/80">
                    variant="{variant}"
                  </code>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Migration Guide */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-base-content">Migration Guide: Old vs New Button Hover</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Old Way */}
          <div className="space-y-3">
            <h4 className="font-medium text-error flex items-center gap-2">
              ❌ Old Way (Don't Use)
            </h4>
            <div className="bg-base-200 rounded p-3">
              <code className="text-sm text-base-content/80">
                {`<Button 
  hoverable 
  className="hover:shadow-lg hover:-translate-y-0.5"
>
  Manual Hover Classes
</Button>`}
              </code>
            </div>
            <div className="text-sm text-base-content/70">
              <strong>Problems:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Scattered hover classes everywhere</li>
                <li>Inconsistent button behavior</li>
                <li>Hard to maintain and update</li>
                <li>Duplicated hover logic</li>
              </ul>
            </div>
          </div>

          {/* New Way */}
          <div className="space-y-3">
            <h4 className="font-medium text-success flex items-center gap-2">
              ✅ New Way (Recommended)
            </h4>
            <div className="bg-base-200 rounded p-3">
              <code className="text-sm text-base-content/80">
                {`<Button variant="elevated-interactive">
  Clean Interactive Button
</Button>`}
              </code>
            </div>
            <div className="text-sm text-base-content/70">
              <strong>Benefits:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Clean, readable component API</li>
                <li>Consistent hover behavior everywhere</li>
                <li>Easy to maintain and update globally</li>
                <li>Built-in accessibility support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Sizes Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">Sizes</h3>
          <button
            onClick={() => onCopyCode(
              `// Button sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
<Button size="icon"><Settings /></Button>`,
              'button-sizes'
            )}
            className="text-sm text-base-content/60 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'button-sizes' ? (
              <>
                <Check className="h-3 w-3" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy code
              </>
            )}
          </button>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          {sizes.map((size) => (
            <Button key={size} size={size as any} variant="default">
              {size === 'default' ? 'Default' : size.toUpperCase()}
            </Button>
          ))}
          <Button size="icon" variant="default">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* States Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">States</h3>
          <button
            onClick={() => onCopyCode(
              `// Button states
<Button>Normal</Button>
<Button disabled>Disabled</Button>
<Button loading>Loading</Button>
<Button leftIcon={<Download />}>With Left Icon</Button>
<Button rightIcon={<ArrowRight />}>With Right Icon</Button>`,
              'button-states'
            )}
            className="text-sm text-base-content/60 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'button-states' ? (
              <>
                <Check className="h-3 w-3" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy code
              </>
            )}
          </button>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          <Button>Normal</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
          <Button 
            loading={loadingStates['click-me']}
            onClick={() => handleLoadingClick('click-me')}
          >
            Click Me
          </Button>
          <Button leftIcon={<Download className="h-4 w-4" />}>
            Download
          </Button>
          <Button rightIcon={<ArrowRight className="h-4 w-4" />}>
            Continue
          </Button>
          <Button leftIcon={<Linkedin className="h-4 w-4" />} variant="linkedin">
            Connect
          </Button>
        </div>
      </section>

      {/* Legacy Features Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">Legacy Interactive Props ⚠️</h3>
          <button
            onClick={() => onCopyCode(
              `// ⚠️ Legacy props (still supported but prefer interactive variants)
<Button hoverable>Hoverable</Button>
<Button animated>Animated</Button>
<Button interactive>Interactive</Button>

// ✅ Recommended: Use interactive variants instead
<Button variant="elevated-interactive">Modern approach</Button>`,
              'button-features'
            )}
            className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'button-features' ? (
              <>
                <Check className="h-3 w-3" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy code
              </>
            )}
          </button>
        </div>
        
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4">
          <p className="text-sm text-warning-content">
            <strong>⚠️ Legacy Support:</strong> These props are still supported for backward compatibility, 
            but we recommend using interactive variants for new code.
          </p>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          <Button hoverable variant="glass">Hoverable</Button>
          <Button animated variant="glass">Animated</Button>
          <Button interactive variant="glass">Interactive</Button>
          <Button variant="elevated">With Shadow</Button>
          <Button variant="floating">Floating</Button>
        </div>
      </section>

      {/* Border Radius Note */}
      <section className="space-y-4">
        <div className="bg-base-200/50 border border-base-300/50 rounded-2xl p-4">
          <h3 className="text-lg font-semibold text-base-content mb-2">Design Note: Consistent Border Radius</h3>
          <p className="text-base-content/70 text-sm">
            All buttons now use a consistent rounded-2xl border radius to match the accordion and card components. 
            This creates visual harmony across the entire design system.
          </p>
          <div className="mt-3">
            <Button variant="default" className="mr-2">Standard Button</Button>
            <span className="text-xs text-base-content/60">All buttons use rounded-2xl</span>
          </div>
        </div>
      </section>

      {/* Interactive Examples */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-base-content">Interactive Examples</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Action Buttons */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-base-content/70">Action Buttons</h4>
            <div className="space-y-2">
              <Button variant="default-interactive" leftIcon={<Plus className="h-4 w-4" />} className="w-full">
                Create New
              </Button>
              <Button variant="outlined-interactive" leftIcon={<Upload className="h-4 w-4" />} className="w-full">
                Upload File
              </Button>
              <Button variant="error" leftIcon={<Trash2 className="h-4 w-4" />} className="w-full">
                Delete Item
              </Button>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-base-content/70">Social Integration</h4>
            <div className="space-y-2">
              <Button variant="linkedin-interactive" leftIcon={<Linkedin className="h-4 w-4" />} className="w-full">
                Connect on LinkedIn
              </Button>
              <Button variant="glass" leftIcon={<Star className="h-4 w-4" />} className="w-full">
                Star Repository
              </Button>
              <Button variant="default-interactive" leftIcon={<Heart className="h-4 w-4" />} className="w-full">
                Add to Favorites
              </Button>
            </div>
          </div>

          {/* Loading States */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-base-content/70">Loading Examples</h4>
            <div className="space-y-2">
              <Button 
                variant="default-interactive" 
                loading={loadingStates['save']}
                onClick={() => handleLoadingClick('save')}
                className="w-full"
              >
                Save Changes
              </Button>
              <Button 
                variant="success-interactive" 
                loading={loadingStates['publish']}
                onClick={() => handleLoadingClick('publish')}
                className="w-full"
              >
                Publish Post
              </Button>
              <Button 
                variant="outlined-interactive" 
                loading={loadingStates['sync']}
                onClick={() => handleLoadingClick('sync')}
                className="w-full"
              >
                Sync Data
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Button Groups */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-base-content">Button Groups</h3>
        
        <div className="space-y-4">
          <div className="flex gap-1">
            <Button variant="outlined" className="rounded-r-none">Left</Button>
            <Button variant="outlined" className="rounded-none border-x-0">Center</Button>
            <Button variant="outlined" className="rounded-l-none">Right</Button>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm">Cancel</Button>
            <Button variant="default" size="sm">Save</Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outlined" size="icon"><Settings className="h-4 w-4" /></Button>
            <Button variant="outlined" className="flex-1">Settings</Button>
          </div>
        </div>
      </section>
    </div>
  );
}