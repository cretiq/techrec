'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-daisy/card';
import { Badge } from '@/components/ui-daisy/badge';
import { Button } from '@/components/ui-daisy/button';
import { Tooltip, TooltipInfo } from '@/components/ui-daisy/tooltip';
import { 
  Coins, 
  TrendingUp, 
  Calendar, 
  ShoppingCart, 
  Plus,
  Info,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { SubscriptionTier } from '@prisma/client';

interface PointsBalanceProps {
  className?: string;
  pointsData?: {
    available: number;
    monthly: number;
    used: number;
    earned: number;
    resetDate: string | null;
    subscriptionTier: string;
    efficiency: number;
    transactions: any[];
  };
}

interface PointsData {
  available: number;
  monthly: number;
  used: number;
  earned: number;
  resetDate: string | null;
  subscriptionTier: SubscriptionTier;
  efficiency: number; // Points usage efficiency
  transactions: PointsTransaction[];
}

interface PointsTransaction {
  id: string;
  amount: number;
  type: 'earned' | 'spent';
  source: string;
  description: string;
  createdAt: Date;
}

export function PointsBalance({ className = '', pointsData: propPointsData }: PointsBalanceProps) {
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('🪙 [PointsBalance] Component mounted with data:', propPointsData);

  useEffect(() => {
    console.log('🪙 [PointsBalance] Processing points data...');
    
    if (propPointsData) {
      // Use the provided points data
      const processedData: PointsData = {
        available: propPointsData.available,
        monthly: propPointsData.monthly,
        used: propPointsData.used,
        earned: propPointsData.earned,
        resetDate: propPointsData.resetDate,
        subscriptionTier: propPointsData.subscriptionTier as SubscriptionTier,
        efficiency: propPointsData.efficiency,
        transactions: propPointsData.transactions.map(tx => ({
          ...tx,
          createdAt: new Date(tx.createdAt)
        }))
      };

      setPointsData(processedData);
      setIsLoading(false);
      
      console.log('🪙 [PointsBalance] Points data processed:', processedData);
    } else {
      // Fallback to mock data if no points data provided
      setPointsData({
        available: 0,
        monthly: 0,
        used: 0,
        earned: 0,
        resetDate: null,
        subscriptionTier: 'FREE',
        efficiency: 0,
        transactions: []
      });
      setIsLoading(false);
    }
  }, [propPointsData]);

  const getTierColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'FREE': return 'text-gray-600 bg-gray-100';
      case 'BASIC': return 'text-blue-600 bg-blue-100';
      case 'STARTER': return 'text-green-600 bg-green-100';
      case 'PRO': return 'text-purple-600 bg-purple-100';
      case 'EXPERT': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDaysUntilReset = (resetDate: string | null) => {
    if (!resetDate) return 0;
    const now = new Date();
    const resetDateObj = new Date(resetDate);
    const diffTime = resetDateObj.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <Card 
        variant="transparent" 
        className="bg-base-100/60 backdrop-blur-sm border border-base-300/50"
        data-testid="points-balance-loading"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-base-300/50 rounded animate-pulse" />
            <div className="h-5 bg-base-300/50 rounded animate-pulse w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-base-300/50 rounded-full animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-base-300/50 rounded animate-pulse" />
            <div className="h-3 bg-base-300/30 rounded animate-pulse w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pointsData) {
    return (
      <Card 
        variant="transparent" 
        className="bg-base-100/60 backdrop-blur-sm border border-base-300/50"
        data-testid="points-balance-error"
      >
        <CardContent className="p-4 text-center">
          <p className="text-base-content/70">Failed to load points data</p>
        </CardContent>
      </Card>
    );
  }

  const usagePercentage = pointsData.monthly > 0 ? (pointsData.used / pointsData.monthly) * 100 : 0;
  const daysUntilReset = getDaysUntilReset(pointsData.resetDate);

  return (
    <Card 
      variant="transparent" 
      className={`bg-base-100/60 backdrop-blur-sm border border-base-300/50 ${className}`}
      data-testid="points-balance"
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Coins className="w-5 h-5 text-primary" />
          Points Balance
          <Tooltip 
            content="Points are used for premium features like AI cover letters, advanced CV analysis, and job application tools. You receive monthly points based on your subscription tier."
            size="large"
            position="top"
          >
            <Info className="w-4 h-4 text-base-content/50 hover:text-base-content/80 cursor-help" />
          </Tooltip>
        </CardTitle>
        
        <div className="flex items-center gap-2">
          <Tooltip 
            content={`${pointsData.subscriptionTier} subscription tier - upgrade for more monthly points and features`}
            size="medium"
            position="bottom"
          >
            <Badge 
              variant="outline" 
              className={`text-xs ${getTierColor(pointsData.subscriptionTier)}`}
              data-testid="points-tier-badge"
            >
              {pointsData.subscriptionTier}
            </Badge>
          </Tooltip>
          {/* Efficiency badge removed for simplified UI */}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        
        {/* Available Points Display */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="relative inline-flex items-center justify-center"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-base-content" data-testid="points-available-count">
                  {pointsData.available.toLocaleString()}
                </div>
                <div className="text-xs text-base-content/60">
                  available
                </div>
              </div>
            </div>
            
            {/* Glow effect for high balances */}
            {pointsData.available >= 500 && (
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-md -z-10"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
          </motion.div>
          
          <div className="space-y-1">
            <Tooltip 
              content={`Monthly allocation: ${pointsData.monthly} points. Used: ${pointsData.used} points. Remaining: ${pointsData.monthly - pointsData.used} points. Your monthly points reset on ${pointsData.resetDate ? new Date(pointsData.resetDate).toLocaleDateString() : 'unknown date'}.`}
              size="large"
              position="bottom"
            >
              <p className="text-sm font-medium text-base-content cursor-help">
                {pointsData.monthly - pointsData.used} of {pointsData.monthly} monthly points
              </p>
            </Tooltip>
            <progress 
              className="progress progress-primary w-full" 
              value={usagePercentage} 
              max="100"
            ></progress>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <Tooltip 
                content="Points earned through daily activities, challenges, and bonus rewards"
                size="medium"
                position="top"
              >
                <span className="text-xs text-base-content/60 cursor-help">Earned</span>
              </Tooltip>
            </div>
            <div className="font-semibold text-base-content" data-testid="points-earned-count">
              {pointsData.earned.toLocaleString()}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <ShoppingCart className="w-4 h-4 text-red-600" />
              <Tooltip 
                content="Points spent on premium features like AI cover letters, advanced CV analysis, and job application tools"
                size="medium"
                position="top"
              >
                <span className="text-xs text-base-content/60 cursor-help">Used</span>
              </Tooltip>
            </div>
            <div className="font-semibold text-base-content" data-testid="points-used-count">
              {pointsData.used.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Reset Information */}
        {pointsData.resetDate && (
          <div className="p-3 bg-base-100/40 border border-base-300/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Next Reset
              </span>
            </div>
            <p className="text-sm text-base-content">
              {daysUntilReset} days until monthly reset
            </p>
            <p className="text-xs text-base-content/70">
              Reset date: {pointsData.resetDate ? new Date(pointsData.resetDate).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        )}

        {/* Recent Transactions */}
        {pointsData.transactions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-base-content">Recent Activity</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {pointsData.transactions.slice(0, 3).map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-2 bg-base-100/30 rounded text-xs"
                  data-testid={`points-transaction-${transaction.id}`}
                >
                  <span className="text-base-content/70 truncate">
                    {transaction.description}
                  </span>
                  <span className={`font-medium ${
                    transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'earned' ? '+' : ''}{transaction.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State or Actions */}
        {pointsData.available === 0 ? (
          <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg text-center">
            <div className="space-y-2">
              <Info className="w-8 h-8 text-primary mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-primary">
                  No points available
                </p>
                <p className="text-xs text-base-content/70">
                  Complete activities to earn points, or upgrade your subscription for more monthly points.
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-base-content/60">Ways to earn points:</p>
                <div className="space-y-1">
                  <div className="text-xs text-base-content/60">• Complete daily challenges</div>
                  <div className="text-xs text-base-content/60">• Upload and analyze CVs</div>
                  <div className="text-xs text-base-content/60">• Maintain daily streaks</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Link href="/developer/subscription">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                data-testid="points-upgrade-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Get More Points
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <p className="text-xs text-center text-base-content/60">
              Use points for premium features
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}