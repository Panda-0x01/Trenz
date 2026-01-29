'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, UserPlus, TrendingUp, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: number;
  type: 'like' | 'comment' | 'follow' | 'trend';
  user: {
    id: number;
    username: string;
    displayName?: string;
    profileImageUrl?: string;
  };
  message: string;
  createdAt: string;
  isRead: boolean;
  postId?: number;
  trendId?: number;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      // Mock notifications for now
      const mockNotifications: Notification[] = [
        {
          id: 1,
          type: 'like',
          user: {
            id: 2,
            username: 'johndoe',
            displayName: 'John Doe',
            profileImageUrl: '/api/placeholder/40/40',
          },
          message: 'liked your post',
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          isRead: false,
        },
        {
          id: 2,
          type: 'comment',
          user: {
            id: 3,
            username: 'janedoe',
            displayName: 'Jane Doe',
            profileImageUrl: '/api/placeholder/40/40',
          },
          message: 'commented on your post: "Great content!"',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          isRead: false,
        },
        {
          id: 3,
          type: 'follow',
          user: {
            id: 4,
            username: 'alexsmith',
            displayName: 'Alex Smith',
            profileImageUrl: '/api/placeholder/40/40',
          },
          message: 'started following you',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          isRead: true,
        },
        {
          id: 4,
          type: 'trend',
          user: {
            id: 5,
            username: 'trendmaster',
            displayName: 'Trend Master',
            profileImageUrl: '/api/placeholder/40/40',
          },
          message: 'created a new trend #SummerVibes',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
          isRead: true,
        },
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = (notificationId: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'trend':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      default:
        return <Heart className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold mb-2">Notifications</h1>
            <p className="text-gray-600 text-sm md:text-base">Stay updated with your latest activity</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead} size="sm" className="text-xs md:text-sm">
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 md:py-4 px-4 md:px-6 text-center font-medium transition-colors text-sm md:text-base ${
              activeTab === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`flex-1 py-3 md:py-4 px-4 md:px-6 text-center font-medium transition-colors text-sm md:text-base ${
              activeTab === 'unread'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <div className="p-4 md:p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                        <AvatarImage src={notification.user.profileImageUrl} />
                        <AvatarFallback className="text-xs md:text-sm">
                          {(notification.user.displayName || notification.user.username).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm">
                            <span className="font-semibold">
                              {notification.user.displayName || notification.user.username}
                            </span>
                            <span className="text-gray-600 ml-1">
                              {notification.message}
                            </span>
                          </p>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            <div className="hidden md:block">
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      
                      <div className="block md:hidden flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="h-24 w-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
                <Heart className="h-12 w-12 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {activeTab === 'unread' ? 'No Unread Notifications' : 'No Notifications'}
              </h3>
              <p className="text-gray-600">
                {activeTab === 'unread' 
                  ? 'You\'re all caught up! No unread notifications.'
                  : 'You\'ll see notifications here when you get likes, follows, and comments.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}