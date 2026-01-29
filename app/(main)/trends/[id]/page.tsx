'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { TrendingUp, Calendar, Users, Trophy, Clock, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import PostCard from '@/components/posts/PostCard';
import Leaderboard from '@/components/trends/Leaderboard';
import { Trend, Post, LeaderboardEntry } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function TrendDetailPage() {
  const params = useParams();
  const trendId = parseInt(params.id as string);
  
  const [trend, setTrend] = useState<Trend | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (trendId) {
      loadTrendData();
    }
  }, [trendId]);

  const loadTrendData = async () => {
    try {
      // Load trend details
      const trendsResponse = await api.getTrends();
      if (trendsResponse.success && trendsResponse.data) {
        const foundTrend = trendsResponse.data.find((t: Trend) => t.id === trendId);
        if (foundTrend) {
          setTrend(foundTrend);
        }
      }

      // Load trend posts
      const postsResponse = await api.getPosts(1, 20);
      if (postsResponse.success && postsResponse.data) {
        // Filter posts by trend (mock)
        const trendPosts = postsResponse.data.data.filter((post: Post) => 
          post.trendId === trendId
        );
        setPosts(trendPosts);
      }

      // Load leaderboard
      const leaderboardResponse = await api.getTrendLeaderboard(trendId);
      if (leaderboardResponse.success && leaderboardResponse.data) {
        setLeaderboard(leaderboardResponse.data);
      }

    } catch (error) {
      toast.error('Failed to load trend data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinTrend = async () => {
    setIsJoining(true);
    try {
      // Navigate to create post with this trend preselected
      window.location.href = `/create?trend=${trendId}`;
    } catch (error) {
      toast.error('Failed to join trend');
    } finally {
      setIsJoining(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: trend?.name,
          text: trend?.description,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to share');
    }
  };

  const handleLike = (postId: number) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              _count: {
                ...post._count,
                likes: post.isLiked 
                  ? (post._count?.likes || 0) - 1
                  : (post._count?.likes || 0) + 1
              }
            }
          : post
      )
    );
  };

  const getTimeRemaining = () => {
    if (!trend) return null;
    
    const now = new Date();
    const endDate = new Date(trend.endDate);
    const startDate = new Date(trend.startDate);
    
    if (now > endDate) return 'Ended';
    if (now < startDate) return 'Not started';
    
    const diff = endDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const getProgressPercentage = () => {
    if (!trend) return 0;
    
    const now = new Date();
    const startDate = new Date(trend.startDate);
    const endDate = new Date(trend.endDate);
    
    if (now < startDate) return 0;
    if (now > endDate) return 100;
    
    const total = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!trend) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Trend not found</h1>
          <p className="text-muted-foreground">The trend you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const isActive = trend.isActive && new Date() < new Date(trend.endDate);
  const timeRemaining = getTimeRemaining();
  const progress = getProgressPercentage();

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Trend Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold">{trend.name}</h1>
                    <Badge variant={isActive ? 'default' : 'secondary'}>
                      {isActive ? (
                        <>
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        'Ended'
                      )}
                    </Badge>
                  </div>
                  <p className="text-xl text-primary font-medium">#{trend.hashtag}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleShare}>
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  {isActive && (
                    <Button onClick={handleJoinTrend} disabled={isJoining}>
                      {isJoining ? 'Joining...' : 'Join Trend'}
                    </Button>
                  )}
                </div>
              </div>

              {trend.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {trend.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="font-semibold">{trend._count?.posts || 0}</span>
                  <span className="text-muted-foreground">posts</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-muted-foreground">
                    {new Date(trend.startDate).toLocaleDateString()} - {new Date(trend.endDate).toLocaleDateString()}
                  </span>
                </div>
                {timeRemaining && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-muted-foreground">{timeRemaining}</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {isActive && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="rules">Rules & Info</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onLike={handleLike}
                  showTrendInfo={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to join this trend!
              </p>
              {isActive && (
                <Button onClick={handleJoinTrend}>
                  Create First Post
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Leaderboard
            trendId={trend.id}
            entries={leaderboard}
            isLive={isActive}
            title="Current Rankings"
          />
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Participation</h4>
                <p className="text-sm text-muted-foreground">
                  Join this trend by creating a post with an image that fits the theme. 
                  Use the hashtag #{trend.hashtag} to participate.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Scoring</h4>
                <p className="text-sm text-muted-foreground">
                  Your score is calculated based on engagement: likes (1 point), 
                  comments (2 points), and shares (3 points).
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Winners</h4>
                <p className="text-sm text-muted-foreground">
                  When the trend ends, the top participants will be awarded "Trend Winner" 
                  badges that appear on their profiles.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Guidelines</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Keep content appropriate and relevant to the trend</li>
                  <li>• Original content only - no reposts</li>
                  <li>• Be respectful to other participants</li>
                  <li>• Follow community guidelines</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}