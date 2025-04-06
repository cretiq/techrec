import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function UIComponentsPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2">Base UI Components</h1>
      <p className="text-gray-500 mb-8">
        The foundational UI components used throughout the technical assessment platform.
      </p>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-6">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">🔍</Button>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <Button disabled>Disabled</Button>
            <Button className="gap-2">
              <span>With Icon</span>
              <span>→</span>
            </Button>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card Description</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Card Content</p>
              </CardContent>
              <CardFooter>
                <Button>Action</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Compact Card</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p>This card has reduced padding for a more compact look.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Full Width Button
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle>Styled Card</CardTitle>
                <CardDescription>With custom background and border</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Cards can be styled with custom colors and effects.</p>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="ghost">Cancel</Button>
                <Button>Submit</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Tabs</h2>
          <Tabs defaultValue="account">
            <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="p-4 border rounded-md mt-2">
              Account tab content
            </TabsContent>
            <TabsContent value="password" className="p-4 border rounded-md mt-2">
              Password tab content
            </TabsContent>
            <TabsContent value="settings" className="p-4 border rounded-md mt-2">
              Settings tab content
            </TabsContent>
          </Tabs>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Badges</h2>
          <div className="flex flex-wrap gap-4">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-transparent">Success</Badge>
            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-transparent">Warning</Badge>
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-transparent">Info</Badge>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Progress</h2>
          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Default</span>
                <span>40%</span>
              </div>
              <Progress value={40} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Custom Height</span>
                <span>60%</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Custom Color</span>
                <span>80%</span>
              </div>
              <Progress value={80} indicatorClassName="bg-green-500" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Avatars</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>

            <Avatar>
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>

            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary text-primary-foreground">LG</AvatarFallback>
            </Avatar>

            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-secondary text-secondary-foreground">SM</AvatarFallback>
            </Avatar>

            <div className="flex -space-x-2">
              <Avatar className="border-2 border-background">
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <Avatar className="border-2 border-background">
                <AvatarFallback>B</AvatarFallback>
              </Avatar>
              <Avatar className="border-2 border-background">
                <AvatarFallback>C</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

