'use client';
import React from 'react';
import { Shirt, Home, Bookmark, Camera } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Closet', icon: Shirt, href: '/closet' },
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Outfits', icon: Bookmark, href: '/outfits' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={24} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
