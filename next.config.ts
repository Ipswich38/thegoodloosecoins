import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Disable ESLint during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Image optimization
  images: {
    domains: [], // Add any external image domains here if needed
    formats: ['image/webp', 'image/avif'],
  },
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Environment variables that can be exposed to the client
  env: {
    NEXT_PUBLIC_APP_NAME: 'The Good Loose Coins',
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
