// GitHub Repository Service with Rate Limiting and Circuit Breaker Protection
// Fetches public repositories for project enhancement

import { Octokit } from '@octokit/rest';
import { githubCircuitBreaker } from '@/utils/circuitBreaker';
import { traceGitHubCall, logGitHubAPI, LogLevel } from '@/utils/apiLogger';
import { getCache, setCache } from '@/lib/redis';

// GitHub API rate limiting configuration
const GITHUB_RATE_LIMIT = {
  requests: 60,        // GitHub allows 60 requests per hour for unauthenticated
  authenticated: 5000, // 5000 requests per hour for authenticated users
  window: 3600000,     // 1 hour in milliseconds
  resetBuffer: 300000  // 5 minutes buffer before reset
};

// Cache configuration
const GITHUB_CACHE_CONFIG = {
  repositories: 3600,    // 1 hour for repository list
  readme: 7200,          // 2 hours for README content
  userProfile: 1800,     // 30 minutes for user profile
  rateLimitStatus: 60    // 1 minute for rate limit status
};

// Debug logging
const DEBUG_GITHUB = process.env.NODE_ENV === 'development' || process.env.DEBUG_GITHUB === 'true';

const debugLog = (message: string, data?: any) => {
  if (DEBUG_GITHUB) {
    console.log(`[GitHubService] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
};

// Types for repository data
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  languages_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  default_branch: string;
  topics: string[];
  visibility: 'public' | 'private';
  archived: boolean;
  fork: boolean;
  readme_url?: string;
  has_readme: boolean;
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  email: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRateLimit {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
  resource: string;
}

export interface RepositoryFetchOptions {
  includePrivate?: boolean;
  includeForks?: boolean;
  includeArchived?: boolean;
  sortBy?: 'updated' | 'created' | 'pushed' | 'full_name';
  direction?: 'asc' | 'desc';
  limit?: number;
  page?: number;
}

export interface RepositoryFetchResult {
  repositories: GitHubRepository[];
  user: GitHubUser;
  rateLimitStatus: GitHubRateLimit;
  fromCache: boolean;
  totalCount: number;
  hasMore: boolean;
}

/**
 * GitHub Repository Service
 */
export class GitHubRepositoryService {
  private octokit: Octokit;
  private userId: string;
  private accessToken: string;

  constructor(accessToken: string, userId: string) {
    this.accessToken = accessToken;
    this.userId = userId;
    this.octokit = new Octokit({
      auth: accessToken,
      userAgent: 'TechRec-Portfolio-Enhancement/1.0',
      baseUrl: 'https://api.github.com',
      throttle: {
        onRateLimit: (retryAfter: number, options: any) => {
          logGitHubAPI('rate-limit', LogLevel.WARN, `Rate limit exceeded, retrying after ${retryAfter}s`, {
            retryAfter,
            method: options.method,
            url: options.url
          });
          return true; // Retry
        },
        onAbuseLimit: (retryAfter: number, options: any) => {
          logGitHubAPI('abuse-limit', LogLevel.ERROR, `Abuse limit exceeded, retrying after ${retryAfter}s`, {
            retryAfter,
            method: options.method,
            url: options.url
          });
          return true; // Retry
        }
      }
    });
  }

  /**
   * Get rate limit status
   */
  async getRateLimitStatus(): Promise<GitHubRateLimit> {
    const cacheKey = `github-rate-limit:${this.userId}`;
    
    try {
      const cached = await getCache<GitHubRateLimit>(cacheKey);
      if (cached) {
        debugLog('Rate limit status from cache', cached);
        return cached;
      }
    } catch (error) {
      debugLog('Error getting rate limit from cache', error);
    }

    return await githubCircuitBreaker.execute(
      async () => {
        const result = await traceGitHubCall(
          'rate-limit-status',
          async () => {
            const response = await this.octokit.rest.rateLimit.get();
            return response.data.rate;
          }
        );

        if (result.success && result.data) {
          await setCache(cacheKey, result.data, GITHUB_CACHE_CONFIG.rateLimitStatus);
          debugLog('Rate limit status cached', result.data);
        }

        return result.data || {
          limit: 0,
          remaining: 0,
          reset: 0,
          used: 0,
          resource: 'core'
        };
      }
    );
  }

  /**
   * Get user profile information
   */
  async getUserProfile(): Promise<GitHubUser> {
    const cacheKey = `github-user-profile:${this.userId}`;
    
    try {
      const cached = await getCache<GitHubUser>(cacheKey);
      if (cached) {
        debugLog('User profile from cache', { login: cached.login, name: cached.name });
        return cached;
      }
    } catch (error) {
      debugLog('Error getting user profile from cache', error);
    }

    return await githubCircuitBreaker.execute(
      async () => {
        const result = await traceGitHubCall(
          'user-profile',
          async () => {
            const response = await this.octokit.rest.users.getAuthenticated();
            return response.data;
          }
        );

        if (result.success && result.data) {
          await setCache(cacheKey, result.data, GITHUB_CACHE_CONFIG.userProfile);
          debugLog('User profile cached', { login: result.data.login, name: result.data.name });
        }

        return result.data || {
          id: 0,
          login: 'unknown',
          name: null,
          bio: null,
          location: null,
          email: null,
          public_repos: 0,
          followers: 0,
          following: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
    );
  }

  /**
   * Fetch repositories with options
   */
  async fetchRepositories(options: RepositoryFetchOptions = {}): Promise<RepositoryFetchResult> {
    const {
      includePrivate = false,
      includeForks = false,
      includeArchived = false,
      sortBy = 'updated',
      direction = 'desc',
      limit = 30,
      page = 1
    } = options;

    // Generate cache key based on options
    const cacheKey = `github-repositories:${this.userId}:${JSON.stringify(options)}`;
    
    try {
      const cached = await getCache<RepositoryFetchResult>(cacheKey);
      if (cached) {
        debugLog('Repositories from cache', { 
          count: cached.repositories.length, 
          totalCount: cached.totalCount,
          fromCache: true
        });
        return { ...cached, fromCache: true };
      }
    } catch (error) {
      debugLog('Error getting repositories from cache', error);
    }

    // Check rate limit before making request
    const rateLimitStatus = await this.getRateLimitStatus();
    if (rateLimitStatus.remaining < 10) {
      logGitHubAPI('rate-limit-warning', LogLevel.WARN, 'GitHub rate limit low', {
        remaining: rateLimitStatus.remaining,
        reset: rateLimitStatus.reset,
        resetTime: new Date(rateLimitStatus.reset * 1000).toISOString()
      });
    }

    return await githubCircuitBreaker.execute(
      async () => {
        const result = await traceGitHubCall(
          'fetch-repositories',
          async () => {
            // Get user profile first
            const user = await this.getUserProfile();
            
            // Fetch repositories
            const response = await this.octokit.rest.repos.listForAuthenticatedUser({
              visibility: includePrivate ? 'all' : 'public',
              sort: sortBy,
              direction: direction,
              per_page: Math.min(limit, 100), // GitHub max is 100
              page
            });

            let repositories = response.data.map(repo => ({
              id: repo.id,
              name: repo.name,
              full_name: repo.full_name,
              description: repo.description,
              html_url: repo.html_url,
              language: repo.language,
              languages_url: repo.languages_url,
              stargazers_count: repo.stargazers_count,
              forks_count: repo.forks_count,
              open_issues_count: repo.open_issues_count,
              created_at: repo.created_at,
              updated_at: repo.updated_at,
              pushed_at: repo.pushed_at,
              size: repo.size,
              default_branch: repo.default_branch,
              topics: repo.topics || [],
              visibility: repo.visibility as 'public' | 'private',
              archived: repo.archived,
              fork: repo.fork,
              has_readme: false // Will be checked separately
            }));

            // Filter based on options
            if (!includeForks) {
              repositories = repositories.filter(repo => !repo.fork);
            }
            
            if (!includeArchived) {
              repositories = repositories.filter(repo => !repo.archived);
            }

            // Check for README files
            repositories = await this.checkReadmeFiles(repositories);

            const totalCount = user.public_repos;
            const hasMore = repositories.length === limit && (page * limit) < totalCount;

            const fetchResult: RepositoryFetchResult = {
              repositories,
              user,
              rateLimitStatus: await this.getRateLimitStatus(),
              fromCache: false,
              totalCount,
              hasMore
            };

            return fetchResult;
          },
          {
            includeRequest: false,
            includeResponse: false // Don't log repo data for privacy
          }
        );

        if (result.success && result.data) {
          await setCache(cacheKey, result.data, GITHUB_CACHE_CONFIG.repositories);
          debugLog('Repositories cached', { 
            count: result.data.repositories.length,
            totalCount: result.data.totalCount
          });
        }

        return result.data || {
          repositories: [],
          user: await this.getUserProfile(),
          rateLimitStatus: await this.getRateLimitStatus(),
          fromCache: false,
          totalCount: 0,
          hasMore: false
        };
      }
    );
  }

  /**
   * Check which repositories have README files
   */
  private async checkReadmeFiles(repositories: GitHubRepository[]): Promise<GitHubRepository[]> {
    const readmeChecks = repositories.map(async (repo) => {
      try {
        const result = await traceGitHubCall(
          'check-readme',
          async () => {
            const response = await this.octokit.rest.repos.getReadme({
              owner: repo.full_name.split('/')[0],
              repo: repo.name
            });
            return response.data;
          }
        );

        if (result.success && result.data) {
          repo.has_readme = true;
          repo.readme_url = result.data.html_url;
        }
      } catch (error) {
        // README doesn't exist or is inaccessible
        repo.has_readme = false;
        debugLog(`No README found for ${repo.full_name}`, error);
      }
      
      return repo;
    });

    return await Promise.all(readmeChecks);
  }

  /**
   * Get README content for a repository
   */
  async getReadmeContent(owner: string, repo: string): Promise<string | null> {
    const cacheKey = `github-readme:${owner}:${repo}`;
    
    try {
      const cached = await getCache<string>(cacheKey);
      if (cached) {
        debugLog(`README content from cache for ${owner}/${repo}`, { length: cached.length });
        return cached;
      }
    } catch (error) {
      debugLog(`Error getting README from cache for ${owner}/${repo}`, error);
    }

    return await githubCircuitBreaker.execute(
      async () => {
        const result = await traceGitHubCall(
          'get-readme-content',
          async () => {
            const response = await this.octokit.rest.repos.getReadme({
              owner,
              repo
            });
            
            // Decode base64 content
            const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
            return content;
          }
        );

        if (result.success && result.data) {
          await setCache(cacheKey, result.data, GITHUB_CACHE_CONFIG.readme);
          debugLog(`README content cached for ${owner}/${repo}`, { length: result.data.length });
          return result.data;
        }

        return null;
      }
    );
  }

  /**
   * Get repository languages
   */
  async getRepositoryLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    const cacheKey = `github-languages:${owner}:${repo}`;
    
    try {
      const cached = await getCache<Record<string, number>>(cacheKey);
      if (cached) {
        debugLog(`Languages from cache for ${owner}/${repo}`, Object.keys(cached));
        return cached;
      }
    } catch (error) {
      debugLog(`Error getting languages from cache for ${owner}/${repo}`, error);
    }

    return await githubCircuitBreaker.execute(
      async () => {
        const result = await traceGitHubCall(
          'get-repository-languages',
          async () => {
            const response = await this.octokit.rest.repos.listLanguages({
              owner,
              repo
            });
            return response.data;
          }
        );

        if (result.success && result.data) {
          await setCache(cacheKey, result.data, GITHUB_CACHE_CONFIG.repositories);
          debugLog(`Languages cached for ${owner}/${repo}`, Object.keys(result.data));
        }

        return result.data || {};
      }
    );
  }
}

/**
 * Create GitHub Repository Service instance
 */
export const createGitHubRepositoryService = (accessToken: string, userId: string): GitHubRepositoryService => {
  return new GitHubRepositoryService(accessToken, userId);
};

/**
 * Validate GitHub access token
 */
export const validateGitHubToken = async (accessToken: string): Promise<boolean> => {
  try {
    const tempOctokit = new Octokit({ auth: accessToken });
    await tempOctokit.rest.users.getAuthenticated();
    return true;
  } catch (error) {
    logGitHubAPI('token-validation', LogLevel.ERROR, 'GitHub token validation failed', {
      error: error instanceof Error ? error.message : String(error)
    });
    return false;
  }
};