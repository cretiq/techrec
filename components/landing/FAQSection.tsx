"use client"

import { Badge, Accordion, AccordionItem, AccordionTitle, AccordionContent } from "@/components/ui-daisy"
import { SectionBadge } from "@/components/ui-daisy/section-badge"
import { HelpCircle } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
  category?: string
}

const faqData: FAQItem[] = [
  {
    question: "How does TechRec work?",
    answer: "Upload your CV once, and our AI analyzes it against successful tech profiles. We then find matching roles and generate tailored cover letters, resumes, and outreach messages for multiple positions simultaneously. Apply to 20+ jobs in 30 minutes instead of 3+ hours per application.",
    category: "Getting Started"
  },
  {
    question: "What's included in the free tier?",
    answer: "The free tier includes basic CV upload and analysis, up to 5 job matches per month, standard AI suggestions, and basic profile management. Perfect for trying out the platform and seeing immediate value.",
    category: "Pricing"
  },
  {
    question: "How accurate is the AI job matching?",
    answer: "Our matching algorithm considers 15+ factors including skills, experience, location, company size, and role requirements. Users report 85%+ satisfaction with match relevance, and 76% land offers within 45 days.",
    category: "Features"
  },
  {
    question: "Can I customize the generated content?",
    answer: "Absolutely! All generated cover letters and outreach messages can be fully edited before sending. You can set tone preferences (formal, casual, enthusiastic) and provide specific talking points for personalization.",
    category: "Features"
  },
  {
    question: "Is my data secure?",
    answer: "Yes. All CVs are stored securely on AWS S3 with encryption, we're GDPR compliant, and we never share your data with third parties without explicit consent. You have full control over data deletion and export.",
    category: "Security"
  },
  {
    question: "What job sources do you use?",
    answer: "We aggregate from multiple premium sources including LinkedIn, AngelList, Indeed, company career pages, and exclusive tech job boards. Our ethical scraping ensures fresh, high-quality opportunities.",
    category: "Features"
  },
  {
    question: "How long does it take to see results?",
    answer: "Setup takes 2 minutes, first job matches appear within 24 hours, and you can generate and submit applications in under 5 minutes. Most users see interview requests within the first week.",
    category: "Getting Started"
  },
  {
    question: "Is there a money-back guarantee?",
    answer: "Yes! We offer a 30-day money-back guarantee for all paid subscriptions. If you're not satisfied with the results, we'll provide a full refund, no questions asked.",
    category: "Pricing"
  }
]

export function FAQSection() {
  return (
    <section className="py-20 md:py-32 bg-base-200/20">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <SectionBadge variant="outline" icon={<HelpCircle />} className="mb-6">
              Frequently Asked Questions
            </SectionBadge>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-base-content">
              Got Questions?
              <br />
              <span className="gradient-text">We've Got Answers</span>
            </h2>
            
            <p className="text-lg text-base-content/80 mb-8">
              Everything you need to know about transforming your job search with AI
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="">
            <Accordion variant="plus" grouped={true} className="w-full">
              {faqData.map((faq, index) => (
                <AccordionItem 
                  key={index}
                  name="faq-accordion"
                  defaultOpen={index === 0}
                  className="bg-gradient-to-br from-base-200 to-base-300 border border-base-100 rounded-3xl mb-2"
                >
                  <AccordionTitle className="hover:text-primary transition-colors duration-200 px-8 py-6">
                    <div className="flex flex-col items-start gap-2">
                      <span>{faq.question}</span>
                      {faq.category && (
                        <Badge variant="ghost" size="sm" className="opacity-70">
                          {faq.category}
                        </Badge>
                      )}
                    </div>
                  </AccordionTitle>
                  <AccordionContent className="px-8">
                    <div className="pb-6">
                      <p className="text-base-content/80 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12">
            <p className="text-base-content/70 mb-4">
              Still have questions? We're here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="mailto:support@techrec.com"
                className="text-primary hover:text-primary-focus transition-colors duration-200 font-medium"
              >
                support@techrec.com
              </a>
              <span className="hidden sm:block text-base-content/30">•</span>
              <span className="text-base-content/70">
                Response time: <strong className="text-primary">Under 4 hours</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}