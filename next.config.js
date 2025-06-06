const redirects = {
  '/apply': 'https://airtable.com/appkHZ2UvU6SouT5y/pagGp5iw06B9Fc57g/form',
  '/submit-hack':
    'https://airtable.com/appNJwWpcxwIbW89F/pagQzXpkrwU7VMYzx/form',
  '/discord': 'https://discord.gg/jZHTRHUWy9',
  // '/people':
  //   'https://airtable.com/appkHZ2UvU6SouT5y/shrScGCEpYDJHG4m5/tbl3mg59vE4hyDveG',
  '/host-event':
    'https://manifoldmarkets.notion.site/Mox-Event-Host-Info-19354492ea7a80359441d2710b91f07a',

  // Endpoints mostly for admin/staff
  '/eventz':
    'https://airtable.com/appkHZ2UvU6SouT5y/tblqzGMNypqO3jftS/viw1hb5Y019dA4NaL?blocks=hide',
}

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
    return Object.entries(redirects).map(([source, destination]) => ({
      source,
      destination,
      permanent: false,
    }))
  },
}

module.exports = nextConfig
