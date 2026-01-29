'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LeaderboardEntry, User } from '@/types';
import api from '@/lib/api';

interface LeaderboardProps {
  trendId: number;
  entries: LeaderboardEntry[];
  currentUser?: User;
  isLive?: boolean;
  title?: string;
}

export default function Leaderboard({ 
  trendId, 
  entries, 
  currentUser, 
  isLive = false,
  title = "Leaderboard"
}: LeaderboardProps) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(entries);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setLeaderboardData(entries);
  }, [entries]);

  const refreshLeaderboard = async () => {
    setIsLoading(true);
    try {
      const response = await api.getTrendLeaderboard(trendId);
      if (response.success && response.data) {
        setLeaderboardData(response.data);
      }
    } catch (error) {
      console.error('Error refreshing leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return 'default';
      case 2:
        return 'secondary';
      case 3:
        return 'outline';
      default:
        return 'outline';
    }
  };

  const currentUserEntry = leaderboardData.find(entry => entry.userId === currentUser?.id);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>{title}</span>
            {isLive && (
              <Badge variant="outline" className="text-xs text-green-600">
                Live
              </Badge>
            )}
          </CardTitle>
          
          {isLive && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshLeaderboard}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current User Position (if not in top entries) */}
        {currentUserEntry && currentUserEntry.rank > 10 && (
          <div className="border rounded-lg p-3 bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getRankIcon(currentUserEntry.rank)}
                  <Badge variant={getRankBadgeVariant(currentUserEntry.rank)} className="text-xs">
                    #{currentUserEntry.rank}
                  </Badge>
                </div>
                
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUserEntry.user.profileImageUrl} />
                  <AvatarFallback>
                    {(currentUserEntry.user.displayName || currentUserEntry.user.username).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <p className="font-medium text-sm">You</p>
                  <p className="text-xs text-muted-foreground">@{currentUserEntry.user.username}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-sm">{currentUserEntry.score.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </div>
          </div>
        )}

        {/* Top Entries */}
        <div className="space-y-3">
          {leaderboardData.slice(0, 10).map((entry, index) => {
            const isCurrentUser = entry.userId === currentUser?.id;
            
            return (
              <div 
                key={`leaderboard-${entry.userId}-${entry.rank}-${index}`}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 min-w-[60px]">
                    {getRankIcon(entry.rank)}
                    <Badge variant={getRankBadgeVariant(entry.rank)} className="text-xs">
                      #{entry.rank}
                    </Badge>
                  </div>
                  
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.user.profileImageUrl} />
                    <AvatarFallback>
                      {(entry.user.displayName || entry.user.username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Link 
                        href={`/profile/${entry.user.username}`}
                        className="font-medium text-sm hover:underline"
                      >
                        {entry.user.displayName || entry.user.username}
                        {isCurrentUser && <span className="text-primary ml-1">(You)</span>}
                      </Link>
                      {entry.user.isVerified && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          ✓
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">@{entry.user.username}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-sm">{entry.score.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.posts.length} post{entry.posts.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {leaderboardData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No entries yet. Be the first to join this trend!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}