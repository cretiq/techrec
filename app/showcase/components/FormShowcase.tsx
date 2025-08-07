"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui-daisy/input';
import { Textarea } from '@/components/ui-daisy/textarea';
import { Select } from '@/components/ui-daisy/select';
import { RadioGroup } from '@/components/ui-daisy/radio-group';
import { Button } from '@/components/ui-daisy/button';
import { 
  Search, 
  Mail, 
  Lock, 
  User, 
  Phone,
  Calendar,
  CreditCard,
  Globe,
  Check,
  Copy
} from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface FormShowcaseProps {
  onCopyCode: (code: string, id: string) => void;
  copiedCode: string | null;
  theme?: 'light' | 'dark';
}

export default function FormShowcase({ onCopyCode, copiedCode, theme }: FormShowcaseProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    bio: '',
    experience: '',
    preference: 'option1'
  });

  const inputVariants = ['default', 'glass', 'bordered'];
  const textareaVariants = ['default', 'glass', 'bordered'];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-base-content">Form Components</h2>
        <p className="text-base-content/70 mb-6">
          Professional form elements with consistent borders and minimal design. All components share
          the same subtle styling and focus states for perfect visual consistency.
        </p>
      </div>

      {/* Input Component */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">Input Component</h3>
          <button
            onClick={() => onCopyCode(
              `import { Input } from '@/components/ui-daisy/input';

// Input variants
<Input variant="default" placeholder="Default input" />
<Input variant="glass" placeholder="Glass input" />
<Input variant="bordered" placeholder="Bordered input" />

// With icons
<Input 
  variant="glass" 
  placeholder="Search..." 
  leftIcon={<Search className="h-4 w-4" />} 
/>

// With label and error
<Input 
  label="Email Address" 
  error="Please enter a valid email" 
  placeholder="john@example.com" 
/>`,
              'input-examples'
            )}
            className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'input-examples' ? (
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

        <div className="space-y-6">
          {/* Variants */}
          <div>
            <h4 className="text-sm font-medium text-base-content/70 mb-3">Variants</h4>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {inputVariants.map((variant) => (
                <motion.div key={variant} variants={staggerItem}>
                  <Input 
                    variant={variant as any}
                    placeholder={`${variant.charAt(0).toUpperCase() + variant.slice(1)} input`}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* With Icons */}
          <div>
            <h4 className="text-sm font-medium text-base-content/70 mb-3">With Icons</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                variant="glass"
                placeholder="Search..."
                leftIcon={<Search className="h-4 w-4" />}
              />
              <Input 
                variant="glass"
                placeholder="Email"
                leftIcon={<Mail className="h-4 w-4" />}
                rightIcon={<Check className="h-4 w-4 text-success" />}
              />
              <Input 
                variant="glass"
                placeholder="Username"
                leftIcon={<User className="h-4 w-4" />}
              />
              <Input 
                variant="glass"
                type="password"
                placeholder="Password"
                leftIcon={<Lock className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* With Labels and States */}
          <div>
            <h4 className="text-sm font-medium text-base-content/70 mb-3">Labels & States</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Email Address"
                placeholder="john@example.com"
                helperText="We'll never share your email"
              />
              <Input 
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                leftIcon={<Phone className="h-4 w-4" />}
                error="Please enter a valid phone number"
              />
              <Input 
                label="Website"
                placeholder="https://example.com"
                leftIcon={<Globe className="h-4 w-4" />}
                variant="glass"
              />
              <Input 
                label="Date of Birth"
                type="date"
                leftIcon={<Calendar className="h-4 w-4" />}
                variant="glass"
              />
            </div>
          </div>

          {/* Sizes */}
          <div>
            <h4 className="text-sm font-medium text-base-content/70 mb-3">Sizes</h4>
            <div className="space-y-3">
              <Input size="sm" placeholder="Small input" variant="glass" />
              <Input size="md" placeholder="Medium input (default)" variant="glass" />
              <Input size="lg" placeholder="Large input" variant="glass" />
            </div>
          </div>
        </div>
      </section>

      {/* Textarea Component */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">Textarea Component</h3>
          <button
            onClick={() => onCopyCode(
              `import { Textarea } from '@/components/ui-daisy/textarea';

// Textarea variants
<Textarea variant="default" placeholder="Default textarea" />
<Textarea variant="glass" placeholder="Glass textarea" />
<Textarea variant="bordered" placeholder="Bordered textarea" />

// With label and helper text
<Textarea 
  label="Bio" 
  placeholder="Tell us about yourself..."
  helperText="Maximum 500 characters"
  rows={4}
/>`,
              'textarea-examples'
            )}
            className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'textarea-examples' ? (
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

        <div className="space-y-6">
          {/* Variants */}
          <div>
            <h4 className="text-sm font-medium text-base-content/70 mb-3">Variants</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {textareaVariants.map((variant) => (
                <Textarea 
                  key={variant}
                  variant={variant as any}
                  placeholder={`${variant.charAt(0).toUpperCase() + variant.slice(1)} textarea`}
                  rows={3}
                />
              ))}
            </div>
          </div>

          {/* With Labels */}
          <div>
            <h4 className="text-sm font-medium text-base-content/70 mb-3">With Labels & States</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea 
                label="Cover Letter"
                placeholder="Write your cover letter here..."
                helperText="Minimum 200 characters"
                rows={5}
                variant="glass"
              />
              <Textarea 
                label="Experience Description"
                placeholder="Describe your experience..."
                error="This field is required"
                rows={5}
                variant="glass"
              />
            </div>
          </div>

          {/* Resize Options */}
          <div>
            <h4 className="text-sm font-medium text-base-content/70 mb-3">Resize Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Textarea 
                resize="none"
                placeholder="No resize"
                rows={3}
                variant="glass"
              />
              <Textarea 
                resize="vertical"
                placeholder="Vertical resize only"
                rows={3}
                variant="glass"
              />
              <Textarea 
                resize="both"
                placeholder="Resize both ways"
                rows={3}
                variant="glass"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Select Component */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">Select Component</h3>
          <button
            onClick={() => onCopyCode(
              `import { Select } from '@/components/ui-daisy/select';

// Select variants
<Select variant="default">
  <option>Option 1</option>
  <option>Option 2</option>
</Select>

// With label
<Select label="Experience Level" variant="glass">
  <option value="">Select level</option>
  <option value="junior">Junior (0-2 years)</option>
  <option value="mid">Mid-level (3-5 years)</option>
  <option value="senior">Senior (5+ years)</option>
</Select>`,
              'select-examples'
            )}
            className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'select-examples' ? (
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

        <div className="space-y-6">
          {/* Variants */}
          <div>
            <h4 className="text-sm font-medium text-base-content/70 mb-3">Variants</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select variant="default">
                <option>Default select</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </Select>
              <Select variant="glass">
                <option>Glass select</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </Select>
              <Select variant="bordered">
                <option>Bordered select</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </Select>
            </div>
          </div>

          {/* With Labels */}
          <div>
            <h4 className="text-sm font-medium text-base-content/70 mb-3">With Labels & States</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select 
                label="Experience Level"
                variant="glass"
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
              >
                <option value="">Select level</option>
                <option value="junior">Junior (0-2 years)</option>
                <option value="mid">Mid-level (3-5 years)</option>
                <option value="senior">Senior (5+ years)</option>
                <option value="lead">Lead (7+ years)</option>
              </Select>
              <Select 
                label="Department"
                variant="glass"
                error="Please select a department"
              >
                <option value="">Choose department</option>
                <option value="engineering">Engineering</option>
                <option value="design">Design</option>
                <option value="product">Product</option>
                <option value="marketing">Marketing</option>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* RadioGroup Component */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">RadioGroup Component</h3>
          <button
            onClick={() => onCopyCode(
              `import { RadioGroup } from '@/components/ui-daisy/radio-group';

// RadioGroup usage
<RadioGroup 
  label="Preference" 
  value={value} 
  onChange={setValue}
>
  <RadioGroup.Option value="option1" label="Option 1" />
  <RadioGroup.Option value="option2" label="Option 2" />
  <RadioGroup.Option value="option3" label="Option 3" />
</RadioGroup>`,
              'radio-examples'
            )}
            className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'radio-examples' ? (
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

        <div className="space-y-6">
          {/* Basic RadioGroup */}
          <div>
            <h4 className="text-sm font-medium text-base-content/70 mb-3">Basic Usage</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RadioGroup 
                label="Job Type Preference"
                value={formData.preference}
                onChange={(value) => setFormData({...formData, preference: value})}
              >
                <RadioGroup.Option value="remote" label="Remote" />
                <RadioGroup.Option value="hybrid" label="Hybrid" />
                <RadioGroup.Option value="onsite" label="On-site" />
              </RadioGroup>

              <RadioGroup 
                label="Availability"
                value="immediate"
                onChange={() => {}}
              >
                <RadioGroup.Option value="immediate" label="Immediate" />
                <RadioGroup.Option value="2weeks" label="2 weeks notice" />
                <RadioGroup.Option value="1month" label="1 month notice" />
                <RadioGroup.Option value="flexible" label="Flexible" />
              </RadioGroup>
            </div>
          </div>

          {/* With Descriptions */}
          <div>
            <h4 className="text-sm font-medium text-base-content/70 mb-3">With Descriptions</h4>
            <RadioGroup 
              label="Subscription Plan"
              value="pro"
              onChange={() => {}}
            >
              <RadioGroup.Option 
                value="free" 
                label="Free Plan"
                description="Basic features for individuals"
              />
              <RadioGroup.Option 
                value="pro" 
                label="Pro Plan"
                description="Advanced features for professionals"
              />
              <RadioGroup.Option 
                value="enterprise" 
                label="Enterprise"
                description="Custom solutions for teams"
              />
            </RadioGroup>
          </div>
        </div>
      </section>

      {/* Complete Form Example */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-base-content">Complete Form Example</h3>
        
        <div className="max-w-2xl">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="First Name"
                placeholder="John"
                variant="glass"
                required
              />
              <Input 
                label="Last Name"
                placeholder="Doe"
                variant="glass"
                required
              />
            </div>

            <Input 
              label="Email"
              type="email"
              placeholder="john.doe@example.com"
              leftIcon={<Mail className="h-4 w-4" />}
              variant="glass"
              required
            />

            <Select 
              label="Role"
              variant="glass"
              required
            >
              <option value="">Select a role</option>
              <option value="developer">Developer</option>
              <option value="designer">Designer</option>
              <option value="manager">Manager</option>
              <option value="other">Other</option>
            </Select>

            <Textarea 
              label="Message"
              placeholder="Tell us more about your requirements..."
              rows={4}
              variant="glass"
              helperText="Minimum 50 characters"
              required
            />

            <RadioGroup 
              label="Preferred Contact Method"
              value="email"
              onChange={() => {}}
            >
              <RadioGroup.Option value="email" label="Email" />
              <RadioGroup.Option value="phone" label="Phone" />
              <RadioGroup.Option value="both" label="Both" />
            </RadioGroup>

            <div className="flex gap-3">
              <Button type="button" variant="outlined">
                Cancel
              </Button>
              <Button type="submit" variant="gradient-brand">
                Submit Application
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}