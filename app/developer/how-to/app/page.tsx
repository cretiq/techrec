import { Metadata } from 'next'
import { HowToUseAppPage } from '@/components/how-to/HowToUseAppPage'

export const metadata: Metadata = {
  title: 'How to Use TechRec - Complete App Guide',
  description: 'Learn how to use TechRec effectively - from CV upload and analysis to job applications and tracking',
  keywords: ['TechRec', 'how to use', 'CV analysis', 'job search', 'developer guide'],
  openGraph: {
    title: 'How to Use TechRec - Complete App Guide',
    description: 'Master TechRec in 5 simple steps. From CV upload to landing your dream developer job.',
    type: 'article',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Use TechRec - Complete App Guide',
    description: 'Master TechRec in 5 simple steps. From CV upload to landing your dream developer job.',
  }
}

export default function HowToUseAppPageRoute() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 dark:from-base-300 dark:via-base-200 dark:to-base-300">
      <div className="relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30 dark:opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(139, 92, 246, 0.15) 2px, transparent 0), radial-gradient(circle at 75px 75px, rgba(59, 130, 246, 0.15) 2px, transparent 0)`,
            backgroundSize: '100px 100px'
          }} />
        </div>
        
        {/* Main content */}
        <div className="relative z-10">
          <HowToUseAppPage />
        </div>
        
        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-violet-50/80 to-transparent dark:from-base-300/80 pointer-events-none" />
      </div>
    </div>
  )
}