'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  CodeBracketIcon,
  ArrowLeftIcon,
  SparklesIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui-daisy/button';
import { Card } from '@/components/ui-daisy/card';
import { Alert } from '@/components/ui-daisy/alert';
import { Badge } from '@/components/ui-daisy/badge';
import { ProjectEnhancementWizard } from '@/components/projects/ProjectEnhancementWizard';

interface GitHubRepository {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics: string[];
  has_readme: boolean;
  languages?: { [key: string]: number };
}

export default function ProjectEnhancePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check GitHub connection status
  useEffect(() => {
    const checkGitHubConnection = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const sessionData = await response.json();
          const hasGitHubAccount = sessionData.user?.accounts?.some(
            (account: any) => account.provider === 'github'
          );
          setGithubConnected(hasGitHubAccount);
          
          if (hasGitHubAccount) {
            loadRepositories();
          }
        }
      } catch (error) {
        console.error('Error checking GitHub connection:', error);
      }
    };

    if (session) {
      checkGitHubConnection();
    }
  }, [session]);

  const connectToGitHub = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Redirect to GitHub OAuth
      window.location.href = '/api/auth/signin/github';
    } catch (error) {
      console.error('Error connecting to GitHub:', error);
      setError('Failed to connect to GitHub. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const loadRepositories = async () => {
    setIsLoadingRepos(true);
    setError(null);

    try {
      const response = await fetch('/api/project-enhancement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'fetch-github-repos',
          data: {}
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRepositories(data.repositories || []);
    } catch (error) {
      console.error('Error loading repositories:', error);
      setError('Failed to load repositories. Please try again.');
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const handleSelectRepository = (repo: GitHubRepository) => {
    setSelectedRepo(repo);
    setShowWizard(true);
  };

  const handleWizardComplete = (result: any) => {
    setShowWizard(false);
    setSelectedRepo(null);
    // Could navigate to portfolio or show success message
    router.push('/developer/profile');
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
    setSelectedRepo(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      JavaScript: 'warning',
      TypeScript: 'info',
      Python: 'success',
      Java: 'error',
      Go: 'primary',
      Rust: 'secondary',
      HTML: 'accent',
      CSS: 'accent'
    };
    return colors[language] || 'ghost';
  };

  if (showWizard && selectedRepo) {
    return (
      <ProjectEnhancementWizard
        mode="github"
        onComplete={handleWizardComplete}
        onCancel={handleWizardCancel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-base-100" data-testid="project-enhancement-container">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-base-300">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
            >
              Back
            </Button>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl">
              <CodeBracketIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-base-content">
                Enhance GitHub Projects
              </h1>
              <p className="text-base-content/70 text-lg">
                Transform your repositories into compelling CV sections
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* GitHub Connection */}
        {!githubConnected && (
          <Card className="max-w-2xl mx-auto text-center p-8" data-testid="project-enhancement-github-connect-section">
            <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-6">
              <CodeBracketIcon className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-base-content mb-4">
              Connect Your GitHub Account
            </h2>
            <p className="text-base-content/70 mb-6 leading-relaxed">
              Connect your GitHub account to analyze your repositories and generate 
              professional project descriptions for your CV and portfolio.
            </p>
            
            <Button
              onClick={connectToGitHub}
              loading={isConnecting}
              size="lg"
              variant="default"
              leftIcon={<LinkIcon className="w-5 h-5" />}
              data-testid="project-enhancement-button-connect-github-trigger"
            >
              {isConnecting ? 'Connecting...' : 'Connect GitHub'}
            </Button>

            {isConnecting && (
              <div className="loading loading-spinner loading-lg text-primary mx-auto mt-4" data-testid="project-enhancement-github-connecting-spinner"></div>
            )}

            {githubConnected && (
              <div className="mt-4" data-testid="project-enhancement-github-connected-success">
                <CheckCircleIcon className="w-8 h-8 text-success mx-auto mb-2" />
                <p className="text-success">Connected successfully!</p>
              </div>
            )}

            {error && (
              <Alert variant="error" className="mt-6" data-testid="project-enhancement-github-error">
                <span data-testid="project-enhancement-github-error-message">{error}</span>
                <div className="mt-4" data-testid="project-enhancement-manual-entry-option">
                  <p className="text-sm text-base-content/70 mb-3">
                    Can't connect to GitHub? Enter your project details manually instead.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="project-enhancement-button-manual-entry-trigger"
                    onClick={() => {
                      // This would switch to manual mode
                      console.log('Switch to manual entry mode');
                    }}
                  >
                    Enter Project Manually
                  </Button>
                </div>
              </Alert>
            )}
          </Card>
        )}

        {/* Repository Selection */}
        {githubConnected && repositories.length === 0 && !isLoadingRepos && (
          <Card className="max-w-2xl mx-auto text-center p-8">
            <div className="p-4 bg-warning/10 rounded-full w-fit mx-auto mb-6">
              <ExclamationTriangleIcon className="w-12 h-12 text-warning" />
            </div>
            <h2 className="text-2xl font-bold text-base-content mb-4">
              No Repositories Found
            </h2>
            <p className="text-base-content/70 mb-6 leading-relaxed">
              We couldn't find any repositories in your GitHub account. 
              Make sure you have public repositories or try refreshing.
            </p>
            
            <Button
              onClick={loadRepositories}
              variant="default"
              leftIcon={<SparklesIcon className="w-5 h-5" />}
            >
              Refresh Repositories
            </Button>
          </Card>
        )}

        {/* Loading State */}
        {isLoadingRepos && (
          <Card className="max-w-2xl mx-auto text-center p-8">
            <div className="loading loading-spinner loading-lg text-primary mx-auto mb-4"></div>
            <p className="text-base-content/70">Loading your repositories...</p>
          </Card>
        )}

        {/* Repository Grid */}
        {repositories.length > 0 && (
          <div className="space-y-6" data-testid="project-enhancement-repository-list">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-base-content">
                Select a Repository to Enhance
              </h2>
              <Button
                onClick={loadRepositories}
                loading={isLoadingRepos}
                variant="outline"
                leftIcon={<SparklesIcon className="w-4 h-4" />}
              >
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repositories.map((repo, index) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
                    onClick={() => handleSelectRepository(repo)}
                    data-testid={`project-enhancement-repo-card-${repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  >
                    <div className="p-6 space-y-4">
                      {/* Header */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg font-semibold text-base-content group-hover:text-primary transition-colors line-clamp-1" data-testid="repo-card-name">
                            {repo.name}
                          </h3>
                          {repo.has_readme && (
                            <Badge variant="success" size="sm">
                              <CheckCircleIcon className="w-3 h-3 mr-1" />
                              README
                            </Badge>
                          )}
                        </div>
                        {repo.description && (
                          <p className="text-sm text-base-content/70 line-clamp-2" data-testid="repo-card-description">
                            {repo.description}
                          </p>
                        )}
                      </div>

                      {/* Language & Stats */}
                      <div className="flex items-center justify-between">
                        {repo.language && (
                          <Badge variant={getLanguageColor(repo.language)} size="sm">
                            {repo.language}
                          </Badge>
                        )}
                        <div className="flex items-center gap-3 text-xs text-base-content/60">
                          <span>★ {repo.stargazers_count}</span>
                          <span>⑂ {repo.forks_count}</span>
                        </div>
                      </div>

                      {/* Topics */}
                      {repo.topics && repo.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {repo.topics.slice(0, 3).map((topic, topicIndex) => (
                            <Badge key={topicIndex} variant="ghost" size="sm">
                              {topic}
                            </Badge>
                          ))}
                          {repo.topics.length > 3 && (
                            <Badge variant="ghost" size="sm">
                              +{repo.topics.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Last Updated */}
                      <div className="text-xs text-base-content/50">
                        Updated {formatDate(repo.updated_at)}
                      </div>

                      {/* Action */}
                      <div className="pt-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full group-hover:shadow-md transition-shadow"
                          rightIcon={<SparklesIcon className="w-4 h-4" />}
                          data-testid="project-enhancement-button-analyze-trigger"
                        >
                          Enhance Project
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <Card className="mt-12 bg-info/10 border-info/20">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <DocumentTextIcon className="w-6 h-6 text-info flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-base-content mb-2">
                  How Project Enhancement Works
                </h3>
                <div className="text-sm text-base-content/70 space-y-2">
                  <p>
                    • Our AI analyzes your repository, README, and code structure
                  </p>
                  <p>
                    • We extract key technical highlights and business impact
                  </p>
                  <p>
                    • Generate professional CV descriptions that stand out to employers
                  </p>
                  <p>
                    • Get suggestions for improvements and missing documentation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}