'use client';

import React from 'react';

// Import shadcn components
import {  Button as ShadcnButton  } from '@/components/ui-daisy/button';
import {  Input as ShadcnInput  } from '@/components/ui-daisy/input';
import {  Card as ShadcnCard, CardContent as ShadcnCardContent, CardDescription as ShadcnCardDescription, CardFooter as ShadcnCardFooter, CardHeader as ShadcnCardHeader, CardTitle as ShadcnCardTitle  } from '@/components/ui-daisy/card';

// Import DaisyUI components
import { Button as DaisyButton } from '@/components/ui-daisy/button';
import { Input as DaisyInput } from '@/components/ui-daisy/input';
import { Card as DaisyCard, CardContent as DaisyCardContent, CardDescription as DaisyCardDescription, CardFooter as DaisyCardFooter, CardHeader as DaisyCardHeader, CardTitle as DaisyCardTitle } from '@/components/ui-daisy/card';

export default function MigrationComparisonPage() {
  return (
    <div className="container mx-auto p-8 space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Migration Comparison</h1>
        <p className="text-lg text-muted-foreground">Side-by-side comparison of shadcn/ui vs DaisyUI components</p>
      </div>

      {/* Button Comparison */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold">Button Components</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* shadcn Buttons */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-blue-600">shadcn/ui Buttons</h3>
            <div className="p-6 border rounded-lg bg-card">
              <div className="flex flex-wrap gap-4">
                <ShadcnButton>Default</ShadcnButton>
                <ShadcnButton variant="error">Destructive</ShadcnButton>
                <ShadcnButton variant="outline">Outline</ShadcnButton>
                <ShadcnButton variant="secondary">Secondary</ShadcnButton>
                <ShadcnButton variant="ghost">Ghost</ShadcnButton>
                <ShadcnButton variant="link">Link</ShadcnButton>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                <ShadcnButton size="sm">Small</ShadcnButton>
                <ShadcnButton size="lg">Large</ShadcnButton>
                <ShadcnButton loading>Loading</ShadcnButton>
              </div>
            </div>
          </div>

          {/* DaisyUI Buttons */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-green-600">DaisyUI Buttons</h3>
            <div className="p-6 border rounded-lg bg-base-100">
              <div className="flex flex-wrap gap-4">
                <DaisyButton>Default</DaisyButton>
                <DaisyButton variant="error">Destructive</DaisyButton>
                <DaisyButton variant="outline">Outline</DaisyButton>
                <DaisyButton variant="secondary">Secondary</DaisyButton>
                <DaisyButton variant="ghost">Ghost</DaisyButton>
                <DaisyButton variant="link">Link</DaisyButton>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                <DaisyButton size="sm">Small</DaisyButton>
                <DaisyButton size="lg">Large</DaisyButton>
                <DaisyButton loading>Loading</DaisyButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Input Comparison */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold">Input Components</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* shadcn Inputs */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-blue-600">shadcn/ui Inputs</h3>
            <div className="p-6 border rounded-lg bg-card space-y-4">
              <ShadcnInput placeholder="Default input" />
              <ShadcnInput placeholder="Email input" type="email" />
              <ShadcnInput placeholder="Password input" type="password" />
              <ShadcnInput placeholder="Disabled input" disabled />
            </div>
          </div>

          {/* DaisyUI Inputs */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-green-600">DaisyUI Inputs</h3>
            <div className="p-6 border rounded-lg bg-base-100 space-y-4">
              <DaisyInput placeholder="Default input" />
              <DaisyInput placeholder="Primary input" variant="primary" />
              <DaisyInput placeholder="Success input" variant="success" />
              <DaisyInput placeholder="Error input" variant="error" />
              <DaisyInput placeholder="Small input" inputSize="sm" />
              <DaisyInput placeholder="Large input" inputSize="lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Card Comparison */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold">Card Components</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* shadcn Card */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-blue-600">shadcn/ui Card</h3>
            <ShadcnCard className="w-full">
              <ShadcnCardHeader>
                <ShadcnCardTitle>Card Title</ShadcnCardTitle>
                <ShadcnCardDescription>
                  This is a description of the card content using shadcn/ui components.
                </ShadcnCardDescription>
              </ShadcnCardHeader>
              <ShadcnCardContent>
                <p>This is the main content area of the card. It can contain any type of content.</p>
              </ShadcnCardContent>
              <ShadcnCardFooter>
                <ShadcnButton>Action</ShadcnButton>
                <ShadcnButton variant="outline">Cancel</ShadcnButton>
              </ShadcnCardFooter>
            </ShadcnCard>
          </div>

          {/* DaisyUI Card */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-green-600">DaisyUI Card</h3>
            <DaisyCard className="w-full">
              <DaisyCardHeader>
                <DaisyCardTitle>Card Title</DaisyCardTitle>
                <DaisyCardDescription>
                  This is a description of the card content using DaisyUI components.
                </DaisyCardDescription>
              </DaisyCardHeader>
              <DaisyCardContent>
                <p>This is the main content area of the card. It can contain any type of content.</p>
              </DaisyCardContent>
              <DaisyCardFooter>
                <DaisyButton>Action</DaisyButton>
                <DaisyButton variant="outline">Cancel</DaisyButton>
              </DaisyCardFooter>
            </DaisyCard>
          </div>
        </div>
      </section>

      {/* Migration Benefits */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold">Migration Benefits</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-green-600">🎨 Better Theming</h3>
              <p>DaisyUI provides built-in theme support with 30+ themes out of the box.</p>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-blue-600">📦 Smaller Bundle</h3>
              <p>DaisyUI uses pure CSS classes, potentially reducing JavaScript bundle size.</p>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-purple-600">🚀 Faster Development</h3>
              <p>Pre-built components with consistent design patterns speed up development.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Migration Status */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold">Migration Progress</h2>
        
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="stat">
                <div className="stat-title">Completed</div>
                <div className="stat-value text-success">3</div>
                <div className="stat-desc">Button, Input, Card</div>
              </div>
              
              <div className="stat">
                <div className="stat-title">In Progress</div>
                <div className="stat-value text-warning">5</div>
                <div className="stat-desc">Modal, Tabs, Select, etc.</div>
              </div>
              
              <div className="stat">
                <div className="stat-title">Remaining</div>
                <div className="stat-value text-error">10</div>
                <div className="stat-desc">Complex components</div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="text-sm font-medium mb-2">Overall Progress</div>
              <progress className="progress progress-primary w-full" value="17" max="100"></progress>
              <div className="text-xs text-base-content/70 mt-1">17% Complete</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 