/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['page.mdx', 'page.md', 'page.jsx', 'page.js', 'page.tsx', 'page.ts'],
  env: {
    RPC_ENDPOINT: process.env.RPC_ENDPOINT,

    CHAIN_ID: process.env.CHAIN_ID,
    BECH32_PREFIX: process.env.BECH32_PREFIX,

    DENOM: process.env.DENOM,
    DECIMALS: process.env.DECIMALS,
    MINIMAL_DENOM: process.env.MINIMAL_DENOM,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/portfolio',
        permanent: true,
      },
    ]
  },
  experimental: {
    forceSwcTransforms: true,
  },
}

module.exports = nextConfig
