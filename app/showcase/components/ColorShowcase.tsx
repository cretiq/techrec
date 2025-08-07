"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-daisy/card';
import { Button } from '@/components/ui-daisy/button';
import { Badge } from '@/components/ui-daisy/badge';
import { 
  Copy, 
  Check, 
  Palette,
  Droplet,
  Contrast,
  Sun
} from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface ColorShowcaseProps {
  onCopyCode: (code: string, id: string) => void;
  copiedCode: string | null;
  theme?: 'light' | 'dark';
}

// Color definitions from tailwind.config.ts
const colorPalettes = {
  brand: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  surface: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  }
};

const shadowStyles = {
  'soft': '0 2px 8px 0 rgba(0, 0, 0, 0.06)',
  'medium': '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
  'large': '0 8px 32px 0 rgba(0, 0, 0, 0.12)',
  'colored': '0 4px 16px 0 rgba(139, 92, 246, 0.15)',
  'brand': '0 4px 16px 0 rgba(14, 165, 233, 0.15)',
  'success': '0 4px 16px 0 rgba(34, 197, 94, 0.15)',
  'error': '0 4px 16px 0 rgba(239, 68, 68, 0.15)',
  'glow': '0 0 24px rgba(139, 92, 246, 0.15)',
  'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

export default function ColorShowcase({ onCopyCode, copiedCode, theme }: ColorShowcaseProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-base-content">Color System</h2>
        <p className="text-base-content/70 mb-6">
          A comprehensive color palette with semantic meanings, carefully crafted for accessibility 
          and minimal design. All colors maintain the subtle aesthetic of the Linear-style interface.
        </p>
      </div>

      {/* Brand Colors */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2 text-base-content">
            <Palette className="h-5 w-5" />
            Brand Colors
          </h3>
          <button
            onClick={() => onCopyCode(
              `// Brand color usage
<div className="bg-brand-500">Primary brand color</div>
<div className="text-brand-600">Brand text</div>
<Button variant="gradient-brand">Brand button</Button>

// Tailwind classes
bg-brand-50 through bg-brand-950
text-brand-50 through text-brand-950
border-brand-50 through border-brand-950`,
              'brand-colors'
            )}
            className="text-sm text-base-content/60 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'brand-colors' ? (
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
          className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-11 gap-2"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {Object.entries(colorPalettes.brand).map(([shade, color]) => (
            <motion.div key={shade} variants={staggerItem}>
              <button
                onClick={() => handleCopyColor(color)}
                className="w-full group relative"
              >
                <div 
                  className="h-20 rounded-lg shadow-medium hover:shadow-large transition-shadow duration-100"
                  style={{ backgroundColor: color }}
                />
                <div className="mt-2 text-center">
                  <p className="text-xs font-medium">{shade}</p>
                  <p className="text-xs text-base-content/60">{color}</p>
                </div>
                {copiedColor === color && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                )}
              </button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Semantic Colors */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-base-content">Semantic Colors</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Success */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Check className="h-5 w-5 text-success" />
                Success
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(colorPalettes.success).map(([shade, color]) => (
                  <button
                    key={shade}
                    onClick={() => handleCopyColor(color)}
                    className="w-full flex items-center gap-3 p-2 rounded hover:bg-base-200 transition-colors"
                  >
                    <div 
                      className="w-10 h-10 rounded shadow-soft"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">success-{shade}</p>
                      <p className="text-xs text-base-content/60">{color}</p>
                    </div>
                    {copiedColor === color && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Warning */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sun className="h-5 w-5 text-warning" />
                Warning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(colorPalettes.warning).map(([shade, color]) => (
                  <button
                    key={shade}
                    onClick={() => handleCopyColor(color)}
                    className="w-full flex items-center gap-3 p-2 rounded hover:bg-base-200 transition-colors"
                  >
                    <div 
                      className="w-10 h-10 rounded shadow-soft"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">warning-{shade}</p>
                      <p className="text-xs text-base-content/60">{color}</p>
                    </div>
                    {copiedColor === color && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Error */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Droplet className="h-5 w-5 text-error" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(colorPalettes.error).map(([shade, color]) => (
                  <button
                    key={shade}
                    onClick={() => handleCopyColor(color)}
                    className="w-full flex items-center gap-3 p-2 rounded hover:bg-base-200 transition-colors"
                  >
                    <div 
                      className="w-10 h-10 rounded shadow-soft"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">error-{shade}</p>
                      <p className="text-xs text-base-content/60">{color}</p>
                    </div>
                    {copiedColor === color && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Surface/Neutral Colors */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2 text-base-content">
          <Contrast className="h-5 w-5" />
          Surface Colors
        </h3>
        
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-11 gap-2"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {Object.entries(colorPalettes.surface).map(([shade, color]) => (
            <motion.div key={shade} variants={staggerItem}>
              <button
                onClick={() => handleCopyColor(color)}
                className="w-full group relative"
              >
                <div 
                  className="h-20 rounded-lg shadow-medium hover:shadow-large transition-shadow duration-100 border border-base-300"
                  style={{ backgroundColor: color }}
                />
                <div className="mt-2 text-center">
                  <p className="text-xs font-medium">{shade}</p>
                  <p className="text-xs text-base-content/60">{color}</p>
                </div>
                {copiedColor === color && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                )}
              </button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Shadow System */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">Shadow System</h3>
          <button
            onClick={() => onCopyCode(
              `// Shadow utilities
<div className="shadow-soft">Soft shadow</div>
<div className="shadow-medium">Medium shadow</div>
<div className="shadow-large">Large shadow</div>
<div className="shadow-colored">Colored shadow</div>
<div className="shadow-brand">Brand shadow</div>
<div className="shadow-glow">Glow effect</div>

// Hover effects
<Card className="shadow-medium hover:shadow-large">
  Hover for larger shadow
</Card>`,
              'shadow-system'
            )}
            className="text-sm text-base-content/60 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'shadow-system' ? (
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(shadowStyles).map(([name, shadow]) => (
            <Card 
              key={name} 
              variant="glass" 
              className="transition-all duration-100"
              style={{ boxShadow: shadow }}
            >
              <CardHeader>
                <CardTitle className="text-base">{name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-base-content/60 font-mono">{shadow}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Gradient Examples */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-base-content">Gradient Examples</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="h-32 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 flex items-center justify-center text-white font-medium">
            Brand Gradient
          </div>
          <div className="h-32 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 flex items-center justify-center text-white font-medium">
            Violet to Pink
          </div>
          <div className="h-32 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-white font-medium">
            Blue to Cyan
          </div>
          <div className="h-32 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white font-medium">
            Emerald to Teal
          </div>
          <div className="h-32 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-medium">
            Amber Gradient
          </div>
          <div className="h-32 rounded-lg bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300 flex items-center justify-center font-medium">
            Subtle Base
          </div>
        </div>
      </section>

      {/* Color Usage Examples */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-base-content">Usage Examples</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-base-content/70 mb-3">Buttons</h4>
            <div className="flex flex-wrap gap-2">
              <Button variant="gradient-brand">Brand Button</Button>
              <Button variant="success">Success Button</Button>
              <Button variant="warning">Warning Button</Button>
              <Button variant="error">Error Button</Button>
              <Button variant="gradient">Custom Gradient</Button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-base-content/70 mb-3">Badges</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="gradient-brand">Brand</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="glass">Glass</Badge>
              <Badge variant="gradient">Gradient</Badge>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-base-content/70 mb-3">Text Colors</h4>
            <div className="space-y-2">
              <p className="text-brand-600">Brand colored text</p>
              <p className="text-success">Success colored text</p>
              <p className="text-warning">Warning colored text</p>
              <p className="text-error">Error colored text</p>
              <p className="text-base-content/70">Muted text (70% opacity)</p>
              <p className="text-base-content/50">Subtle text (50% opacity)</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}