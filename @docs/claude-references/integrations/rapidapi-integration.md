# RapidAPI Integration Reference

**📚 CRITICAL**: When working with job search functionality, refer to comprehensive documentation:

## Complete Documentation Links

- **[🌟 Complete Reference](docs/features/rapidapi-complete-reference.md)** - Full integration guide with AI enhancements
- **[Implementation Summary](docs/features/rapidapi-implementation-summary.md)** - Architecture and component overview  
- **[Enhancement History](docs/features/rapidapi-enhancement-plan.md)** - Complete project tracking

## Key Implementation Notes

### High-Fidelity Defaults
- **Agency Filter**: `agency='FALSE'` - Exclude agency postings by default
- **AI Enhancement**: `include_ai='true'` - Include AI-generated job insights
- **Description Type**: `description_type='text'` - Plain text format for descriptions

### Enhanced Mock Data
- **File**: `rapidapi_job_response_enhanced.json`
- **Purpose**: Provides realistic AI fields for development
- **Usage**: Development and testing with complete job data structure

### Type-Safe Architecture
- **Interface**: `EnhancedRole` 
- **AI Fields**: 16+ additional fields per job
- **Structure**: Complete type safety for all API responses

### Performance Optimizations
- **Component Strategy**: Memoized job cards
- **Accessibility**: Full compliance with screen reader support
- **Loading States**: Progressive loading with skeleton screens

## API Endpoint
```
/api/rapidapi/search - Job search with AI-enriched LinkedIn data
```

## Integration Architecture

### Request Flow
1. User initiates job search
2. Request sent to RapidAPI endpoint with optimized parameters
3. AI enhancement processing applied
4. **Universal usage tracking** - headers captured from all response types
5. Type-safe response with `EnhancedRole` interface
6. Memoized rendering of job cards

### Response Enhancement
- AI-generated insights added to each job posting
- Comprehensive skill matching
- Salary range predictions
- Company culture analysis
- Role difficulty assessments

### Usage Tracking System (Enhanced Aug 2025)
- **Universal Headers Processing**: Usage data captured from ALL response types
  - Real API calls → Actual RapidAPI headers
  - Mock data → Realistic simulated headers
  - Cached responses → Preserved headers from original request
  - Debug mode → Authentic simulation headers
- **Admin Dashboard Integration**: Live usage monitoring at `/admin`
- **Environment Standardization**: Consistent `DEBUG_RAPIDAPI` variable
- **Cache Persistence**: Usage data survives across cached responses

## Development Setup

### Mock Data Usage
```typescript
// Use enhanced mock data for development
import enhancedJobs from './rapidapi_job_response_enhanced.json'

// Type-safe interface
interface EnhancedRole {
  // 16+ AI-enhanced fields
  // Complete job data structure
}
```

### Performance Considerations
- **Memoization**: Job card components memoized for performance
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Loading States**: Skeleton screens during API calls
- **Error Handling**: Graceful degradation for API failures
- **Usage Monitoring**: Real-time admin dashboard for API consumption tracking

### Debug Configuration (Aug 2025)
```bash
# Normal operation
DEBUG_RAPIDAPI=off npm run dev

# Real API calls with comprehensive logging
DEBUG_RAPIDAPI=log npm run dev

# Log requests without making API calls
DEBUG_RAPIDAPI=stop npm run dev

# Use mock data (with realistic headers)
USE_MOCK_DATA=true npm run dev
```

### Admin Monitoring
- **URL**: `/admin` (admin email required)
- **Features**: Live usage statistics, cache performance, environment configuration
- **Data Source**: Always shows latest available usage data regardless of mode

## Related Documentation

- **API Patterns**: See CLAUDE.md for RESTful API structure
- **Component Architecture**: See CLAUDE.md for component patterns
- **Performance**: See CLAUDE.md for optimization strategies