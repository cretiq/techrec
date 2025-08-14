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
    <div className="min-h-screen">
      <HowToUseAppPage />
    </div>
  )
}