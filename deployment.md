# TechRec Vercel Deployment Guide

This comprehensive guide covers all steps needed to deploy the TechRec AI-powered tech recruitment platform to Vercel.

## 🚀 ABSOLUTE MINIMUM - Deploy ASAP

### ⚡ Bare Minimum Requirements (30 minutes setup)

**To get the app working immediately with core functionality:**

1. **Database & Caching (5 min)**
   - MongoDB Atlas cluster (free tier works)
   - Upstash Redis (free tier works)

2. **Authentication (10 min)**
   - Google OAuth credentials only (skip GitHub for now)
   - NextAuth secret (any secure random string)
   - Skip email verification for initial deployment

3. **AI Services (5 min)**
   - Google Gemini API key (primary)
   - Skip OpenAI for now (Gemini handles all CV analysis)

4. **Essential Environment Variables (5 min)**
   ```bash
   # Absolute minimum - only these 8 variables needed
   MONGODB_URI="your-atlas-connection-string"
   REDIS_URL="your-upstash-redis-url"
   NEXTAUTH_URL="https://your-vercel-app.vercel.app"
   NEXTAUTH_SECRET="any-secure-random-string"
   GOOGLE_CLIENT_ID="your-google-oauth-id"
   GOOGLE_CLIENT_SECRET="your-google-oauth-secret"
   GOOGLE_AI_API_KEY="your-gemini-api-key"
   NODE_ENV="production"
   ```

5. **Deploy Immediately (5 min)**
   ```bash
   vercel --prod
   ```

**Features that work with minimum setup:**
- ✅ Google OAuth login
- ✅ CV upload and AI analysis
- ✅ Basic profile management
- ✅ Core gamification (XP/points tracking)

**Features disabled until full setup:**
- ❌ Email verification (users auto-verified)
- ❌ Stripe payments (free tier only)
- ❌ Job search (needs RapidAPI)
- ❌ File storage (local temporary storage)

**Next steps after initial deployment:**
1. Add email service for verification
2. Configure Stripe for payments
3. Add AWS S3 for file storage
4. Add RapidAPI for job search

---

## 📋 Pre-Deployment Checklist

### ✅ External Services Setup Required

Before deploying to Vercel, ensure these external services are configured:

#### 1. **Database & Caching**
- [ ] **MongoDB Atlas**: Production cluster configured with connection string
- [ ] **Redis**: Production Redis instance (Upstash Redis recommended for Vercel)
- [ ] **Database Migration**: Prisma migrations applied to production database

#### 2. **Authentication Services**
- [ ] **Google OAuth**: OAuth 2.0 credentials configured for production domain
- [ ] **GitHub OAuth**: OAuth app configured (if using GitHub auth)
- [ ] **NextAuth Secret**: Secure random secret generated
- [ ] **Email Service**: SMTP service configured for email verification (Resend, SendGrid, or AWS SES recommended)
- [ ] **Email Templates**: Verification email templates prepared and tested

#### 3. **AI Services**
- [ ] **OpenAI API**: Production API key with billing enabled
- [ ] **Google Gemini API**: Production API key with quota sufficient for usage
- [ ] **Model Configuration**: All Gemini model variants configured

#### 4. **Payment Processing**
- [ ] **Stripe**: Production account with webhooks configured
- [ ] **Stripe Products**: Subscription tiers configured in Stripe Dashboard

#### 5. **File Storage**
- [ ] **AWS S3**: Production bucket with proper CORS and IAM permissions
- [ ] **AWS IAM**: Programmatic access keys for S3 operations

#### 6. **Job Search API**
- [ ] **RapidAPI**: LinkedIn Job Search API subscription active

## 🔧 Environment Variables Configuration

### Step 1: Prepare Environment Variables

Create a production `.env.production` file based on your `.env.example`:

```bash
# Core Database & Caching
MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/techrec_prod"
REDIS_URL="rediss://user:pass@redis-host:6380"
REDIS_USE_TLS=true

# Application URLs
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-super-secure-nextauth-secret"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Email Service Configuration
EMAIL_SERVER_HOST="smtp.resend.com"                    # SMTP server host
EMAIL_SERVER_PORT=587                                   # SMTP port (587 for TLS, 465 for SSL)
EMAIL_SERVER_USER="resend"                             # SMTP username
EMAIL_SERVER_PASSWORD="your-smtp-api-key"              # SMTP password/API key
EMAIL_FROM="noreply@your-domain.com"                   # From email address
EMAIL_FROM_NAME="TechRec"                              # From name
EMAIL_VERIFICATION_TOKEN_EXPIRES=24                    # Verification token expiry (hours)

# AI Services
OPENAI_API_KEY="sk-proj-your-production-openai-key"
GOOGLE_AI_API_KEY="your-production-google-ai-key"

# Gemini Model Configuration
GEMINI_MODEL="gemini-2.0-flash-lite"
GEMINI_CV_ANALYSIS_MODEL="gemini-2.0-flash-exp"
GEMINI_COVER_LETTER_MODEL="gemini-2.0-flash-lite"
GEMINI_DIRECT_UPLOAD_MODEL="gemini-2.0-flash-exp"

# Payment Processing
STRIPE_SECRET_KEY="sk_live_your-production-stripe-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-endpoint-secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your-publishable-key"

# File Storage
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-production-access-key"
AWS_SECRET_ACCESS_KEY="your-production-secret-key"
AWS_S3_BUCKET_NAME="your-production-bucket"

# Job Search Integration
RAPIDAPI_KEY="your-rapidapi-key"
RAPIDAPI_HOST="linkedin-api8.p.rapidapi.com"

# Production Configuration
NODE_ENV="production"
NEXT_PUBLIC_ENABLE_MVP_MODE=true
MVP_INITIAL_POINTS=300
MVP_POINTS_PER_RESULT=1
MVP_WARNING_THRESHOLD=50
MVP_CRITICAL_THRESHOLD=10

# Debug Settings (set to false in production)
DEBUG_CV_UPLOAD=false
DEBUG_COVER_LETTER=false
```

### Step 2: Verify Required Environment Variables

Ensure all **81 documented environment variables** are properly configured. See [`@docs/claude-references/reference/environment-variables.md`](@docs/claude-references/reference/environment-variables.md) for the complete reference.

## 🚀 Vercel Deployment Steps

### Step 1: Project Setup

1. **Connect Repository to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Initialize project
   vercel
   ```

2. **Configure Build Settings**
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm ci`

### Step 2: Environment Variables Configuration

1. **Add Environment Variables in Vercel Dashboard**
   - Go to Project Settings → Environment Variables
   - Add all production environment variables
   - Set appropriate scopes (Production, Preview, Development)

2. **Critical Environment Variables for Vercel**
   ```bash
   # Database
   MONGODB_URI
   REDIS_URL
   REDIS_USE_TLS=true
   
   # Authentication
   NEXTAUTH_URL
   NEXTAUTH_SECRET
   GOOGLE_CLIENT_ID
   GOOGLE_CLIENT_SECRET
   
   # Email Service
   EMAIL_SERVER_HOST
   EMAIL_SERVER_USER
   EMAIL_SERVER_PASSWORD
   EMAIL_FROM
   
   # AI Services
   OPENAI_API_KEY
   GOOGLE_AI_API_KEY
   
   # Payments
   STRIPE_SECRET_KEY
   STRIPE_WEBHOOK_SECRET
   
   # Storage
   AWS_ACCESS_KEY_ID
   AWS_SECRET_ACCESS_KEY
   AWS_S3_BUCKET_NAME
   ```

### Step 3: Build Configuration

1. **Verify Next.js Configuration**
   
   Ensure `next.config.mjs` is production-ready:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     eslint: {
       ignoreDuringBuilds: true, // Only for deployment, fix in dev
     },
     typescript: {
       ignoreBuildErrors: true, // Only for deployment, fix in dev
     },
     images: {
       unoptimized: true, // Vercel handles optimization
     },
     experimental: {
       webpackBuildWorker: true,
       parallelServerBuildTraces: true,
       parallelServerCompiles: true,
     },
   }
   ```

2. **Database Migration**
   ```bash
   # Run Prisma migrations in production
   npx prisma migrate deploy
   
   # Generate Prisma client
   npx prisma generate
   ```

### Step 4: Domain & DNS Configuration

1. **Custom Domain Setup**
   - Add custom domain in Vercel Dashboard
   - Configure DNS records as instructed by Vercel
   - Enable SSL certificate (automatic with Vercel)

2. **Update OAuth Redirect URIs**
   - Google OAuth Console: Add `https://your-domain.com/api/auth/callback/google`
   - GitHub OAuth App: Add `https://your-domain.com/api/auth/callback/github`
   - Update `NEXTAUTH_URL` environment variable

### Step 5: Webhook Configuration

1. **Stripe Webhook Setup**
   ```bash
   # Webhook endpoint
   https://your-domain.com/api/webhooks/stripe
   
   # Required events:
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed
   ```

2. **Update Webhook Secrets**
   - Copy webhook signing secret from Stripe Dashboard
   - Update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables

## 🔍 Post-Deployment Validation

### Step 1: Functional Testing

1. **Authentication Flow**
   - [ ] Google OAuth login works
   - [ ] GitHub OAuth login works
   - [ ] Email/password registration works
   - [ ] Email verification flow works
   - [ ] Password reset functionality works
   - [ ] JWT session persistence works
   - [ ] User profile creation works

2. **Core Features**
   - [ ] CV upload and analysis works
   - [ ] File storage to S3 works
   - [ ] AI analysis (OpenAI/Gemini) works
   - [ ] Database read/write operations work
   - [ ] Redis caching works

3. **Payment Integration**
   - [ ] Stripe subscription flow works
   - [ ] Webhook processing works
   - [ ] Points system works
   - [ ] Subscription tier validation works

4. **Gamification System**
   - [ ] XP transactions work
   - [ ] Points transactions work
   - [ ] Achievement system works
   - [ ] Leaderboard functionality works

### Step 2: Performance Validation

1. **Database Performance**
   ```bash
   # Monitor MongoDB connection pool
   # Check for connection timeouts
   # Validate query performance
   ```

2. **Redis Performance**
   ```bash
   # Verify TLS connection works
   # Test cache hit/miss rates
   # Monitor connection stability
   ```

3. **API Response Times**
   - [ ] Profile APIs < 500ms
   - [ ] CV analysis < 30s
   - [ ] Job search < 5s
   - [ ] Cover letter generation < 10s

### Step 3: Security Validation

1. **Environment Variables**
   - [ ] No secrets exposed in client-side code
   - [ ] All sensitive data properly encrypted
   - [ ] CORS headers configured correctly

2. **Authentication Security**
   - [ ] JWT tokens properly signed
   - [ ] Session timeout configured
   - [ ] OAuth flows secure
   - [ ] Email verification prevents unverified access
   - [ ] Password reset tokens expire appropriately
   - [ ] SMTP connection secured with TLS

3. **API Security**
   - [ ] Rate limiting functional
   - [ ] Input validation working
   - [ ] SQL injection prevention active

## 🚨 Critical Configuration Notes

### Database Considerations
- **Connection Pooling**: MongoDB Atlas handles this automatically
- **Read Replicas**: Configure for better performance if needed
- **Backup Strategy**: Ensure automatic backups are enabled

### Redis Configuration
- **TLS**: Always use TLS in production (`REDIS_USE_TLS=true`)
- **Connection Limits**: Monitor Redis connection pool limits
- **Memory Usage**: Set appropriate memory limits and eviction policies

### Performance Optimization
- **Next.js Build**: Ensure static generation where possible
- **Image Optimization**: Verify Vercel image optimization works
- **API Routes**: Implement proper caching headers

### Monitoring & Observability
- **Error Tracking**: Consider integrating Sentry or similar
- **Performance Monitoring**: Use Vercel Analytics
- **Database Monitoring**: Use MongoDB Atlas monitoring
- **Redis Monitoring**: Use Redis provider's monitoring tools

## 🔧 Troubleshooting Common Issues

### Build Failures
1. **TypeScript Errors**: Temporarily set `ignoreBuildErrors: true`, fix post-deployment
2. **Dependency Issues**: Clear `node_modules` and `package-lock.json`, reinstall
3. **Memory Issues**: Increase Vercel build memory if needed

### Runtime Issues
1. **Database Connection**: Check MongoDB URI and network access
2. **Redis Connection**: Verify TLS settings and credentials
3. **Environment Variables**: Ensure all required variables are set

### Authentication Issues
1. **OAuth Redirect**: Verify callback URLs match exactly
2. **CORS Errors**: Check domain configuration
3. **Session Issues**: Verify `NEXTAUTH_SECRET` and `NEXTAUTH_URL`
4. **Email Delivery**: Check SMTP credentials and spam folder
5. **Email Templates**: Verify email templates render correctly
6. **Verification Links**: Ensure verification URLs point to correct domain

### Performance Issues
1. **Cold Starts**: Expected with serverless, optimize with warming
2. **Database Timeout**: Check connection pool settings
3. **Memory Limits**: Monitor Vercel function memory usage

## 📚 Additional Resources

- [Vercel Next.js Deployment Guide](https://vercel.com/guides/deploying-nextjs-with-vercel)
- [Prisma MongoDB Deployment](https://www.prisma.io/docs/guides/deployment)
- [NextAuth.js Production Guide](https://next-auth.js.org/deployment)
- [Stripe Webhook Security](https://stripe.com/docs/webhooks/signatures)
- [TechRec Documentation](@docs/claude-references/)

## 🎯 Success Criteria

Deployment is successful when:
- [ ] All environment variables configured
- [ ] Application builds without errors
- [ ] All external services connected
- [ ] Authentication flows working (including email verification)
- [ ] Email service delivering verification emails
- [ ] Core features functional
- [ ] Payment processing active
- [ ] Performance meets requirements
- [ ] Security validations pass

---

*This deployment guide covers the comprehensive setup required for the TechRec platform's complex architecture including AI integration, gamification, payments, and multi-provider authentication.*