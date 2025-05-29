import {  SelectSeparator  } from '@/components/ui-daisy/select'
import {  Button  } from '@/components/ui-daisy/button'
import {  Input  } from '@/components/ui-daisy/input'
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
 } from '@/components/ui-daisy/select'
import {  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle  } from '@/components/ui-daisy/card'
import { Search, Mail, User, Calendar, CreditCard } from "lucide-react"

export default function FormComponentsPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2">Form Components</h1>
      <p className="text-gray-500 mb-8">Essential form components for the technical assessment platform.</p>

      <div className="grid gap-10">
        <section>
          <h2 className="text-2xl font-bold mb-6">Input</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="default">Default Input</Label>
              <Input id="default" placeholder="Enter text here..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="disabled">Disabled Input</Label>
              <Input id="disabled" placeholder="Disabled input" disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="with-icon">Input with Icon</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="with-icon" placeholder="Search..." className="pl-8" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="with-button">Input with Button</Label>
              <div className="flex gap-2">
                <Input id="with-button" placeholder="Enter email..." />
                <Button type="submit">Subscribe</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Input</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="Email" className="pl-8" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password Input</Label>
              <Input id="password" type="password" placeholder="Password" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="number">Number Input</Label>
              <Input id="number" type="number" placeholder="0" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date Input</Label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="date" type="date" className="pl-8" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Select</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="basic-select">Basic Select</Label>
              <Select>
                <SelectTrigger id="basic-select">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">Option 1</SelectItem>
                  <SelectItem value="option2">Option 2</SelectItem>
                  <SelectItem value="option3">Option 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="disabled-select">Disabled Select</Label>
              <Select disabled>
                <SelectTrigger id="disabled-select">
                  <SelectValue placeholder="Disabled" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">Option 1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grouped-select">Grouped Select</Label>
              <Select>
                <SelectTrigger id="grouped-select">
                  <SelectValue placeholder="Select a programming language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Frontend</SelectLabel>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="react">React</SelectItem>
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>Backend</SelectLabel>
                    <SelectItem value="node">Node.js</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty-select">Difficulty Select</Label>
              <Select>
                <SelectTrigger id="difficulty-select">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Textarea</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="basic-textarea">Basic Textarea</Label>
              <Textarea id="basic-textarea" placeholder="Enter your message here..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="disabled-textarea">Disabled Textarea</Label>
              <Textarea id="disabled-textarea" placeholder="Disabled textarea" disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="large-textarea">Large Textarea</Label>
              <Textarea id="large-textarea" placeholder="Enter detailed description..." className="min-h-[150px]" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code-textarea">Code Textarea</Label>
              <Textarea
                id="code-textarea"
                placeholder="// Enter your code here"
                className="font-mono"
                defaultValue={`function example() {\n  return "Hello, world!";\n}`}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Form Examples</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Enter your contact details below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="full-name" placeholder="John Doe" className="pl-8" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="contact-email" type="email" placeholder="john@example.com" className="pl-8" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Enter your message..." />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Submit</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>Enter your payment details below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-name">Name on Card</Label>
                  <Input id="card-name" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="card-number" placeholder="1234 5678 9012 3456" className="pl-8" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry-date">Expiry Date</Label>
                    <Input id="expiry-date" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Pay Now</Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}

