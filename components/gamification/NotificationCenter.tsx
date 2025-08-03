'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  Trophy, 
  Zap, 
  Star, 
  Award,
  CheckCircle2,
  Flame,
  Target,
  TrendingUp,
  Gift,
  Calendar
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-daisy/card';
import { Button } from '@/components/ui-daisy/button';
import { Badge } from '@/components/ui-daisy/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui-daisy/tabs';
import { 
  selectNotifications,
  selectUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications
} from '@/lib/features/gamificationSlice';
import { GamificationNotification } from '@/types/gamification';

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className = '' }: NotificationCenterProps) {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadNotifications);
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notificationId: string) => {
    dispatch(markNotificationRead(notificationId));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  const handleClearAll = () => {
    dispatch(clearNotifications());
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'xp_gained':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'level_up':
        return <Trophy className="w-4 h-4 text-gold-500" />;
      case 'badge_earned':
        return <Award className="w-4 h-4 text-blue-500" />;
      case 'challenge_completed':
        return <Star className="w-4 h-4 text-green-500" />;
      case 'streak_milestone':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'achievement_unlocked':
        return <Gift className="w-4 h-4 text-purple-500" />;
      case 'daily_reminder':
        return <Calendar className="w-4 h-4 text-blue-400" />;
      default:
        return <Bell className="w-4 h-4 text-base-content/60" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'xp_gained':
        return 'border-l-yellow-500 bg-yellow-50/50';
      case 'level_up':
        return 'border-l-gold-500 bg-gold-50/50';
      case 'badge_earned':
        return 'border-l-blue-500 bg-blue-50/50';
      case 'challenge_completed':
        return 'border-l-green-500 bg-green-50/50';
      case 'streak_milestone':
        return 'border-l-orange-500 bg-orange-50/50';
      case 'achievement_unlocked':
        return 'border-l-purple-500 bg-purple-50/50';
      default:
        return 'border-l-base-300 bg-base-100/50';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.isRead;
    if (activeTab === 'achievements') {
      return ['level_up', 'badge_earned', 'challenge_completed', 'achievement_unlocked'].includes(notification.type);
    }
    if (activeTab === 'xp') {
      return ['xp_gained', 'streak_milestone'].includes(notification.type);
    }
    return true;
  });

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        data-testid="notification-center-trigger"
      >
        <Bell className="w-5 h-5" />
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
            data-testid="notification-center-unread-count"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
        
        {/* Pulse animation for new notifications */}
        {unreadCount > 0 && (
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full"
          />
        )}
      </Button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-96 z-50"
            data-testid="notification-center-dropdown"
          >
            <Card variant="glass" hoverable>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                    {unreadCount > 0 && (
                      <Badge variant="outline" className="ml-2">
                        {unreadCount} new
                      </Badge>
                    )}
                  </CardTitle>
                  
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllRead}
                        className="text-xs"
                        data-testid="notification-center-mark-all-read"
                      >
                        Mark all read
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      data-testid="notification-center-close"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full grid grid-cols-4 mx-4 mb-3" style={{ width: 'calc(100% - 2rem)' }}>
                    <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                    <TabsTrigger value="unread" className="text-xs">Unread</TabsTrigger>
                    <TabsTrigger value="achievements" className="text-xs">Rewards</TabsTrigger>
                    <TabsTrigger value="xp" className="text-xs">XP</TabsTrigger>
                  </TabsList>

                  <div className="max-h-96 overflow-y-auto">
                    <TabsContent value={activeTab} className="mt-0">
                      {filteredNotifications.length === 0 ? (
                        <div className="p-6 text-center text-base-content/60">
                          <Bell className="w-12 h-12 mx-auto mb-3 text-base-content/30" />
                          <p className="text-sm">No notifications yet</p>
                          <p className="text-xs text-base-content/50 mt-1">
                            Complete actions to start earning rewards!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {filteredNotifications.map((notification, index) => (
                            <NotificationItem
                              key={notification.id}
                              notification={notification}
                              index={index}
                              onClick={() => handleNotificationClick(notification.id)}
                              getIcon={getNotificationIcon}
                              getColor={getNotificationColor}
                              formatTimeAgo={formatTimeAgo}
                            />
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </div>
                </Tabs>

                {/* Footer actions */}
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-base-300/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAll}
                      className="w-full text-xs text-base-content/60 hover:text-red-600"
                      data-testid="notification-center-clear-all"
                    >
                      Clear all notifications
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Individual notification item component
function NotificationItem({
  notification,
  index,
  onClick,
  getIcon,
  getColor,
  formatTimeAgo
}: {
  notification: GamificationNotification;
  index: number;
  onClick: () => void;
  getIcon: (type: string) => React.ReactNode;
  getColor: (type: string) => string;
  formatTimeAgo: (timestamp: Date) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`
        p-3 mx-3 rounded-lg border-l-4 cursor-pointer transition-all duration-200
        ${getColor(notification.type)}
        ${notification.isRead ? 'opacity-60' : 'hover:bg-base-200/30'}
        ${!notification.isRead ? 'shadow-sm' : ''}
      `}
      data-testid={`notification-item-${notification.id}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={`text-sm font-medium ${!notification.isRead ? 'text-base-content' : 'text-base-content/70'}`}>
                {notification.title}
              </p>
              <p className={`text-xs mt-1 ${!notification.isRead ? 'text-base-content/80' : 'text-base-content/60'}`}>
                {notification.message}
              </p>
              
              {/* XP amount for XP notifications */}
              {notification.xpAmount && (
                <div className="flex items-center gap-1 mt-2">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs font-medium text-yellow-600">
                    +{notification.xpAmount} XP
                  </span>
                </div>
              )}
              
              {/* Badge info for badge notifications */}
              {notification.badgeId && (
                <div className="flex items-center gap-1 mt-2">
                  <Award className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-blue-600">
                    New badge unlocked
                  </span>
                </div>
              )}
            </div>

            {/* Timestamp and unread indicator */}
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-base-content/50">
                {formatTimeAgo(notification.timestamp)}
              </span>
              
              {!notification.isRead && (
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Compact notification bell for headers/navbars
export function CompactNotificationBell({ className = '' }: { className?: string }) {
  const unreadCount = useSelector(selectUnreadNotifications);
  
  return (
    <div className={`relative ${className}`}>
      <Bell className="w-5 h-5" />
      
      {unreadCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
        />
      )}
    </div>
  );
}