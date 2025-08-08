"use client";

import React from 'react';
import { Check, Copy, Type, AlignLeft, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface TypographyShowcaseProps {
  onCopyCode: (code: string, id: string) => void;
  copiedCode: string | null;
  theme?: 'light' | 'dark';
}

export default function TypographyShowcase({ onCopyCode, copiedCode, theme }: TypographyShowcaseProps) {
  const fontSizes = [
    { name: 'text-xs', size: '0.75rem', lineHeight: '1rem', example: 'Extra Small Text' },
    { name: 'text-sm', size: '0.875rem', lineHeight: '1.25rem', example: 'Small Text' },
    { name: 'text-base', size: '1rem', lineHeight: '1.5rem', example: 'Base Text' },
    { name: 'text-lg', size: '1.125rem', lineHeight: '1.75rem', example: 'Large Text' },
    { name: 'text-xl', size: '1.25rem', lineHeight: '1.75rem', example: 'Extra Large Text' },
    { name: 'text-2xl', size: '1.5rem', lineHeight: '2rem', example: 'Double Extra Large' },
    { name: 'text-3xl', size: '1.875rem', lineHeight: '2.25rem', example: 'Triple Extra Large' },
    { name: 'text-4xl', size: '2.25rem', lineHeight: '2.5rem', example: 'Huge Text' },
    { name: 'text-5xl', size: '3rem', lineHeight: '1', example: 'Massive Text' },
    { name: 'text-6xl', size: '3.75rem', lineHeight: '1', example: 'Giant Text' },
  ];

  const fontWeights = [
    { name: 'font-light', weight: '300', example: 'Light Weight Text' },
    { name: 'font-normal', weight: '400', example: 'Normal Weight Text' },
    { name: 'font-medium', weight: '500', example: 'Medium Weight Text' },
    { name: 'font-semibold', weight: '600', example: 'Semibold Weight Text' },
    { name: 'font-bold', weight: '700', example: 'Bold Weight Text' },
    { name: 'font-extrabold', weight: '800', example: 'Extra Bold Weight Text' },
  ];

  const textColors = [
    { name: 'text-base-content', example: 'Primary Text' },
    { name: 'text-base-content', example: 'Secondary Text' },
    { name: 'text-gray-300', example: 'Tertiary Text' },
    { name: 'text-base-content/70', example: 'Muted Text' },
    { name: 'text-base-content/60', example: 'Subtle Text' },
    { name: 'text-brand-400', example: 'Brand Text' },
    { name: 'text-success', example: 'Success Text' },
    { name: 'text-warning', example: 'Warning Text' },
    { name: 'text-error', example: 'Error Text' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-base-content">Typography System</h2>
        <p className="text-base-content/70 mb-6">
          A comprehensive typography system with consistent scales, weights, and colors.
          Designed for optimal readability and the minimal Linear aesthetic.
        </p>
      </div>

      {/* Font Sizes */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content flex items-center gap-2">
            <Type className="h-5 w-5" />
            Font Sizes
          </h3>
          <button
            onClick={() => onCopyCode(
              `// Typography scale
<h1 className="text-6xl font-bold">Giant Heading</h1>
<h2 className="text-4xl font-semibold">Large Heading</h2>
<h3 className="text-2xl font-medium">Medium Heading</h3>
<p className="text-base">Body text</p>
<span className="text-sm text-base-content/70">Small text</span>`,
              'typography-sizes'
            )}
            className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'typography-sizes' ? (
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
          className="space-y-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {fontSizes.map((font) => (
            <motion.div 
              key={font.name} 
              variants={staggerItem}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-800/50 hover:border-base-300/50 transition-colors"
            >
              <div className="flex items-center gap-6">
                <code className="text-xs text-base-content/70 font-mono w-20">{font.name}</code>
                <span className="text-xs text-base-content/60 w-24">{font.size}</span>
                <span className={`${font.name} text-base-content`}>{font.example}</span>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(font.name)}
                className="p-2 rounded hover:bg-base-200/60 transition-colors"
              >
                <Copy className="h-3 w-3 text-base-content/70" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Font Weights */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Font Weights
          </h3>
          <button
            onClick={() => onCopyCode(
              `// Font weights
<h1 className="font-light">Light heading</h1>
<h2 className="font-normal">Normal heading</h2>
<h3 className="font-medium">Medium heading</h3>
<h4 className="font-semibold">Semibold heading</h4>
<h5 className="font-bold">Bold heading</h5>
<h6 className="font-extrabold">Extra bold heading</h6>`,
              'typography-weights'
            )}
            className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'typography-weights' ? (
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

        <div className="space-y-4">
          {fontWeights.map((weight) => (
            <div 
              key={weight.name}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-800/50 hover:border-base-300/50 transition-colors"
            >
              <div className="flex items-center gap-6">
                <code className="text-xs text-base-content/70 font-mono w-24">{weight.name}</code>
                <span className="text-xs text-base-content/60 w-16">{weight.weight}</span>
                <span className={`${weight.name} text-xl text-base-content`}>{weight.example}</span>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(weight.name)}
                className="p-2 rounded hover:bg-base-200/60 transition-colors"
              >
                <Copy className="h-3 w-3 text-base-content/70" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Text Colors */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content flex items-center gap-2">
            <AlignLeft className="h-5 w-5" />
            Text Colors
          </h3>
          <button
            onClick={() => onCopyCode(
              `// Text colors for dark theme
<p className="text-base-content">Primary text</p>
<p className="text-base-content">Secondary text</p>
<p className="text-base-content/70">Muted text</p>
<p className="text-brand-400">Brand accent</p>
<p className="text-success">Success state</p>
<p className="text-warning">Warning state</p>
<p className="text-error">Error state</p>`,
              'typography-colors'
            )}
            className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'typography-colors' ? (
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

        <div className="space-y-4">
          {textColors.map((color) => (
            <div 
              key={color.name}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-800/50 hover:border-base-300/50 transition-colors"
            >
              <div className="flex items-center gap-6">
                <code className="text-xs text-base-content/70 font-mono w-28">{color.name}</code>
                <span className={`${color.name} text-lg font-medium`}>{color.example}</span>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(color.name)}
                className="p-2 rounded hover:bg-base-200/60 transition-colors"
              >
                <Copy className="h-3 w-3 text-base-content/70" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Typography Examples */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-base-content">Typography Examples</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Heading Hierarchy */}
          <div className="p-6 rounded-lg border border-gray-800/50">
            <h4 className="text-lg font-semibold text-base-content mb-4">Heading Hierarchy</h4>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-base-content">Main Heading</h1>
              <h2 className="text-3xl font-semibold text-base-content">Section Heading</h2>
              <h3 className="text-2xl font-medium text-base-content">Subsection</h3>
              <h4 className="text-xl font-medium text-base-content">Sub-heading</h4>
              <h5 className="text-lg font-medium text-gray-300">Minor Heading</h5>
              <h6 className="text-base font-medium text-base-content/70">Small Heading</h6>
            </div>
          </div>

          {/* Body Text Examples */}
          <div className="p-6 rounded-lg border border-gray-800/50">
            <h4 className="text-lg font-semibold text-base-content mb-4">Body Text</h4>
            <div className="space-y-4">
              <p className="text-base text-base-content leading-relaxed">
                This is a paragraph of body text demonstrating the base text style. 
                It has good readability and proper line height for comfortable reading.
              </p>
              <p className="text-sm text-gray-300 leading-relaxed">
                This is smaller body text that might be used for captions, 
                secondary information, or supplementary content.
              </p>
              <p className="text-xs text-base-content/70 leading-relaxed">
                This is very small text used for fine print, metadata, 
                or other minimal information that needs to be present but unobtrusive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Code and Monospace */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-base-content">Code Typography</h3>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-base-300/30">
            <p className="text-base-content mb-2">Inline code: <code className="px-2 py-1 bg-gray-800/50 rounded text-brand-400 font-mono text-sm">const variable = true;</code></p>
          </div>
          
          <div className="p-4 rounded-lg border border-base-300/30 bg-base-100/60">
            <pre className="text-sm text-gray-300 font-mono leading-relaxed overflow-x-auto">
              <code>{`// Code block example
function createComponent() {
  return {
    name: 'Button',
    variant: 'primary',
    onClick: () => console.log('clicked')
  };
}`}</code>
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}