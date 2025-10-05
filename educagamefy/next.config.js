/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', 
    },
  },

  api: {
    bodyParser: false,
  },
};

module.exports = nextConfig;
