'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Story } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useConfirmation } from '@/hooks/useConfirmation';

interface StoryViewerProps {
  stories: { user: any; stories: Story[] }[];
  initialUserIndex: number;
  initialStoryIndex: number;
  onClose: () => void;
  onStoryDeleted?: () => void;
  currentUser?: any;
}

export default function StoryViewer({ 
  stories, 
  initialUserIndex, 
  initialStoryIndex, 
  onClose,
  onStoryDeleted,
  currentUser
}: StoryViewerProps) {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { confirm, ConfirmationComponent } = useConfirmation();

  const currentUserStories = stories[currentUserIndex];
  const currentStory = currentUserStories?.stories[currentStoryIndex];

  const STORY_DURATION = 5000; // 5 seconds for image/text stories

  // Memoize the onClose callback to prevent unnecessary re-renders
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const nextStory = useCallback(() => {
    const userStories = stories[currentUserIndex];
    
    if (currentStoryIndex < userStories.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
    } else if (currentUserIndex < stories.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    } else {
      // Use setTimeout to avoid state update during render
      setTimeout(() => {
        handleClose();
      }, 0);
    }
  }, [currentUserIndex, currentStoryIndex, stories, handleClose]);

  const prevStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex(prev => prev - 1);
      const prevUserStories = stories[currentUserIndex - 1];
      setCurrentStoryIndex(prevUserStories.stories.length - 1);
      setProgress(0);
    }
  }, [currentUserIndex, currentStoryIndex, stories]);

  const togglePlayPause = useCallback(() => {
    setIsPaused(!isPaused);
  }, [isPaused]);

  const handleDeleteStory = useCallback(async () => {
    if (!currentStory || !currentUser) return;
    
    if (currentStory.userId !== currentUser.id) {
      toast.error('You can only delete your own stories');
      return;
    }

    const confirmed = await confirm({
      title: 'Delete Story',
      message: 'Are you sure you want to delete this story? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'warning',
      isDestructive: true,
    });

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await api.deleteStory(currentStory.id);
      
      if (response.success) {
        toast.success('Story deleted successfully');
        
        // Call the callback to refresh stories
        if (onStoryDeleted) {
          onStoryDeleted();
        }
        
        // Close the viewer or move to next story
        const userStories = stories[currentUserIndex];
        if (userStories.stories.length === 1) {
          // If this was the only story for this user, close viewer
          handleClose();
        } else {
          // Move to next story or previous if this was the last one
          if (currentStoryIndex < userStories.stories.length - 1) {
            nextStory();
          } else if (currentStoryIndex > 0) {
            prevStory();
          } else {
            handleClose();
          }
        }
      } else {
        toast.error(response.error || 'Failed to delete story');
      }
    } catch (error) {
      console.error('Delete story error:', error);
      toast.error('Failed to delete story');
    } finally {
      setIsDeleting(false);
    }
  }, [currentStory, currentUser, currentUserIndex, currentStoryIndex, stories, onStoryDeleted, handleClose, nextStory, prevStory, confirm]);

  useEffect(() => {
    if (!isPlaying || isPaused || !currentStory) return;

    const duration = currentStory.storyType === 'VIDEO' 
      ? (currentStory.duration || 15) * 1000 
      : STORY_DURATION;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (duration / 100));
        
        if (newProgress >= 100) {
          nextStory();
          return 0;
        }
        
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentUserIndex, currentStoryIndex, isPlaying, isPaused, currentStory, nextStory]);

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Story Progress Bars */}
      <div className="absolute top-4 left-4 right-4 flex gap-1 z-30 max-w-md mx-auto">
        {currentUserStories.stories.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{
                width: index < currentStoryIndex ? '100%' : 
                       index === currentStoryIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* User Info */}
      <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-30 max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src={currentUserStories.user.profileImageUrl} />
            <AvatarFallback>
              {(currentUserStories.user.displayName || currentUserStories.user.username).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white font-semibold text-sm">
              {currentUserStories.user.displayName || currentUserStories.user.username}
            </p>
            <p className="text-white/70 text-xs">
              {new Date(currentStory.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Delete Story Option (only for own stories) */}
          {currentUser && currentStory.userId === currentUser.id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 z-40"
                  disabled={isDeleting}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black/90 border-white/20 z-50">
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteStory();
                  }}
                  disabled={isDeleting}
                  className="text-red-400 focus:text-red-300 focus:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete Story'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="text-white hover:bg-white/20 z-40"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Story Content Container */}
      <div className="relative w-full h-full max-w-md mx-auto bg-black overflow-hidden">
        {currentStory.storyType === 'IMAGE' && currentStory.imageUrl && (
          <div className="w-full h-full flex items-center justify-center p-4">
            <img
              src={currentStory.imageUrl}
              alt="Story"
              className="max-w-full max-h-full object-contain"
              onClick={togglePlayPause}
            />
          </div>
        )}
        
        {currentStory.storyType === 'VIDEO' && currentStory.videoUrl && (
          <div className="w-full h-full flex items-center justify-center">
            <video
              src={currentStory.videoUrl}
              className="max-w-full max-h-full object-contain"
              autoPlay
              muted
              onClick={togglePlayPause}
            />
          </div>
        )}
        
        {currentStory.storyType === 'TEXT' && (
          <div 
            className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600 p-8"
            onClick={togglePlayPause}
          >
            <div className="max-w-sm w-full px-4">
              <p className="text-white text-lg md:text-xl lg:text-2xl font-medium text-center leading-relaxed break-words hyphens-auto">
                {currentStory.content}
              </p>
            </div>
          </div>
        )}

        {/* Text overlay for image/video stories */}
        {currentStory.content && currentStory.storyType !== 'TEXT' && (
          <div className="absolute bottom-20 left-4 right-4 z-10">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 max-w-full">
              <p className="text-white text-sm leading-relaxed break-words">
                {currentStory.content}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Areas */}
        <div className="absolute inset-0 flex z-10">
          <div 
            className="flex-1 cursor-pointer"
            onClick={(e) => {
              // Only trigger if not clicking on interactive elements
              if (e.target === e.currentTarget) {
                prevStory();
              }
            }}
          />
          <div 
            className="flex-1 cursor-pointer"
            onClick={(e) => {
              // Only trigger if not clicking on interactive elements
              if (e.target === e.currentTarget) {
                nextStory();
              }
            }}
          />
        </div>

        {/* Play/Pause Indicator */}
        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <div className="bg-black/50 rounded-full p-4">
              <Play className="h-8 w-8 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
        onClick={prevStory}
        disabled={currentUserIndex === 0 && currentStoryIndex === 0}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
        onClick={nextStory}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Confirmation Dialog */}
      <ConfirmationComponent />
    </div>
  );
}