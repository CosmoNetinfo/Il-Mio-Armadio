'use client';
import React from 'react';
import { User, Settings } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const Header = () => {
  const { user } = useAuth();
  
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px',
      background: 'transparent'
    }}>
      <Link href="/">
        <h1 style={{ margin: 0, fontSize: '22px' }}>IL MIO <span className="text-gradient">ARMADIO</span></h1>
      </Link>
      <div style={{ display: 'flex', gap: '16px' }}>
        <Link href="/profile">
          <div className="glass" style={{ width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="profile" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
            ) : (
              <User size={20} />
            )}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
