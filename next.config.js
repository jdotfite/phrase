/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
}
module.exports = nextConfig