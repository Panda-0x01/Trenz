'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Users, Hash, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import PostCard from '@/components/posts/PostCard';
import TrendCard from '@/components/trends/TrendCard';
import { Post, Trend, User } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<{
    users: User[];
    posts: Post[];
    trends: Trend[];
  }>({
    users: [],
    posts: [],
    trends: [],
  });
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const response = await api.search(query);
      if (response.success && response.data) {
        setSearchResults(response.data);
      } else {
        toast.error('Search failed');
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('q', searchQuery.trim());
    window.history.pushState({}, '', url.toString());
    
    await performSearch(searchQuery);
  };

  const handleLike = (postId: number) => {
    setSearchResults(prev => ({
      ...prev,
      posts: prev.posts.map(post =>
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
    }));
  };

  const handleJoinTrend = (trendId: number) => {
    window.location.href = `/create?trend=${trendId}`;
  };

  const totalResults = searchResults.users.length + searchResults.posts.length + searchResults.trends.length;

  return (
    <div className="container mx-auto px-4 py-4 md:py-6 max-w-4xl">
      {/* Search Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Search</h1>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search posts, trends, and users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
          <Button type="submit" disabled={isSearching || !searchQuery.trim()} className="w-full sm:w-auto">
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </form>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div>
          {isSearching ? (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Searching...</p>
              </div>
            </div>
          ) : totalResults > 0 ? (
            <div>
              <div className="mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold mb-2">
                  Search Results for "{searchQuery}"
                </h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  Found {totalResults} result{totalResults !== 1 ? 's' : ''}
                </p>
              </div>

              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                  <TabsTrigger value="all" className="text-xs md:text-sm">
                    All ({totalResults})
                  </TabsTrigger>
                  <TabsTrigger value="users" className="text-xs md:text-sm">
                    <Users className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Users</span> ({searchResults.users.length})
                  </TabsTrigger>
                  <TabsTrigger value="posts" className="text-xs md:text-sm">
                    <FileText className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Posts</span> ({searchResults.posts.length})
                  </TabsTrigger>
                  <TabsTrigger value="trends" className="text-xs md:text-sm">
                    <Hash className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Trends</span> ({searchResults.trends.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
                  {/* Users Section */}
                  {searchResults.users.length > 0 && (
                    <div>
                      <h3 className="text-base md:text-lg font-semibold mb-4">Users</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                        {searchResults.users.slice(0, 4).map((user) => (
                          <Card key={user.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-3 md:p-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0">
                                  <AvatarImage src={user.profileImageUrl} />
                                  <AvatarFallback className="text-sm">
                                    {(user.displayName || user.username).charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Link 
                                      href={`/profile/${user.username}`}
                                      className="font-semibold hover:underline truncate text-sm md:text-base"
                                    >
                                      {user.displayName || user.username}
                                    </Link>
                                    {user.isVerified && (
                                      <Badge variant="secondary" className="text-xs">✓</Badge>
                                    )}
                                  </div>
                                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                                    @{user.username}
                                  </p>
                                  {user.bio && (
                                    <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2">
                                      {user.bio}
                                    </p>
                                  )}
                                  <div className="flex gap-3 md:gap-4 mt-2 text-xs text-muted-foreground">
                                    <span>{user._count?.posts || 0} posts</span>
                                    <span>{user._count?.followers || 0} followers</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      {searchResults.users.length > 4 && (
                        <Button variant="outline" className="w-full text-sm">
                          View all {searchResults.users.length} users
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Posts Section */}
                  {searchResults.posts.length > 0 && (
                    <div>
                      <h3 className="text-base md:text-lg font-semibold mb-4">Posts</h3>
                      <div className="grid grid-cols-1 gap-4 mb-6">
                        {searchResults.posts.slice(0, 4).map((post) => (
                          <PostCard key={post.id} post={post} onLike={handleLike} />
                        ))}
                      </div>
                      {searchResults.posts.length > 4 && (
                        <Button variant="outline" className="w-full text-sm">
                          View all {searchResults.posts.length} posts
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Trends Section */}
                  {searchResults.trends.length > 0 && (
                    <div>
                      <h3 className="text-base md:text-lg font-semibold mb-4">Trends</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                        {searchResults.trends.slice(0, 4).map((trend) => (
                          <TrendCard
                            key={trend.id}
                            trend={trend}
                            showJoinButton={true}
                            onJoin={handleJoinTrend}
                          />
                        ))}
                      </div>
                      {searchResults.trends.length > 4 && (
                        <Button variant="outline" className="w-full text-sm">
                          View all {searchResults.trends.length} trends
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="users" className="space-y-4 mt-6">
                  {searchResults.users.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchResults.users.map((user) => (
                        <Card key={user.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={user.profileImageUrl} />
                                <AvatarFallback>
                                  {(user.displayName || user.username).charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <Link 
                                    href={`/profile/${user.username}`}
                                    className="font-semibold hover:underline truncate"
                                  >
                                    {user.displayName || user.username}
                                  </Link>
                                  {user.isVerified && (
                                    <Badge variant="secondary" className="text-xs">✓</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                  @{user.username}
                                </p>
                                {user.bio && (
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {user.bio}
                                  </p>
                                )}
                                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                  <span>{user._count?.posts || 0} posts</span>
                                  <span>{user._count?.followers || 0} followers</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No users found</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="posts" className="space-y-4 mt-6">
                  {searchResults.posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchResults.posts.map((post) => (
                        <PostCard key={post.id} post={post} onLike={handleLike} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No posts found</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="trends" className="space-y-4 mt-6">
                  {searchResults.trends.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchResults.trends.map((trend) => (
                        <TrendCard
                          key={trend.id}
                          trend={trend}
                          showJoinButton={true}
                          onJoin={handleJoinTrend}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Hash className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No trends found</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground mb-4">
                No results found for "{searchQuery}". Try different keywords.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Search tips:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Try different or more general keywords</li>
                  <li>Check your spelling</li>
                  <li>Use fewer keywords</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!hasSearched && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Search Trenz</h3>
          <p className="text-muted-foreground">
            Find users, posts, and trends across the platform
          </p>
        </div>
      )}
    </div>
  );
}