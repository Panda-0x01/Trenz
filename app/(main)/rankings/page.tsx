'use client';

import { useEffect, useState } from 'react';
import { Trophy, Medal, Award, TrendingUp, Calendar, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Leaderboard from '@/components/trends/Leaderboard';
import { Trend, TrendWinner, LeaderboardEntry } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function RankingsPage() {
  const [activeTrends, setActiveTrends] = useState<Trend[]>([]);
  const [pastWinners, setPastWinners] = useState<TrendWinner[]>([]);
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  useEffect(() => {
    loadRankingsData();
  }, []);

  useEffect(() => {
    if (activeTrends.length > 0 && !selectedTrend) {
      setSelectedTrend(activeTrends[0]);
    }
  }, [activeTrends]);

  useEffect(() => {
    if (selectedTrend) {
      loadLeaderboard(selectedTrend.id);
    }
  }, [selectedTrend]);

  const loadRankingsData = async () => {
    try {
      const trendsResponse = await api.getTrends();
      
      if (trendsResponse.success && trendsResponse.data) {
        const trends = trendsResponse.data;
        setActiveTrends(trends.filter((trend: Trend) => trend.isActive));
      }

      // Load past winners (mock data for now)
      setPastWinners([]);
    } catch (error) {
      toast.error('Failed to load rankings data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLeaderboard = async (trendId: number) => {
    setIsLoadingLeaderboard(true);
    try {
      const response = await api.getTrendLeaderboard(trendId);
      if (response.success && response.data) {
        setLeaderboardData(response.data);
      }
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <h1 className="text-3xl font-bold">Rankings & Leaderboards</h1>
        </div>
        <p className="text-muted-foreground">
          Compete in trending challenges and climb the leaderboards
        </p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Competitions</TabsTrigger>
          <TabsTrigger value="winners">Past Winners</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {activeTrends.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trend Selection */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Active Trends</h2>
                {activeTrends.map((trend) => (
                  <Card 
                    key={trend.id}
                    className={`cursor-pointer transition-colors ${
                      selectedTrend?.id === trend.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedTrend(trend)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{trend.name}</h3>
                          <p className="text-sm text-muted-foreground">#{trend.hashtag}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {trend._count?.posts || 0} posts
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(trend.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-green-600">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Live
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Leaderboard */}
              <div className="lg:col-span-2">
                {selectedTrend && (
                  <Leaderboard
                    trendId={selectedTrend.id}
                    entries={leaderboardData}
                    isLive={true}
                    title={`${selectedTrend.name} Leaderboard`}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Active Competitions</h3>
              <p className="text-muted-foreground mb-4">
                There are no active trend competitions at the moment.
              </p>
              <Button>Create New Trend</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="winners" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastWinners.length > 0 ? (
              pastWinners.map((winner) => (
                <Card key={winner.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{winner.trend.name}</CardTitle>
                      {getRankIcon(winner.rankPosition)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {(winner.user.displayName || winner.user.username).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{winner.user.displayName || winner.user.username}</p>
                        <p className="text-sm text-muted-foreground">@{winner.user.username}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Position:</span>
                        <span className="font-medium">#{winner.rankPosition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Score:</span>
                        <span className="font-medium">{winner.finalScore}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Won:</span>
                        <span className="font-medium">
                          {new Date(winner.awardedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      View Winning Post
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Medal className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Past Winners Yet</h3>
                <p className="text-muted-foreground">
                  Winners will appear here when trends are completed.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}