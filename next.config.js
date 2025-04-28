/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      },
    ],
  },
  experimental: {
    staleTimes: {
      // Set session cache to expire after 20 seconds
      dynamic: 20,
      static: 20
    }
  },
};

module.exports = nextConfig; 