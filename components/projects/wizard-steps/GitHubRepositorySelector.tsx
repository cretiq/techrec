// GitHub Repository Selector - Single-responsibility component
// Follows established daisyUI patterns with proper state management integration

'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { CodeBracketIcon, StarIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui-daisy/badge';
import { Button } from '@/components/ui-daisy/button';
import { Alert } from '@/components/ui/alert';
import { 
  fetchGitHubRepositories,
  setSelectedRepository,
  selectGitHubRepositories,
  selectSelectedRepository,
  selectIsLoading,
  selectError
} from '@/lib/features/projectEnhancementSlice';
import type { GitHubRepository } from '@/lib/github/repositoryService';

interface GitHubRepositorySelectorProps {
  onRepositorySelect?: (repository: GitHubRepository) => void;
}

/**
 * GitHub Repository Selector Component
 * Single-responsibility: Handle repository selection with daisyUI components
 */
export const GitHubRepositorySelector: React.FC<GitHubRepositorySelectorProps> = ({
  onRepositorySelect
}) => {
  const dispatch = useDispatch();
  const repositories = useSelector(selectGitHubRepositories);
  const selectedRepository = useSelector(selectSelectedRepository);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  // Fetch repositories on mount
  useEffect(() => {
    if (repositories.length === 0) {
      dispatch(fetchGitHubRepositories({ includePrivate: false, limit: 20 }) as any);
    }
  }, [dispatch, repositories.length]);

  const handleRepositorySelect = (repository: GitHubRepository) => {
    dispatch(setSelectedRepository(repository));
    onRepositorySelect?.(repository);
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <span>Failed to load repositories: {error}</span>
      </Alert>
    );
  }

  if (isLoading && repositories.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (repositories.length === 0) {
    return (
      <Alert variant="warning">
        <CodeBracketIcon className="w-5 h-5" />
        <span>No public repositories found. Create some projects on GitHub first!</span>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select a Repository to Enhance</h3>
        <Badge variant="info">{repositories.length} repositories</Badge>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {repositories.map((repository) => (
          <motion.div
            key={repository.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card border-2 cursor-pointer transition-all duration-200 ${
              selectedRepository?.id === repository.id
                ? 'border-primary bg-primary/5'
                : 'border-base-300 hover:border-primary/50 hover:shadow-md'
            }`}
            onClick={() => handleRepositorySelect(repository)}
          >
            <div className="card-body p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="card-title text-base">{repository.name}</h4>
                    {repository.language && (
                      <Badge variant="secondary" size="sm">
                        {repository.language}
                      </Badge>
                    )}
                    {!repository.has_readme && (
                      <Badge variant="warning" size="sm">
                        No README
                      </Badge>
                    )}
                  </div>
                  
                  {repository.description && (
                    <p className="text-sm opacity-70 mb-3">{repository.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm opacity-60">
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-4 h-4" />
                      <span>{repository.stargazers_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <EyeIcon className="w-4 h-4" />
                      <span>{repository.visibility}</span>
                    </div>
                    <span>Updated {new Date(repository.updated_at).toLocaleDateString()}</span>
                  </div>
                  
                  {repository.topics && repository.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {repository.topics.slice(0, 3).map((topic) => (
                        <Badge key={topic} variant="outline" size="xs">
                          {topic}
                        </Badge>
                      ))}
                      {repository.topics.length > 3 && (
                        <Badge variant="outline" size="xs">
                          +{repository.topics.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="ml-4">
                  {selectedRepository?.id === repository.id ? (
                    <div className="badge badge-primary">Selected</div>
                  ) : (
                    <Button variant="outline" size="sm">
                      Select
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {repositories.length > 0 && (
        <div className="text-center">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => dispatch(fetchGitHubRepositories({ includePrivate: false, limit: 50 }) as any)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>
                Loading more...
              </>
            ) : (
              'Load More Repositories'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default GitHubRepositorySelector;