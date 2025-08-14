# Server Management & Debugging

## Server Management

### ✅ MANDATORY Process Management
```bash
# 1. Clean environment
pkill -f "npm run dev"

# 2. Start server with logging
nohup npm run dev > server.log 2>&1 &

# 3. Validate startup
sleep 3 && head -10 server.log
```

## Database Integrity & Test User Setup

### 🛡️ CRITICAL SAFETY
The CV upload route uses a **real test user** to prevent database integrity issues:

**Test User Details**:
- **Email**: `cv-upload-test@test.techrec.com`
- **Developer ID**: `689491c6de5f64dd40843cd0`
- **Purpose**: Prevents orphaned CV records and Prisma constraint violations

**Safety Validations**:
- Developer existence verified before profile sync
- Foreign key constraints properly maintained
- No orphaned CV records created during debugging

**Previous Issue**: Mock developer IDs created CV records that couldn't link to profiles, causing Prisma P2025 errors during profile sync.

## Essential Debug Commands

### Log Monitoring
```bash
# Monitor logs during development
tail -f server.log

# Search for specific errors
grep -i "error\|failed\|exception" server.log

# Monitor API endpoints
grep -i "upload\|gemini\|analysis" server.log

# Authentication debugging
grep -i "session\|auth\|unauthorized" server.log
```

### Server Health Checks
```bash
# Check server status
curl -I http://localhost:3000/api/health

# Validate database connections
curl http://localhost:3000/api/status

# Monitor memory usage
ps aux | grep "npm run dev"

# Check port availability
lsof -i :3000
```

## Debug Environment Setup

### Environment Variables for Debugging
```bash
# Add to .env.local for permanent debugging:
DEBUG_CV_UPLOAD=true
DEBUG_COVER_LETTER=true
NODE_ENV=development
ENABLE_DIRECT_GEMINI_UPLOAD=true
```

### Debug File Locations
```bash
# Check debug files created
ls -la logs/direct-gemini-upload/
ls -la logs/cover-letter-generation/

# Monitor debug file generation
watch 'ls -la logs/*/20*'
```

## Production Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Build succeeds without errors
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Redis connection validated
- [ ] S3 bucket access verified

### Post-Deployment
- [ ] Health checks passing
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] File uploads functional
- [ ] Database queries performing well
- [ ] Cache invalidation working

## Performance Monitoring

### Key Metrics to Track
- API response times
- Database query performance  
- Memory usage patterns
- Error rates by endpoint
- File upload success rates
- Cache hit/miss ratios

### Monitoring Commands
```bash
# API performance
curl -w "@curl-format.txt" -s -o /dev/null http://localhost:3000/api/endpoint

# Memory usage
free -h && df -h

# Process monitoring
htop

# Network connections
netstat -tuln | grep 3000
```

## Troubleshooting Common Issues

### Server Won't Start
1. Check port availability: `lsof -i :3000`
2. Validate environment variables: `printenv | grep -E "(MONGODB|REDIS|GOOGLE)"`
3. Check dependencies: `npm list`

### Database Connection Failures
1. Verify MongoDB URI format
2. Check network connectivity
3. Validate database credentials
4. Test connection with MongoDB Compass

### Redis Connection Issues
1. Check Redis server status
2. Verify TLS settings if required
3. Validate connection string format
4. Test with Redis CLI

### File Upload Problems
1. Check S3 bucket permissions
2. Verify AWS credentials
3. Test file size limits
4. Monitor server disk space

## Related Documentation

- **Development Commands**: See reference docs for complete command list
- **Debug Workflows**: See workflow docs for detailed debugging procedures
- **Environment Variables**: See reference docs for configuration setup