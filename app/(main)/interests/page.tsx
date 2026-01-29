'use client';

import { useEffect, useState } from 'react';
import { Heart, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import PostCard from '@/components/posts/PostCard';
import { Post } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';

const AVAILABLE_INTERESTS = [
  'Photography', 'Art', 'Design', 'Fashion', 'Food', 'Travel', 'Nature',
  'Architecture', 'Street Photography', 'Portrait', 'Landscape', 'Minimalism',
  'Urban', 'Vintage', 'Black & White', 'Color', 'Abstract', 'Documentary',
  'Wildlife', 'Sports', 'Music', 'Technology', 'Lifestyle', 'Beauty'
];

export default function InterestsPage() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');
  const [interestPosts, setInterestPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUserInterests();
    loadInterestBasedPosts();
  }, []);

  const loadUserInterests = async () => {
    // In a real app, this would fetch user's saved interests
    // For now, we'll use localStorage
    const saved = localStorage.getItem('userInterests');
    if (saved) {
      setSelectedInterests(JSON.parse(saved));
    }
  };

  const loadInterestBasedPosts = async () => {
    try {
      const response = await api.getPosts(1, 12);
      if (response.success && response.data) {
        setInterestPosts(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => {
      const updated = prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest];
      
      // Save to localStorage
      localStorage.setItem('userInterests', JSON.stringify(updated));
      return updated;
    });
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !selectedInterests.includes(customInterest.trim())) {
      toggleInterest(customInterest.trim());
      setCustomInterest('');
    }
  };

  const saveInterests = async () => {
    setIsSaving(true);
    try {
      // In a real app, this would save to the backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Interests saved successfully!');
    } catch (error) {
      toast.error('Failed to save interests');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLike = (postId: number) => {
    setInterestPosts(prevPosts =>
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

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="h-6 w-6 text-pink-500" />
          <h1 className="text-3xl font-bold">Your Interests</h1>
        </div>
        <p className="text-muted-foreground">
          Select your interests to see personalized content in your feed
        </p>
      </div>

      {/* Interest Selection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Choose Your Interests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selected Interests */}
          {selectedInterests.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Selected ({selectedInterests.length})</h3>
              <div className="flex flex-wrap gap-2">
                {selectedInterests.map((interest) => (
                  <Badge
                    key={interest}
                    variant="default"
                    className="cursor-pointer hover:bg-destructive"
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Available Interests */}
          <div>
            <h3 className="font-medium mb-3">Available Interests</h3>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_INTERESTS.filter(interest => !selectedInterests.includes(interest))
                .map((interest) => (
                <Badge
                  key={interest}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => toggleInterest(interest)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          {/* Custom Interest */}
          <div>
            <h3 className="font-medium mb-3">Add Custom Interest</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter custom interest..."
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomInterest()}
              />
              <Button onClick={addCustomInterest} disabled={!customInterest.trim()}>
                Add
              </Button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={saveInterests} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Interests'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interest-Based Posts */}
      <div>
        <h2 className="text-xl font-semibold mb-6">
          {selectedInterests.length > 0 
            ? 'Posts Based on Your Interests' 
            : 'Discover Posts'
          }
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-64"></div>
              </div>
            ))}
          </div>
        ) : interestPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interestPosts.map((post) => (
              <PostCard key={post.id} post={post} onLike={handleLike} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No posts found</p>
            <p className="text-sm text-muted-foreground">
              Select some interests above to see personalized content
            </p>
          </div>
        )}
      </div>
    </div>
  );
}