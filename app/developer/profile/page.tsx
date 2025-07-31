'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-daisy/card';
import { Badge } from '@/components/ui-daisy/badge';
import { Button } from '@/components/ui-daisy/button';
import { useSession } from 'next-auth/react';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Database,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertTriangle 
} from 'lucide-react';

interface DeveloperProfile {
  id: string;
  name: string;
  email: string;
  profileEmail?: string;
  title?: string;
  about?: string;
  totalXP: number;
  currentLevel: number;
  subscriptionTier: string;
  subscriptionStatus: string;
  monthlyPoints: number;
  pointsUsed: number;
  pointsEarned: number;
  createdAt: string;
  updatedAt: string;
  cvCount: number;
  skillsCount: number;
  experienceCount: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!session?.user?.id) {
      setError('No session found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/developer/profile');
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load profile');
      }
    } catch (err) {
      setError('Error fetching profile data');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile();
    } else if (status === 'unauthenticated') {
      setError('Not authenticated');
      setLoading(false);
    }
  }, [session, status]);

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Loading profile...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error Loading Profile</h2>
              <p className="text-base-content/70 mb-4">{error}</p>
              <Button onClick={fetchProfile} disabled={loading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <User className="w-12 h-12 mx-auto text-base-content/40 mb-4" />
              <p className="text-base-content/70">No profile data found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availablePoints = profile.monthlyPoints - profile.pointsUsed + profile.pointsEarned;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-base-content/70">Your account information and current status</p>
      </div>

      {/* Basic Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-base-content/70">Name</label>
                <div className="text-lg font-semibold">{profile.name}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-base-content/70">Email</label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-base-content/60" />
                  <span className="font-mono text-sm">{profile.email}</span>
                </div>
              </div>

              {profile.profileEmail && profile.profileEmail !== profile.email && (
                <div>
                  <label className="text-sm font-medium text-base-content/70">Profile Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-base-content/60" />
                    <span className="font-mono text-sm">{profile.profileEmail}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-base-content/70">Developer ID</label>
                <div className="font-mono text-xs text-base-content/60 bg-base-200 p-2 rounded">
                  {profile.id}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {profile.title && (
                <div>
                  <label className="text-sm font-medium text-base-content/70">Title</label>
                  <div className="text-lg">{profile.title}</div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-base-content/70">Member Since</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-base-content/60" />
                  <span>{new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-base-content/70">Last Updated</label>
                <div className="text-sm text-base-content/60">
                  {new Date(profile.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription & Gamification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Tier</span>
              <Badge variant={profile.subscriptionTier === 'FREE' ? 'secondary' : 'default'}>
                {profile.subscriptionTier}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <Badge variant="outline">
                  {profile.subscriptionStatus}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Available Points</span>
              <div className="text-lg font-semibold text-primary">
                {availablePoints.toLocaleString()}
              </div>
            </div>

            <div className="text-xs text-base-content/60 space-y-1">
              <div>Monthly: {profile.monthlyPoints.toLocaleString()}</div>
              <div>Used: {profile.pointsUsed.toLocaleString()}</div>
              <div>Earned: {profile.pointsEarned.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Profile Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Level</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Level {profile.currentLevel}</Badge>
                <span className="text-sm text-base-content/60">
                  ({profile.totalXP.toLocaleString()} XP)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">CVs Uploaded</span>
              <div className="text-lg font-semibold">
                {profile.cvCount}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Skills</span>
              <div className="text-lg font-semibold">
                {profile.skillsCount}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Experience Entries</span>
              <div className="text-lg font-semibold">
                {profile.experienceCount}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Session Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-base-content/70">Session User ID</label>
              <div className="font-mono text-xs text-base-content/60 bg-base-200 p-2 rounded">
                {session?.user?.id}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-base-content/70">Session Email</label>
              <div className="font-mono text-xs text-base-content/60 bg-base-200 p-2 rounded">
                {session?.user?.email}
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-base-200 rounded-lg">
            <div className="flex items-center gap-2">
              {session?.user?.id === profile.id ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700">Session is consistent</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">Session ID mismatch detected</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button onClick={fetchProfile} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Profile
        </Button>
      </div>
    </div>
  );
}