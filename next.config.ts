import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'arweave.net',
      },
      {
        protocol: 'https',
        hostname: '**.ipfs.nftstorage.link',
      },
      {
        protocol: 'https',
        hostname: '**.ipfs.dweb.link',
      },
      {
        protocol: 'https',
        hostname: 'static.getgrass.io',
      },
      {
        protocol: 'https',
        hostname: 'metadata.degods.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'shdw-drive.genesysgo.net',
      }
    ],
    unoptimized: true
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
