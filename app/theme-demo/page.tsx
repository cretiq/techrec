import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

export default function ThemeDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container py-6 space-y-8">
        <h1 className="text-3xl font-bold">Theme Demo</h1>
        <p className="text-muted-foreground">
          This page demonstrates how the theme toggle affects various UI components.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Card Component</CardTitle>
              <CardDescription>This is how cards look in the current theme.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Cards maintain consistent styling across themes while adapting to the color scheme.</p>
            </CardContent>
            <CardFooter>
              <Button>Action</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
              <CardDescription>Input fields, switches, and buttons.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter your name" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="notifications" />
                <Label htmlFor="notifications">Enable notifications</Label>
              </div>
              <div className="space-x-2">
                <Button variant="default">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="p-4 border rounded-md mt-2">
            <h3 className="text-lg font-medium">Tab Content 1</h3>
            <p className="text-muted-foreground">This is the content for tab 1.</p>
          </TabsContent>
          <TabsContent value="tab2" className="p-4 border rounded-md mt-2">
            <h3 className="text-lg font-medium">Tab Content 2</h3>
            <p className="text-muted-foreground">This is the content for tab 2.</p>
          </TabsContent>
          <TabsContent value="tab3" className="p-4 border rounded-md mt-2">
            <h3 className="text-lg font-medium">Tab Content 3</h3>
            <p className="text-muted-foreground">This is the content for tab 3.</p>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

