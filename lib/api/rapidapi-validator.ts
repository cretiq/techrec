// lib/api/rapidapi-validator.ts
// Parameter validation against RapidAPI LinkedIn Jobs API documentation

import type { SearchParameters } from './rapidapi-cache';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  normalizedParams: SearchParameters;
}

interface FilterConstraints {
  title_filter: {
    maxLength: number;
    supportedOperators: string[];
    quotingRules: string[];
  };
  location_filter: {
    maxLength: number;
    supportedOperators: string[];
    abbreviationPolicy: string;
  };
  type_filter: {
    allowedValues: string[];
    delimiterRules: string;
  };
  seniority_filter: {
    allowedValues: string[];
    caseSensitive: boolean;
  };
  description_filter: {
    maxLength: number;
    timeoutRisk: boolean;
    recommendedLimits: { limit: number; offset: number };
  };
  organization_filters: {
    maxLength: number;
    supportedOperators: string[];
    slugFormat: string;
  };
  industry_filter: {
    maxLength: number;
    allowedValues: string[];
  };
  general: {
    maxLimit: number;
    offsetMultiple: boolean;
    searchJobLimit: number;
  };
}

class RapidApiValidator {
  private static instance: RapidApiValidator;
  private constraints: FilterConstraints;

  private constructor() {
    // Initialize constraints based on documentation
    this.constraints = {
      title_filter: {
        maxLength: 500,
        supportedOperators: ['AND', 'OR', 'NOT', '-'],
        quotingRules: ['Use quotes for exact phrases', 'Use - for exclusion']
      },
      location_filter: {
        maxLength: 200,
        supportedOperators: ['OR'],
        abbreviationPolicy: 'Full names only - no abbreviations supported'
      },
      type_filter: {
        allowedValues: ['CONTRACTOR', 'FULL_TIME', 'INTERN', 'OTHER', 'PART_TIME', 'TEMPORARY', 'VOLUNTEER'],
        delimiterRules: 'Comma-delimited, no spaces'
      },
      seniority_filter: {
        allowedValues: ['Associate', 'Director', 'Executive', 'Mid-Senior level', 'Entry level', 'Not Applicable', 'Internship'],
        caseSensitive: true
      },
      description_filter: {
        maxLength: 200,
        timeoutRisk: true,
        recommendedLimits: { limit: 10, offset: 50 }
      },
      organization_filters: {
        maxLength: 300,
        supportedOperators: ['AND', 'OR'],
        slugFormat: 'LinkedIn organization slug format (e.g., "microsoft", "google")'
      },
      industry_filter: {
        maxLength: 200,
        allowedValues: [
          'Accounting', 'Airlines/Aviation', 'Alternative Dispute Resolution', 'Alternative Medicine',
          'Animation', 'Apparel & Fashion', 'Architecture & Planning', 'Arts and Crafts',
          'Automotive', 'Aviation & Aerospace', 'Banking', 'Biotechnology', 'Broadcast Media',
          'Building Materials', 'Business Supplies and Equipment', 'Capital Markets', 'Chemicals',
          'Civic & Social Organization', 'Civil Engineering', 'Commercial Real Estate', 'Computer & Network Security',
          'Computer Games', 'Computer Hardware', 'Computer Networking', 'Computer Software',
          'Construction', 'Consumer Electronics', 'Consumer Goods', 'Consumer Services',
          'Cosmetics', 'Dairy', 'Defense & Space', 'Design', 'E-Learning', 'Education Management',
          'Electrical/Electronic Manufacturing', 'Entertainment', 'Environmental Services',
          'Events Services', 'Executive Office', 'Facilities Services', 'Farming', 'Financial Services',
          'Fine Art', 'Fishery', 'Food & Beverages', 'Food Production', 'Fund-Raising',
          'Furniture', 'Gambling & Casinos', 'Glass, Ceramics & Concrete', 'Government Administration',
          'Government Relations', 'Graphic Design', 'Health, Wellness and Fitness', 'Higher Education',
          'Hospital & Health Care', 'Hospitality', 'Human Resources', 'Import and Export',
          'Individual & Family Services', 'Industrial Automation', 'Information Services',
          'Information Technology and Services', 'Insurance', 'International Affairs',
          'International Trade and Development', 'Internet', 'Investment Banking', 'Investment Management',
          'Judiciary', 'Law Enforcement', 'Law Practice', 'Legal Services', 'Legislative Office',
          'Leisure, Travel & Tourism', 'Libraries', 'Logistics and Supply Chain', 'Luxury Goods & Jewelry',
          'Machinery', 'Management Consulting', 'Maritime', 'Market Research', 'Marketing and Advertising',
          'Mechanical or Industrial Engineering', 'Media Production', 'Medical Devices', 'Medical Practice',
          'Mental Health Care', 'Military', 'Mining & Metals', 'Motion Pictures and Film',
          'Museums and Institutions', 'Music', 'Nanotechnology', 'Newspapers', 'Non-Profit Organization Management',
          'Oil & Energy', 'Online Media', 'Outsourcing/Offshoring', 'Package/Freight Delivery',
          'Packaging and Containers', 'Paper & Forest Products', 'Performing Arts', 'Pharmaceuticals',
          'Philanthropy', 'Photography', 'Plastics', 'Political Organization', 'Primary/Secondary Education',
          'Printing', 'Professional Training & Coaching', 'Program Development', 'Public Policy',
          'Public Relations and Communications', 'Public Safety', 'Publishing', 'Railroad Manufacture',
          'Ranching', 'Real Estate', 'Recreational Facilities and Services', 'Religious Institutions',
          'Renewables & Environment', 'Research', 'Restaurants', 'Retail', 'Security and Investigations',
          'Semiconductors', 'Shipbuilding', 'Sporting Goods', 'Sports', 'Staffing and Recruiting',
          'Supermarkets', 'Telecommunications', 'Textiles', 'Think Tanks', 'Tobacco', 'Translation and Localization',
          'Transportation/Trucking/Railroad', 'Utilities', 'Venture Capital & Private Equity',
          'Veterinary', 'Warehousing', 'Wholesale', 'Wine and Spirits', 'Wireless', 'Writing and Editing'
        ]
      },
      general: {
        maxLimit: 100, // Maximum jobs per regular API call
        offsetMultiple: true,
        searchJobLimit: 10 // Documentation clearly states "Job searches are limited to 10 jobs per API call"
      }
    };
  }

  static getInstance(): RapidApiValidator {
    if (!RapidApiValidator.instance) {
      RapidApiValidator.instance = new RapidApiValidator();
    }
    return RapidApiValidator.instance;
  }

  /**
   * Validates title_filter parameter
   */
  private validateTitleFilter(value: string): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (value.length > this.constraints.title_filter.maxLength) {
      errors.push(`Title filter exceeds maximum length of ${this.constraints.title_filter.maxLength} characters`);
    }

    // Check for balanced quotes
    const quoteCount = (value.match(/"/g) || []).length;
    if (quoteCount % 2 !== 0) {
      errors.push('Unbalanced quotes in title filter - ensure all quotes are properly closed');
    }

    // Check for proper syntax
    if (value.includes('AND') && value.includes('OR') && !value.includes('(')) {
      warnings.push('Complex boolean expressions should use parentheses for clarity');
    }

    // Check for common abbreviations that might not work
    const commonAbbreviations = ['JS', 'TS', 'AI', 'ML', 'API', 'UI', 'UX'];
    commonAbbreviations.forEach(abbr => {
      if (value.includes(abbr) && !value.includes(`"${abbr}"`)) {
        warnings.push(`Consider quoting abbreviation "${abbr}" for exact matching`);
      }
    });

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validates location_filter parameter
   */
  private validateLocationFilter(value: string): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (value.length > this.constraints.location_filter.maxLength) {
      errors.push(`Location filter exceeds maximum length of ${this.constraints.location_filter.maxLength} characters`);
    }

    // Check for common abbreviations
    const locationAbbreviations = ['US', 'UK', 'USA', 'NY', 'CA', 'TX', 'FL'];
    locationAbbreviations.forEach(abbr => {
      if (value.includes(abbr)) {
        if (abbr === 'US') {
          errors.push('Use "United States" instead of "US" abbreviation');
        } else if (abbr === 'UK') {
          errors.push('Use "United Kingdom" instead of "UK" abbreviation');
        } else {
          warnings.push(`Consider using full location name instead of "${abbr}" abbreviation`);
        }
      }
    });

    // Check for proper OR syntax
    if (value.includes('OR') && !value.includes('"')) {
      warnings.push('When using OR with locations, consider quoting location names');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validates type_filter parameter
   */
  private validateTypeFilter(value: string): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    const types = value.split(',').map(t => t.trim());
    
    types.forEach(type => {
      if (!this.constraints.type_filter.allowedValues.includes(type)) {
        errors.push(`Invalid job type: "${type}". Allowed values: ${this.constraints.type_filter.allowedValues.join(', ')}`);
      }
    });

    // Check for spaces in comma-delimited list
    if (value.includes(', ')) {
      errors.push('Job types should be comma-delimited without spaces (e.g., "FULL_TIME,PART_TIME")');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validates seniority_filter parameter
   */
  private validateSeniorityFilter(value: string): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    const levels = value.split(',').map(l => l.trim());
    
    levels.forEach(level => {
      if (!this.constraints.seniority_filter.allowedValues.includes(level)) {
        errors.push(`Invalid seniority level: "${level}". Allowed values: ${this.constraints.seniority_filter.allowedValues.join(', ')}`);
      }
    });

    // Check for spaces in comma-delimited list
    if (value.includes(', ')) {
      errors.push('Seniority levels should be comma-delimited without spaces');
    }

    if (value.includes('Not Applicable')) {
      warnings.push('Using "Not Applicable" may miss relevant jobs - consider omitting this filter');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validates description_filter parameter
   */
  private validateDescriptionFilter(value: string, limit?: number): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (value.length > this.constraints.description_filter.maxLength) {
      warnings.push(`Description filter is long (${value.length} chars) - may cause timeouts`);
    }

    // Check for quoted common keywords that might cause timeouts
    const commonKeywords = ['health safety', 'remote work', 'team player'];
    commonKeywords.forEach(keyword => {
      if (value.includes(`"${keyword}"`)) {
        warnings.push(`Quoted phrase "${keyword}" might cause timeouts - consider unquoted search`);
      }
    });

    // Check limits for 7-day endpoint
    if (limit && limit > this.constraints.description_filter.recommendedLimits.limit) {
      warnings.push(`Description filter with limit > ${this.constraints.description_filter.recommendedLimits.limit} may cause timeouts`);
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validates organization description filter parameter
   */
  private validateOrganizationDescriptionFilter(value: string): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (value.length > this.constraints.organization_filters.maxLength) {
      errors.push(`Organization description filter exceeds maximum length of ${this.constraints.organization_filters.maxLength} characters`);
    }

    if (value.length < 3) {
      warnings.push('Organization description filter is very short - consider more specific terms');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validates organization specialties filter parameter
   */
  private validateOrganizationSpecialtiesFilter(value: string): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (value.length > this.constraints.organization_filters.maxLength) {
      errors.push(`Organization specialties filter exceeds maximum length of ${this.constraints.organization_filters.maxLength} characters`);
    }

    // Split by common delimiters and validate individual specialties
    const specialties = value.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
    if (specialties.length > 10) {
      warnings.push('Too many specialties may over-filter results - consider reducing to most important ones');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validates organization slug filter parameter
   */
  private validateOrganizationSlugFilter(value: string): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (value.length > this.constraints.organization_filters.maxLength) {
      errors.push(`Organization slug filter exceeds maximum length of ${this.constraints.organization_filters.maxLength} characters`);
    }

    // Validate slug format (should be lowercase, hyphenated company names)
    const slugs = value.split(',').map(s => s.trim()).filter(Boolean);
    slugs.forEach(slug => {
      if (!/^[a-z0-9-]+$/.test(slug)) {
        warnings.push(`Organization slug "${slug}" should contain only lowercase letters, numbers, and hyphens`);
      }
    });

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validates industry filter parameter
   */
  private validateIndustryFilter(value: string): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (value.length > this.constraints.industry_filter.maxLength) {
      errors.push(`Industry filter exceeds maximum length of ${this.constraints.industry_filter.maxLength} characters`);
    }

    // Split by comma and validate each industry
    const industries = value.split(',').map(s => s.trim()).filter(Boolean);
    const validIndustries = this.constraints.industry_filter.allowedValues;
    
    industries.forEach(industry => {
      if (!validIndustries.includes(industry)) {
        warnings.push(`Industry "${industry}" may not be a valid LinkedIn industry category`);
      }
    });

    if (industries.length > 5) {
      warnings.push('Selecting too many industries may over-filter results');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validates general parameters (limit, offset)
   */
  private validateGeneralParams(params: SearchParameters): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate limit
    if (params.limit && params.limit > this.constraints.general.maxLimit) {
      errors.push(`Limit cannot exceed ${this.constraints.general.maxLimit} jobs per request`);
    }

    // Special validation for search operations (title_filter, advanced_title_filter, or description_filter)
    const isSearchOperation = params.title_filter || params.advanced_title_filter || params.description_filter;
    if (isSearchOperation) {
      if (params.limit && params.limit > this.constraints.general.searchJobLimit) {
        errors.push(`Search operations are limited to ${this.constraints.general.searchJobLimit} jobs per API call`);
      }
    }
    
    // Validate advanced_title_filter and title_filter are mutually exclusive
    if (params.title_filter && params.advanced_title_filter) {
      errors.push('Cannot use both title_filter and advanced_title_filter in the same request');
    }
    
    // Validate boolean string parameters
    const booleanParams = ['remote', 'agency', 'external_apply_url', 'directapply', 'include_ai', 'ai_has_salary', 'ai_visa_sponsorship_filter'];
    booleanParams.forEach(param => {
      const value = params[param];
      if (value !== undefined && value !== 'true' && value !== 'false') {
        warnings.push(`Parameter ${param} should be 'true' or 'false', got: ${value}`);
      }
    });
    
    // Validate employees range
    if (params.employees_gte !== undefined && params.employees_lte !== undefined) {
      if (params.employees_gte > params.employees_lte) {
        errors.push('employees_gte cannot be greater than employees_lte');
      }
    }
    
    // Validate date_filter format
    if (params.date_filter) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?$/;
      if (!dateRegex.test(params.date_filter)) {
        errors.push('date_filter must be in format YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS');
      }
    }
    
    // Validate order parameter
    if (params.order && params.order !== 'asc') {
      warnings.push('order parameter should be "asc" for ascending date order (default is descending)');
    }

    // Validate offset is multiple of limit
    if (params.offset && params.limit && params.offset % params.limit !== 0) {
      errors.push('Offset must be a multiple of limit parameter');
    }

    // Validate offset isn't too high
    if (params.offset && params.offset > 1000) {
      warnings.push('High offset values may return less relevant results');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Normalizes parameters according to API requirements
   * CRITICAL: Preserves all default values set in the route handler
   */
  private normalizeParameters(params: SearchParameters): SearchParameters {
    const normalized = { ...params };

    // Normalize location abbreviations
    if (normalized.location_filter) {
      normalized.location_filter = normalized.location_filter
        .replace(/\bUS\b/g, 'United States')
        .replace(/\bUK\b/g, 'United Kingdom');
    }

    // Ensure proper quoting for title filter
    if (normalized.title_filter) {
      // Auto-quote phrases that contain multiple words
      normalized.title_filter = normalized.title_filter.replace(
        /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g,
        '"$1"'
      );
    }

    // Set default limit if not specified
    if (!normalized.limit) {
      normalized.limit = 10; // Conservative default
    }

    // Ensure limit doesn't exceed search constraints
    if ((normalized.title_filter || normalized.description_filter) && normalized.limit && normalized.limit > 10) {
      normalized.limit = 10;
    }

    // CRITICAL FIX: Preserve high-fidelity defaults from route handler
    // These defaults are essential for enhanced data quality:
    // - agency: 'FALSE' (direct employers only)
    // - include_ai: 'true' (AI-enriched fields)
    // - description_type: 'text' (full job descriptions)
    // The validator MUST NOT override these carefully set defaults

    return normalized;
  }

  /**
   * Validates all parameters for a search request
   */
  validateSearchParameters(params: SearchParameters): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate individual filters
    if (params.title_filter) {
      const titleValidation = this.validateTitleFilter(params.title_filter);
      errors.push(...titleValidation.errors);
      warnings.push(...titleValidation.warnings);
    }

    if (params.location_filter) {
      const locationValidation = this.validateLocationFilter(params.location_filter);
      errors.push(...locationValidation.errors);
      warnings.push(...locationValidation.warnings);
    }

    if (params.type_filter) {
      const typeValidation = this.validateTypeFilter(params.type_filter);
      errors.push(...typeValidation.errors);
      warnings.push(...typeValidation.warnings);
    }

    if (params.seniority_filter) {
      const seniorityValidation = this.validateSeniorityFilter(params.seniority_filter);
      errors.push(...seniorityValidation.errors);
      warnings.push(...seniorityValidation.warnings);
    }

    if (params.description_filter) {
      const descriptionValidation = this.validateDescriptionFilter(params.description_filter, params.limit);
      errors.push(...descriptionValidation.errors);
      warnings.push(...descriptionValidation.warnings);
    }

    // Validate organization filters
    if (params.organization_description_filter) {
      const orgDescValidation = this.validateOrganizationDescriptionFilter(params.organization_description_filter);
      errors.push(...orgDescValidation.errors);
      warnings.push(...orgDescValidation.warnings);
    }

    if (params.organization_specialties_filter) {
      const orgSpecValidation = this.validateOrganizationSpecialtiesFilter(params.organization_specialties_filter);
      errors.push(...orgSpecValidation.errors);
      warnings.push(...orgSpecValidation.warnings);
    }

    if (params.organization_slug_filter) {
      const orgSlugValidation = this.validateOrganizationSlugFilter(params.organization_slug_filter);
      errors.push(...orgSlugValidation.errors);
      warnings.push(...orgSlugValidation.warnings);
    }

    if (params.industry_filter) {
      const industryValidation = this.validateIndustryFilter(params.industry_filter);
      errors.push(...industryValidation.errors);
      warnings.push(...industryValidation.warnings);
    }

    // Validate general parameters
    const generalValidation = this.validateGeneralParams(params);
    errors.push(...generalValidation.errors);
    warnings.push(...generalValidation.warnings);

    // Normalize parameters
    const normalizedParams = this.normalizeParameters(params);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      normalizedParams
    };
  }

  /**
   * Gets validation constraints for frontend display
   */
  getConstraints(): FilterConstraints {
    return { ...this.constraints };
  }

  /**
   * Validates advanced title filter syntax
   */
  validateAdvancedTitleFilter(value: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for balanced parentheses
    let parenCount = 0;
    for (const char of value) {
      if (char === '(') parenCount++;
      if (char === ')') parenCount--;
      if (parenCount < 0) {
        errors.push('Unbalanced parentheses in advanced title filter');
        break;
      }
    }
    if (parenCount !== 0) {
      errors.push('Unbalanced parentheses in advanced title filter');
    }

    // Check for proper operator usage
    const operators = ['&', '|', '!', '<->', ':*'];
    const hasOperators = operators.some(op => value.includes(op));
    
    if (hasOperators) {
      // Check for proper phrase quoting
      const phrases = value.match(/'[^']*'/g);
      if (phrases) {
        phrases.forEach(phrase => {
          if (phrase.split(' ').length === 1) {
            warnings.push(`Single word in quotes: ${phrase} - may not be necessary`);
          }
        });
      }

      // Check for mixed natural language and operators
      if (value.includes('AND') || value.includes('OR')) {
        warnings.push('Mix of natural language (AND/OR) and operators (&/|) - use operators only');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      normalizedParams: { advanced_title_filter: value }
    };
  }
}

export default RapidApiValidator;
export type { ValidationResult, FilterConstraints };