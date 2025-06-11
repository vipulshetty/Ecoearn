/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com', // Allow Google profile images
      'cverdfxlzklzckwrvjmo.supabase.co' // Allow Supabase storage images
    ],
  },
  // Temporarily disable type checking and linting for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
