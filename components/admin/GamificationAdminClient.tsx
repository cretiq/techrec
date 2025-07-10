'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-daisy/card';
import { Button } from '@/components/ui-daisy/button';
import { Input } from '@/components/ui-daisy/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui-daisy/select';
import { Badge } from '@/components/ui-daisy/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui-daisy/tabs';
import { 
  Coins, 
  Award, 
  TrendingUp, 
  User, 
  Search,
  Plus,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface Developer {
  id: string;
  name: string;
  email: string;
  totalXP: number;
  currentLevel: number;
  monthlyPoints: number;
  pointsUsed: number;
  pointsEarned: number;
  subscriptionTier: string;
  userBadges: Array<{
    badgeId: string;
    earnedAt: Date;
    badge: {
      name: string;
      icon: string;
      category: string;
      tier: string;
    };
  }>;
}

interface Suggestion {
  id: string;
  name: string;
  email: string;
}

interface AdminOperation {
  type: 'success' | 'error' | 'loading';
  message: string;
}

export function GamificationAdminClient() {
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [operation, setOperation] = useState<AdminOperation | null>(null);
  const [loading, setLoading] = useState(false);

  // Type-ahead search state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Points management
  const [pointsAmount, setPointsAmount] = useState<number>(0);
  const [pointsReason, setPointsReason] = useState('');

  // XP management
  const [xpAmount, setXpAmount] = useState<number>(0);
  const [xpSource, setXpSource] = useState<string>('');
  const [xpDescription, setXpDescription] = useState('');

  // Badge management
  const [availableBadges, setAvailableBadges] = useState<Array<{
    id: string;
    name: string;
    icon: string;
    category: string;
    tier: string;
    description: string;
  }>>([]);
  const [selectedBadge, setSelectedBadge] = useState<string>('');

  // Debounced search for suggestions
  useEffect(() => {
    if (searchEmail.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSuggestionsLoading(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/admin/gamification/developers/search?q=${encodeURIComponent(searchEmail)}`);
        const data = await response.json();
        if (response.ok) {
          setSuggestions(data);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        setSuggestions([]);
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setIsSuggestionsLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchEmail]);
  
    // Handle clicks outside of search to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSuggestionsVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchContainerRef]);

  // Search for developer
  const searchDeveloper = async (emailToSearch?: string) => {
    const finalEmail = emailToSearch || searchEmail;
    if (!finalEmail.trim()) return;
    
    setLoading(true);
    setSuggestions([]);
    setIsSuggestionsVisible(false);
    setOperation({ type: 'loading', message: 'Searching for developer...' });
    
    try {
      const response = await fetch(`/api/admin/gamification/developer?email=${encodeURIComponent(finalEmail)}`);
      const data = await response.json();
      
      if (response.ok) {
        setSelectedDeveloper(data.developer);
        setOperation({ type: 'success', message: `Found developer: ${data.developer.name}` });
      } else {
        setSelectedDeveloper(null);
        setOperation({ type: 'error', message: data.error || 'Developer not found' });
      }
    } catch (error) {
      setOperation({ type: 'error', message: 'Error searching for developer' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSuggestionClick = (suggestion: Suggestion) => {
    setSearchEmail(suggestion.email);
    setSuggestions([]);
    setIsSuggestionsVisible(false);
    searchDeveloper(suggestion.email);
  };


  // Award points
  const awardPoints = async () => {
    if (!selectedDeveloper || !pointsAmount || !pointsReason) return;
    
    setLoading(true);
    setOperation({ type: 'loading', message: 'Awarding points...' });
    
    try {
      const response = await fetch('/api/admin/gamification/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          developerId: selectedDeveloper.id,
          amount: pointsAmount,
          reason: pointsReason
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setOperation({ type: 'success', message: `Successfully awarded ${pointsAmount} points` });
        setPointsAmount(0);
        setPointsReason('');
        // Refresh developer data
        searchDeveloper();
      } else {
        setOperation({ type: 'error', message: data.error || 'Failed to award points' });
      }
    } catch (error) {
      setOperation({ type: 'error', message: 'Error awarding points' });
    } finally {
      setLoading(false);
    }
  };

  // Award XP
  const awardXP = async () => {
    if (!selectedDeveloper || !xpAmount || !xpSource) return;
    
    setLoading(true);
    setOperation({ type: 'loading', message: 'Awarding XP...' });
    
    try {
      const response = await fetch('/api/admin/gamification/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          developerId: selectedDeveloper.id,
          amount: xpAmount,
          source: xpSource,
          description: xpDescription || `Admin award: ${xpAmount} XP`
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setOperation({ 
          type: 'success', 
          message: `Successfully awarded ${xpAmount} XP${data.leveledUp ? ' (Level up!)' : ''}` 
        });
        setXpAmount(0);
        setXpSource('');
        setXpDescription('');
        // Refresh developer data
        searchDeveloper();
      } else {
        setOperation({ type: 'error', message: data.error || 'Failed to award XP' });
      }
    } catch (error) {
      setOperation({ type: 'error', message: 'Error awarding XP' });
    } finally {
      setLoading(false);
    }
  };

  // Award badge
  const awardBadge = async () => {
    if (!selectedDeveloper || !selectedBadge) return;
    
    setLoading(true);
    setOperation({ type: 'loading', message: 'Awarding badge...' });
    
    try {
      const response = await fetch('/api/admin/gamification/badge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          developerId: selectedDeveloper.id,
          badgeId: selectedBadge
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setOperation({ type: 'success', message: `Successfully awarded badge` });
        setSelectedBadge('');
        // Refresh developer data
        searchDeveloper();
      } else {
        setOperation({ type: 'error', message: data.error || 'Failed to award badge' });
      }
    } catch (error) {
      setOperation({ type: 'error', message: 'Error awarding badge' });
    } finally {
      setLoading(false);
    }
  };

  // Load available badges
  useEffect(() => {
    const loadBadges = async () => {
      try {
        const response = await fetch('/api/admin/gamification/badges');
        const data = await response.json();
        if (response.ok) {
          setAvailableBadges(data.badges);
        }
      } catch (error) {
        console.error('Error loading badges:', error);
      }
    };
    
    loadBadges();
  }, []);

  return (
    <div className="space-y-6">
      {/* Developer Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Find Developer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1 relative" ref={searchContainerRef}>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <Input
                type="email"
                value={searchEmail}
                onChange={(e) => {
                  setSearchEmail(e.target.value);
                  setIsSuggestionsVisible(true);
                }}
                placeholder="developer@example.com"
                className="w-full"
                autoComplete="off"
              />
              {isSuggestionsVisible && (suggestions.length > 0 || isSuggestionsLoading) && (
                <div className="absolute z-10 w-full mt-1 bg-base-100 border border-base-300 rounded-md shadow-lg">
                  <ul className="max-h-60 overflow-auto">
                    {isSuggestionsLoading && (
                      <li className="px-4 py-2 text-sm text-base-content/60 flex items-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Searching...
                      </li>
                    )}
                    {!isSuggestionsLoading && suggestions.map((suggestion) => (
                      <li
                        key={suggestion.id}
                        className="px-4 py-2 text-sm hover:bg-base-200 cursor-pointer"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <p className="font-medium">{suggestion.name}</p>
                        <p className="text-xs text-base-content/60">{suggestion.email}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <Button 
              onClick={() => searchDeveloper()}
              disabled={loading || !searchEmail.trim()}
              className="flex items-center gap-2"
            >
              {loading && !isSuggestionsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Operation Status */}
      {operation && (
        <Card className={`border-l-4 ${
          operation.type === 'success' ? 'border-l-green-500' : 
          operation.type === 'error' ? 'border-l-red-500' : 'border-l-blue-500'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {operation.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
              {operation.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
              {operation.type === 'loading' && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
              <span className={`font-medium ${
                operation.type === 'success' ? 'text-green-700' : 
                operation.type === 'error' ? 'text-red-700' : 'text-blue-700'
              }`}>
                {operation.message}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Developer Info and Actions */}
      {selectedDeveloper && (
        <div className="space-y-6">
          {/* Developer Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Developer Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-base-content/70">Name</div>
                  <div className="font-semibold">{selectedDeveloper.name}</div>
                </div>
                <div>
                  <div className="text-sm text-base-content/70">Email</div>
                  <div className="font-semibold">{selectedDeveloper.email}</div>
                </div>
                <div>
                  <div className="text-sm text-base-content/70">Level</div>
                  <div className="font-semibold">Level {selectedDeveloper.currentLevel}</div>
                </div>
                <div>
                  <div className="text-sm text-base-content/70">Total XP</div>
                  <div className="font-semibold">{selectedDeveloper.totalXP.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-base-content/70">Available Points</div>
                  <div className="font-semibold">
                    {(selectedDeveloper.monthlyPoints - selectedDeveloper.pointsUsed + selectedDeveloper.pointsEarned).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-base-content/70">Subscription</div>
                  <Badge variant="outline">{selectedDeveloper.subscriptionTier}</Badge>
                </div>
              </div>
              
              {/* Badges */}
              <div className="mt-6">
                <div className="text-sm text-base-content/70 mb-2">Recent Badges</div>
                <div className="flex flex-wrap gap-2">
                  {selectedDeveloper.userBadges.slice(0, 10).map((userBadge) => (
                    <Badge key={userBadge.badgeId} variant="outline" className="flex items-center gap-1">
                      <span>{userBadge.badge.icon}</span>
                      {userBadge.badge.name}
                    </Badge>
                  ))}
                  {selectedDeveloper.userBadges.length > 10 && (
                    <Badge variant="outline">+{selectedDeveloper.userBadges.length - 10} more</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Tabs defaultValue="points" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="points">Points</TabsTrigger>
              <TabsTrigger value="xp">XP</TabsTrigger>
              <TabsTrigger value="badges">Badges</TabsTrigger>
            </TabsList>

            <TabsContent value="points" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="w-5 h-5" />
                    Award Points
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Points Amount</label>
                      <Input
                        type="number"
                        value={pointsAmount}
                        onChange={(e) => setPointsAmount(Number(e.target.value))}
                        placeholder="100"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Reason</label>
                      <Input
                        value={pointsReason}
                        onChange={(e) => setPointsReason(e.target.value)}
                        placeholder="Admin award for..."
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={awardPoints}
                    disabled={loading || !pointsAmount || !pointsReason}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Award Points
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="xp" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Award XP
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">XP Amount</label>
                      <Input
                        type="number"
                        value={xpAmount}
                        onChange={(e) => setXpAmount(Number(e.target.value))}
                        placeholder="500"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Source</label>
                      <select 
                        value={xpSource}
                        onChange={(e) => setXpSource(e.target.value)}
                        className="select select-bordered w-full"
                      >
                        <option value="">Select source</option>
                        <option value="ADMIN_AWARD">Admin Award</option>
                        <option value="PROFILE_SECTION_UPDATED">Profile Update</option>
                        <option value="CV_UPLOADED">CV Upload</option>
                        <option value="CV_ANALYSIS_COMPLETED">CV Analysis</option>
                        <option value="APPLICATION_SUBMITTED">Application Submit</option>
                        <option value="SKILL_ADDED">Skill Add</option>
                        <option value="DAILY_LOGIN">Daily Login</option>
                        <option value="STREAK_MILESTONE">Streak Bonus</option>
                        <option value="BADGE_EARNED">Badge Earned</option>
                        <option value="CHALLENGE_COMPLETED">Challenge Completed</option>
                        <option value="ACHIEVEMENT_UNLOCKED">Achievement Unlocked</option>
                        <option value="LEVEL_UP">Level Up</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                    <Input
                      value={xpDescription}
                      onChange={(e) => setXpDescription(e.target.value)}
                      placeholder="Special admin award for..."
                    />
                  </div>
                  <Button 
                    onClick={awardXP}
                    disabled={loading || !xpAmount || !xpSource}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Award XP
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="badges" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Award Badge
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Badge</label>
                    <select 
                      value={selectedBadge}
                      onChange={(e) => setSelectedBadge(e.target.value)}
                      className="select select-bordered w-full"
                    >
                      <option value="">Select a badge</option>
                      {availableBadges.map((badge) => (
                        <option key={badge.id} value={badge.id}>
                          {badge.icon} {badge.name} ({badge.tier})
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button 
                    onClick={awardBadge}
                    disabled={loading || !selectedBadge}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Award Badge
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}