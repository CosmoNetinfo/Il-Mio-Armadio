'use client';
import React from 'react';
import { User, Settings } from 'lucide-react';
import Link from 'next/link';

const Header = () => {
  
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px',
      background: 'transparent'
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <img src="/favicon.png" alt="" width={32} height={32} style={{ borderRadius: '8px' }} />
        <h1 style={{ margin: 0, fontSize: 'clamp(15px, 4vw, 22px)', whiteSpace: 'nowrap' }}>IL MIO <span className="text-gradient">ARMADIO</span></h1>
      </Link>
      <div style={{ display: 'flex', gap: '16px' }}>
        <Link href="/profile">
          <div className="glass" style={{ width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <User size={20} />
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
