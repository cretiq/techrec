"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Bell, Users, Shield, CreditCard, Globe, Upload, Save, Loader2, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("profile")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    })

    setIsSaving(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="w-full flex justify-center">
        <div className="container max-w-6xl py-6 md:py-10 px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">Manage your company profile and preferences</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <Tabs
              defaultValue={activeTab}
              onValueChange={setActiveTab}
              className="w-full flex flex-col md:flex-row gap-8"
            >
              <div className="md:w-1/4">
                <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 space-y-1 items-start">
                  <TabsTrigger
                    value="profile"
                    className="w-full justify-start text-left px-4 py-2 h-10 data-[state=active]:bg-muted data-[state=active]:shadow-none"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Company Profile
                  </TabsTrigger>
                  <TabsTrigger
                    value="team"
                    className="w-full justify-start text-left px-4 py-2 h-10 data-[state=active]:bg-muted data-[state=active]:shadow-none"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Team Members
                  </TabsTrigger>
                  <TabsTrigger
                    value="notifications"
                    className="w-full justify-start text-left px-4 py-2 h-10 data-[state=active]:bg-muted data-[state=active]:shadow-none"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="w-full justify-start text-left px-4 py-2 h-10 data-[state=active]:bg-muted data-[state=active]:shadow-none"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger
                    value="billing"
                    className="w-full justify-start text-left px-4 py-2 h-10 data-[state=active]:bg-muted data-[state=active]:shadow-none"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Billing
                  </TabsTrigger>
                  <TabsTrigger
                    value="integrations"
                    className="w-full justify-start text-left px-4 py-2 h-10 data-[state=active]:bg-muted data-[state=active]:shadow-none"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Integrations
                  </TabsTrigger>
                </TabsList>
              </div>
              <div className="flex-1">
                <TabsContent value="profile" className="mt-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Company Profile</CardTitle>
                      <CardDescription>Manage your company information and public profile</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-4 items-start">
                          <div className="flex flex-col items-center gap-2">
                            <div
                              className="relative group cursor-pointer"
                              onClick={() => document.getElementById("logo-upload")?.click()}
                            >
                              <Avatar className="h-24 w-24 border-2 border-transparent group-hover:border-primary transition-colors">
                                <AvatarImage src="/placeholder.svg?height=96&width=96" />
                                <AvatarFallback>TC</AvatarFallback>
                              </Avatar>
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="h-6 w-6 text-white" />
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => document.getElementById("logo-upload")?.click()}
                            >
                              <Upload className="h-4 w-4" />
                              Change Logo
                            </Button>
                            <Input
                              id="logo-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                // Handle logo upload
                                if (e.target.files && e.target.files[0]) {
                                  // In a real app, you would upload the file to a server
                                  // For demo, we'll just show a toast
                                  toast({
                                    title: "Company logo updated",
                                    description: "Your company logo has been updated successfully",
                                  })
                                }
                              }}
                            />
                          </div>
                          <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="company-name">Company Name</Label>
                                <Input id="company-name" defaultValue="TechCorp Inc." />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input id="website" defaultValue="https://techcorp.example.com" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="company-description">Company Description</Label>
                              <Textarea
                                id="company-description"
                                rows={4}
                                defaultValue="TechCorp is a leading technology company specializing in innovative software solutions for businesses of all sizes."
                              />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="industry">Industry</Label>
                            <Select defaultValue="technology">
                              <SelectTrigger id="industry">
                                <SelectValue placeholder="Select industry" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="technology">Technology</SelectItem>
                                <SelectItem value="finance">Finance</SelectItem>
                                <SelectItem value="healthcare">Healthcare</SelectItem>
                                <SelectItem value="education">Education</SelectItem>
                                <SelectItem value="retail">Retail</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="company-size">Company Size</Label>
                            <Select defaultValue="50-200">
                              <SelectTrigger id="company-size">
                                <SelectValue placeholder="Select company size" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1-10">1-10 employees</SelectItem>
                                <SelectItem value="11-50">11-50 employees</SelectItem>
                                <SelectItem value="50-200">50-200 employees</SelectItem>
                                <SelectItem value="201-500">201-500 employees</SelectItem>
                                <SelectItem value="501-1000">501-1000 employees</SelectItem>
                                <SelectItem value="1000+">1000+ employees</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="contact-email">Contact Email</Label>
                            <Input id="contact-email" type="email" defaultValue="hr@techcorp.example.com" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contact-phone">Contact Phone</Label>
                            <Input id="contact-phone" defaultValue="+1 (555) 123-4567" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input id="location" defaultValue="San Francisco, CA" />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button onClick={handleSave} disabled={isSaving} className="gap-1">
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="team" className="mt-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Team Members</CardTitle>
                      <CardDescription>Manage your team members and their access permissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-end">
                          <Button className="gap-1">
                            <Users className="h-4 w-4" />
                            Invite Team Member
                          </Button>
                        </div>
                        <div className="rounded-md border">
                          <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 text-sm font-medium">
                            <div className="col-span-1">Name</div>
                            <div className="col-span-1">Email</div>
                            <div className="col-span-1">Role</div>
                            <div className="col-span-1 text-right">Actions</div>
                          </div>
                          {[
                            { name: "John Doe", email: "john@techcorp.example.com", role: "Admin" },
                            { name: "Jane Smith", email: "jane@techcorp.example.com", role: "HR Manager" },
                            { name: "Mike Johnson", email: "mike@techcorp.example.com", role: "Recruiter" },
                          ].map((member, index) => (
                            <div key={index} className="grid grid-cols-4 gap-4 p-4 border-t items-center">
                              <div className="col-span-1 font-medium">{member.name}</div>
                              <div className="col-span-1">{member.email}</div>
                              <div className="col-span-1">{member.role}</div>
                              <div className="col-span-1 flex justify-end gap-2">
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                                <Button variant="outline" size="sm" className="text-destructive">
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications" className="mt-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                      <CardDescription>Configure how and when you receive notifications</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
                          <div className="space-y-4">
                            {[
                              { id: "new-candidate", label: "New candidate applications" },
                              { id: "assessment-completed", label: "Assessment completions" },
                              { id: "candidate-match", label: "Candidate matches" },
                              { id: "team-activity", label: "Team member activity" },
                              { id: "weekly-summary", label: "Weekly summary reports" },
                            ].map((item) => (
                              <div key={item.id} className="flex items-center justify-between">
                                <Label htmlFor={item.id} className="font-normal">
                                  {item.label}
                                </Label>
                                <Switch id={item.id} defaultChecked={true} />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-4">In-App Notifications</h3>
                          <div className="space-y-4">
                            {[
                              { id: "app-new-candidate", label: "New candidate applications" },
                              { id: "app-assessment-completed", label: "Assessment completions" },
                              { id: "app-candidate-match", label: "Candidate matches" },
                              { id: "app-team-activity", label: "Team member activity" },
                            ].map((item) => (
                              <div key={item.id} className="flex items-center justify-between">
                                <Label htmlFor={item.id} className="font-normal">
                                  {item.label}
                                </Label>
                                <Switch id={item.id} defaultChecked={true} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button onClick={handleSave} disabled={isSaving} className="gap-1">
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="security" className="mt-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>Manage your account security and authentication options</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Password</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" />
                          </div>
                          <Button className="gap-1">
                            <Save className="h-4 w-4" />
                            Update Password
                          </Button>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Two-Factor Authentication</p>
                              <p className="text-sm text-muted-foreground">
                                Add an extra layer of security to your account
                              </p>
                            </div>
                            <Switch id="two-factor" defaultChecked={false} />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Login Notifications</p>
                              <p className="text-sm text-muted-foreground">
                                Receive notifications for new login attempts
                              </p>
                            </div>
                            <Switch id="login-notifications" defaultChecked={true} />
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-4">Session Management</h3>
                        <div className="space-y-4">
                          <div className="rounded-md border">
                            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 text-sm font-medium">
                              <div className="col-span-1">Device</div>
                              <div className="col-span-1">Location</div>
                              <div className="col-span-1">Last Active</div>
                            </div>
                            {[
                              {
                                device: "Chrome on Windows",
                                location: "San Francisco, CA",
                                lastActive: "Now (Current session)",
                              },
                              { device: "Safari on macOS", location: "New York, NY", lastActive: "2 days ago" },
                              { device: "Mobile App on iOS", location: "Chicago, IL", lastActive: "1 week ago" },
                            ].map((session, index) => (
                              <div key={index} className="grid grid-cols-3 gap-4 p-4 border-t items-center">
                                <div className="col-span-1">{session.device}</div>
                                <div className="col-span-1">{session.location}</div>
                                <div className="col-span-1">{session.lastActive}</div>
                              </div>
                            ))}
                          </div>
                          <Button variant="outline" className="gap-1">
                            <Shield className="h-4 w-4" />
                            Sign Out All Devices
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="billing" className="mt-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Billing Information</CardTitle>
                      <CardDescription>Manage your subscription and payment methods</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Current Plan</h3>
                        <div className="rounded-md border p-4">
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <p className="font-medium text-lg">Business Plan</p>
                              <p className="text-sm text-muted-foreground">$99/month, billed monthly</p>
                            </div>
                            <Badge>Active</Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <p>Unlimited assessments</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <p>Up to 100 candidates per month</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <p>Advanced analytics</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <p>Team collaboration</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button variant="outline">Change Plan</Button>
                            <Button variant="outline" className="text-destructive">
                              Cancel Subscription
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                        <div className="rounded-md border p-4">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="bg-muted p-2 rounded-md">
                              <CreditCard className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="font-medium">Visa ending in 4242</p>
                              <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline">Update Payment Method</Button>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-4">Billing History</h3>
                        <div className="rounded-md border">
                          <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 text-sm font-medium">
                            <div className="col-span-1">Date</div>
                            <div className="col-span-1">Amount</div>
                            <div className="col-span-1">Status</div>
                            <div className="col-span-1 text-right">Invoice</div>
                          </div>
                          {[
                            { date: "Apr 1, 2025", amount: "$99.00", status: "Paid" },
                            { date: "Mar 1, 2025", amount: "$99.00", status: "Paid" },
                            { date: "Feb 1, 2025", amount: "$99.00", status: "Paid" },
                          ].map((invoice, index) => (
                            <div key={index} className="grid grid-cols-4 gap-4 p-4 border-t items-center">
                              <div className="col-span-1">{invoice.date}</div>
                              <div className="col-span-1">{invoice.amount}</div>
                              <div className="col-span-1">
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  {invoice.status}
                                </Badge>
                              </div>
                              <div className="col-span-1 text-right">
                                <Button variant="ghost" size="sm" className="gap-1">
                                  <Download className="h-4 w-4" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="integrations" className="mt-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Integrations</CardTitle>
                      <CardDescription>Connect your account with other services</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        {[
                          {
                            name: "GitHub",
                            description: "Import code challenges from repositories",
                            connected: true,
                            icon: <GitHubIcon className="h-8 w-8" />,
                          },
                          {
                            name: "Slack",
                            description: "Receive notifications in your Slack workspace",
                            connected: true,
                            icon: <SlackIcon className="h-8 w-8" />,
                          },
                          {
                            name: "Google Calendar",
                            description: "Schedule interviews and assessments",
                            connected: false,
                            icon: <CalendarIcon className="h-8 w-8" />,
                          },
                          {
                            name: "Jira",
                            description: "Track candidates in your project management tool",
                            connected: false,
                            icon: <JiraIcon className="h-8 w-8" />,
                          },
                        ].map((integration) => (
                          <div
                            key={integration.name}
                            className="flex items-center justify-between p-4 border rounded-md"
                          >
                            <div className="flex items-center gap-4">
                              <div className="bg-muted p-2 rounded-md">{integration.icon}</div>
                              <div>
                                <p className="font-medium">{integration.name}</p>
                                <p className="text-sm text-muted-foreground">{integration.description}</p>
                              </div>
                            </div>
                            <Button variant={integration.connected ? "outline" : "default"}>
                              {integration.connected ? "Disconnect" : "Connect"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple icon components for the integrations section
function GitHubIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  )
}

function SlackIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z" />
      <path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
      <path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z" />
      <path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z" />
      <path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z" />
      <path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" />
      <path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z" />
      <path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z" />
    </svg>
  )
}

function CalendarIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function JiraIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M11.5 11.5L8 15l3.5 3.5L15 15z" />
      <path d="M15 8l-3.5 3.5L15 15l3.5-3.5z" />
      <path d="M8 15l-3.5 3.5L8 22l3.5-3.5z" />
    </svg>
  )
}

// Add the Switch component since we're using it in the settings page
function CheckCircle(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

