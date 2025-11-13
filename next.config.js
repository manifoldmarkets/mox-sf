const redirects = {
  '/apply': 'https://airtable.com/appkHZ2UvU6SouT5y/pagGp5iw06B9Fc57g/form',
  '/submit-hack':
    'https://airtable.com/appNJwWpcxwIbW89F/pagQzXpkrwU7VMYzx/form',
  '/discord': 'https://discord.gg/jZHTRHUWy9',
  '/substack': 'https://moxsf.substack.com/',
  // '/people':
  //   'https://airtable.com/appkHZ2UvU6SouT5y/shrScGCEpYDJHG4m5/tbl3mg59vE4hyDveG',
  '/host-event':
    'https://airtable.com/appkHZ2UvU6SouT5y/pagHlAqA2JFG7nNP2/form',
  '/feedback': 'https://airtable.com/appkHZ2UvU6SouT5y/pagnAzfmwXz1SvOID/form',
  '/fund':
    'https://moxsf.notion.site/Mox-Fund-for-massive-public-good-24e54492ea7a80a78e10d9dd9c149619',
  '/populi':
    'https://moxsf.notion.site/Mox-Populi-26954492ea7a80f7820ec2f5c237b212',
  '/guest': '/guests',

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
