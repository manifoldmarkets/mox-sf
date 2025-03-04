/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'v5.airtableusercontent.com',
      },
    ],
  },
  redirects: async () => {
    return [
      {
        source: '/apply',
        destination:
          'https://airtable.com/appkHZ2UvU6SouT5y/pagGp5iw06B9Fc57g/form',
        permanent: false,
      },
      {
        source: '/events',
        destination: 'https://airtable.com/appkHZ2UvU6SouT5y/shrB6kpJ6tH14kU50',
        permanent: false,
      },
      {
        source: '/submit-hack',
        destination:
          'https://airtable.com/appNJwWpcxwIbW89F/pagQzXpkrwU7VMYzx/form',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
