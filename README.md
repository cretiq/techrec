# 🚀 TechRec

> **AI-powered recruitment platform that gamifies job searching for tech professionals**

TechRec transforms the job search experience by combining intelligent CV analysis, batch job applications, AI-generated content, and a comprehensive gamification system. Upload your CV, get instant feedback, apply to multiple positions at once, and level up your career.

## What TechRec Does

**🤖 Smart CV Analysis**  
Upload your CV and get instant multi-dimensional scoring on ATS compatibility, content quality, and formatting. Our AI extracts your profile data and provides actionable improvement suggestions.

**🎯 Batch Job Applications**  
Apply to 20+ relevant positions simultaneously. Our matching algorithm scores compatibility between your profile and job roles, then generates personalized cover letters for each application.

**📝 AI Content Generation**  
Create professional cover letters, LinkedIn outreach messages, and project descriptions. Choose from multiple writing styles (formal, casual, confident) tailored to each opportunity.

**🎮 Gamified Experience**  
Earn XP through platform activities, unlock achievements, maintain daily streaks, and climb leaderboards. Premium subscription tiers provide point-based access to advanced AI features.

**🎨 Professional Design**  
Modern glass morphism interface with smooth animations, 40+ custom components, and full accessibility support.

## Technology Stack

**Frontend**  
Next.js 15+ • TypeScript • TailwindCSS 4 • DaisyUI • Framer Motion • Redux Toolkit

**Backend**  
Next.js API Routes • MongoDB • Prisma ORM • Redis Caching • NextAuth.js

**AI & Services**  
Google Gemini • OpenAI GPT • Stripe Payments • AWS S3 • LinkedIn API

**Testing**  
Jest • Playwright • React Testing Library • Zod Validation

## 🧪 Testing

**E2E Tests**: 91% success rate (41/45 tests passing)  
**📖 See**: [`E2E_TESTING_BEST_PRACTICES.md`](./E2E_TESTING_BEST_PRACTICES.md) for comprehensive testing guidelines

```bash
# Run all E2E tests
npx playwright test --timeout=60000

# Run with UI
npx playwright test --ui
```

**Key Requirements**: Authentication-first testing, graceful CV data handling, mobile compatibility

---

*Built for tech professionals who want to level up their job search game*
