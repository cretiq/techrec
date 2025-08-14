"use client";

import React, { useState } from 'react';
import { DaisyAccordion, DaisyAccordionItem, DaisyAccordionTrigger, DaisyAccordionContent } from '@/components/ui-daisy/accordion-daisyui';
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

interface DaisyAccordionShowcaseProps {
  onCopyCode: (code: string, id: string) => void;
  copiedCode: string | null;
  theme?: 'light' | 'dark';
}

export default function DaisyAccordionShowcase({ onCopyCode, copiedCode, theme }: DaisyAccordionShowcaseProps) {
  const [openSections, setOpenSections] = useState<string[]>(['profile']);

  const basicDaisyAccordionVariants = [
    { variant: 'default', label: 'Default' },
    { variant: 'faq', label: 'FAQ' },
    { variant: 'filters', label: 'Filters' },
    { variant: 'compact', label: 'Compact' },
    { variant: 'elevated', label: 'Elevated' },
    { variant: 'glass', label: 'Glass' },
    { variant: 'interactive', label: 'Interactive' },
    { variant: 'gradient', label: 'Gradient (Legacy)' },
  ];

  const contextualUseCases = [
    { variant: 'faq', label: 'FAQ Section', context: 'Documentation & Help', description: 'Gradient styling for FAQ sections and documentation' },
    { variant: 'filters', label: 'Filter Controls', context: 'Settings & Controls', description: 'Clean styling for search filters and preferences' },
    { variant: 'elevated', label: 'Data Display', context: 'Analysis & Results', description: 'Elevated styling for important data sections' },
    { variant: 'interactive', label: 'Interactive Content', context: 'Forms & Actions', description: 'Enhanced interactive styling with hover effects' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-base-content">DaisyAccordion Component</h2>
        <p className="text-base-content/70 mb-6">
          Collapsible accordion components with consistent borders and minimal design. Now featuring a comprehensive
          hover system with interactive variants that provide consistent, reusable hover behaviors across the application.
        </p>
      </div>

      {/* Basic Variants Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">Basic DaisyAccordion Variants</h3>
          <button
            onClick={() => onCopyCode(
              `import { DaisyAccordion, DaisyAccordionItem, DaisyAccordionTrigger, DaisyAccordionContent } from '@/components/ui-daisy/accordion-daisyui';

// Basic variants (no hover effects)
<DaisyAccordion type="single" value={activeSection} onValueChange={setActiveSection}>
  <DaisyAccordionItem variant="default" value="section1">
    <DaisyAccordionTrigger>Section 1</DaisyAccordionTrigger>
    <DaisyAccordionContent>Content for section 1</DaisyAccordionContent>
  </DaisyAccordionItem>
</DaisyAccordion>

// Interactive variants (with built-in hover effects) ✨
<DaisyAccordion type="single" value={activeSection} onValueChange={setActiveSection}>
  <DaisyAccordionItem variant="glass-interactive" value="section1">
    <DaisyAccordionTrigger>Section 1 with hover effects</DaisyAccordionTrigger>
    <DaisyAccordionContent>Content with smooth interactions</DaisyAccordionContent>
  </DaisyAccordionItem>
</DaisyAccordion>`,
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
          {basicDaisyAccordionVariants.map(({ variant, label }) => (
            <motion.div key={variant} variants={staggerItem}>
              <DaisyAccordion type="single" value="demo" onValueChange={() => {}}>
                <DaisyAccordionItem variant={variant as any} value="demo">
                  <DaisyAccordionTrigger>{label} DaisyAccordion</DaisyAccordionTrigger>
                  <DaisyAccordionContent>
                    <p className="text-sm text-base-content/70">
                      This is a {label.toLowerCase()} accordion variant with professional styling 
                      and smooth animations. Perfect for organizing content sections.
                    </p>
                  </DaisyAccordionContent>
                </DaisyAccordionItem>
              </DaisyAccordion>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Interactive Variants - NEW HOVER SYSTEM */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">Interactive DaisyAccordion Variants ✨</h3>
          <button
            onClick={() => onCopyCode(
              `// New Interactive Variants - Built-in Hover Effects
<DaisyAccordion type="multiple" value={openSections} onValueChange={setOpenSections}>
  <DaisyAccordionItem variant="glass-interactive" value="section1">
    <DaisyAccordionTrigger>Glass with hover effects</DaisyAccordionTrigger>
    <DaisyAccordionContent>Enhanced glass effect on hover</DaisyAccordionContent>
  </DaisyAccordionItem>
  
  <DaisyAccordionItem variant="elevated-interactive" value="section2">
    <DaisyAccordionTrigger>Elevated with hover effects</DaisyAccordionTrigger>
    <DaisyAccordionContent>Shadow lift and background change on hover</DaisyAccordionContent>
  </DaisyAccordionItem>
  
  <DaisyAccordionItem variant="gradient-interactive" value="section3">
    <DaisyAccordionTrigger>Gradient with hover effects</DaisyAccordionTrigger>
    <DaisyAccordionContent>Gradient shifts and shadow enhancement on hover</DaisyAccordionContent>
  </DaisyAccordionItem>
</DaisyAccordion>

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
              </>
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
          {interactiveDaisyAccordionVariants.map(({ variant, label, description }) => (
            <motion.div key={variant} variants={staggerItem}>
              <div className="space-y-2">
                <DaisyAccordion type="single" value="demo" onValueChange={() => {}}>
                  <DaisyAccordionItem variant={variant as any} value="demo">
                    <DaisyAccordionTrigger>{label}</DaisyAccordionTrigger>
                    <DaisyAccordionContent>
                      <p className="text-sm text-base-content/70 mb-2">
                        {description}
                      </p>
                      <div className="bg-base-200/50 rounded p-2">
                        <code className="text-xs text-base-content/80">
                          variant="{variant}"
                        </code>
                      </div>
                    </DaisyAccordionContent>
                  </DaisyAccordionItem>
                </DaisyAccordion>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Migration Guide */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-base-content">Migration Guide: Old vs New DaisyAccordion Hover</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Old Way */}
          <div className="space-y-3">
            <h4 className="font-medium text-error flex items-center gap-2">
              ❌ Old Way (Don't Use)
            </h4>
            <div className="bg-base-200 rounded p-3">
              <code className="text-sm text-base-content/80">
                {`<DaisyAccordionItem 
  hoverable 
  className="hover:shadow-lg hover:-translate-y-0.5"
>
  Manual Hover Classes
</DaisyAccordionItem>`}
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
                {`<DaisyAccordionItem variant="elevated-interactive">
  Clean Interactive DaisyAccordion
</DaisyAccordionItem>`}
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
<DaisyAccordionItem hoverable>Hoverable accordion</DaisyAccordionItem>
<DaisyAccordionItem interactive>Interactive accordion</DaisyAccordionItem>
<DaisyAccordionItem animated>Animated accordion</DaisyAccordionItem>

// ✅ Recommended: Use interactive variants instead
<DaisyAccordionItem variant="elevated-interactive">Modern approach</DaisyAccordionItem>`,
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
          <DaisyAccordion type="single" value="" onValueChange={() => {}}>
            <DaisyAccordionItem variant="glass" hoverable value="hover">
              <DaisyAccordionTrigger>Hoverable</DaisyAccordionTrigger>
              <DaisyAccordionContent>
                <p className="text-sm">Hover me for elevation effect</p>
              </DaisyAccordionContent>
            </DaisyAccordionItem>
          </DaisyAccordion>

          <DaisyAccordion type="single" value="" onValueChange={() => {}}>
            <DaisyAccordionItem variant="glass" interactive value="interactive">
              <DaisyAccordionTrigger>Interactive</DaisyAccordionTrigger>
              <DaisyAccordionContent>
                <p className="text-sm">Hover for subtle scale</p>
              </DaisyAccordionContent>
            </DaisyAccordionItem>
          </DaisyAccordion>

          <DaisyAccordion type="single" value="" onValueChange={() => {}}>
            <DaisyAccordionItem variant="glass" animated value="animated">
              <DaisyAccordionTrigger>Animated</DaisyAccordionTrigger>
              <DaisyAccordionContent>
                <p className="text-sm">Animated on mount</p>
              </DaisyAccordionContent>
            </DaisyAccordionItem>
          </DaisyAccordion>
        </div>
      </section>

      {/* Real-world Examples */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-base-content">Real-world Examples</h3>

        <div className="space-y-6">
          {/* Profile Settings DaisyAccordion */}
          <div>
            <h4 className="text-sm font-medium text-base-content/70 mb-3">Profile Settings</h4>
            <DaisyAccordion type="multiple" value={openSections} onValueChange={setOpenSections}>
              <DaisyAccordionItem variant="glass-interactive" value="profile">
                <DaisyAccordionTrigger>
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    <span>Personal Information</span>
                    <Badge variant="success" size="sm">Complete</Badge>
                  </div>
                </DaisyAccordionTrigger>
                <DaisyAccordionContent>
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
                </DaisyAccordionContent>
              </DaisyAccordionItem>

              <DaisyAccordionItem variant="elevated-interactive" value="security">
                <DaisyAccordionTrigger>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5" />
                    <span>Security Settings</span>
                    <Badge variant="warning" size="sm">Action Required</Badge>
                  </div>
                </DaisyAccordionTrigger>
                <DaisyAccordionContent>
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
                </DaisyAccordionContent>
              </DaisyAccordionItem>

              <DaisyAccordionItem variant="gradient-interactive" value="achievements">
                <DaisyAccordionTrigger>
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5" />
                    <span>Achievements & Progress</span>
                    <Badge variant="gradient-brand" size="sm">5 New</Badge>
                  </div>
                </DaisyAccordionTrigger>
                <DaisyAccordionContent>
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
                </DaisyAccordionContent>
              </DaisyAccordionItem>
            </DaisyAccordion>
          </div>

          {/* System Status DaisyAccordion */}
          <div>
            <h4 className="text-sm font-medium text-base-content/70 mb-3">System Status Dashboard</h4>
            <DaisyAccordion type="multiple" value={['status']} onValueChange={() => {}}>
              <DaisyAccordionItem variant="outlined-interactive" value="status">
                <DaisyAccordionTrigger>
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5" />
                    <span>System Health</span>
                    <Badge variant="success" pulse size="sm">All Systems Operational</Badge>
                  </div>
                </DaisyAccordionTrigger>
                <DaisyAccordionContent>
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
                </DaisyAccordionContent>
              </DaisyAccordionItem>
            </DaisyAccordion>
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
            <DaisyAccordion type="single" value="demo" onValueChange={() => {}}>
              <DaisyAccordionItem variant="default" value="demo">
                <DaisyAccordionTrigger>Consistent Design Language</DaisyAccordionTrigger>
                <DaisyAccordionContent>
                  <p className="text-xs text-base-content/60">All accordions use rounded-2xl for visual harmony</p>
                </DaisyAccordionContent>
              </DaisyAccordionItem>
            </DaisyAccordion>
          </div>
        </div>
      </section>
    </div>
  );
}