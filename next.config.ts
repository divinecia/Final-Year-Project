import type {NextConfig} from 'next';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fonts.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  
  // External packages that should not be bundled
  serverExternalPackages: [
    'genkit',
    '@genkit-ai/googleai',
    '@genkit-ai/firebase',
    '@genkit-ai/next',
    '@opentelemetry/exporter-jaeger',
    'handlebars',
  ],
  
  // Webpack configuration for compatibility
  webpack: (config, { isServer }) => {
    // Handle handlebars and Node.js modules for client builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        os: false,
      };
    }
    
    // Exclude AI/Genkit modules from client bundle
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push(
        'genkit',
        '@genkit-ai/googleai',
        '@genkit-ai/firebase',
        '@genkit-ai/next',
        '@opentelemetry/exporter-jaeger',
        'handlebars'
      );
    }
    
    return config;
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})(nextConfig);
