'use client';

import { useState, useEffect } from 'react';
import { Settings, Archive, Heart, Smile, MessageCircle, Share, ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { User, Story } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';

interface StoryGroup {
  user: User;
  stories: Story[];
}

export default function StoriesPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [selectedStoryGroup, setSelectedStoryGroup] = useState<StoryGroup | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
    loadStories();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const response = await api.getCurrentUser();
      if (response.success && response.data) {
        setCurrentUser(response.data as User);
      }
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  };

  const loadStories = async () => {
    try {
      setIsLoading(true);
      const response = await api.getStories();
      
      if (response.success && response.data) {
        // Group stories by user
        const groupedStories: { [key: number]: StoryGroup } = {};
        
        (response.data as any[]).forEach((story: any) => {
          if (!groupedStories[story.userId]) {
            groupedStories[story.userId] = {
              user: story.user,
              stories: []
            };
          }
          groupedStories[story.userId].stories.push(story);
        });

        // Convert to array and sort by most recent story
        const storyGroupsArray = Object.values(groupedStories).sort((a, b) => {
          const aLatest = Math.max(...a.stories.map(s => new Date(s.createdAt).getTime()));
          const bLatest = Math.max(...b.stories.map(s => new Date(s.createdAt).getTime()));
          return bLatest - aLatest;
        });

        setStoryGroups(storyGroupsArray);
        
        // Auto-select first story group if available
        if (storyGroupsArray.length > 0) {
          setSelectedStoryGroup(storyGroupsArray[0]);
          setCurrentStoryIndex(0);
        }
      }
    } catch (error) {
      console.error('Failed to load stories:', error);
      toast.error('Failed to load stories');
    } finally {
      setIsLoading(false);
    }
  };

  const selectStoryGroup = (group: StoryGroup) => {
    setSelectedStoryGroup(group);
    setCurrentStoryIndex(0);
  };

  const nextStory = () => {
    if (!selectedStoryGroup) return;
    
    if (currentStoryIndex < selectedStoryGroup.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      // Move to next user's stories
      const currentGroupIndex = storyGroups.findIndex(g => g.user.id === selectedStoryGroup.user.id);
      if (currentGroupIndex < storyGroups.length - 1) {
        const nextGroup = storyGroups[currentGroupIndex + 1];
        setSelectedStoryGroup(nextGroup);
        setCurrentStoryIndex(0);
      }
    }
  };

  const prevStory = () => {
    if (!selectedStoryGroup) return;
    
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } else {
      // Move to previous user's stories
      const currentGroupIndex = storyGroups.findIndex(g => g.user.id === selectedStoryGroup.user.id);
      if (currentGroupIndex > 0) {
        const prevGroup = storyGroups[currentGroupIndex - 1];
        setSelectedStoryGroup(prevGroup);
        setCurrentStoryIndex(prevGroup.stories.length - 1);
      }
    }
  };

  const currentStory = selectedStoryGroup?.stories[currentStoryIndex];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-blue-600 font-medium">Connected</p>
              <h1 className="text-2xl font-bold text-gray-900">Stories</h1>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-gray-600">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" className="text-gray-600">
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
          </div>
        </div>

        {/* Your Story Section */}
        {currentUser && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Your story</h3>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={currentUser.profileImageUrl} />
                <AvatarFallback>
                  {(currentUser.displayName || currentUser.username).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900">
                  {currentUser.displayName || currentUser.username}
                </p>
                <p className="text-sm text-gray-500">Add to your story</p>
              </div>
            </div>
          </div>
        )}

        {/* Followed Stories */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Followed stories</h3>
            <div className="space-y-4">
              {storyGroups.map((group) => {
                const latestStory = group.stories[group.stories.length - 1];
                const isSelected = selectedStoryGroup?.user.id === group.user.id;
                
                return (
                  <div
                    key={group.user.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => selectStoryGroup(group)}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-blue-500">
                        <AvatarImage src={group.user.profileImageUrl} />
                        <AvatarFallback>
                          {(group.user.displayName || group.user.username).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {group.stories.length > 1 && (
                        <Badge 
                          variant="secondary" 
                          className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-blue-600 text-white"
                        >
                          {group.stories.length}
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {group.user.displayName || group.user.username}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(latestStory.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center bg-gray-200 relative">
        {storyGroups.length === 0 ? (
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <MessageCircle className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No stories available</h3>
            <p className="text-gray-600">Stories from people you follow will appear here</p>
          </div>
        ) : selectedStoryGroup && currentStory ? (
          <>
            {/* Story Cards */}
            <div className="flex gap-6 items-center justify-center max-w-6xl mx-auto px-6">
              {/* Previous Story Preview */}
              {storyGroups.findIndex(g => g.user.id === selectedStoryGroup.user.id) > 0 && (
                <Card className="w-64 h-96 bg-gray-800 overflow-hidden opacity-50 transform scale-90">
                  <CardContent className="p-0 h-full relative">
                    {(() => {
                      const prevGroupIndex = storyGroups.findIndex(g => g.user.id === selectedStoryGroup.user.id) - 1;
                      const prevGroup = storyGroups[prevGroupIndex];
                      const prevStory = prevGroup.stories[0];
                      
                      if (prevStory.storyType === 'IMAGE' && prevStory.imageUrl) {
                        return (
                          <img
                            src={prevStory.imageUrl}
                            alt="Previous story"
                            className="w-full h-full object-cover"
                          />
                        );
                      } else if (prevStory.storyType === 'TEXT') {
                        return (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600 p-4">
                            <p className="text-white text-center text-sm">{prevStory.content}</p>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Current Story */}
              <Card className="w-80 h-[500px] bg-black overflow-hidden relative shadow-2xl">
                <CardContent className="p-0 h-full relative">
                  {/* Story Progress Bars */}
                  <div className="absolute top-4 left-4 right-4 flex gap-1 z-30">
                    {selectedStoryGroup.stories.map((_, index) => (
                      <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white transition-all duration-300"
                          style={{
                            width: index < currentStoryIndex ? '100%' : 
                                   index === currentStoryIndex ? '100%' : '0%'
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* User Info */}
                  <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-30">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-white">
                        <AvatarImage src={selectedStoryGroup.user.profileImageUrl} />
                        <AvatarFallback className="text-black">
                          {(selectedStoryGroup.user.displayName || selectedStoryGroup.user.username).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-semibold text-sm">
                          {selectedStoryGroup.user.displayName || selectedStoryGroup.user.username}
                        </p>
                        <p className="text-white/70 text-xs">
                          {formatDistanceToNow(new Date(currentStory.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Story Content */}
                  <div className="w-full h-full">
                    {currentStory.storyType === 'IMAGE' && currentStory.imageUrl && (
                      <img
                        src={currentStory.imageUrl}
                        alt="Story"
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {currentStory.storyType === 'VIDEO' && currentStory.videoUrl && (
                      <video
                        src={currentStory.videoUrl}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                      />
                    )}
                    
                    {currentStory.storyType === 'TEXT' && (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-600 to-teal-600 p-6">
                        <p className="text-white text-xl font-medium text-center leading-relaxed">
                          {currentStory.content}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Text overlay for image/video stories */}
                  {currentStory.content && currentStory.storyType !== 'TEXT' && (
                    <div className="absolute bottom-20 left-4 right-4 z-10">
                      <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3">
                        <p className="text-white text-sm leading-relaxed">
                          {currentStory.content}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Reply Input */}
                  <div className="absolute bottom-4 left-4 right-4 z-20">
                    <div className="bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                      <p className="text-white/70 text-sm">Write a reply...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Story Preview */}
              {storyGroups.findIndex(g => g.user.id === selectedStoryGroup.user.id) < storyGroups.length - 1 && (
                <Card className="w-64 h-96 bg-gray-800 overflow-hidden opacity-50 transform scale-90">
                  <CardContent className="p-0 h-full relative">
                    {(() => {
                      const nextGroupIndex = storyGroups.findIndex(g => g.user.id === selectedStoryGroup.user.id) + 1;
                      const nextGroup = storyGroups[nextGroupIndex];
                      const nextStory = nextGroup.stories[0];
                      
                      if (nextStory.storyType === 'IMAGE' && nextStory.imageUrl) {
                        return (
                          <img
                            src={nextStory.imageUrl}
                            alt="Next story"
                            className="w-full h-full object-cover"
                          />
                        );
                      } else if (nextStory.storyType === 'TEXT') {
                        return (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 p-4">
                            <p className="text-white text-center text-sm">{nextStory.content}</p>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Navigation Buttons */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-600 hover:bg-white/80 bg-white/60 backdrop-blur-sm"
              onClick={prevStory}
              disabled={storyGroups.findIndex(g => g.user.id === selectedStoryGroup.user.id) === 0 && currentStoryIndex === 0}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-600 hover:bg-white/80 bg-white/60 backdrop-blur-sm"
              onClick={nextStory}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            {/* Reaction Buttons */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/90 hover:bg-white text-red-500 hover:text-red-600 rounded-full h-12 w-12"
              >
                <Heart className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/90 hover:bg-white text-yellow-500 hover:text-yellow-600 rounded-full h-12 w-12"
              >
                <Smile className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/90 hover:bg-white text-blue-500 hover:text-blue-600 rounded-full h-12 w-12"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/90 hover:bg-white text-green-500 hover:text-green-600 rounded-full h-12 w-12"
              >
                <Share className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/90 hover:bg-white text-blue-600 hover:text-blue-700 rounded-full h-12 w-12"
              >
                <ThumbsUp className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}