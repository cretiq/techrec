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
  Loader2,
  FileText,
  Trash2,
  Download,
  Calendar,
  HardDrive,
  ChevronUp,
  ChevronDown,
  Users
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
  createdAt: Date;
  updatedAt: Date;
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
  cvs: Array<{
    id: string;
    filename: string;
    originalName: string;
    size: number;
    uploadDate: Date;
    status: string;
    mimeType: string;
  }>;
  cvCount: number;
  skillsCount: number;
  experienceCount: number;
  educationCount: number;
  achievementsCount: number;
  personalProjectsCount: number;
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
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState<Developer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [operation, setOperation] = useState<AdminOperation | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDevelopers, setLoadingDevelopers] = useState(true);

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

  // CV management
  const [cvToDelete, setCvToDelete] = useState<{
    id: string;
    filename: string;
    originalName: string;
    size: number;
    uploadDate: Date;
  } | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeletingCv, setIsDeletingCv] = useState(false);

  // Profile clearing
  const [isClearProfileConfirmOpen, setIsClearProfileConfirmOpen] = useState(false);
  const [isClearingProfile, setIsClearingProfile] = useState(false);
  const [profileDataToDelete, setProfileDataToDelete] = useState<{
    skills: number;
    experience: number;
    education: number;
    achievements: number;
    personalProjects: number;
    experienceProjects: number;
  } | null>(null);

  // Load developers on component mount
  useEffect(() => {
    loadDevelopers();
  }, []);

  // Filter and sort developers when search term, sort, or developers change
  useEffect(() => {
    let filtered = developers;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = developers.filter(dev => 
        dev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dev.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let aValue: any = a[sortBy as keyof Developer];
      let bValue: any = b[sortBy as keyof Developer];

      // Handle string comparisons
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredDevelopers(filtered);
  }, [developers, searchTerm, sortBy, sortOrder]);

  // Load all developers
  const loadDevelopers = async () => {
    setLoadingDevelopers(true);
    setOperation({ type: 'loading', message: 'Loading developers...' });
    
    try {
      const response = await fetch(`/api/admin/gamification/developers?sortBy=${sortBy}&sortOrder=${sortOrder}`);
      const data = await response.json();
      
      if (response.ok) {
        setDevelopers(data.developers);
        setOperation({ type: 'success', message: `Loaded ${data.developers.length} developers` });
      } else {
        setOperation({ type: 'error', message: data.error || 'Failed to load developers' });
      }
    } catch (error) {
      setOperation({ type: 'error', message: 'Error loading developers' });
    } finally {
      setLoadingDevelopers(false);
    }
  };

  // Handle developer selection
  const selectDeveloper = async (developer: Developer) => {
    setSelectedDeveloper(developer);
    setOperation({ type: 'success', message: `Selected developer: ${developer.name}` });
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
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
        await loadDevelopers();
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
        await loadDevelopers();
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
        await loadDevelopers();
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

  // Delete CV
  const deleteCv = async (cvId: string) => {
    setIsDeletingCv(true);
    setOperation({ type: 'loading', message: 'Deleting CV...' });
    
    try {
      const response = await fetch(`/api/admin/gamification/cv/${cvId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setOperation({ type: 'success', message: 'CV deleted successfully' });
        // Refresh developer data
        await loadDevelopers();
      } else {
        setOperation({ type: 'error', message: data.error || 'Failed to delete CV' });
      }
    } catch (error) {
      setOperation({ type: 'error', message: 'Error deleting CV' });
    } finally {
      setIsDeletingCv(false);
      setIsDeleteConfirmOpen(false);
      setCvToDelete(null);
    }
  };

  // Handle CV deletion confirmation
  const handleDeleteCvClick = (cv: any) => {
    setCvToDelete(cv);
    setIsDeleteConfirmOpen(true);
  };

  // Fetch profile data counts
  const fetchProfileDataCounts = async (developerId: string) => {
    try {
      const response = await fetch(`/api/admin/gamification/profile-counts?developerId=${developerId}`);
      const data = await response.json();
      
      if (response.ok) {
        return data;
      } else {
        console.error('Failed to fetch profile data counts:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Error fetching profile data counts:', error);
      return null;
    }
  };

  // Handle clear profile confirmation
  const handleClearProfileClick = async () => {
    if (!selectedDeveloper) return;
    
    setOperation({ type: 'loading', message: 'Loading profile data...' });
    const counts = await fetchProfileDataCounts(selectedDeveloper.id);
    
    if (counts) {
      setProfileDataToDelete(counts);
      setIsClearProfileConfirmOpen(true);
      setOperation(null);
    } else {
      setOperation({ type: 'error', message: 'Failed to load profile data' });
    }
  };

  // Clear profile data
  const clearProfileData = async () => {
    if (!selectedDeveloper) return;
    
    setIsClearingProfile(true);
    setOperation({ type: 'loading', message: 'Clearing profile data...' });
    
    try {
      const response = await fetch(`/api/admin/gamification/clear-profile?developerId=${selectedDeveloper.id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setOperation({ type: 'success', message: 'Profile data cleared successfully' });
        // Refresh developer data
        await loadDevelopers();
      } else {
        setOperation({ type: 'error', message: data.error || 'Failed to clear profile data' });
      }
    } catch (error) {
      setOperation({ type: 'error', message: 'Error clearing profile data' });
    } finally {
      setIsClearingProfile(false);
      setIsClearProfileConfirmOpen(false);
      setProfileDataToDelete(null);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)]">
      {/* Left Half - Developer Table */}
      <div className="w-1/2 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Developers ({filteredDevelopers.length})
              </div>
              <Button 
                onClick={loadDevelopers}
                disabled={loadingDevelopers}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {loadingDevelopers ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {/* Search Filter */}
            <div className="mb-3">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by name or email..."
                className="max-w-sm"
              />
            </div>

            {/* Developer Table */}
            {loadingDevelopers ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary mb-4" />
                <p className="text-base-content/70">Loading developers...</p>
              </div>
            ) : (
              <div className="overflow-auto flex-1">
                <table className="table table-compact table-zebra w-full">
                  <thead className="sticky top-0 bg-base-100 z-10">
                    <tr className="text-xs">
                      <th 
                        className="cursor-pointer hover:bg-base-200 p-2"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-1">
                          Name
                          {sortBy === 'name' && (
                            sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="cursor-pointer hover:bg-base-200 p-2"
                        onClick={() => handleSort('email')}
                      >
                        <div className="flex items-center gap-1">
                          Email
                          {sortBy === 'email' && (
                            sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="cursor-pointer hover:bg-base-200 p-2"
                        onClick={() => handleSort('currentLevel')}
                      >
                        <div className="flex items-center gap-1">
                          Level
                          {sortBy === 'currentLevel' && (
                            sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="cursor-pointer hover:bg-base-200 p-2"
                        onClick={() => handleSort('totalXP')}
                      >
                        <div className="flex items-center gap-1">
                          XP
                          {sortBy === 'totalXP' && (
                            sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          )}
                        </div>
                      </th>
                      <th className="p-2">Points</th>
                      <th 
                        className="cursor-pointer hover:bg-base-200 p-2"
                        onClick={() => handleSort('subscriptionTier')}
                      >
                        <div className="flex items-center gap-1">
                          Tier
                          {sortBy === 'subscriptionTier' && (
                            sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          )}
                        </div>
                      </th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDevelopers.map((developer) => (
                      <tr 
                        key={developer.id}
                        className={`cursor-pointer hover:bg-base-200/50 ${
                          selectedDeveloper?.id === developer.id ? 'bg-primary/10' : ''
                        }`}
                        onClick={() => selectDeveloper(developer)}
                      >
                        <td className="p-2">
                          <div className="text-sm font-medium truncate max-w-[120px]" title={developer.name}>
                            {developer.name}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="text-xs text-base-content/70 truncate max-w-[150px]" title={developer.email}>
                            {developer.email}
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline" className="text-xs px-2 py-1">L{developer.currentLevel}</Badge>
                        </td>
                        <td className="p-2">
                          <div className="text-xs">{developer.totalXP.toLocaleString()}</div>
                        </td>
                        <td className="p-2">
                          <div className="text-xs flex items-center gap-1">
                            <span>{(developer.monthlyPoints - developer.pointsUsed + developer.pointsEarned).toLocaleString()}</span>
                            {process.env.NEXT_PUBLIC_ENABLE_MVP_MODE === 'true' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-4 w-6 p-0 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectDeveloper(developer);
                                  setPointsAmount(50);
                                  setPointsReason('Quick beta points top-up');
                                }}
                                title="Quick add 50 points"
                              >
                                +50
                              </Button>
                            )}
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline" className="text-xs px-2 py-1">{developer.subscriptionTier}</Badge>
                        </td>
                        <td className="p-2">
                          <Button
                            variant={selectedDeveloper?.id === developer.id ? "default" : "outline"}
                            size="sm"
                            className="text-xs px-2 py-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectDeveloper(developer);
                            }}
                          >
                            {selectedDeveloper?.id === developer.id ? "✓" : "Select"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Half - User Details */}
      <div className="w-1/2 flex flex-col">

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
                <div>
                  <div className="text-sm text-base-content/70">CVs Uploaded</div>
                  <div className="font-semibold">{selectedDeveloper.cvCount}</div>
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="points">Points</TabsTrigger>
              <TabsTrigger value="xp">XP</TabsTrigger>
              <TabsTrigger value="badges">Badges</TabsTrigger>
              <TabsTrigger value="cvs">CV Management</TabsTrigger>
            </TabsList>

            <TabsContent value="points" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="w-5 h-5" />
                    Points Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current Balance Display */}
                  <div className="p-4 bg-base-200 rounded-lg">
                    <div className="text-sm text-base-content/70">Current Available Points</div>
                    <div className="text-2xl font-bold">
                      {(selectedDeveloper.monthlyPoints - selectedDeveloper.pointsUsed + selectedDeveloper.pointsEarned).toLocaleString()}
                    </div>
                    <div className="text-xs text-base-content/50 mt-1">
                      Monthly: {selectedDeveloper.monthlyPoints} | Used: {selectedDeveloper.pointsUsed} | Earned: {selectedDeveloper.pointsEarned}
                    </div>
                  </div>

                  {/* Quick Adjustment Buttons */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Quick Adjustments (Beta Testing)</label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {[50, 100, 150, 200, 250, 300].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPointsAmount(amount);
                            setPointsReason(`Beta testing allocation - ${amount} points`);
                          }}
                        >
                          +{amount}
                        </Button>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
                      {[-10, -25, -50, -100, -150, -200].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          className="text-warning"
                          onClick={() => {
                            setPointsAmount(Math.abs(amount));
                            setPointsReason(`Points deduction - ${Math.abs(amount)} points`);
                          }}
                        >
                          {amount}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Manual Input */}
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
                  
                  {/* Award Button */}
                  <Button 
                    onClick={awardPoints}
                    disabled={loading || !pointsAmount || !pointsReason}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Award Points
                  </Button>

                  {/* Beta Tester Quick Setup */}
                  {process.env.NEXT_PUBLIC_ENABLE_MVP_MODE === 'true' && (
                    <div className="pt-4 border-t">
                      <Button
                        variant="primary"
                        onClick={() => {
                          setPointsAmount(300);
                          setPointsReason('Beta tester initial allocation');
                        }}
                        className="w-full"
                      >
                        Set as Beta Tester (300 points)
                      </Button>
                    </div>
                  )}
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

            <TabsContent value="cvs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      CV Management
                    </div>
                    <Button
                      variant="error"
                      size="sm"
                      onClick={handleClearProfileClick}
                      disabled={loading || isClearingProfile}
                      className="flex items-center gap-2"
                    >
                      {isClearingProfile ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Clear All Profile Data
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDeveloper.cvs.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 mx-auto text-base-content/40 mb-4" />
                      <p className="text-base-content/70">No CVs uploaded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-sm text-base-content/70 mb-4">
                        Total CVs: {selectedDeveloper.cvCount}
                      </div>
                      
                      {/* CV Table */}
                      <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                          <thead>
                            <tr>
                              <th className="w-[30%]">File Name</th>
                              <th className="w-[20%]">Size</th>
                              <th className="w-[20%]">Upload Date</th>
                              <th className="w-[15%]">Status</th>
                              <th className="w-[15%]">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedDeveloper.cvs.map((cv) => (
                              <tr key={cv.id}>
                                <td>
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary" />
                                    <div>
                                      <div className="font-medium text-sm">{cv.originalName}</div>
                                      <div className="text-xs text-base-content/60">{cv.filename}</div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="flex items-center gap-1">
                                    <HardDrive className="w-3 h-3 text-base-content/60" />
                                    <span className="text-sm">{formatFileSize(cv.size)}</span>
                                  </div>
                                </td>
                                <td>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-base-content/60" />
                                    <span className="text-sm">{formatDate(cv.uploadDate)}</span>
                                  </div>
                                </td>
                                <td>
                                  <Badge 
                                    variant={cv.status === 'COMPLETED' ? 'default' : cv.status === 'PENDING' ? 'secondary' : 'destructive'}
                                    className="text-xs"
                                  >
                                    {cv.status}
                                  </Badge>
                                </td>
                                <td>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteCvClick(cv)}
                                    disabled={isDeletingCv}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Confirmation Modal */}
              {isDeleteConfirmOpen && cvToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="w-6 h-6 text-red-500" />
                      <h3 className="text-lg font-semibold">Confirm CV Deletion</h3>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <p className="text-base-content/80">
                        Are you sure you want to delete this CV? This action cannot be undone.
                      </p>
                      
                      <div className="bg-base-200 p-3 rounded-md">
                        <div className="text-sm">
                          <div><strong>File:</strong> {cvToDelete.originalName}</div>
                          <div><strong>Size:</strong> {formatFileSize(cvToDelete.size)}</div>
                          <div><strong>Uploaded:</strong> {formatDate(cvToDelete.uploadDate)}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setIsDeleteConfirmOpen(false);
                          setCvToDelete(null);
                        }}
                        disabled={isDeletingCv}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="error"
                        onClick={() => deleteCv(cvToDelete.id)}
                        disabled={isDeletingCv}
                        className="flex items-center gap-2"
                      >
                        {isDeletingCv ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Delete CV
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Clear Profile Confirmation Modal */}
              {isClearProfileConfirmOpen && profileDataToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="w-6 h-6 text-red-500" />
                      <h3 className="text-lg font-semibold">Confirm Profile Data Deletion</h3>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <p className="text-base-content/80">
                        Are you sure you want to delete ALL profile data for <strong>{selectedDeveloper?.name}</strong>? This action cannot be undone.
                      </p>
                      
                      <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                        <h4 className="font-semibold text-red-800 mb-2">The following data will be permanently deleted:</h4>
                        <ul className="text-sm text-red-700 space-y-1">
                          <li>• <strong>{profileDataToDelete.skills}</strong> Skills</li>
                          <li>• <strong>{profileDataToDelete.experience}</strong> Work Experience entries</li>
                          <li>• <strong>{profileDataToDelete.education}</strong> Education entries</li>
                          <li>• <strong>{profileDataToDelete.achievements}</strong> Achievement entries</li>
                          <li>• <strong>{profileDataToDelete.personalProjects}</strong> Personal Projects</li>
                          <li>• <strong>{profileDataToDelete.experienceProjects}</strong> Experience Projects</li>
                        </ul>
                        <p className="text-xs text-red-600 mt-3 font-medium">
                          Total items to be deleted: {
                            profileDataToDelete.skills + 
                            profileDataToDelete.experience + 
                            profileDataToDelete.education + 
                            profileDataToDelete.achievements + 
                            profileDataToDelete.personalProjects + 
                            profileDataToDelete.experienceProjects
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setIsClearProfileConfirmOpen(false);
                          setProfileDataToDelete(null);
                        }}
                        disabled={isClearingProfile}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="error"
                        onClick={clearProfileData}
                        disabled={isClearingProfile}
                        className="flex items-center gap-2"
                      >
                        {isClearingProfile ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Delete All Profile Data
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}