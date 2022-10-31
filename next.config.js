/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['lh3.googleusercontent.com', 'uas.edu.kw', 'i.imgur.com']
  }
}

module.exports = nextConfig
