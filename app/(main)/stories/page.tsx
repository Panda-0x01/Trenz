'use client';

import { useState, useEffect } from 'react';
import { Settings, Archive, Heart, Smile, MessageCircle, Share, ThumbsUp, ChevronLeft, ChevronRight, Pause, Play, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [currentStoryInGroup, setCurrentStoryInGroup] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

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
      }
    } catch (error) {
      console.error('Failed to load stories:', error);
      toast.error('Failed to load stories');
    } finally {
      setIsLoading(false);
    }
  };

  const selectStoryGroup = (index: number) => {
    setSelectedStoryIndex(index);
    setCurrentStoryInGroup(0);
  };

  const nextStory = () => {
    const currentGroup = storyGroups[selectedStoryIndex];
    if (!currentGroup) return;

    if (currentStoryInGroup < currentGroup.stories.length - 1) {
      setCurrentStoryInGroup(prev => prev + 1);
    } else if (selectedStoryIndex < storyGroups.length - 1) {
      setSelectedStoryIndex(prev => prev + 1);
      setCurrentStoryInGroup(0);
    }
  };

  const prevStory = () => {
    if (currentStoryInGroup > 0) {
      setCurrentStoryInGroup(prev => prev - 1);
    } else if (selectedStoryIndex > 0) {
      setSelectedStoryIndex(prev => prev - 1);
      const prevGroup = storyGroups[selectedStoryIndex - 1];
      setCurrentStoryInGroup(prevGroup.stories.length - 1);
    }
  };

  const currentGroup = storyGroups[selectedStoryIndex];
  const currentStory = currentGroup?.stories[currentStoryInGroup];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
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
      <div className="w-80 bg-white flex flex-col">
        {/* Header */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-sm text-blue-600 font-medium mb-1">Connected</p>
            <h1 className="text-3xl font-bold text-gray-900">Stories</h1>
          </div>
          
          <div className="flex gap-3 mb-6">
            <Button variant="outline" size="sm" className="text-gray-600 border-gray-300">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" className="text-gray-600 border-gray-300">
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
          </div>
        </div>

        {/* Your Story Section */}
        {currentUser && (
          <div className="px-6 pb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Your story</h3>
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
              <Avatar className="h-14 w-14">
                <AvatarImage src={currentUser.profileImageUrl} />
                <AvatarFallback className="bg-gray-200 text-gray-700">
                  {(currentUser.displayName || currentUser.username).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900">
                  {currentUser.displayName || currentUser.username}
                </p>
                <p className="text-sm text-gray-500">Added 20 h ago</p>
              </div>
            </div>
          </div>
        )}

        {/* Followed Stories */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Followed stories</h3>
            <div className="space-y-2">
              {storyGroups.map((group, index) => {
                const latestStory = group.stories[group.stories.length - 1];
                const isSelected = selectedStoryIndex === index;
                
                return (
                  <div
                    key={group.user.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => selectStoryGroup(index)}
                  >
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={group.user.profileImageUrl} />
                      <AvatarFallback className="bg-gray-200 text-gray-700">
                        {(group.user.displayName || group.user.username).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
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
      <div className="flex-1 bg-gray-400 relative overflow-hidden">
        {storyGroups.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">No stories available</h3>
              <p className="opacity-75">Stories from people you follow will appear here</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full px-8">
            {/* Story Cards Container */}
            <div className="flex items-center gap-6 max-w-7xl">
              {/* Previous Story Card */}
              {selectedStoryIndex > 0 && (
                <div className="relative">
                  <div className="w-72 h-96 rounded-2xl overflow-hidden bg-black shadow-xl opacity-60 transform scale-90">
                    {(() => {
                      const prevGroup = storyGroups[selectedStoryIndex - 1];
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
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 p-6">
                            <p className="text-white text-center font-medium">{prevStory.content}</p>
                          </div>
                        );
                      }
                      return <div className="w-full h-full bg-gray-800"></div>;
                    })()}
                    
                    {/* User info overlay */}
                    <div className="absolute top-4 left-4 right-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 border-2 border-white">
                          <AvatarImage src={storyGroups[selectedStoryIndex - 1].user.profileImageUrl} />
                          <AvatarFallback className="text-xs">
                            {storyGroups[selectedStoryIndex - 1].user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-white text-sm font-medium">
                          {storyGroups[selectedStoryIndex - 1].user.displayName || storyGroups[selectedStoryIndex - 1].user.username}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Story Card */}
              {currentGroup && currentStory && (
                <div className="relative">
                  <div className="w-80 h-[500px] rounded-2xl overflow-hidden bg-black shadow-2xl">
                    {/* Story Progress Bars */}
                    <div className="absolute top-4 left-4 right-4 flex gap-1 z-30">
                      {currentGroup.stories.map((_, index) => (
                        <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-white transition-all duration-300"
                            style={{
                              width: index < currentStoryInGroup ? '100%' : 
                                     index === currentStoryInGroup ? '100%' : '0%'
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* User Info */}
                    <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-30">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-white">
                          <AvatarImage src={currentGroup.user.profileImageUrl} />
                          <AvatarFallback className="text-black">
                            {(currentGroup.user.displayName || currentGroup.user.username).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-semibold text-sm">
                            {currentGroup.user.displayName || currentGroup.user.username}
                          </p>
                          <p className="text-white/70 text-xs">
                            {formatDistanceToNow(new Date(currentStory.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/20 h-8 w-8"
                          onClick={() => setIsPaused(!isPaused)}
                        >
                          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/20 h-8 w-8"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
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
                  </div>
                </div>
              )}

              {/* Next Story Card */}
              {selectedStoryIndex < storyGroups.length - 1 && (
                <div className="relative">
                  <div className="w-72 h-96 rounded-2xl overflow-hidden bg-black shadow-xl opacity-60 transform scale-90">
                    {(() => {
                      const nextGroup = storyGroups[selectedStoryIndex + 1];
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
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600 p-6">
                            <p className="text-white text-center font-medium">{nextStory.content}</p>
                          </div>
                        );
                      }
                      return <div className="w-full h-full bg-gray-800"></div>;
                    })()}
                    
                    {/* User info overlay */}
                    <div className="absolute top-4 left-4 right-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 border-2 border-white">
                          <AvatarImage src={storyGroups[selectedStoryIndex + 1].user.profileImageUrl} />
                          <AvatarFallback className="text-xs">
                            {storyGroups[selectedStoryIndex + 1].user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-white text-sm font-medium">
                          {storyGroups[selectedStoryIndex + 1].user.displayName || storyGroups[selectedStoryIndex + 1].user.username}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Arrows */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-8 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm h-12 w-12 rounded-full"
              onClick={prevStory}
              disabled={selectedStoryIndex === 0 && currentStoryInGroup === 0}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-8 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm h-12 w-12 rounded-full"
              onClick={nextStory}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            {/* Reaction Buttons */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/90 hover:bg-white text-red-500 hover:text-red-600 rounded-full h-12 w-12 shadow-lg"
              >
                <Heart className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/90 hover:bg-white text-yellow-500 hover:text-yellow-600 rounded-full h-12 w-12 shadow-lg"
              >
                <Smile className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/90 hover:bg-white text-blue-500 hover:text-blue-600 rounded-full h-12 w-12 shadow-lg"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/90 hover:bg-white text-green-500 hover:text-green-600 rounded-full h-12 w-12 shadow-lg"
              >
                <Share className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/90 hover:bg-white text-blue-600 hover:text-blue-700 rounded-full h-12 w-12 shadow-lg"
              >
                <ThumbsUp className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}