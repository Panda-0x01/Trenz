'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Search, 
  Compass, 
  Film, 
  User,
  Plus,
  Trophy,
  PlayCircle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User as UserType } from '@/types';

interface MobileNavigationProps {
  user?: UserType;
}

export default function MobileNavigation({ user }: MobileNavigationProps) {
  const pathname = usePathname();

  const navigationItems = [
    {
      name: 'Home',
      href: '/home',
      icon: Home,
    },
    {
      name: 'Search',
      href: '/search',
      icon: Search,
    },
    {
      name: 'Stories',
      href: '/stories',
      icon: PlayCircle,
    },
    {
      name: 'Create',
      href: '/create',
      icon: Plus,
    },
    {
      name: 'Reels',
      href: '/trends',
      icon: Film,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 min-w-0 flex-1 ${
                isActive ? 'text-black' : 'text-gray-500'
              }`}
            >
              <Icon className={`h-6 w-6 ${isActive ? 'text-black' : 'text-gray-500'}`} />
              <span className="text-xs mt-1 truncate">{item.name}</span>
            </Link>
          );
        })}
        
        {/* Profile */}
        {user && (
          <Link
            href={`/profile/${user.username}`}
            className={`flex flex-col items-center justify-center p-2 min-w-0 flex-1 ${
              pathname.includes('/profile') ? 'text-black' : 'text-gray-500'
            }`}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={user.profileImageUrl} alt={user.displayName || user.username} />
              <AvatarFallback className="bg-purple-600 text-white text-xs">
                {(user.displayName || user.username).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs mt-1 truncate">Profile</span>
          </Link>
        )}
      </div>
    </div>
  );
}