# 🚀 DEPLOY NOW - Complete Step-by-Step Guide

**Goal**: Get your TechRec app live on Vercel in 25 minutes with core functionality working.

**Deployment Strategy**: 
1. **Phase 1**: Deploy with database + AI (no auth) to get Vercel domain
2. **Phase 2**: Add Google OAuth with the actual domain and redeploy

**What you'll have after this guide**:
- ✅ Working TechRec app on Vercel
- ✅ Google OAuth login  
- ✅ CV upload and AI analysis
- ✅ Basic profile management
- ✅ Gamification system

---

## ⏱️ Step 1: MongoDB Atlas Setup (2 minutes)

### 1.1 Use Your Existing MongoDB Atlas Account
Since you already have MongoDB Atlas set up with the `techrec` test database, you can reuse the same cluster.

### 1.2 Create Production Database
1. Log into your existing MongoDB Atlas account
2. Go to your existing cluster (the one with your `techrec` test database)
3. Click **"Collections"** on your cluster
4. You'll see your existing `techrec` database - **don't touch this!**
5. We'll create a new production database by simply changing the database name in your connection string

### 1.3 Get Your Existing Connection String
1. Click **"Connect"** on your existing cluster
2. Click **"Connect your application"**
3. **COPY** the connection string - it looks like:
   ```
   mongodb+srv://your-username:<password>@your-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your existing password
5. **Add production database name**: `/techrec-prod` before the `?`
   Final result:
   ```
   mongodb+srv://your-username:YourPassword@your-cluster.xxxxx.mongodb.net/techrec-prod?retryWrites=true&w=majority
   ```

### 1.4 Database Separation
By using `/techrec-prod` in the connection string:
- ✅ Your test data in `techrec` database stays untouched
- ✅ Production data goes to new `techrec-prod` database
- ✅ Same cluster, same user, same network access - zero additional setup needed
- ✅ MongoDB will automatically create `techrec-prod` when your app first connects

**✅ Save this production connection string - you'll need it later!**

---

## ⏱️ Step 2: Upstash Redis Setup (1 minute)

### 2.1 Use Your Existing Upstash Account
Since you already have Upstash set up for development, you can create a separate production Redis database.

### 2.2 Create Production Redis Database
1. Log into your existing Upstash account
2. Click **"Create Database"** on dashboard
3. Name: `techrec-production` (to distinguish from your dev database)
4. Type: **Redis**
5. Region: Choose same region as your MongoDB for better performance
6. Click **"Create"**

### 2.3 Get Production Connection Details
1. Click on your newly created `techrec-production` database
2. Copy the **"Redis URL"** (looks like: `redis://default:xxxxx@xxxx.upstash.io:xxxxx`)
3. **✅ Save this production Redis URL - you'll need it later!**

### 2.4 Database Separation
By creating a separate Redis database:
- ✅ Your dev cache data stays in your existing Redis database
- ✅ Production cache goes to the new `techrec-production` database
- ✅ Same account, clean separation
- ✅ Can monitor and manage each environment independently

---

## ⏱️ Step 3: Google Gemini API Setup (3 minutes)

### 3.1 Get Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click **"Get API Key"** (top right)
4. Click **"Create API Key"**
5. Select an existing Google Cloud project or create new one
6. **COPY** the API key that appears
7. **✅ Save this API key - you'll need it later!**

---

## ⏱️ Step 4: Initial Deploy to Vercel (5 minutes)

**Note**: We'll deploy first WITHOUT OAuth to get your Vercel domain, then add OAuth later.

### 4.1 Install Vercel CLI
```bash
npm install -g vercel
vercel login
```

### 4.2 Build Your App Locally First
```bash
# In your techrec project directory
npm install
npm run build
```

### 4.3 Deploy to Vercel
```bash
vercel
```

Follow prompts:
- **Set up and deploy**: `Y`
- **Which scope**: Choose your account
- **Link to existing project**: `N` 
- **Project name**: `techrec` (or your preferred name)
- **Directory**: Press enter (current directory)
- **Override settings**: `N`

### 4.4 Add Basic Environment Variables (WITHOUT OAuth)
After first deployment, add the non-OAuth variables:

```bash
# Add essential variables for basic functionality
vercel env add MONGODB_URI production
vercel env add REDIS_URL production
vercel env add GOOGLE_AI_API_KEY production
vercel env add NODE_ENV production
vercel env add NEXTAUTH_SECRET production
```

When prompted, enter:
1. **MONGODB_URI**: Your MongoDB production connection string
2. **REDIS_URL**: Your Upstash production Redis URL  
3. **GOOGLE_AI_API_KEY**: Your Gemini API key
4. **NODE_ENV**: `production`
5. **NEXTAUTH_SECRET**: Generate with `openssl rand -base64 32`

### 4.5 Get Your Vercel Domain
```bash
vercel --prod
```

**✅ COPY YOUR VERCEL URL** - you'll need it for OAuth setup!
(It looks like: `https://techrec-xyz123.vercel.app`)

---

## ⏱️ Step 5: Google OAuth Setup (8 minutes)

**Now that you have your Vercel domain, set up OAuth:**

### 5.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click project dropdown (top left)
3. Click **"New Project"** (or use existing)
4. Project name: `techrec-oauth`
5. Click **"Create"**
6. **Select your project** from the dropdown

### 5.2 Configure OAuth Consent Screen
1. In left sidebar, go to **"APIs & Services"** → **"OAuth consent screen"**
2. User Type: Select **"External"**
3. Click **"Create"**
4. Fill required fields:
   - App name: `TechRec`
   - User support email: Your email
   - Developer contact: Your email
5. Click **"Save and Continue"**
6. **"Scopes"** page: Click **"Save and Continue"** (no changes needed)
7. **"Test users"** page: Click **"Save and Continue"** (no changes needed)

### 5.3 Create OAuth Credentials
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: `TechRec Web Client`
5. **Authorized redirect URIs**: Add these URLs:
   ```
   http://localhost:3000/api/auth/callback/google
   https://YOUR-ACTUAL-VERCEL-URL.vercel.app/api/auth/callback/google
   ```
   (Replace with your actual Vercel URL from Step 4.5)
6. Click **"Create"**

### 5.4 Copy Credentials
1. **COPY** the **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)
2. **COPY** the **Client Secret**
3. **✅ Save both - you'll need them next!**

---

## ⏱️ Step 6: Add OAuth and Redeploy (3 minutes)

### 6.1 Add OAuth Environment Variables
```bash
# Add OAuth variables
vercel env add NEXTAUTH_URL production
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
```

When prompted, enter:
1. **NEXTAUTH_URL**: Your actual Vercel URL (e.g., `https://techrec-xyz123.vercel.app`)
2. **GOOGLE_CLIENT_ID**: Your Google OAuth Client ID
3. **GOOGLE_CLIENT_SECRET**: Your Google OAuth Client Secret

### 6.2 Redeploy with OAuth
```bash
vercel --prod
```

---

## ⏱️ Step 7: Test Your Deployment (2 minutes)

### 7.1 Test Core Functions
1. Go to your Vercel URL
2. Click **"Sign in with Google"**
3. Complete OAuth flow
4. Try uploading a CV
5. Check that analysis works

### 7.2 Check Deployment Status
```bash
# View deployment logs
vercel logs --prod

# View environment variables
vercel env ls
```

---

## 🎉 Success! Your App is Live!

**Your TechRec app is now deployed with:**
- ✅ MongoDB Atlas database
- ✅ Redis caching  
- ✅ Google OAuth authentication
- ✅ Gemini AI analysis
- ✅ Core gamification features

## 🔧 Troubleshooting

### Common Issues:

**Build Fails**:
```bash
# Clear cache and rebuild
npm run build
vercel --prod
```

**OAuth Not Working**:
- Check redirect URI matches exactly (with `/api/auth/callback/google`)
- Verify NEXTAUTH_URL matches your Vercel domain

**Database Connection Fails**:
- Verify MongoDB connection string format
- Check Network Access allows all IPs (0.0.0.0/0)
- Ensure database user has Atlas admin role

**Redis Connection Fails**:
- Use `redis://` URL format (not REST URL)
- Verify Redis URL includes password and port

---

## 🚀 Next Steps (Optional)

After your app is working, you can add:
1. **Email verification** (add SMTP service)
2. **Stripe payments** (subscription system)
3. **AWS S3** (file storage)
4. **RapidAPI** (job search)
5. **Custom domain**

---

## 📊 Updated Timeline Summary

- **Step 1**: MongoDB setup (2 min) ✅ Reusing existing account
- **Step 2**: Redis setup (1 min) ✅ Reusing existing account  
- **Step 3**: Gemini API (3 min)
- **Step 4**: Initial Vercel deploy (5 min) 
- **Step 5**: Google OAuth setup (8 min) ✅ Using real domain
- **Step 6**: Add OAuth & redeploy (3 min)
- **Step 7**: Test deployment (2 min)

**Total time: 24 minutes**
**Cost: $0 (all free tiers)**

**Smart deployment strategy**: Get domain first, then configure OAuth with real URLs!