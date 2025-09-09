const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // enable in prod builds
});

module.exports = withPWA({
  reactStrictMode: true,
  experimental: { appDir: true },
});
