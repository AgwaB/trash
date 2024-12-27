import type { NextConfig } from "next";
import webpack from 'webpack';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
        buffer: require.resolve('buffer/'),
        fs: false,
        path: false,
        os: false,
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser'
        })
      );
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
      },
      {
        protocol: 'http',
        hostname: '*',
      },
    ],
    unoptimized: true,
    domains: [
      'arweave.net',
      'www.arweave.net',
      'cdn.helius-rpc.com',
    ],
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  serverRuntimeConfig: {
    maxDuration: 60,
  }
};

export default nextConfig;
