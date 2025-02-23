/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: async () => {
    return [
      {
        source: '/apply',
        destination:
          'https://airtable.com/appkHZ2UvU6SouT5y/pagGp5iw06B9Fc57g/form',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
