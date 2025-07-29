import type {NextConfig} from 'next';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  // Essential optimizations only
  compress: true,
  poweredByHeader: false,
  
  // Allow dev origins for Replit
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // merge any other experimental options here
  },
  
  // Output configuration for deployment
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Build settings
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  
  // Image optimizations
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      }
    ],
  },
  
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Only include essential fixes
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'handlebars': false,
      };
    }

    return config;
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

const withPWAConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

export default withPWAConfig(nextConfig);