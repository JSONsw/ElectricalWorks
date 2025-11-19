/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Output standalone for better serverless compatibility
  output: 'standalone',
  // Webpack configuration for sql.js
  webpack: (config, { isServer }) => {
    // Handle sql.js in server-side code
    if (isServer) {
      // Don't externalize sql.js - we need it bundled
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
