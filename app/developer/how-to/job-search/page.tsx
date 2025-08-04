import { Metadata } from 'next'
import { HowToGetJobPage } from '@/components/how-to/HowToGetJobPage'

export const metadata: Metadata = {
  title: 'How to Get a Developer Job - Complete Career Guide',
  description: 'Comprehensive guide to landing your dream developer job - CV optimization, cover letters, and job search strategies',
  keywords: ['developer job', 'career guide', 'CV optimization', 'cover letters', 'job search strategy', 'tech recruitment'],
  openGraph: {
    title: 'How to Get a Developer Job - Complete Career Guide',
    description: 'The proven playbook that gets developers hired faster. Simple strategies, big results.',
    type: 'article',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Get a Developer Job - Complete Career Guide',
    description: 'The proven playbook that gets developers hired faster. Simple strategies, big results.',
  }
}

export default function HowToGetJobPageRoute() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 dark:from-base-300 dark:via-base-200 dark:to-base-300">
      <div className="relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30 dark:opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(16, 185, 129, 0.15) 2px, transparent 0), radial-gradient(circle at 75px 75px, rgba(6, 182, 212, 0.15) 2px, transparent 0)`,
            backgroundSize: '100px 100px'
          }} />
        </div>
        
        {/* Main content */}
        <div className="relative z-10">
          <HowToGetJobPage />
        </div>
        
        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-emerald-50/80 to-transparent dark:from-base-300/80 pointer-events-none" />
      </div>
    </div>
  )
}