"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-daisy/card'
import { Badge } from '@/components/ui-daisy/badge'
import { HelpCircle, Coins, Search, AlertTriangle, CheckCircle, Mail } from 'lucide-react'

export default function BetaFAQPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Beta Testing FAQ</h1>
        <p className="text-lg text-muted-foreground mb-4">
          Everything you need to know about the TechRec beta testing program
        </p>
        <Badge variant="primary" className="mb-6">
          <Coins className="w-4 h-4 mr-2" />
          Points-Based Beta System
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Getting Started */}
        <div className="collapse collapse-plus bg-base-200">
          <input type="radio" name="faq-accordion" defaultChecked />
          <div className="collapse-title text-xl font-medium flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            What is the TechRec Beta Testing Program?
          </div>
          <div className="collapse-content">
            <div className="space-y-3">
              <p>
                TechRec is testing our job search platform with a select group of beta users. 
                During this phase, we use a points-based system to manage API usage and ensure 
                fair access to our job search features.
              </p>
              <div className="bg-info/10 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Beta Period:</strong> Limited time testing with 10 selected users<br/>
                  <strong>Initial Points:</strong> 300 points per beta tester<br/>
                  <strong>Cost:</strong> 1 point per job result returned
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How Points Work */}
        <div className="collapse collapse-plus bg-base-200">
          <input type="radio" name="faq-accordion" />
          <div className="collapse-title text-xl font-medium flex items-center gap-2">
            <Coins className="w-5 h-5 text-warning" />
            How does the points system work?
          </div>
          <div className="collapse-content">
            <div className="space-y-3">
              <p>
                Our points system is simple and fair - you only pay for what you get:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>1 point = 1 job result</strong> returned from your search</li>
                <li><strong>0 points</strong> if your search returns no results</li>
                <li>Points are deducted <em>after</em> we know how many jobs were found</li>
                <li>You can see your balance and estimated cost before searching</li>
              </ul>
              <div className="bg-success/10 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Example:</strong> Search for "React Developer" in London → 
                  Returns 15 jobs → Uses 15 points → You have 285 points remaining
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Using the Search */}
        <div className="collapse collapse-plus bg-base-200">
          <input type="radio" name="faq-accordion" />
          <div className="collapse-title text-xl font-medium flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            How do I search for jobs?
          </div>
          <div className="collapse-content">
            <div className="space-y-3">
              <ol className="list-decimal pl-6 space-y-2">
                <li>Go to the <strong>Roles Search</strong> page from the navigation menu</li>
                <li>Check your points balance in the blue card at the top</li>
                <li>Use the advanced filters to specify what you're looking for</li>
                <li>See the estimated maximum cost (e.g., "up to 25 points")</li>
                <li>Click search and wait for results</li>
                <li>Points are deducted based on actual results found</li>
              </ol>
              <div className="bg-warning/10 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Tip:</strong> Start with specific searches to get more relevant results 
                  and potentially use fewer points!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Points Balance */}
        <div className="collapse collapse-plus bg-base-200">
          <input type="radio" name="faq-accordion" />
          <div className="collapse-title text-xl font-medium flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-info" />
            How do I check my points balance?
          </div>
          <div className="collapse-content">
            <div className="space-y-3">
              <p>Your points balance is always visible when you're searching for jobs:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Search Page:</strong> Blue card shows current balance with color coding</li>
                <li><strong>Color Indicators:</strong>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li><span className="text-success font-medium">Green:</span> 50+ points (plenty left)</li>
                    <li><span className="text-warning font-medium">Orange:</span> 10-49 points (getting low)</li>
                    <li><span className="text-error font-medium">Red:</span> Under 10 points (critical)</li>
                  </ul>
                </li>
                <li><strong>Search Preview:</strong> Shows maximum points a search might use</li>
                <li><strong>After Search:</strong> Notification shows exactly how many points were used</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Running Low */}
        <div className="collapse collapse-plus bg-base-200">
          <input type="radio" name="faq-accordion" />
          <div className="collapse-title text-xl font-medium flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            What happens when I run low on points?
          </div>
          <div className="collapse-content">
            <div className="space-y-3">
              <p>Don't worry - we'll help you manage your points effectively:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>50 points or less:</strong> Yellow warning badge appears</li>
                <li><strong>10 points or less:</strong> Red critical warning</li>
                <li><strong>0 points:</strong> Search is blocked with a helpful message</li>
              </ul>
              <div className="bg-info/10 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Need more points?</strong> Contact our support team and we'll top you up! 
                  This is beta testing - we want you to explore the platform thoroughly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Tips */}
        <div className="collapse collapse-plus bg-base-200">
          <input type="radio" name="faq-accordion" />
          <div className="collapse-title text-xl font-medium flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            Tips for efficient searching
          </div>
          <div className="collapse-content">
            <div className="space-y-3">
              <p>Get the most value from your points with these strategies:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Be specific:</strong> Use job titles, locations, and filters to get targeted results</li>
                <li><strong>Start small:</strong> Try searches with limit of 10-15 jobs first</li>
                <li><strong>Use filters:</strong> Company size, seniority level, remote options narrow results</li>
                <li><strong>Check previews:</strong> The system shows estimated cost before you search</li>
                <li><strong>Learn from results:</strong> See what works and refine your next search</li>
              </ul>
              <div className="bg-success/10 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Remember:</strong> If a search finds no results, you pay 0 points! 
                  So feel free to experiment.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Issues */}
        <div className="collapse collapse-plus bg-base-200">
          <input type="radio" name="faq-accordion" />
          <div className="collapse-title text-xl font-medium flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-error" />
            What if something goes wrong?
          </div>
          <div className="collapse-content">
            <div className="space-y-3">
              <p>Beta testing means we're still improving! Here's what to do if you encounter issues:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Search errors:</strong> If a search fails, points are NOT deducted</li>
                <li><strong>Incorrect charges:</strong> Contact us - we track every transaction</li>
                <li><strong>Technical bugs:</strong> Report them! That's what beta testing is for</li>
                <li><strong>Feature requests:</strong> We love feedback on what you'd like to see</li>
              </ul>
              <div className="bg-warning/10 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Our guarantee:</strong> You'll never be charged points for system errors. 
                  All transactions are logged and can be reviewed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Help */}
        <div className="collapse collapse-plus bg-base-200">
          <input type="radio" name="faq-accordion" />
          <div className="collapse-title text-xl font-medium flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            How do I get help or provide feedback?
          </div>
          <div className="collapse-content">
            <div className="space-y-3">
              <p>We're here to help and want your feedback!</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle className="text-lg">Need More Points?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-3">
                      Running low on points? No problem - just reach out and we'll top you up.
                    </p>
                    <p className="text-sm font-medium">Contact our beta support team</p>
                  </CardContent>
                </Card>
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle className="text-lg">Found a Bug?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-3">
                      Bugs and issues help us improve! Please report anything unusual.
                    </p>
                    <p className="text-sm font-medium">Include details about what you were doing</p>
                  </CardContent>
                </Card>
              </div>
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Your feedback matters!</strong> This beta program helps us build a better 
                  job search experience. Every suggestion and issue report makes TechRec better.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <Card variant="elevated" className="mt-8">
        <CardContent className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Searching?</h2>
          <p className="text-muted-foreground mb-6">
            You have 300 points to explore our job search platform. 
            Start with a specific search to get the best results!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a 
              href="/developer/roles/search" 
              className="btn btn-primary"
            >
              <Search className="w-4 h-4 mr-2" />
              Start Job Search
            </a>
            <a 
              href="/developer/dashboard" 
              className="btn btn-outline"
            >
              View Dashboard
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}