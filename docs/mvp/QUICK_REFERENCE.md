# MVP CV System - Quick Reference Guide

## 🚀 Quick Start

**Enable MVP Mode:**
```bash
echo "ENABLE_MVP_MODE=true" >> .env.local
npx prisma migrate dev --name "add-mvp-fields" 
npm run dev
```

**Disable MVP Mode:**
```bash
# Set to false or remove from .env.local
ENABLE_MVP_MODE=false
```

## 🔧 Key Files & Components

### Core Files
```
app/api/cv-improvement-mvp/route.ts     # AI suggestions endpoint
components/analysis/MvpResultDisplay.tsx # Main display component  
components/suggestions/MvpSuggestionDisplay.tsx # AI suggestions UI
components/suggestions/SuggestionManager.tsx # Enhanced for MVP mode
```

### Environment Variables
```bash
ENABLE_MVP_MODE=true           # Activates MVP system
GOOGLE_AI_API_KEY=your_key     # Required for AI processing
```

### Database Schema
```prisma
model CV {
  mvpContent  String?  @db.String  # Formatted text
  mvpRawData  Json?                # Unvalidated JSON
}
```

## 📊 Feature Status

### ✅ Implemented & Working
- System-wide MVP toggle
- Dual-format extraction (text + JSON)
- AI suggestions with markdown formatting
- Word count bug fix (uses formatted text)
- Line break preprocessing for better readability
- Side-by-side layout (CV + suggestions)
- Copy/download functionality
- Re-upload capability in MVP mode
- Large text sizing for accessibility

### ❌ Not Implemented (Future)
- Auto-save text editor
- Cover letter integration (infrastructure exists)
- Complex structured analysis (bypassed by design)

## 🐛 Critical Fixes Included

1. **Word Count Bug**: AI now analyzes formatted text, not JSON
2. **Line Break Rendering**: Intelligent markdown preprocessing  
3. **Markdown Formatting**: AI outputs structured, readable suggestions

## ⚡ Performance Targets

- **Upload to Display**: <5s
- **AI Suggestions**: <10s
- **Page Load**: <2s
- **Markdown Processing**: <100ms

## 🔄 Testing Commands

**Test Upload:**
```bash
curl -X POST http://localhost:3000/api/cv/upload \
  -F "file=@test.pdf" \
  -H "Content-Type: multipart/form-data"
```

**Test Suggestions:**
```bash
curl -X POST http://localhost:3000/api/cv-improvement-mvp \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "skills": ["JavaScript"]}'
```

## 🛠️ Development Notes

**Architecture Pattern:**
```
Upload → S3 → Gemini (dual format) → Store → Display
```

**Key Benefits:**
- 75% less complexity than structured system
- Better AI quality through full-context
- 3-4 day implementation vs 2+ weeks
- Clean upgrade path to production

**Upgrade Strategy:**
1. Convert MVP data to structured format
2. Set `ENABLE_MVP_MODE=false`
3. Remove MVP database fields
4. Clean up conditional code

---

**Status: ✅ Production Ready**
**Documentation: See `MVP_CV_SYSTEM_DOCUMENTATION.md` for complete details**