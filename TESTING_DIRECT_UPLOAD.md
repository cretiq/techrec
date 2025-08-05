# Testing Direct Gemini Upload

## 🔒 **Secure Testing Approach**

### **✅ SAFE Method (Use This)**

**All API keys are safely stored in `.env.local` - no exposure in command line:**

```bash
# Simple test command
npm run test:direct-upload

# Or directly with tsx
npx tsx test-direct-simple.mjs
```

### **❌ UNSAFE Method (Don't Use)**

~~Never expose API keys in command line like this:~~
```bash
# DON'T DO THIS - API key visible in command history
GOOGLE_AI_API_KEY=AIzaSy... npx tsx test-direct-simple.mjs
```

## 🧪 **Testing Commands**

### **1. Direct Upload Service Test**
```bash
npm run test:direct-upload
```
**What it tests:**
- Direct PDF upload to Gemini API
- Analysis with gemini-2.0-flash model
- Project nesting validation
- Critical issue verification

### **2. Full Upload Flow Test (via Web Interface)**
1. **Start log monitoring:**
   ```bash
   ./monitor-upload-flow.sh
   ```

2. **Upload CV via browser:**
   - Go to: http://localhost:3000/developer/cv-management
   - Upload: `tests/fixtures/KRUSHAL_SONANI.pdf`
   - Watch the logs for method selection

3. **Expected Log Output:**
   ```
   🎯 [CV-UPLOAD] Selected Method: DIRECT GEMINI
   🚀 [DIRECT-GEMINI] Starting workflow...
   🚀 [DIRECT-GEMINI] Uploading PDF directly to Gemini API...
   🚀 [DIRECT-GEMINI] Analysis completed successfully
   🚀 [DIRECT-GEMINI] Workflow completed successfully
   🚀 [DIRECT-GEMINI] Traditional method skipped - direct upload already completed
   ```

## 🔧 **Environment Setup**

Your `.env.local` should contain:
```bash
# Required for direct upload
GOOGLE_AI_API_KEY=AIzaSy...your-key-here
ENABLE_DIRECT_GEMINI_UPLOAD=true

# Development settings
NODE_ENV=development
DEBUG_CV_UPLOAD=true
```

## 📊 **What to Verify**

### **✅ Success Indicators:**

1. **Method Selection:** 
   - Log shows: `Selected Method: DIRECT GEMINI`

2. **Project Nesting (Critical Fix):**
   - ✅ Projects nested under correct experience entries
   - ✅ No projects incorrectly placed in achievements
   - ✅ Superworks has 5 nested projects: Suponic Exchange, Suponic Game, Baseball Cloud, Sundance Film Festival 2020, Goodpix

3. **Text Quality:**
   - ✅ No character spacing issues
   - ✅ `extractedText: "Direct upload - content preserved in original format"`

4. **Performance:**
   - ✅ Uses latest `gemini-2.0-flash` model
   - ✅ ~20-25 seconds total time (includes upload to Gemini)

### **❌ Problem Indicators:**

1. **Wrong Method:**
   - Log shows: `Selected Method: TRADITIONAL`

2. **Both Methods Running:**
   - See both `🚀 [DIRECT-GEMINI]` and `📄 [TRADITIONAL]` in logs

3. **Project Nesting Issues:**
   - Projects appear as separate achievements
   - Missing project context under experiences

4. **Text Quality Issues:**
   - Character spacing: `A   t a l e n t e d   R e a c t   J s`
   - Traditional method overwrites direct upload results

## 🔍 **Troubleshooting**

### **Service Not Available**
```
❌ Service not available - check GOOGLE_AI_API_KEY
```
**Solution:** Check `.env.local` has valid `GOOGLE_AI_API_KEY`

### **Traditional Method Still Running**
```
📄 [TRADITIONAL] Starting workflow...
```
**Solution:** Ensure `ENABLE_DIRECT_GEMINI_UPLOAD=true` in `.env.local` and restart server

### **Both Methods Running**
**Solution:** Fixed in latest code - only one method should execute

## 🚀 **Quick Validation**

Run this to verify everything is working:
```bash
npm run test:direct-upload
```

Look for:
- ✅ `Service loaded` and `Available: true`
- ✅ `Superworks experience found with 5 nested projects`
- ✅ `No project-like items found in achievements - good!`

## 📈 **Performance Comparison**

| Method | Time | Text Quality | Project Nesting | Model |
|--------|------|-------------|-----------------|-------|
| **Direct Upload** | ~25s | ✅ Clean | ✅ Perfect | gemini-2.0-flash |
| **Traditional** | ~15s | ❌ Spaced | ❌ Separated | gemini-1.5-pro |

Direct upload is worth the extra 10 seconds for significantly better accuracy!