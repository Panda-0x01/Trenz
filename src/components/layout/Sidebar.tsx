'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  Search, 
  Compass, 
  Film, 
  MessageCircle, 
  Heart, 
  PlusSquare,
  User,
  Menu,
  LogOut,
  Settings,
  TrendingUp,
  AlignJustify,
  Trophy,
  PlayCircle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User as UserType } from '@/types';
import api from '@/lib/api';

interface SidebarProps {
  user?: UserType;
  isCollapsed?: boolean;
}

export default function Sidebar({ user, isCollapsed: forceCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(forceCollapsed || false);

  // Update collapsed state when prop changes
  useEffect(() => {
    if (forceCollapsed !== undefined) {
      setIsCollapsed(forceCollapsed);
    }
  }, [forceCollapsed]);

  const handleLogout = async () => {
    await api.logout();
    router.push('/login');
  };

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
      name: 'Explore',
      href: '/explore',
      icon: Compass,
    },
    {
      name: 'Stories',
      href: '/stories',
      icon: PlayCircle,
    },
    {
      name: 'Reels',
      href: '/trends',
      icon: Film,
    },
    {
      name: 'Leaderboard',
      href: '/leaderboard',
      icon: Trophy,
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: MessageCircle,
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Heart,
    },
    {
      name: 'Create',
      href: '/create',
      icon: PlusSquare,
    },
    {
      name: 'Create Trend',
      href: '/create-trend',
      icon: TrendingUp,
    },
  ];

  return (
    <div className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full max-h-screen">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <Link href="/home" className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src="/i2.png" 
                alt="Trenz Logo" 
                className="h-full w-full object-cover rounded-lg"
                onError={(e) => {
                  // Fallback to text if image fails to load
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <div className="hidden w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
            </div>
            {!isCollapsed && (
              <span className="text-2xl font-bold text-black tracking-tight">
                Trenz
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 flex-1 overflow-y-auto scrollbar-hide">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || (item.name === 'Profile' && pathname.includes('/profile'));
              const Icon = item.icon;
              
              return (
                <li key={item.name}>
                  {item.name === 'Profile' && user ? (
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-gray-100 text-black font-semibold' 
                          : 'text-gray-700 hover:bg-gray-50'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                      title={isCollapsed ? item.name : ''}
                    >
                      <Avatar className="h-6 w-6 flex-shrink-0">
                        <AvatarImage src={user.profileImageUrl} alt={user.displayName || user.username} />
                        <AvatarFallback className="bg-purple-600 text-white text-xs">
                          {(user.displayName || user.username).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {!isCollapsed && (
                        <span className="text-base truncate">{item.name}</span>
                      )}
                    </Link>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-gray-100 text-black font-semibold' 
                          : 'text-gray-700 hover:bg-gray-50'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                      title={isCollapsed ? item.name : ''}
                    >
                      <Icon className={`h-6 w-6 flex-shrink-0 ${isActive ? 'text-black' : 'text-gray-700'}`} />
                      {!isCollapsed && (
                        <span className="text-base truncate">{item.name}</span>
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        {user && (
          <div className="p-3 border-t border-gray-100 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`w-full p-3 h-auto ${
                    isCollapsed ? 'justify-center' : 'justify-start'
                  }`}
                  title={isCollapsed ? `${user.displayName || user.username} (@${user.username})` : ''}
                >
                  <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={user.profileImageUrl} alt={user.displayName || user.username} />
                      <AvatarFallback className="bg-purple-600 text-white text-sm">
                        {(user.displayName || user.username).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.displayName || user.username}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          @{user.username}
                        </p>
                      </div>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${user.username}`}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Collapse Toggle - show on desktop only when not forced collapsed */}
        {forceCollapsed === undefined && (
          <div className="p-3 border-t border-gray-100 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsCollapsed(!isCollapsed);
              }}
              className={`w-full hover:bg-gray-100 py-3 px-3 ${
                isCollapsed ? 'justify-center' : 'justify-start'
              }`}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <AlignJustify className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-3 text-base">More</span>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}