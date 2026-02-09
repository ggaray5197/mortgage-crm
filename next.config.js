/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  // Force dynamic rendering for all pages
  output: 'standalone',
}

module.exports = nextConfig
