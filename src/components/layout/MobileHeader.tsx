'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Settings, 
  User, 
  LogOut, 
  Bell,
  Bookmark,
  Shield,
  HelpCircle,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { User as UserType } from '@/types';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface MobileHeaderProps {
  user?: UserType;
  title?: string;
  showSearch?: boolean;
}

export default function MobileHeader({ user, title, showSearch = false }: MobileHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await api.logout();
    router.push('/login');
    setIsMenuOpen(false);
  };

  const getPageTitle = () => {
    if (title) return title;
    
    switch (pathname) {
      case '/home':
        return 'Home';
      case '/search':
        return 'Search';
      case '/explore':
        return 'Explore';
      case '/trends':
        return 'Reels';
      case '/leaderboard':
        return 'Leaderboard';
      case '/messages':
        return 'Messages';
      case '/notifications':
        return 'Notifications';
      case '/create':
        return 'Create';
      case '/create-trend':
        return 'Create Trend';
      case '/settings':
        return 'Settings';
      default:
        if (pathname.includes('/profile')) return 'Profile';
        return 'Trenz';
    }
  };

  const menuItems = [
    {
      name: 'Profile',
      href: user ? `/profile/${user.username}` : '/profile',
      icon: User,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
    },
    {
      name: 'Saved Posts',
      href: '/settings?tab=saves',
      icon: Bookmark,
    },
    {
      name: 'Privacy',
      href: '/settings?tab=privacy',
      icon: Shield,
    },
    {
      name: 'Help & Support',
      href: '/settings?tab=help',
      icon: HelpCircle,
    },
  ];

  return (
    <div className="lg:hidden">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left side - Logo or Back */}
          <div className="flex items-center space-x-3">
            <Link href="/home" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="/i2.png" 
                  alt="Trenz Logo" 
                  className="h-full w-full object-cover rounded-lg"
                  onError={(e) => {
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
              <span className="text-xl font-bold text-black">
                {getPageTitle()}
              </span>
            </Link>
          </div>

          {/* Right side - Search and Menu */}
          <div className="flex items-center space-x-2">
            {showSearch && (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/search">
                  <Search className="h-5 w-5" />
                </Link>
              </Button>
            )}
            
            {/* Hamburger Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-3">
                    {user && (
                      <>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.profileImageUrl} />
                          <AvatarFallback className="bg-purple-600 text-white">
                            {(user.displayName || user.username).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <p className="font-semibold">{user.displayName || user.username}</p>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        </div>
                      </>
                    )}
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || 
                      (item.href.includes('?tab=') && pathname === '/settings');
                    
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-gray-100 text-black font-medium' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                <Separator className="my-6" />

                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Log out
                  </Button>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-center text-xs text-muted-foreground">
                    <p>Trenz v1.0.0</p>
                    <p>© 2024 Trenz. All rights reserved.</p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </div>
  );
}