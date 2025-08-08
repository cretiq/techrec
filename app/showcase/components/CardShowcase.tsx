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
  const basicCardVariants = [
    { variant: 'default', label: 'Default' },
    { variant: 'transparent', label: 'Transparent' },
    { variant: 'glass', label: 'Glass' },
    { variant: 'solid', label: 'Solid' },
    { variant: 'outlined', label: 'Outlined' },
    { variant: 'elevated', label: 'Elevated' },
    { variant: 'floating', label: 'Floating' },
    { variant: 'gradient', label: 'Gradient' },
  ];

  const interactiveCardVariants = [
    { variant: 'default-interactive', label: 'Default Interactive', description: 'Subtle background and shadow change on hover' },
    { variant: 'gradient-interactive', label: 'Gradient Interactive', description: 'Gradient shifts to blue/purple with shadow on hover' },
    { variant: 'elevated-interactive', label: 'Elevated Interactive', description: 'Shadow lift and background lightening on hover' },
    { variant: 'glass-interactive', label: 'Glass Interactive', description: 'Enhanced backdrop blur and background on hover' },
    { variant: 'outlined-interactive', label: 'Outlined Interactive', description: 'Border glow and background fill on hover' },
    { variant: 'floating-interactive', label: 'Floating Interactive', description: 'Enhanced shadow and lift effect on hover' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-base-content">Card Component</h2>
        <p className="text-base-content/70 mb-6">
          Versatile card components with consistent borders and minimal design. Now featuring a comprehensive
          hover system with interactive variants that provide consistent, reusable hover behaviors across the application.
        </p>
      </div>

      {/* Basic Variants Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">Basic Card Variants</h3>
          <button
            onClick={() => onCopyCode(
              `import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui-daisy/card';

// Basic variants (no hover effects)
<Card variant="default">Basic card</Card>
<Card variant="glass">Glass effect card</Card>
<Card variant="gradient">Gradient card</Card>

// Interactive variants (with built-in hover effects) ✨
<Card variant="default-interactive">Hover-enabled default card</Card>
<Card variant="glass-interactive">Hover-enabled glass card</Card>
<Card variant="gradient-interactive">Hover-enabled gradient card</Card>
<Card variant="elevated-interactive">Hover-enabled elevated card</Card>`,
              'card-variants'
            )}
            className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'card-variants' ? (
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
          {basicCardVariants.map(({ variant, label }) => (
            <motion.div key={variant} variants={staggerItem}>
              <Card variant={variant as any} className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-base-content/70">
                    This is a {label.toLowerCase()} card variant with professional styling.
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
              `// New Interactive Variants - Built-in Hover Effects
<Card variant="gradient-interactive">Gradient with hover effects</Card>
<Card variant="elevated-interactive">Elevated with hover effects</Card>
<Card variant="glass-interactive">Glass with hover effects</Card>
<Card variant="outlined-interactive">Outlined with hover effects</Card>
<Card variant="floating-interactive">Floating with hover effects</Card>
<Card variant="default-interactive">Default with hover effects</Card>

// Clean API - No manual hover classes needed!
// Hover effects are built into the variant`,
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
            <strong>✨ New Hover System:</strong> Interactive variants have built-in hover effects that are consistent 
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
        <h3 className="text-xl font-semibold text-base-content">Migration Guide: Old vs New</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Old Way */}
          <Card variant="outlined" className="">
            <CardHeader>
              <CardTitle className="text-error flex items-center gap-2">
                ❌ Old Way (Don't Use)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-base-200 rounded p-3">
                <code className="text-sm text-base-content/80">
                  {`<Card className="
  bg-gradient-to-br 
  from-base-200 
  to-base-300 
  hover:from-blue-50 
  hover:to-purple-100 
  hover:shadow-md 
  transition-all 
  duration-200"
>`}
                </code>
              </div>
              <div className="text-sm text-base-content/70">
                <strong>Problems:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Scattered hover classes everywhere</li>
                  <li>Inconsistent behavior across pages</li>
                  <li>Hard to maintain and update</li>
                  <li>Duplicated hover logic</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* New Way */}
          <Card variant="gradient-interactive" className="">
            <CardHeader>
              <CardTitle className="text-success flex items-center gap-2">
                ✅ New Way (Recommended)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-base-200 rounded p-3">
                <code className="text-sm text-base-content/80">
                  {`<Card variant="gradient-interactive">
  {/* Content */}
</Card>`}
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
            <strong>⚠️ Legacy Support:</strong> These props are still supported for backward compatibility, 
            but we recommend using interactive variants for new code.
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