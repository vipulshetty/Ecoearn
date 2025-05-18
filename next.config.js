/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com', // Allow Google profile images
      'cverdfxlzklzckwrvjmo.supabase.co' // Allow Supabase storage images
    ],
  },
}

module.exports = nextConfig
