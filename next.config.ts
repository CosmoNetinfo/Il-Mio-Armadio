import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/__/auth/:path*',
        destination: 'https://il-mio-armadio.firebaseapp.com/__/auth/:path*',
      },
    ];
  },
};

export default nextConfig;
