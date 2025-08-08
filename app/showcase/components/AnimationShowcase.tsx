"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, Play, Pause, RotateCcw, Zap } from 'lucide-react';
import { Button } from '@/components/ui-daisy/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-daisy/card';
import * as animations from '@/lib/animations';

interface AnimationShowcaseProps {
  onCopyCode: (code: string, id: string) => void;
  copiedCode: string | null;
  theme?: 'light' | 'dark';
}

export default function AnimationShowcase({ onCopyCode, copiedCode, theme }: AnimationShowcaseProps) {
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({});
  const [showExample, setShowExample] = useState<Record<string, boolean>>({});

  const toggleAnimation = (id: string) => {
    setIsPlaying(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExample = (id: string) => {
    setShowExample(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const animationExamples = [
    {
      id: 'page-transition',
      name: 'Page Transition',
      description: 'Smooth page enter/exit animations',
      variant: animations.pageTransition,
      code: `import { pageTransition } from '@/lib/animations';

<motion.div
  initial="initial"
  animate="animate"
  exit="exit"
  variants={pageTransition}
>
  Page content
</motion.div>`
    },
    {
      id: 'stagger-container',
      name: 'Staggered Animation',
      description: 'Sequential animation of child elements',
      variant: animations.staggerContainer,
      code: `import { staggerContainer, staggerItem } from '@/lib/animations';

<motion.div variants={staggerContainer} initial="initial" animate="animate">
  {items.map((item, i) => (
    <motion.div key={i} variants={staggerItem}>
      {item}
    </motion.div>
  ))}
</motion.div>`
    },
    {
      id: 'card-hover',
      name: 'Card Hover',
      description: 'Subtle hover effects for cards',
      variant: animations.cardHover,
      code: `import { cardHover } from '@/lib/animations';

<motion.div
  variants={cardHover}
  whileHover="hover"
  whileTap="tap"
>
  Card content
</motion.div>`
    },
    {
      id: 'button-hover',
      name: 'Button Hover',
      description: 'Interactive button animations',
      variant: animations.buttonHover,
      code: `import { buttonHover } from '@/lib/animations';

<motion.button
  variants={buttonHover}
  whileHover="hover"
  whileTap="tap"
>
  Click me
</motion.button>`
    },
    {
      id: 'modal-content',
      name: 'Modal Animation',
      description: 'Modal enter/exit with backdrop',
      variant: animations.modalContent,
      code: `import { modalContent, modalBackdrop } from '@/lib/animations';

<AnimatePresence>
  {isOpen && (
    <>
      <motion.div variants={modalBackdrop} />
      <motion.div variants={modalContent}>
        Modal content
      </motion.div>
    </>
  )}
</AnimatePresence>`
    },
    {
      id: 'slide-notification',
      name: 'Slide Notification',
      description: 'Slide in from right for notifications',
      variant: animations.slideInFromRight,
      code: `import { slideInFromRight } from '@/lib/animations';

<motion.div
  variants={slideInFromRight}
  initial="initial"
  animate="animate"
  exit="exit"
>
  Notification content
</motion.div>`
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-base-content">Animation System</h2>
        <p className="text-base-content/70 mb-6">
          A comprehensive animation library built with Framer Motion. All animations follow
          the Linear design principles with smooth easing and subtle movements.
        </p>
      </div>

      {/* Animation Controls */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Animation Examples
          </h3>
          <button
            onClick={() => onCopyCode(
              `import { motion } from 'framer-motion';
import * as animations from '@/lib/animations';

// Use predefined animations
<motion.div variants={animations.pageTransition}>
  Content
</motion.div>

// Custom animations
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Custom animation
</motion.div>`,
              'animation-examples'
            )}
            className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'animation-examples' ? (
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {animationExamples.map((example) => (
            <Card key={example.id} variant="outlined" className="">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-base-content">{example.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleExample(example.id)}
                    >
                      {isPlaying[example.id] ? 
                        <Pause className="h-4 w-4" /> : 
                        <Play className="h-4 w-4" />
                      }
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onCopyCode(example.code, example.id)}
                    >
                      {copiedCode === example.id ? 
                        <Check className="h-4 w-4" /> : 
                        <Copy className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-base-content/70">{example.description}</p>
              </CardHeader>
              
              <CardContent>
                <div className="h-32 flex items-center justify-center rounded-lg border border-base-300/30 bg-base-100/30 overflow-hidden">
                  <AnimatePresence mode="wait">
                    {showExample[example.id] && (
                      <motion.div
                        key={`${example.id}-${Date.now()}`}
                        variants={example.variant}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center"
                        onAnimationComplete={() => {
                          setTimeout(() => setShowExample(prev => ({ ...prev, [example.id]: false })), 500);
                        }}
                      >
                        <span className="text-white font-medium text-sm">{example.name.split(' ')[0]}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {!showExample[example.id] && (
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => toggleExample(example.id)}
                      className="text-gray-300"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Play Demo
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Interactive Examples */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-base-content">Interactive Examples</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hover Card */}
          <Card variant="outlined" className="">
            <CardHeader>
              <CardTitle className="text-base-content">Hover Effects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div
                className="p-4 rounded-lg bg-base-100/60 border border-base-300/30 cursor-pointer"
                variants={animations.cardHover}
                whileHover="hover"
                whileTap="tap"
              >
                <p className="text-base-content font-medium">Hover me!</p>
                <p className="text-base-content/70 text-sm">Card with hover animation</p>
              </motion.div>
              
              <motion.button
                className="btn btn-glass w-full"
                variants={animations.buttonHover}
                whileHover="hover"
                whileTap="tap"
              >
                Interactive Button
              </motion.button>
            </CardContent>
          </Card>

          {/* Loading States */}
          <Card variant="outlined" className="">
            <CardHeader>
              <CardTitle className="text-base-content">Loading Animations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <motion.div
                  className="w-12 h-12 border-2 border-brand-500/30 border-t-brand-500 rounded-full"
                  variants={animations.spinnerAnimation}
                  animate="animate"
                />
              </div>
              
              <div className="flex justify-center">
                <motion.div
                  className="w-8 h-8 bg-brand-500 rounded-full"
                  variants={animations.pulseAnimation}
                  animate="animate"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Staggered List Example */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">Staggered Animations</h3>
          <Button
            variant="glass"
            size="sm"
            onClick={() => setIsPlaying(prev => ({ ...prev, stagger: !prev.stagger }))}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Replay
          </Button>
        </div>
        
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={animations.staggerContainer}
          initial="initial"
          animate={isPlaying.stagger ? "animate" : "initial"}
          key={isPlaying.stagger ? "animate" : "initial"}
        >
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <motion.div
              key={item}
              variants={animations.staggerItem}
              className="p-4 rounded-lg border border-base-300/30 bg-base-100/60 text-center"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full mx-auto mb-2"></div>
              <p className="text-base-content font-medium">Item {item}</p>
              <p className="text-base-content/70 text-sm">Staggered animation</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Custom Animation Examples */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-base-content">Custom Animations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Bounce */}
          <div className="p-4 rounded-lg border border-base-300/30 bg-base-100/60 text-center">
            <motion.div
              className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full mx-auto mb-3 cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={{ y: [0, -10, 0] }}
              transition={{ 
                y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                scale: { duration: 0.2 }
              }}
            />
            <p className="text-base-content font-medium">Bounce</p>
            <p className="text-base-content/70 text-sm">Continuous bounce effect</p>
          </div>

          {/* Rotate */}
          <div className="p-4 rounded-lg border border-base-300/30 bg-base-100/60 text-center">
            <motion.div
              className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg mx-auto mb-3 cursor-pointer"
              whileHover={{ rotate: 45 }}
              whileTap={{ rotate: 90 }}
              animate={{ rotate: 360 }}
              transition={{ 
                rotate: { repeat: Infinity, duration: 4, ease: "linear" }
              }}
            />
            <p className="text-base-content font-medium">Rotate</p>
            <p className="text-base-content/70 text-sm">Continuous rotation</p>
          </div>

          {/* Scale Pulse */}
          <div className="p-4 rounded-lg border border-base-300/30 bg-base-100/60 text-center">
            <motion.div
              className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full mx-auto mb-3 cursor-pointer"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ 
                scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
              }}
            />
            <p className="text-base-content font-medium">Pulse</p>
            <p className="text-base-content/70 text-sm">Scale pulse effect</p>
          </div>
        </div>
      </section>

      {/* Animation Guidelines */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-base-content">Animation Guidelines</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="outlined" className="">
            <CardHeader>
              <CardTitle className="text-base-content">Best Practices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-brand-500 rounded-full mt-2"></div>
                <p className="text-gray-300 text-sm">Use subtle animations that enhance UX without being distracting</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-brand-500 rounded-full mt-2"></div>
                <p className="text-gray-300 text-sm">Keep duration between 200-500ms for micro-interactions</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-brand-500 rounded-full mt-2"></div>
                <p className="text-gray-300 text-sm">Use easing functions like 'ease-out' for natural feel</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-brand-500 rounded-full mt-2"></div>
                <p className="text-gray-300 text-sm">Respect prefers-reduced-motion accessibility setting</p>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined" className="">
            <CardHeader>
              <CardTitle className="text-base-content">Performance Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                <p className="text-gray-300 text-sm">Use transform properties (scale, rotate, translate) for 60fps</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                <p className="text-gray-300 text-sm">Add will-change: transform for complex animations</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                <p className="text-gray-300 text-sm">Use AnimatePresence for enter/exit animations</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                <p className="text-gray-300 text-sm">Batch DOM reads and writes to prevent layout thrashing</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}