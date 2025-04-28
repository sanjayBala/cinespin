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
      // Set session cache to expire after 15 minutes (900 seconds)
      dynamic: 900,
      static: 900
    }
  },
};

module.exports = nextConfig; 