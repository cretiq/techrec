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

  const variants = [
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
    { variant: 'gradient-brand', label: 'Gradient Brand' },
    { variant: 'linkedin', label: 'LinkedIn' },
  ];

  const sizes = ['sm', 'default', 'lg', 'xl'];
  const specialFeatures = ['hoverable', 'animated', 'interactive'];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-base-content">Button Component</h2>
        <p className="text-base-content/70 mb-6">
          A comprehensive button system with consistent borders and minimal design. All variants now share
          the same subtle border styling and rounded corners for perfect visual consistency.
        </p>
      </div>

      {/* Variants Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">Variants</h3>
          <button
            onClick={() => onCopyCode(
              `import { Button } from '@/components/ui-daisy/button';

// All button variants now have consistent borders and styling
<Button variant="default">Default</Button>
<Button variant="transparent">Transparent</Button>
<Button variant="glass">Glass</Button>
<Button variant="solid">Solid</Button>
<Button variant="hybrid">Hybrid</Button>
<Button variant="outlined">Outlined</Button>
<Button variant="elevated">Elevated</Button>
<Button variant="floating">Floating</Button>
<Button variant="gradient">Gradient</Button>
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>
<Button variant="error">Error</Button>
<Button variant="info">Info</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button variant="gradient-brand">Gradient Brand</Button>
<Button variant="linkedin">LinkedIn</Button>`,
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
          {variants.map(({ variant, label }) => (
            <motion.div key={variant} variants={staggerItem}>
              <Button variant={variant as any} className="w-full">
                {label}
              </Button>
            </motion.div>
          ))}
        </motion.div>
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

      {/* Special Features Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">Special Features</h3>
          <button
            onClick={() => onCopyCode(
              `// Button special features
<Button hoverable>Hoverable</Button>
<Button animated>Animated</Button>
<Button interactive>Interactive</Button>
<Button variant="elevated">With Shadow</Button>
<Button variant="floating">Floating</Button>`,
              'button-features'
            )}
            className="text-sm text-base-content/60 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
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
              <Button variant="default" leftIcon={<Plus className="h-4 w-4" />} className="w-full">
                Create New
              </Button>
              <Button variant="outlined" leftIcon={<Upload className="h-4 w-4" />} className="w-full">
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
              <Button variant="linkedin" leftIcon={<Linkedin className="h-4 w-4" />} className="w-full">
                Connect on LinkedIn
              </Button>
              <Button variant="glass" leftIcon={<Star className="h-4 w-4" />} className="w-full">
                Star Repository
              </Button>
              <Button variant="default" leftIcon={<Heart className="h-4 w-4" />} className="w-full">
                Add to Favorites
              </Button>
            </div>
          </div>

          {/* Loading States */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-base-content/70">Loading Examples</h4>
            <div className="space-y-2">
              <Button 
                variant="default" 
                loading={loadingStates['save']}
                onClick={() => handleLoadingClick('save')}
                className="w-full"
              >
                Save Changes
              </Button>
              <Button 
                variant="success" 
                loading={loadingStates['publish']}
                onClick={() => handleLoadingClick('publish')}
                className="w-full"
              >
                Publish Post
              </Button>
              <Button 
                variant="outlined" 
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