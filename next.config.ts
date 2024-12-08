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
        hostname: 'bafkreib5y5hapzlhjitu6ytz2f6c5c2tyoqxpqqbuh2ziheqmd25quad5u.ipfs.nftstorage.link',
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
