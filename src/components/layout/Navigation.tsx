'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Heart, Trophy, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    name: 'Home',
    href: '/home',
    icon: Home,
  },
  {
    name: 'Explore',
    href: '/explore',
    icon: Compass,
  },
  {
    name: 'Interests',
    href: '/interests',
    icon: Heart,
  },
  {
    name: 'Rankings',
    href: '/rankings',
    icon: Trophy,
  },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:relative md:bottom-auto md:border-t-0 md:border-r md:w-64 md:h-screen md:pt-6">
      <div className="flex justify-around items-center h-16 px-4 md:flex-col md:h-auto md:space-y-2 md:justify-start">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Button
              key={item.name}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              asChild
              className={cn(
                'flex-col h-12 w-12 md:w-full md:h-10 md:flex-row md:justify-start',
                isActive && 'bg-primary text-primary-foreground'
              )}
            >
              <Link href={item.href}>
                <Icon className="h-5 w-5 md:mr-3" />
                <span className="text-xs mt-1 md:text-sm md:mt-0">{item.name}</span>
              </Link>
            </Button>
          );
        })}
        
        {/* Create Post Button */}
        <Button
          size="sm"
          className="flex-col h-12 w-12 md:w-full md:h-10 md:flex-row md:justify-start md:mt-4"
          asChild
        >
          <Link href="/create">
            <Plus className="h-5 w-5 md:mr-3" />
            <span className="text-xs mt-1 md:text-sm md:mt-0">Create</span>
          </Link>
        </Button>
      </div>
    </nav>
  );
}