'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Star, TrendingUp, Users, Calendar, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LeaderboardEntry, Trend, User as UserType } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function LeaderboardPage() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    loadTrends();
  }, []);

  useEffect(() => {
    if (selectedTrend) {
      loadLeaderboard(selectedTrend.id);
    }
  }, [selectedTrend]);

  const loadTrends = async () => {
    try {
      const response = await api.getTrends();
      if (response.success && response.data) {
        const activeTrends = response.data.filter((trend: Trend) => trend.isActive);
        setTrends(activeTrends);
        if (activeTrends.length > 0) {
          setSelectedTrend(activeTrends[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load trends:', error);
      toast.error('Failed to load trends');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLeaderboard = async (trendId: number) => {
    try {
      const response = await api.getTrendLeaderboard(trendId);
      if (response.success && response.data) {
        setLeaderboard(response.data);
      } else {
        // Create mock leaderboard data for demonstration
        const mockLeaderboard: LeaderboardEntry[] = [
          {
            userId: 1,
            user: {
              id: 1,
              username: 'alice_creative',
              displayName: 'Alice Johnson',
              profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
              bio: 'Creative photographer and trend enthusiast',
              isVerified: true,
              followerCount: 15420,
              followingCount: 892,
              postCount: 156,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            posts: [],
            score: 2847,
            rank: 1
          },
          {
            userId: 2,
            user: {
              id: 2,
              username: 'bob_artist',
              displayName: 'Bob Smith',
              profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
              bio: 'Digital artist and content creator',
              isVerified: false,
              followerCount: 8934,
              followingCount: 445,
              postCount: 89,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            posts: [],
            score: 2156,
            rank: 2
          },
          {
            userId: 3,
            user: {
              id: 3,
              username: 'charlie_photo',
              displayName: 'Charlie Brown',
              profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
              bio: 'Street photographer',
              isVerified: false,
              followerCount: 5672,
              followingCount: 234,
              postCount: 67,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            posts: [],
            score: 1834,
            rank: 3
          },
          {
            userId: 4,
            user: {
              id: 4,
              username: 'diana_design',
              displayName: 'Diana Wilson',
              profileImageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
              bio: 'UI/UX Designer & Visual Artist',
              isVerified: true,
              followerCount: 12340,
              followingCount: 567,
              postCount: 134,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            posts: [],
            score: 1567,
            rank: 4
          },
          {
            userId: 5,
            user: {
              id: 5,
              username: 'evan_explorer',
              displayName: 'Evan Davis',
              profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
              bio: 'Travel photographer & adventurer',
              isVerified: false,
              followerCount: 7890,
              followingCount: 345,
              postCount: 98,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            posts: [],
            score: 1234,
            rank: 5
          }
        ];
        setLeaderboard(mockLeaderboard);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatScore = (score: number) => {
    if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}k`;
    }
    return score.toString();
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background">
      <div className="h-full">
        <div className="flex h-full bg-white">
          {/* Desktop Layout (lg and above) */}
          <div className="hidden lg:flex flex-1 flex-col">
            <div className="p-6 border-b">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <h1 className="text-3xl font-bold">Trend Leaderboard</h1>
              </div>
              <p className="text-muted-foreground">
                See who's leading in the current trends and competitions
              </p>
            </div>

            <div className="flex-1 flex">
              {/* Trends Sidebar */}
              <div className="w-80 border-r flex flex-col">
                <div className="p-4 border-b">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5" />
                    <h2 className="text-lg font-semibold">Active Trends</h2>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {trends.map((trend) => (
                    <Button
                      key={trend.id}
                      variant={selectedTrend?.id === trend.id ? "default" : "ghost"}
                      className="w-full justify-start text-left h-auto p-4"
                      onClick={() => setSelectedTrend(trend)}
                    >
                      <div className="space-y-1 w-full">
                        <p className="font-medium text-sm">{trend.name}</p>
                        <p className="text-xs text-muted-foreground">#{trend.hashtag}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Ends {new Date(trend.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Main Leaderboard */}
              <div className="flex-1 flex flex-col">
                {selectedTrend ? (
                  <>
                    {/* Trend Header */}
                    <div className="p-6 border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Trophy className="h-6 w-6 text-yellow-500" />
                            <h2 className="text-2xl font-bold">{selectedTrend.name}</h2>
                          </div>
                          <p className="text-muted-foreground">
                            #{selectedTrend.hashtag} • Ends {new Date(selectedTrend.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-hidden">
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                        <div className="px-6 pt-4">
                          <TabsList className="grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="current">Current Rankings</TabsTrigger>
                            <TabsTrigger value="stats">Trend Stats</TabsTrigger>
                          </TabsList>
                        </div>
                        
                        <TabsContent value="current" className="flex-1 overflow-y-auto p-6 mt-0">
                          {leaderboard.length > 0 ? (
                            <div className="space-y-6 max-w-5xl">
                              {/* Top 3 Podium */}
                              {leaderboard.slice(0, 3).length > 0 && (
                                <div className="mb-8">
                                  <h3 className="text-xl font-semibold mb-6 text-center">Top 3 Champions</h3>
                                  <div className="flex justify-center items-end gap-8">
                                    {/* Second Place */}
                                    {leaderboard[1] && (
                                      <div className="text-center">
                                        <div className="relative mb-4">
                                          <Avatar className="h-20 w-20 mx-auto border-4 border-gray-300">
                                            <AvatarImage src={leaderboard[1].user.profileImageUrl} />
                                            <AvatarFallback className="text-lg">
                                              {leaderboard[1].user.displayName?.charAt(0) || leaderboard[1].user.username.charAt(0)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="absolute -top-3 -right-3">
                                            <Medal className="h-8 w-8 text-gray-400" />
                                          </div>
                                        </div>
                                        <div className="bg-gray-100 rounded-xl p-6 h-24 flex flex-col justify-center min-w-[160px]">
                                          <p className="font-semibold">{leaderboard[1].user.displayName || leaderboard[1].user.username}</p>
                                          <p className="text-sm text-muted-foreground">{formatScore(leaderboard[1].score)} pts</p>
                                        </div>
                                      </div>
                                    )}

                                    {/* First Place */}
                                    {leaderboard[0] && (
                                      <div className="text-center">
                                        <div className="relative mb-4">
                                          <Avatar className="h-24 w-24 mx-auto border-4 border-yellow-400">
                                            <AvatarImage src={leaderboard[0].user.profileImageUrl} />
                                            <AvatarFallback className="text-xl">
                                              {leaderboard[0].user.displayName?.charAt(0) || leaderboard[0].user.username.charAt(0)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="absolute -top-4 -right-4">
                                            <Crown className="h-10 w-10 text-yellow-500" />
                                          </div>
                                        </div>
                                        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-xl p-6 h-28 flex flex-col justify-center min-w-[180px]">
                                          <p className="font-bold text-lg">{leaderboard[0].user.displayName || leaderboard[0].user.username}</p>
                                          <p className="text-sm opacity-90">{formatScore(leaderboard[0].score)} pts</p>
                                          {leaderboard[0].user.isVerified && (
                                            <Star className="h-4 w-4 mx-auto mt-1" />
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Third Place */}
                                    {leaderboard[2] && (
                                      <div className="text-center">
                                        <div className="relative mb-4">
                                          <Avatar className="h-20 w-20 mx-auto border-4 border-amber-500">
                                            <AvatarImage src={leaderboard[2].user.profileImageUrl} />
                                            <AvatarFallback className="text-lg">
                                              {leaderboard[2].user.displayName?.charAt(0) || leaderboard[2].user.username.charAt(0)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="absolute -top-3 -right-3">
                                            <Award className="h-8 w-8 text-amber-600" />
                                          </div>
                                        </div>
                                        <div className="bg-amber-100 rounded-xl p-6 h-24 flex flex-col justify-center min-w-[160px]">
                                          <p className="font-semibold">{leaderboard[2].user.displayName || leaderboard[2].user.username}</p>
                                          <p className="text-sm text-muted-foreground">{formatScore(leaderboard[2].score)} pts</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              <Separator />

                              {/* Full Rankings */}
                              <div className="space-y-4">
                                <h3 className="text-xl font-semibold">Full Rankings</h3>
                                <div className="space-y-3">
                                  {leaderboard.map((entry, index) => (
                                    <div
                                      key={entry.userId}
                                      className={`flex items-center gap-6 p-6 rounded-xl border transition-colors hover:bg-muted/50 ${
                                        entry.rank <= 3 ? 'bg-muted/30 border-muted' : ''
                                      }`}
                                    >
                                      <div className="flex items-center justify-center w-16">
                                        {getRankIcon(entry.rank)}
                                      </div>

                                      <Avatar className="h-16 w-16">
                                        <AvatarImage src={entry.user.profileImageUrl} />
                                        <AvatarFallback className="text-lg">
                                          {entry.user.displayName?.charAt(0) || entry.user.username.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>

                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                          <p className="text-lg font-semibold truncate">
                                            {entry.user.displayName || entry.user.username}
                                          </p>
                                          {entry.user.isVerified && (
                                            <Star className="h-5 w-5 text-blue-500 fill-current" />
                                          )}
                                        </div>
                                        <p className="text-muted-foreground">
                                          @{entry.user.username} • {formatFollowers(entry.user.followerCount || 0)} followers
                                        </p>
                                      </div>

                                      <div className="text-right">
                                        <div className={`inline-flex items-center px-4 py-2 rounded-full font-medium ${getRankBadgeColor(entry.rank)}`}>
                                          {formatScore(entry.score)} pts
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">
                                          {entry.user.postCount || 0} posts
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center">
                                <Trophy className="h-20 w-20 mx-auto mb-6 text-muted-foreground" />
                                <h3 className="text-xl font-semibold mb-3">No rankings yet</h3>
                                <p className="text-muted-foreground text-lg">
                                  Be the first to participate in this trend!
                                </p>
                              </div>
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="stats" className="flex-1 overflow-y-auto p-6 mt-0">
                          <div className="max-w-4xl space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <Card>
                                <CardContent className="p-6 text-center">
                                  <Users className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                                  <p className="text-3xl font-bold mb-2">{leaderboard.length}</p>
                                  <p className="text-muted-foreground">Participants</p>
                                </CardContent>
                              </Card>
                              
                              <Card>
                                <CardContent className="p-6 text-center">
                                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-green-500" />
                                  <p className="text-3xl font-bold mb-2">
                                    {leaderboard.reduce((sum, entry) => sum + (entry.user.postCount || 0), 0)}
                                  </p>
                                  <p className="text-muted-foreground">Total Posts</p>
                                </CardContent>
                              </Card>
                              
                              <Card>
                                <CardContent className="p-6 text-center">
                                  <Calendar className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                                  <p className="text-3xl font-bold mb-2">
                                    {Math.ceil((new Date(selectedTrend.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                                  </p>
                                  <p className="text-muted-foreground">Days Left</p>
                                </CardContent>
                              </Card>
                            </div>
                            
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-xl">About This Trend</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                                  {selectedTrend.description}
                                </p>
                                <div className="grid grid-cols-2 gap-6">
                                  <div>
                                    <p className="font-semibold text-lg mb-2">Start Date</p>
                                    <p className="text-muted-foreground">
                                      {new Date(selectedTrend.startDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-semibold text-lg mb-2">End Date</p>
                                    <p className="text-muted-foreground">
                                      {new Date(selectedTrend.endDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <Trophy className="h-20 w-20 mx-auto mb-6 text-muted-foreground" />
                      <h3 className="text-xl font-semibold mb-3">No active trends</h3>
                      <p className="text-muted-foreground text-lg">
                        Check back later for new trend competitions!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tablet Layout (md to lg) */}
          <div className="hidden md:flex lg:hidden flex-col h-full w-full">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <h1 className="text-2xl font-bold">Leaderboard</h1>
              </div>
              <p className="text-muted-foreground text-sm">
                Current trend rankings
              </p>
            </div>

            {selectedTrend ? (
              <div className="flex-1 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                  <div className="px-4 pt-4 border-b">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-bold">{selectedTrend.name}</h2>
                        <p className="text-sm text-muted-foreground">#{selectedTrend.hashtag}</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        Active
                      </Badge>
                    </div>
                    <TabsList className="grid w-full max-w-sm grid-cols-2">
                      <TabsTrigger value="current" className="text-sm">Rankings</TabsTrigger>
                      <TabsTrigger value="stats" className="text-sm">Stats</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="current" className="flex-1 overflow-y-auto p-4 mt-0">
                    {leaderboard.length > 0 ? (
                      <div className="space-y-4">
                        {/* Compact Top 3 */}
                        {leaderboard.slice(0, 3).length > 0 && (
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-4 text-center">Top 3</h3>
                            <div className="flex justify-center items-end gap-4">
                              {leaderboard.slice(0, 3).map((entry, index) => (
                                <div key={entry.userId} className="text-center">
                                  <div className="relative mb-3">
                                    <Avatar className="h-12 w-12 mx-auto border-2 border-yellow-400">
                                      <AvatarImage src={entry.user.profileImageUrl} />
                                      <AvatarFallback className="text-sm">
                                        {entry.user.displayName?.charAt(0) || entry.user.username.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -top-2 -right-2">
                                      {getRankIcon(entry.rank)}
                                    </div>
                                  </div>
                                  <div className={`rounded-lg p-3 min-w-[100px] ${
                                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' :
                                    index === 1 ? 'bg-gray-100' : 'bg-amber-100'
                                  }`}>
                                    <p className="font-semibold text-xs truncate">{entry.user.displayName || entry.user.username}</p>
                                    <p className="text-xs opacity-75">{formatScore(entry.score)} pts</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <Separator />

                        {/* Compact Rankings */}
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold">All Rankings</h3>
                          {leaderboard.map((entry) => (
                            <div
                              key={entry.userId}
                              className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50"
                            >
                              <div className="flex items-center justify-center w-8">
                                {entry.rank <= 3 ? getRankIcon(entry.rank) : (
                                  <span className="text-sm font-bold text-muted-foreground">#{entry.rank}</span>
                                )}
                              </div>

                              <Avatar className="h-10 w-10">
                                <AvatarImage src={entry.user.profileImageUrl} />
                                <AvatarFallback className="text-sm">
                                  {entry.user.displayName?.charAt(0) || entry.user.username.charAt(0)}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-sm truncate">
                                    {entry.user.displayName || entry.user.username}
                                  </p>
                                  {entry.user.isVerified && (
                                    <Star className="h-3 w-3 text-blue-500 fill-current" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  @{entry.user.username}
                                </p>
                              </div>

                              <div className="text-right">
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRankBadgeColor(entry.rank)}`}>
                                  {formatScore(entry.score)} pts
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">No rankings yet</h3>
                          <p className="text-muted-foreground">
                            Be the first to participate!
                          </p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="stats" className="flex-1 overflow-y-auto p-4 mt-0">
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                            <p className="text-2xl font-bold mb-1">{leaderboard.length}</p>
                            <p className="text-xs text-muted-foreground">Participants</p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                            <p className="text-2xl font-bold mb-1">
                              {Math.ceil((new Date(selectedTrend.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                            </p>
                            <p className="text-xs text-muted-foreground">Days Left</p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">About This Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                            {selectedTrend.description}
                          </p>
                          <div className="space-y-2">
                            <div>
                              <p className="font-semibold text-sm">End Date</p>
                              <p className="text-muted-foreground text-sm">
                                {new Date(selectedTrend.endDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No active trends</h3>
                  <p className="text-muted-foreground">
                    Check back later for competitions!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Layout (sm and below) */}
          <div className="md:hidden flex flex-col h-full w-full">
            <div className="p-4 border-b bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <h1 className="text-xl font-bold">Leaderboard</h1>
              </div>
              {selectedTrend && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{selectedTrend.name}</p>
                    <p className="text-xs text-muted-foreground">#{selectedTrend.hashtag}</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    Active
                  </Badge>
                </div>
              )}
            </div>

            {selectedTrend ? (
              <div className="flex-1 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                  <div className="px-4 pt-3 border-b">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="current" className="text-sm">Rankings</TabsTrigger>
                      <TabsTrigger value="stats" className="text-sm">Stats</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="current" className="flex-1 overflow-y-auto p-4 mt-0">
                    {leaderboard.length > 0 ? (
                      <div className="space-y-4">
                        {/* Mobile Top 3 */}
                        {leaderboard.slice(0, 3).length > 0 && (
                          <div className="mb-6">
                            <h3 className="font-semibold mb-4 text-center">Top 3 Champions</h3>
                            <div className="space-y-3">
                              {leaderboard.slice(0, 3).map((entry) => (
                                <div
                                  key={entry.userId}
                                  className={`flex items-center gap-3 p-4 rounded-lg border ${
                                    entry.rank === 1 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200' :
                                    entry.rank === 2 ? 'bg-gray-50 border-gray-200' :
                                    'bg-amber-50 border-amber-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-center w-8">
                                    {getRankIcon(entry.rank)}
                                  </div>

                                  <Avatar className="h-12 w-12">
                                    <AvatarImage src={entry.user.profileImageUrl} />
                                    <AvatarFallback className="text-sm">
                                      {entry.user.displayName?.charAt(0) || entry.user.username.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="font-semibold text-sm truncate">
                                        {entry.user.displayName || entry.user.username}
                                      </p>
                                      {entry.user.isVerified && (
                                        <Star className="h-3 w-3 text-blue-500 fill-current" />
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      @{entry.user.username}
                                    </p>
                                  </div>

                                  <div className="text-right">
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRankBadgeColor(entry.rank)}`}>
                                      {formatScore(entry.score)} pts
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <Separator />

                        {/* Mobile All Rankings */}
                        <div className="space-y-3">
                          <h3 className="font-semibold">All Rankings</h3>
                          {leaderboard.map((entry) => (
                            <div
                              key={entry.userId}
                              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50"
                            >
                              <div className="flex items-center justify-center w-6">
                                {entry.rank <= 3 ? (
                                  <div className="scale-75">{getRankIcon(entry.rank)}</div>
                                ) : (
                                  <span className="text-xs font-bold text-muted-foreground">#{entry.rank}</span>
                                )}
                              </div>

                              <Avatar className="h-10 w-10">
                                <AvatarImage src={entry.user.profileImageUrl} />
                                <AvatarFallback className="text-sm">
                                  {entry.user.displayName?.charAt(0) || entry.user.username.charAt(0)}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-sm truncate">
                                    {entry.user.displayName || entry.user.username}
                                  </p>
                                  {entry.user.isVerified && (
                                    <Star className="h-3 w-3 text-blue-500 fill-current" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {formatFollowers(entry.user.followerCount || 0)} followers
                                </p>
                              </div>

                              <div className="text-right">
                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRankBadgeColor(entry.rank)}`}>
                                  {formatScore(entry.score)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="font-semibold mb-2">No rankings yet</h3>
                          <p className="text-muted-foreground text-sm">
                            Be the first to participate!
                          </p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="stats" className="flex-1 overflow-y-auto p-4 mt-0">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <Card>
                          <CardContent className="p-3 text-center">
                            <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                            <p className="text-lg font-bold mb-1">{leaderboard.length}</p>
                            <p className="text-xs text-muted-foreground">Participants</p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-3 text-center">
                            <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                            <p className="text-lg font-bold mb-1">
                              {Math.ceil((new Date(selectedTrend.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                            </p>
                            <p className="text-xs text-muted-foreground">Days Left</p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">About This Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                            {selectedTrend.description}
                          </p>
                          <div className="space-y-2">
                            <div>
                              <p className="font-semibold text-sm">Ends</p>
                              <p className="text-muted-foreground text-sm">
                                {new Date(selectedTrend.endDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No active trends</h3>
                  <p className="text-muted-foreground text-sm">
                    Check back later for competitions!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}