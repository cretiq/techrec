"use client";

import React, { useState } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui-daisy/accordion';
import { Button } from '@/components/ui-daisy/button';
import { Badge } from '@/components/ui-daisy/badge';
import { 
  Star, 
  Clock, 
  MapPin, 
  Building, 
  DollarSign,
  User,
  Settings,
  Shield,
  Trophy,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Check,
  Copy
} from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface AccordionShowcaseProps {
  onCopyCode: (code: string, id: string) => void;
  copiedCode: string | null;
  theme?: 'light' | 'dark';
}

export default function AccordionShowcase({ onCopyCode, copiedCode, theme }: AccordionShowcaseProps) {
  const [openSections, setOpenSections] = useState<string[]>(['profile']);

  const basicAccordionVariants = [
    { variant: 'default', label: 'Default' },
    { variant: 'transparent', label: 'Transparent' },
    { variant: 'glass', label: 'Glass' },
    { variant: 'solid', label: 'Solid' },
    { variant: 'outlined', label: 'Outlined' },
    { variant: 'elevated', label: 'Elevated' },
    { variant: 'floating', label: 'Floating' },
    { variant: 'gradient', label: 'Gradient' },
  ];

  const interactiveAccordionVariants = [
    { variant: 'default-interactive', label: 'Default Interactive', description: 'Subtle background and shadow change on hover' },
    { variant: 'transparent-interactive', label: 'Transparent Interactive', description: 'Enhanced backdrop blur and background on hover' },
    { variant: 'glass-interactive', label: 'Glass Interactive', description: 'Enhanced glass effect with blur and shadow on hover' },
    { variant: 'solid-interactive', label: 'Solid Interactive', description: 'Background lightening with shadow on hover' },
    { variant: 'outlined-interactive', label: 'Outlined Interactive', description: 'Border glow and background fill on hover' },
    { variant: 'elevated-interactive', label: 'Elevated Interactive', description: 'Shadow lift and background lightening on hover' },
    { variant: 'floating-interactive', label: 'Floating Interactive', description: 'Enhanced shadow and lift effect on hover' },
    { variant: 'gradient-interactive', label: 'Gradient Interactive', description: 'Gradient shifts with shadow enhancement on hover' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-base-content">Accordion Component</h2>
        <p className="text-base-content/70 mb-6">
          Collapsible accordion components with consistent borders and minimal design. Now featuring a comprehensive
          hover system with interactive variants that provide consistent, reusable hover behaviors across the application.
        </p>
      </div>

      {/* Basic Variants Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">Basic Accordion Variants</h3>
          <button
            onClick={() => onCopyCode(
              `import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui-daisy/accordion';

// Basic variants (no hover effects)
<Accordion type="single" value={activeSection} onValueChange={setActiveSection}>
  <AccordionItem variant="default" value="section1">
    <AccordionTrigger>Section 1</AccordionTrigger>
    <AccordionContent>Content for section 1</AccordionContent>
  </AccordionItem>
</Accordion>

// Interactive variants (with built-in hover effects) ✨
<Accordion type="single" value={activeSection} onValueChange={setActiveSection}>
  <AccordionItem variant="glass-interactive" value="section1">
    <AccordionTrigger>Section 1 with hover effects</AccordionTrigger>
    <AccordionContent>Content with smooth interactions</AccordionContent>
  </AccordionItem>
</Accordion>`,
              'accordion-variants'
            )}
            className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'accordion-variants' ? (
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
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {basicAccordionVariants.map(({ variant, label }) => (
            <motion.div key={variant} variants={staggerItem}>
              <Accordion type="single" value="demo" onValueChange={() => {}}>
                <AccordionItem variant={variant as any} value="demo">
                  <AccordionTrigger>{label} Accordion</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-base-content/70">
                      This is a {label.toLowerCase()} accordion variant with professional styling 
                      and smooth animations. Perfect for organizing content sections.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Interactive Variants - NEW HOVER SYSTEM */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">Interactive Accordion Variants ✨</h3>
          <button
            onClick={() => onCopyCode(
              `// New Interactive Variants - Built-in Hover Effects
<Accordion type="multiple" value={openSections} onValueChange={setOpenSections}>
  <AccordionItem variant="glass-interactive" value="section1">
    <AccordionTrigger>Glass with hover effects</AccordionTrigger>
    <AccordionContent>Enhanced glass effect on hover</AccordionContent>
  </AccordionItem>
  
  <AccordionItem variant="elevated-interactive" value="section2">
    <AccordionTrigger>Elevated with hover effects</AccordionTrigger>
    <AccordionContent>Shadow lift and background change on hover</AccordionContent>
  </AccordionItem>
  
  <AccordionItem variant="gradient-interactive" value="section3">
    <AccordionTrigger>Gradient with hover effects</AccordionTrigger>
    <AccordionContent>Gradient shifts and shadow enhancement on hover</AccordionContent>
  </AccordionItem>
</Accordion>

// Clean API - No manual hover classes needed!
// Hover effects are built into the variant`,
              'interactive-accordion-variants'
            )}
            className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'interactive-accordion-variants' ? (
              <>
                <Check className="h-3 w-3" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy code
              <//>
            )}
          </button>
        </div>
        
        <div className="bg-info/10 border border-info/20 rounded-lg p-4 mb-4">
          <p className="text-sm text-info-content">
            <strong>✨ New Hover System:</strong> Interactive accordion variants have built-in hover effects that are consistent 
            across the entire application. No need for manual hover classes - just use the 
            <code className="bg-info/20 px-1 rounded text-xs mx-1">-interactive</code> suffix!
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {interactiveAccordionVariants.map(({ variant, label, description }) => (
            <motion.div key={variant} variants={staggerItem}>
              <div className="space-y-2">
                <Accordion type="single" value="demo" onValueChange={() => {}}>
                  <AccordionItem variant={variant as any} value="demo">
                    <AccordionTrigger>{label}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-base-content/70 mb-2">
                        {description}
                      </p>
                      <div className="bg-base-200/50 rounded p-2">
                        <code className="text-xs text-base-content/80">
                          variant="{variant}"
                        </code>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Migration Guide */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-base-content">Migration Guide: Old vs New Accordion Hover</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Old Way */}
          <div className="space-y-3">
            <h4 className="font-medium text-error flex items-center gap-2">
              ❌ Old Way (Don't Use)
            </h4>
            <div className="bg-base-200 rounded p-3">
              <code className="text-sm text-base-content/80">
                {`<AccordionItem 
  hoverable 
  className="hover:shadow-lg hover:-translate-y-0.5"
>
  Manual Hover Classes
</AccordionItem>`}
              </code>
            </div>
            <div className="text-sm text-base-content/70">
              <strong>Problems:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Scattered hover classes everywhere</li>
                <li>Inconsistent accordion behavior</li>
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
                {`<AccordionItem variant="elevated-interactive">
  Clean Interactive Accordion
</AccordionItem>`}
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

      {/* Legacy Interactive States */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">Legacy Interactive Props ⚠️</h3>
          <button
            onClick={() => onCopyCode(
              `// ⚠️ Legacy props (still supported but prefer interactive variants)
<AccordionItem hoverable>Hoverable accordion</AccordionItem>
<AccordionItem interactive>Interactive accordion</AccordionItem>
<AccordionItem animated>Animated accordion</AccordionItem>

// ✅ Recommended: Use interactive variants instead
<AccordionItem variant="elevated-interactive">Modern approach</AccordionItem>`,
              'accordion-legacy'
            )}
            className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'accordion-legacy' ? (
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Accordion type="single" value="" onValueChange={() => {}}>
            <AccordionItem variant="glass" hoverable value="hover">
              <AccordionTrigger>Hoverable</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm">Hover me for elevation effect</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Accordion type="single" value="" onValueChange={() => {}}>
            <AccordionItem variant="glass" interactive value="interactive">
              <AccordionTrigger>Interactive</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm">Hover for subtle scale</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Accordion type="single" value="" onValueChange={() => {}}>
            <AccordionItem variant="glass" animated value="animated">
              <AccordionTrigger>Animated</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm">Animated on mount</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Real-world Examples */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-base-content">Real-world Examples</h3>

        <div className="space-y-6">
          {/* Profile Settings Accordion */}
          <div>
            <h4 className="text-sm font-medium text-base-content/70 mb-3">Profile Settings</h4>
            <Accordion type="multiple" value={openSections} onValueChange={setOpenSections}>
              <AccordionItem variant="glass-interactive" value="profile">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    <span>Personal Information</span>
                    <Badge variant="success" size="sm">Complete</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-base-content">Full Name</label>
                        <div className="mt-1 p-2 rounded border border-base-300/50 bg-base-100/50 text-sm">
                          John Doe
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-base-content">Email</label>
                        <div className="mt-1 p-2 rounded border border-base-300/50 bg-base-100/50 text-sm">
                          john@example.com
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="glass" size="sm">Edit Profile</Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem variant="elevated-interactive" value="security">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5" />
                    <span>Security Settings</span>
                    <Badge variant="warning" size="sm">Action Required</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-base-content">Two-Factor Authentication</p>
                        <p className="text-sm text-base-content/70">Add an extra layer of security</p>
                      </div>
                      <Button variant="outlined" size="sm">
                        Enable
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-base-content">Password</p>
                        <p className="text-sm text-base-content/70">Last changed 3 months ago</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Change
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem variant="gradient-interactive" value="achievements">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5" />
                    <span>Achievements & Progress</span>
                    <Badge variant="gradient-brand" size="sm">5 New</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-base-100/50">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center">
                        <Star className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-base-content">First Profile Complete</p>
                        <p className="text-xs text-base-content/70">Completed your profile setup</p>
                      </div>
                      <Badge variant="success" size="sm">+50 XP</Badge>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-base-100/50">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-base-content">Quick Learner</p>
                        <p className="text-xs text-base-content/70">Completed 5 skill assessments</p>
                      </div>
                      <Badge variant="info" size="sm">+100 XP</Badge>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* System Status Accordion */}
          <div>
            <h4 className="text-sm font-medium text-base-content/70 mb-3">System Status Dashboard</h4>
            <Accordion type="multiple" value={['status']} onValueChange={() => {}}>
              <AccordionItem variant="outlined-interactive" value="status">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5" />
                    <span>System Health</span>
                    <Badge variant="success" pulse size="sm">All Systems Operational</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-success/20 bg-success/10">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <div>
                        <p className="font-medium text-base-content">API Services</p>
                        <p className="text-xs text-base-content/70">99.9% uptime</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-warning/20 bg-warning/10">
                      <AlertCircle className="h-5 w-5 text-warning" />
                      <div>
                        <p className="font-medium text-base-content">Database</p>
                        <p className="text-xs text-base-content/70">Maintenance mode</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-success/20 bg-success/10">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <div>
                        <p className="font-medium text-base-content">CDN</p>
                        <p className="text-xs text-base-content/70">Global availability</p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Design Note */}
      <section className="space-y-4">
        <div className="bg-base-200/50 border border-base-300/50 rounded-2xl p-4">
          <h3 className="text-lg font-semibold text-base-content mb-2">Design Note: Consistent Border Radius</h3>
          <p className="text-base-content/70 text-sm">
            All accordions use a consistent rounded-2xl border radius to match the card and button components. 
            This creates visual harmony across the entire design system while maintaining the professional aesthetic.
          </p>
          <div className="mt-3">
            <Accordion type="single" value="demo" onValueChange={() => {}}>
              <AccordionItem variant="default" value="demo">
                <AccordionTrigger>Consistent Design Language</AccordionTrigger>
                <AccordionContent>
                  <p className="text-xs text-base-content/60">All accordions use rounded-2xl for visual harmony</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  );
}