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
    minimumCacheTTL: 60 * 60 * 24, // Cache images for 24 hours
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
  
  // Webpack configuration for compatibility and optimization
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

    // Enable persistent caching for faster rebuilds
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    };

    // Enable code splitting optimizations
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 10,
        maxAsyncRequests: 10,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
      runtimeChunk: 'single',
    };

    return config;
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})(nextConfig);
