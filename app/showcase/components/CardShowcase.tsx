"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui-daisy/card';
import { Button } from '@/components/ui-daisy/button';
import { Badge } from '@/components/ui-daisy/badge';
import { 
  Star, 
  Clock, 
  MapPin, 
  Building, 
  DollarSign,
  ArrowRight,
  Heart,
  Share2,
  Check,
  Copy
} from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface CardShowcaseProps {
  onCopyCode: (code: string, id: string) => void;
  copiedCode: string | null;
  theme?: 'light' | 'dark';
}

export default function CardShowcase({ onCopyCode, copiedCode, theme }: CardShowcaseProps) {
  // Core DaisyUI variants (like button's btn-primary, btn-secondary)
  const coreDaisyUIVariants = [
    { variant: 'default', label: 'Default', description: 'Pure DaisyUI card bg-base-100' },
    { variant: 'primary', label: 'Primary', description: 'DaisyUI card bg-primary (like btn-primary)' },
    { variant: 'secondary', label: 'Secondary', description: 'DaisyUI card bg-secondary' },
    { variant: 'accent', label: 'Accent', description: 'DaisyUI card bg-accent' },
    { variant: 'neutral', label: 'Neutral', description: 'DaisyUI card bg-neutral' },
  ];
  
  // DaisyUI style variants (like button's btn-ghost, btn-outline)
  const styleDaisyUIVariants = [
    { variant: 'bordered', label: 'Bordered', description: 'DaisyUI card-border (like btn-outline)' },
    { variant: 'flat', label: 'Flat', description: 'DaisyUI card with no shadow' },
    { variant: 'elevated', label: 'Elevated', description: 'DaisyUI card with shadow-lg' },
    { variant: 'outlined', label: 'Outlined', description: 'Transparent with DaisyUI border' },
  ];
  
  // Custom variants (like button's LinkedIn custom styling)
  const customVariants = [
    { variant: 'glass', label: 'Glass', description: 'Custom glass effect (no DaisyUI equivalent)' },
    { variant: 'floating', label: 'Floating', description: 'Enhanced shadow with backdrop blur' },
    { variant: 'gradient', label: 'Gradient', description: 'Custom gradient (no DaisyUI equivalent)' },
    { variant: 'selected', label: 'Selected', description: 'App-specific selected state' },
  ];

  const interactiveCardVariants = [
    { variant: 'default-interactive', label: 'Default Interactive', description: 'Pure DaisyUI with hover effects' },
    { variant: 'primary-interactive', label: 'Primary Interactive', description: 'DaisyUI primary with hover (like button)' },
    { variant: 'bordered-interactive', label: 'Bordered Interactive', description: 'DaisyUI border with hover effects' },
    { variant: 'elevated-interactive', label: 'Elevated Interactive', description: 'DaisyUI shadow with enhanced hover' },
    { variant: 'glass-interactive', label: 'Glass Interactive', description: 'Custom glass effect with hover' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-base-content">Card Component</h2>
        <p className="text-base-content/70 mb-6">
          Card components following the <strong>same DaisyUI-first approach as Button</strong>. 
          Uses pure <code className="bg-base-200 px-1 rounded text-xs">card bg-primary</code> classes 
          (like <code className="bg-base-200 px-1 rounded text-xs mx-1">btn btn-primary</code>) with minimal custom CSS only where needed.
        </p>
      </div>

      {/* Core DaisyUI Variants */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">Core DaisyUI Variants (Like Button)</h3>
          <button
            onClick={() => onCopyCode(
              `import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui-daisy/card';

// Pure DaisyUI variants (like btn-primary, btn-secondary) ✨
<Card variant="primary">card bg-primary text-primary-content</Card>
<Card variant="secondary">card bg-secondary text-secondary-content</Card>
<Card variant="accent">card bg-accent text-accent-content</Card>

// DaisyUI style variants (like btn-ghost, btn-outline)
<Card variant="bordered">card card-border</Card>
<Card variant="outlined">card bg-transparent card-border</Card>

// DaisyUI sizes (like btn-sm, btn-lg)
<Card size="sm">card-sm</Card>
<Card size="lg">card-lg</Card>`,
              'core-daisyui-variants'
            )}
            className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'core-daisyui-variants' ? (
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {coreDaisyUIVariants.map(({ variant, label, description }) => (
            <motion.div key={variant} variants={staggerItem}>
              <Card variant={variant as any} className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">
                    {description}
                  </p>
                  <div className="bg-black/5 rounded p-2">
                    <code className="text-xs">
                      variant="{variant}"
                    </code>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* DaisyUI Style Variants */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">DaisyUI Style Variants</h3>
          <button
            onClick={() => onCopyCode(
              `// DaisyUI style variants (like btn-ghost, btn-outline)
<Card variant="bordered">card bg-base-100 card-border</Card>
<Card variant="flat">card bg-base-100 (no shadow)</Card>
<Card variant="elevated">card bg-base-100 shadow-lg</Card>
<Card variant="outlined">card bg-transparent card-border</Card>`,
              'style-variants'
            )}
            className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'style-variants' ? (
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {styleDaisyUIVariants.map(({ variant, label, description }) => (
            <motion.div key={variant} variants={staggerItem}>
              <Card variant={variant as any} className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-base-content/70 mb-2">
                    {description}
                  </p>
                  <div className="bg-base-200/50 rounded p-2">
                    <code className="text-xs text-base-content/80">
                      variant="{variant}"
                    </code>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Custom Variants */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">Custom Variants (Minimal)</h3>
          <button
            onClick={() => onCopyCode(
              `// Custom variants only where DaisyUI has no equivalent
<Card variant="glass">Custom glass effect</Card>
<Card variant="selected">App-specific selected state</Card>
<Card variant="gradient">Custom gradient background</Card>

// Like button's LinkedIn custom styling - minimal custom CSS`,
              'custom-variants'
            )}
            className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'custom-variants' ? (
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {customVariants.map(({ variant, label, description }) => (
            <motion.div key={variant} variants={staggerItem}>
              <Card variant={variant as any} className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-base-content/70 mb-2">
                    {description}
                  </p>
                  <div className="bg-base-200/50 rounded p-2">
                    <code className="text-xs text-base-content/80">
                      variant="{variant}"
                    </code>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* DaisyUI Size Variants */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">DaisyUI Size Variants ✨</h3>
          <button
            onClick={() => onCopyCode(
              `// DaisyUI native size support
<Card size="xs">Extra small card</Card>
<Card size="sm">Small card</Card>
<Card size="md">Medium card (default)</Card>
<Card size="lg">Large card</Card>
<Card size="xl">Extra large card</Card>

// Legacy compact support (maps to size="sm")
<Card compact>Legacy compact card</Card>`,
              'card-sizes'
            )}
            className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'card-sizes' ? (
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
            <strong>✨ DaisyUI Native:</strong> Size variants use DaisyUI's built-in 
            <code className="bg-info/20 px-1 rounded text-xs mx-1">card-{'{size}'}</code> classes for consistent sizing across your app.
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
            <motion.div key={size} variants={staggerItem}>
              <Card variant="solid" size={size} className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{size.toUpperCase()}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-base-content/70">
                    DaisyUI card-{size}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Interactive Variants - NEW HOVER SYSTEM */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">Interactive Card Variants ✨</h3>
          <button
            onClick={() => onCopyCode(
              `// DaisyUI Interactive Variants (Same Pattern as Button) ✨
<Card variant="primary-interactive">card bg-primary + hover</Card>
<Card variant="bordered-interactive">card card-border + hover</Card>
<Card variant="elevated-interactive">card shadow-lg + hover</Card>

// Compare to Button's interactive pattern:
<Button variant="primary">btn btn-primary</Button>
<Card variant="primary-interactive">card bg-primary + hover</Card>

// Same philosophy: DaisyUI base + minimal enhancements`,
              'interactive-variants'
            )}
            className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'interactive-variants' ? (
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
            <strong>✨ Same as Button Component:</strong> Interactive variants follow the exact same DaisyUI-first approach. 
            Pure <code className="bg-info/20 px-1 rounded text-xs mx-1">card bg-primary</code> classes 
            (like <code className="bg-info/20 px-1 rounded text-xs mx-1">btn btn-primary</code>) with 
            <code className="bg-info/20 px-1 rounded text-xs mx-1">-interactive</code> suffix for hover effects!
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {interactiveCardVariants.map(({ variant, label, description }) => (
            <motion.div key={variant} variants={staggerItem}>
              <Card variant={variant as any} className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-base-content/70 mb-3">
                    {description}
                  </p>
                  <div className="bg-base-200/50 rounded p-2">
                    <code className="text-xs text-base-content/80">
                      variant="{variant}"
                    </code>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Migration Guide */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-base-content">Philosophy: Same DaisyUI-First Approach as Button</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Old Way */}
          <Card variant="outlined" className="">
            <CardHeader>
              <CardTitle className="text-error flex items-center gap-2">
                ❌ Old Approach (Over-Engineered Custom)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-base-200 rounded p-3">
                <code className="text-sm text-base-content/80">
                  {`<Card className="
  bg-base-100
  border-2
  border-base-300
  shadow-sm
  hover:shadow-md 
  hover:bg-base-200
  transition-all 
  duration-200
  rounded-lg
  p-4"
>`}
                </code>
              </div>
              <div className="text-sm text-base-content/70">
                <strong>Problems:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Manual CSS for every card variation</li>
                  <li>Inconsistent styling across components</li>
                  <li>Large CSS bundle with duplicated styles</li>
                  <li>No design system consistency</li>
                  <li>Hard to maintain responsive behavior</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* New Way */}
          <Card variant="gradient-interactive" className="">
            <CardHeader>
              <CardTitle className="text-success flex items-center gap-2">
                ✅ New Approach (DaisyUI-First Like Button)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-base-200 rounded p-3">
                <div className="space-y-2">
                  <div className="bg-base-200 rounded p-3">
                    <code className="text-sm text-base-content/80">
                      {`// Cards now follow Button's pattern
<Card variant="primary">DaisyUI primary</Card>
<Card variant="bordered">DaisyUI bordered</Card>
<Card size="lg">DaisyUI size</Card>`}
                    </code>
                  </div>
                  <div className="bg-base-200 rounded p-3">
                    <code className="text-sm text-base-content/80">
                      {`// Compare to Button component
<Button variant="primary">DaisyUI primary</Button>
<Button variant="outline">DaisyUI outline</Button>
<Button size="lg">DaisyUI size</Button>`}
                    </code>
                  </div>
                </div>
              </div>
              <div className="text-sm text-base-content/70">
                <strong>Benefits:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Consistent with Button component's approach</li>
                  <li>Pure DaisyUI classes (like btn-primary → card bg-primary)</li>
                  <li>Minimal custom CSS only where truly needed</li>
                  <li>Automatic DaisyUI theming and updates</li>
                  <li>Smaller bundle size, better performance</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* DaisyUI Special Features */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">DaisyUI Special Features ✨</h3>
          <button
            onClick={() => onCopyCode(
              `// DaisyUI side-by-side layout
<Card side>Horizontal layout</Card>

// DaisyUI background image
<Card imageFull>
  <figure>
    <img src="image.jpg" alt="Background" />
  </figure>
  <CardContent>Overlay content</CardContent>
</Card>

// DaisyUI with figure element
<Card>
  <figure>
    <img src="image.jpg" alt="Card image" />
  </figure>
  <CardContent>Regular content below image</CardContent>
</Card>`,
              'daisyui-features'
            )}
            className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'daisyui-features' ? (
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
        
        <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-4">
          <p className="text-sm text-success-content">
            <strong>✨ DaisyUI Advanced Features:</strong> Cards get DaisyUI's built-in 
            <code className="bg-success/20 px-1 rounded text-xs mx-1">card-side</code> and 
            <code className="bg-success/20 px-1 rounded text-xs mx-1">image-full</code> for free, 
            just like Button gets <code className="bg-success/20 px-1 rounded text-xs mx-1">btn-sm</code> and <code className="bg-success/20 px-1 rounded text-xs mx-1">btn-outline</code>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Side Layout Example */}
          <Card variant="solid" side className="flex-col lg:flex-row">
            <figure className="lg:w-1/3">
              <div className="w-full h-32 lg:h-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-2xl">
                IMG
              </div>
            </figure>
            <div className="lg:w-2/3">
              <CardHeader>
                <CardTitle>Card Side Layout</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-base-content/70">
                  DaisyUI's <code className="bg-base-200 px-1 rounded text-xs">card-side</code> class 
                  creates responsive side-by-side layouts automatically.
                </p>
              </CardContent>
            </div>
          </Card>

          {/* Image Full Example */}
          <Card variant="default" imageFull className="relative">
            <figure>
              <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-pink-600"></div>
            </figure>
            <CardContent className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent text-white">
              <CardTitle className="text-white">Image Full Layout</CardTitle>
              <p className="text-sm text-white/90">
                DaisyUI's <code className="bg-white/20 px-1 rounded text-xs">image-full</code> creates 
                overlay content on background images.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Legacy Interactive States */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Legacy Interactive Props ⚠️</h3>
          <button
            onClick={() => onCopyCode(
              `// ⚠️ Legacy props (still supported but prefer interactive variants)
<Card hoverable>Hoverable card</Card>
<Card clickable>Clickable card</Card>
<Card interactive>Interactive card</Card>
<Card animated>Animated card</Card>

// ✅ Recommended: Use interactive variants instead
<Card variant="gradient-interactive">Modern approach</Card>`,
              'card-interactive'
            )}
            className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'card-interactive' ? (
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
            <strong>⚠️ Legacy Support:</strong> These props are still supported for backward compatibility. 
            For new code, prefer DaisyUI-based variants with <code className="bg-warning/20 px-1 rounded text-xs">-interactive</code> suffix.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="glass" hoverable>
            <CardHeader>
              <CardTitle className="text-lg">Hoverable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Hover me for elevation effect</p>
            </CardContent>
          </Card>

          <Card variant="glass" clickable>
            <CardHeader>
              <CardTitle className="text-lg">Clickable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Click me for scale effect</p>
            </CardContent>
          </Card>

          <Card variant="glass" interactive>
            <CardHeader>
              <CardTitle className="text-lg">Interactive</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Hover for subtle scale</p>
            </CardContent>
          </Card>

          <Card variant="glass" animated>
            <CardHeader>
              <CardTitle className="text-lg">Animated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Animated on mount</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Real-world Examples */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Real-world Examples</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Job Card */}
          <Card variant="glass-interactive" animated>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Senior Frontend Developer</CardTitle>
                  <CardDescription>TechCorp Inc.</CardDescription>
                </div>
                <Badge variant="gradient-brand" size="sm">New</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-base-content/70">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  San Francisco
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  $120k-$180k
                </div>
              </div>
              <p className="text-sm">
                Join our team to build cutting-edge web applications using React, 
                TypeScript, and modern web technologies.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="glass" size="sm">React</Badge>
                <Badge variant="glass" size="sm">TypeScript</Badge>
                <Badge variant="glass" size="sm">Next.js</Badge>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-xs text-base-content/60 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Posted 2 days ago
              </p>
              <Button variant="gradient-brand" size="sm" rightIcon={<ArrowRight className="h-3 w-3" />}>
                Apply
              </Button>
            </CardFooter>
          </Card>

          {/* Profile Card */}
          <Card variant="floating-interactive">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xl">
                  JD
                </div>
                <div>
                  <CardTitle>John Doe</CardTitle>
                  <CardDescription>Full Stack Developer</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-base-content/70 mb-4">
                Passionate developer with 5+ years of experience in building scalable web applications.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-base-content/50" />
                  <span>Google</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-base-content/50" />
                  <span>Mountain View, CA</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outlined" size="sm" className="flex-1">
                View Profile
              </Button>
              <Button variant="gradient-brand" size="sm" className="flex-1">
                Connect
              </Button>
            </CardFooter>
          </Card>

          {/* Stats Card */}
          <Card variant="gradient" className="text-white">
            <CardHeader>
              <CardTitle className="text-white">Weekly Analytics</CardTitle>
              <CardDescription className="text-white/80">
                Your performance this week
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Profile Views</span>
                  <span className="text-sm font-semibold">1,234</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Applications</span>
                  <span className="text-sm font-semibold">23</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Interviews</span>
                  <span className="text-sm font-semibold">5</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: '20%' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Card with Actions */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Cards with Actions</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="glass">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Achievement Unlocked!</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold">First Application</h4>
                  <p className="text-sm text-base-content/70">
                    You've submitted your first job application!
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="gradient" size="sm">+50 XP</Badge>
                <Badge variant="gradient-emerald" size="sm">Achievement</Badge>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated-interactive">
            <CardHeader>
              <CardTitle>Premium Feature</CardTitle>
              <CardDescription>
                Unlock advanced features with our Pro plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  Unlimited job applications
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  Advanced AI matching
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  Priority support
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="gradient-brand" className="w-full">
                Upgrade to Pro
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Complex Layouts */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Complex Card Layouts</h3>

        <Card variant="glass" className="overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="md:col-span-2 p-6">
              <h3 className="text-xl font-semibold mb-2">
                Master the Art of Technical Interviews
              </h3>
              <p className="text-base-content/70 mb-4">
                Join our comprehensive workshop series designed to help you ace technical interviews
                at top tech companies.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="glass">Data Structures</Badge>
                <Badge variant="glass">Algorithms</Badge>
                <Badge variant="glass">System Design</Badge>
                <Badge variant="glass">Behavioral</Badge>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="gradient-brand">
                  Enroll Now
                </Button>
                <p className="text-sm text-base-content/60">
                  <span className="font-semibold text-base-content">$99</span> / course
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-brand-500 to-brand-600 p-6 text-white flex flex-col justify-center items-center text-center">
              <div className="text-4xl font-bold mb-2">4.9</div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm">1,234 Reviews</p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}