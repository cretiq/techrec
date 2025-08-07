# 🚀 TechRec - AI-Powered Tech Recruitment Platform

This is a comprehensive tech recruitment platform built with **Next.js 15+**, **TypeScript**, **TailwindCSS 4**, and **DaisyUI**, featuring sophisticated AI-powered CV analysis, gamification, and a professional component architecture.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 🏗️ Architecture & Documentation

### Component System
- **[Component Architecture Guide](./COMPONENT_ARCHITECTURE.md)** - Complete 4-layer component system documentation
- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive project guidelines and development patterns
- **4-Layer Architecture**: UI Primitives → Business Components → Page-Specific → Pages

### Quick Component Reference
```tsx
// Layer 1: UI Primitives (98% of imports)
import { Button, Card, Accordion } from '@/components/ui-daisy'

// Layer 2: Business Components  
import { StartAssessmentButton } from '@/components/buttons'
import { AnalysisResultDisplay } from '@/components/analysis'

// Layer 3: Page-Specific (rare)
import { QuestionTemplateSelector } from '@/app/components'
```

### Key Features
- **🎨 Professional Design System** - Glass morphism, gradients, 40+ components
- **⚡ Object-based Variants** - Consistent, type-safe component APIs
- **🎭 Framer Motion** - Smooth animations and transitions
- **♿ Accessibility First** - WCAG AA compliance built-in
- **🧩 Modular Architecture** - Clean separation of concerns
- **🤖 Centralized AI Configuration** - Environment-based Gemini model management

## ⚙️ Configuration

### AI Model Configuration
TechRec uses a centralized AI model configuration system. Configure models via environment variables:

```bash
# Global fallback model
GEMINI_MODEL=gemini-2.5-flash

# Specific use case models (optional)
GEMINI_CV_ANALYSIS_MODEL=gemini-2.5-flash
GEMINI_COVER_LETTER_MODEL=gemini-2.5-flash
GEMINI_OUTREACH_MODEL=gemini-2.5-flash
# ... see CLAUDE.md for complete list
```

### Development Usage
```typescript
import { getGeminiModel } from '@/lib/modelConfig';

// Use case-specific model selection
const model = genAI.getGenerativeModel({ 
  model: getGeminiModel('cv-analysis'),
  generationConfig: { ... }
});
```

For complete configuration details, see **[CLAUDE.md](./CLAUDE.md)**.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
