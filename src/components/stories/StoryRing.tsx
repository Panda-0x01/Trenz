'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus } from 'lucide-react';

interface StoryRingProps {
  user: any;
  hasStories?: boolean;
  isOwnStory?: boolean;
  onClick: () => void;
}

export default function StoryRing({ user, hasStories = false, isOwnStory = false, onClick }: StoryRingProps) {
  return (
    <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={onClick}>
      <div className={`relative ${hasStories ? 'p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-full' : ''}`}>
        <Avatar className={`${hasStories ? 'border-2 border-white' : ''} h-16 w-16`}>
          <AvatarImage src={user.profileImageUrl} />
          <AvatarFallback className="bg-gray-100">
            {(user.displayName || user.username).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {isOwnStory && !hasStories && (
          <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-white">
            <Plus className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
      
      <span className="text-xs text-center max-w-[70px] truncate">
        {isOwnStory ? 'Your story' : (user.displayName || user.username)}
      </span>
    </div>
  );
}