'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User as UserType } from '@/types';
import api from '@/lib/api';

interface SuggestionsSidebarProps {
  currentUser?: UserType;
}

export default function SuggestionsSidebar({ currentUser }: SuggestionsSidebarProps) {
  const [suggestions, setSuggestions] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const [hiddenUserIds, setHiddenUserIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (currentUser) {
      loadSuggestions();
    }
  }, [currentUser]);

  const loadSuggestions = async () => {
    try {
      // Try to get real user suggestions from API
      const response = await api.request('/users/suggestions');
      if (response.success && response.data) {
        setSuggestions((response.data as any[]).slice(0, 5)); // Show max 5 suggestions
      } else {
        // Fallback to getting recent users if suggestions API doesn't exist
        const usersResponse = await api.request('/users?limit=5');
        if (usersResponse.success && usersResponse.data) {
          // Filter out current user
          const filteredUsers = (usersResponse.data as any[]).filter((user: UserType) => 
            user.id !== currentUser?.id
          ).slice(0, 5);
          setSuggestions(filteredUsers);
        }
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      // Set empty array on error
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async (userId: number) => {
    try {
      const response = await api.followUser(userId);
      if (response.success) {
        // Hide the user from suggestions instead of removing
        setHiddenUserIds(prev => new Set([...prev, userId]));
      }
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const handleHideUser = (userId: number) => {
    setHiddenUserIds(prev => new Set([...prev, userId]));
  };

  const handleHideSuggestions = () => {
    setIsHidden(true);
    // Store in localStorage to remember user preference
    localStorage.setItem('hideSuggestions', 'true');
  };

  // Check if suggestions should be hidden on mount
  useEffect(() => {
    const hidden = localStorage.getItem('hideSuggestions') === 'true';
    setIsHidden(hidden);
    
    // Load hidden user IDs from localStorage
    const hiddenIds = localStorage.getItem('hiddenUserIds');
    if (hiddenIds) {
      try {
        const parsedIds = JSON.parse(hiddenIds);
        setHiddenUserIds(new Set(parsedIds));
      } catch (error) {
        console.error('Failed to parse hidden user IDs:', error);
      }
    }
  }, []);

  // Save hidden user IDs to localStorage whenever it changes
  useEffect(() => {
    if (hiddenUserIds.size > 0) {
      localStorage.setItem('hiddenUserIds', JSON.stringify([...hiddenUserIds]));
    }
  }, [hiddenUserIds]);

  // Filter out hidden users
  const visibleSuggestions = suggestions.filter(user => !hiddenUserIds.has(user.id));

  if (!currentUser || isHidden) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-100 p-6 overflow-y-auto hidden lg:block">
      {/* Current User Info */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={currentUser.profileImageUrl} alt={currentUser.displayName || currentUser.username} />
            <AvatarFallback className="bg-purple-600 text-white">
              {(currentUser.displayName || currentUser.username).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-gray-900">
              {currentUser.displayName || currentUser.username}
            </p>
            <p className="text-sm text-gray-500">
              @{currentUser.username}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600">
          Switch
        </Button>
      </div>

      {/* Suggestions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-500">Suggested for you</h3>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-xs text-gray-900 hover:text-gray-700">
              See All
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleHideSuggestions}
              className="text-xs text-gray-500 hover:text-gray-700 p-1"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : visibleSuggestions.length > 0 ? (
          <div className="space-y-3">
            {visibleSuggestions.map((user) => (
              <div key={user.id} className="flex items-center space-x-3">
                <Link href={`/profile/${user.username}`}>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profileImageUrl} alt={user.displayName || user.username} />
                    <AvatarFallback className="bg-gray-300 text-gray-600 text-sm">
                      {(user.displayName || user.username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1">
                  <Link href={`/profile/${user.username}`}>
                    <p className="text-sm font-semibold text-gray-900 hover:underline">
                      {user.username}
                    </p>
                  </Link>
                  <p className="text-xs text-gray-500">
                    {user.displayName || 'New to Trenz'}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFollow(user.id)}
                    className="text-blue-500 hover:text-blue-600 text-xs font-semibold"
                  >
                    Follow
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleHideUser(user.id)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : suggestions.length > 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 mb-3">
              All suggestions are hidden.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setHiddenUserIds(new Set());
                localStorage.removeItem('hiddenUserIds');
              }}
              className="text-xs"
            >
              Show All Suggestions
            </Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">
              No suggestions available right now.
            </p>
          </div>
        )}
      </div>

      {/* Show suggestions again option */}
      {visibleSuggestions.length === 0 && suggestions.length > 0 && !isLoading && (
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setHiddenUserIds(new Set());
              localStorage.removeItem('hiddenUserIds');
            }}
            className="w-full text-xs"
          >
            Show All Suggestions
          </Button>
        </div>
      )}
      
      {visibleSuggestions.length === 0 && suggestions.length === 0 && !isLoading && (
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              localStorage.removeItem('hideSuggestions');
              setIsHidden(false);
              loadSuggestions();
            }}
            className="w-full text-xs"
          >
            Refresh Suggestions
          </Button>
        </div>
      )}

      {/* Footer Links */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="text-xs text-gray-400 space-y-1">
          <div className="flex flex-wrap gap-2">
            <Link href="/about" className="hover:underline">About</Link>
            <span>•</span>
            <Link href="/help" className="hover:underline">Help</Link>
            <span>•</span>
            <Link href="/press" className="hover:underline">Press</Link>
            <span>•</span>
            <Link href="/api" className="hover:underline">API</Link>
            <span>•</span>
            <Link href="/jobs" className="hover:underline">Jobs</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/terms" className="hover:underline">Terms</Link>
            <span>•</span>
            <Link href="/locations" className="hover:underline">Locations</Link>
            <span>•</span>
            <Link href="/language" className="hover:underline">Language</Link>
            <span>•</span>
            <Link href="/verified" className="hover:underline">Meta Verified</Link>
          </div>
          <div className="mt-4">
            <p>© 2024 TRENZ FROM META</p>
          </div>
        </div>
      </div>
    </div>
  );
}