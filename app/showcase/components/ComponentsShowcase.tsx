"use client";

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui-daisy/tabs';
import { Badge } from '@/components/ui-daisy/badge';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from '@/components/ui-daisy/dropdown';
import { Button } from '@/components/ui-daisy/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-daisy/card';
import { 
  Check, 
  Copy, 
  ChevronDown, 
  Settings, 
  User, 
  LogOut, 
  Bell,
  Star,
  Shield,
  Trophy,
  Zap,
  Crown,
  Activity,
  Users,
  Calendar,
  MessageCircle,
  Archive
} from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface ComponentsShowcaseProps {
  onCopyCode: (code: string, id: string) => void;
  copiedCode: string | null;
  theme?: 'light' | 'dark';
}

export default function ComponentsShowcase({ onCopyCode, copiedCode, theme }: ComponentsShowcaseProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [badgeCount, setBadgeCount] = useState(5);

  // Badge variants for showcase
  const badgeVariants = [
    { variant: 'default', label: 'Default' },
    { variant: 'secondary', label: 'Secondary' },
    { variant: 'success', label: 'Success' },
    { variant: 'warning', label: 'Warning' },
    { variant: 'error', label: 'Error' },
    { variant: 'info', label: 'Info' },
    { variant: 'gradient-brand', label: 'Brand' },
    { variant: 'gradient', label: 'Gradient' },
    { variant: 'glass', label: 'Glass' },
    { variant: 'glass-success', label: 'Glass Success' },
    { variant: 'outline', label: 'Outline' }
  ];

  const tabVariants = [
    { variant: 'default', label: 'Default' },
    { variant: 'boxed', label: 'Boxed' },
    { variant: 'bordered', label: 'Bordered' },
    { variant: 'lifted', label: 'Lifted' },
    { variant: 'glass', label: 'Glass' },
    { variant: 'minimal', label: 'Minimal' },
    { variant: 'pills', label: 'Pills' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-base-content">UI Components</h2>
        <p className="text-base-content/70 mb-6">
          Essential UI components with the Linear-style minimal dark aesthetic. Each component 
          maintains consistent borders, spacing, and subtle interactions.
        </p>
      </div>

      {/* Tabs Component */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">Tabs Component</h3>
          <button
            onClick={() => onCopyCode(
              `import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui-daisy/tabs';

// Basic tabs usage
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList variant="glass" fullWidth>
    <TabsTrigger value="overview" variant="glass">Overview</TabsTrigger>
    <TabsTrigger value="analytics" variant="glass">Analytics</TabsTrigger>
    <TabsTrigger value="settings" variant="glass">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="overview" animated>
    Overview content with smooth transitions
  </TabsContent>
  <TabsContent value="analytics" animated>
    Analytics content
  </TabsContent>
  <TabsContent value="settings" animated>
    Settings content
  </TabsContent>
</Tabs>`,
              'tabs-examples'
            )}
            className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'tabs-examples' ? (
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
          {/* Tab Variants */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Tab Variants</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tabVariants.slice(0, 4).map(({ variant, label }) => (
                <Card key={variant} variant="outlined" className="">
                  <CardHeader>
                    <CardTitle className="text-sm text-base-content">{label} Tabs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs value="tab1" className="w-full">
                      <TabsList variant={variant as any} fullWidth>
                        <TabsTrigger value="tab1" variant={variant as any}>Tab 1</TabsTrigger>
                        <TabsTrigger value="tab2" variant={variant as any}>Tab 2</TabsTrigger>
                        <TabsTrigger value="tab3" variant={variant as any}>Tab 3</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Interactive Tabs Example */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Interactive Example</h4>
            <Card variant="outlined" className="">
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList variant="glass" fullWidth>
                    <TabsTrigger value="overview" variant="glass" className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="analytics" variant="glass" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Analytics
                    </TabsTrigger>
                    <TabsTrigger value="settings" variant="glass" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" animated className="mt-4">
                    <div className="p-4 rounded-lg border border-base-300/30 bg-base-100/60">
                      <h5 className="font-medium text-base-content mb-2">Project Overview</h5>
                      <p className="text-base-content/70 text-sm">
                        Monitor your project's performance, recent activities, and key metrics 
                        in this comprehensive overview dashboard.
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="analytics" animated className="mt-4">
                    <div className="p-4 rounded-lg border border-base-300/30 bg-base-100/60">
                      <h5 className="font-medium text-base-content mb-2">Analytics Dashboard</h5>
                      <p className="text-base-content/70 text-sm">
                        Detailed analytics and insights about user engagement, conversion rates, 
                        and performance metrics for data-driven decisions.
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="settings" animated className="mt-4">
                    <div className="p-4 rounded-lg border border-base-300/30 bg-base-100/60">
                      <h5 className="font-medium text-base-content mb-2">Configuration Settings</h5>
                      <p className="text-base-content/70 text-sm">
                        Customize your application preferences, manage integrations, 
                        and configure advanced settings for optimal performance.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Badge Component */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">Badge Component</h3>
          <button
            onClick={() => onCopyCode(
              `import { Badge } from '@/components/ui-daisy/badge';

// Badge variants
<Badge variant="default">Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="gradient-brand">Brand</Badge>
<Badge variant="glass" interactive>Glass</Badge>

// Status badges with indicators
<Badge variant="success" pulse>Active</Badge>
<Badge variant="outline">Inactive</Badge>
<Badge variant="warning">Pending</Badge>

// Count badges
<Badge variant="primary" count={5} />
<Badge variant="primary" count={99} />
<Badge variant="primary" count="99+" />`,
              'badge-examples'
            )}
            className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'badge-examples' ? (
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
          {/* Badge Variants */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Badge Variants</h4>
            <motion.div 
              className="flex flex-wrap gap-3"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {badgeVariants.map(({ variant, label }) => (
                <motion.div key={variant} variants={staggerItem}>
                  <Badge variant={variant as any}>
                    {label}
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Badge Sizes */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Badge Sizes</h4>
            <div className="flex items-center gap-3">
              <Badge size="sm" variant="gradient-brand">Small</Badge>
              <Badge size="md" variant="gradient-brand">Medium</Badge>
              <Badge size="lg" variant="gradient-brand">Large</Badge>
            </div>
          </div>

          {/* Interactive Badges */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Interactive & Status Badges</h4>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Badge variant="glass" interactive dot>
                  Online
                </Badge>
                <Badge variant="success" pulse>Active</Badge>
                <Badge variant="outline">Inactive</Badge>
                <Badge variant="warning">Pending</Badge>
                <Badge variant="error">Error</Badge>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-base-content/70" />
                  <span className="text-base-content text-sm">Notifications</span>
                  <Badge variant="primary" count={badgeCount} />
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setBadgeCount(prev => prev + 1)}
                >
                  +1
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setBadgeCount(prev => Math.max(0, prev - 1))}
                >
                  -1
                </Button>
              </div>
            </div>
          </div>

          {/* Badge Usage Examples */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Usage Examples</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card variant="outlined" className="">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-base-content font-medium">User Profile</h5>
                    <Badge variant="gradient-brand" size="sm">
                      <Crown className="h-3 w-3 mr-1" />
                      Pro
                    </Badge>
                  </div>
                  <p className="text-base-content/70 text-sm">Premium user with advanced features</p>
                </CardContent>
              </Card>

              <Card variant="outlined" className="">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-base-content font-medium">Project Status</h5>
                    <div className="flex gap-2">
                      <Badge variant="glass-success" size="sm">
                        <Shield className="h-3 w-3 mr-1" />
                        Secure
                      </Badge>
                      <Badge variant="success" pulse>Active</Badge>
                    </div>
                  </div>
                  <p className="text-base-content/70 text-sm">Production environment running smoothly</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Dropdown Component */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">Dropdown Component</h3>
          <button
            onClick={() => onCopyCode(
              `import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from '@/components/ui-daisy/dropdown';

// Basic dropdown
<Dropdown>
  <DropdownTrigger>
    <Button variant="outlined" rightIcon={<ChevronDown />}>
      Options
    </Button>
  </DropdownTrigger>
  <DropdownContent>
    <DropdownItem leftIcon={<User />}>Profile</DropdownItem>
    <DropdownItem leftIcon={<Settings />}>Settings</DropdownItem>
    <DropdownItem leftIcon={<LogOut />} variant="error">
      Sign Out
    </DropdownItem>
  </DropdownContent>
</Dropdown>`,
              'dropdown-examples'
            )}
            className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-1 px-3 py-1 rounded-lg border border-base-300/50 hover:border-base-content/30 transition-colors"
          >
            {copiedCode === 'dropdown-examples' ? (
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
          {/* Basic Dropdowns */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Basic Dropdowns</h4>
            <div className="flex flex-wrap gap-4">
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="outlined" rightIcon={<ChevronDown className="h-4 w-4" />}>
                    Account
                  </Button>
                </DropdownTrigger>
                <DropdownContent>
                  <DropdownItem leftIcon={<User className="h-4 w-4" />}>
                    Profile
                  </DropdownItem>
                  <DropdownItem leftIcon={<Settings className="h-4 w-4" />}>
                    Settings
                  </DropdownItem>
                  <DropdownItem leftIcon={<Bell className="h-4 w-4" />}>
                    Notifications
                  </DropdownItem>
                  <li className="border-t border-base-300/50 my-1"></li>
                  <DropdownItem leftIcon={<LogOut className="h-4 w-4" />} variant="error">
                    Sign Out
                  </DropdownItem>
                </DropdownContent>
              </Dropdown>

              <Dropdown>
                <DropdownTrigger>
                  <Button variant="glass" rightIcon={<ChevronDown className="h-4 w-4" />}>
                    Actions
                  </Button>
                </DropdownTrigger>
                <DropdownContent>
                  <DropdownItem leftIcon={<Star className="h-4 w-4" />}>
                    Add to Favorites
                  </DropdownItem>
                  <DropdownItem leftIcon={<Archive className="h-4 w-4" />}>
                    Archive
                  </DropdownItem>
                  <DropdownItem leftIcon={<MessageCircle className="h-4 w-4" />}>
                    Add Comment
                  </DropdownItem>
                </DropdownContent>
              </Dropdown>

              <Dropdown>
                <DropdownTrigger>
                  <Button size="icon" variant="ghost">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownTrigger>
                <DropdownContent>
                  <DropdownItem>Edit</DropdownItem>
                  <DropdownItem>Duplicate</DropdownItem>
                  <DropdownItem>Share</DropdownItem>
                  <li className="border-t border-base-300/50 my-1"></li>
                  <DropdownItem variant="error">Delete</DropdownItem>
                </DropdownContent>
              </Dropdown>
            </div>
          </div>

          {/* Complex Dropdown Example */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Complex Dropdown</h4>
            <Card variant="outlined" className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h5 className="text-base-content font-medium">John Doe</h5>
                    <p className="text-base-content/70 text-sm">Software Engineer</p>
                  </div>
                </div>
                
                <Dropdown>
                  <DropdownTrigger>
                    <Button size="icon" variant="ghost">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownContent>
                    <div className="px-3 py-2 border-b border-base-300/50">
                      <p className="text-xs text-base-content/70 uppercase tracking-wide">Account</p>
                    </div>
                    <DropdownItem leftIcon={<User className="h-4 w-4" />}>
                      View Profile
                    </DropdownItem>
                    <DropdownItem leftIcon={<Settings className="h-4 w-4" />}>
                      Account Settings
                    </DropdownItem>
                    <DropdownItem leftIcon={<Trophy className="h-4 w-4" />}>
                      Achievements
                      <Badge variant="gradient-brand" size="sm" className="ml-auto">
                        3
                      </Badge>
                    </DropdownItem>
                    <div className="px-3 py-2 border-b border-base-300/50">
                      <p className="text-xs text-base-content/70 uppercase tracking-wide">Actions</p>
                    </div>
                    <DropdownItem leftIcon={<Bell className="h-4 w-4" />}>
                      Notifications
                      <Badge variant="success" pulse className="ml-auto">Live</Badge>
                    </DropdownItem>
                    <DropdownItem leftIcon={<Calendar className="h-4 w-4" />}>
                      Schedule Meeting
                    </DropdownItem>
                    <li className="border-t border-base-300/50 my-1"></li>
                    <DropdownItem leftIcon={<LogOut className="h-4 w-4" />} variant="error">
                      Sign Out
                    </DropdownItem>
                  </DropdownContent>
                </Dropdown>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Component Combinations */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-base-content">Component Combinations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tabs with Badges */}
          <Card variant="outlined" className="">
            <CardHeader>
              <CardTitle className="text-base-content">Tabs with Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value="inbox" className="w-full">
                <TabsList variant="glass" fullWidth>
                  <TabsTrigger value="inbox" variant="glass" className="flex items-center gap-2">
                    Inbox
                    <Badge variant="primary" count={5} />
                  </TabsTrigger>
                  <TabsTrigger value="sent" variant="glass">
                    Sent
                  </TabsTrigger>
                  <TabsTrigger value="draft" variant="glass" className="flex items-center gap-2">
                    Draft
                    <Badge variant="primary" count={2} />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* Dropdown with Status */}
          <Card variant="outlined" className="">
            <CardHeader>
              <CardTitle className="text-base-content">Status Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="success" pulse>Live</Badge>
                  <span className="text-base-content text-sm">System Status</span>
                </div>
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="glass" size="sm" rightIcon={<ChevronDown className="h-4 w-4" />}>
                      Manage
                    </Button>
                  </DropdownTrigger>
                  <DropdownContent>
                    <DropdownItem leftIcon={<Zap className="h-4 w-4" />}>
                      <span>Set Active</span>
                      <Badge variant="glass-success" size="sm" className="ml-auto">Live</Badge>
                    </DropdownItem>
                    <DropdownItem leftIcon={<Activity className="h-4 w-4" />}>
                      Set Maintenance
                    </DropdownItem>
                    <DropdownItem leftIcon={<Settings className="h-4 w-4" />}>
                      Configure
                    </DropdownItem>
                  </DropdownContent>
                </Dropdown>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}