export interface HomeContent {
  tagline: string
  subtitle: string
  location: string
  communityTitle: string
  communityImage: string
  communityTags: string[]
  communityLink: string
  offersTitle: string
  offersImage: string
  offersText: string
  ctaButtons: {
    primary: { text: string; href: string }
    secondary: { text: string; href: string }
    tertiary: { text: string; href: string }
  }
  eventsTitle: string
  eventsSubtitle: string
  peopleTitle: string
  peopleSubtitle: string
  galleryTitle: string
  gallerySubtitle: string
  footerText: string
  footerContact: string
}

export const defaultContent: HomeContent = {
  tagline: 'An incubator & community space for doers of good and masters of craft.',
  subtitle: '1680 Mission Street, San Francisco',
  location: 'https://maps.google.com/?q=Mox+1680+Mission+St+San+Francisco',
  communityTitle: 'We bring together:',
  communityImage: '/images/014.jpg',
  communityTags: [
    'AI alignment researchers',
    'Startup founders',
    'Defensive accelerationists',
    'Filmmakers',
    'Writers',
    'High impact nonprofits',
    'Artisans',
    'Figgie players',
    'Policy advocates',
    'Community builders',
    'Members of technical and untechnical staff',
  ],
  communityLink: 'See people at Mox ↓',
  offersTitle: 'What Mox Offers',
  offersImage: '/images/005.jpg',
  offersText:
    'Mox offers all the infrastructure you need for deep work, a rich community atmosphere, and events that you\'ll find meaningful.',
  ctaButtons: {
    primary: { text: 'Apply for membership', href: '/apply' },
    secondary: { text: 'Inquire about offices', href: 'mailto:rachel@moxsf.com' },
    tertiary: { text: 'Buy a day pass', href: '/day-pass' },
  },
  eventsTitle: 'Events',
  eventsSubtitle: "What's happening at Mox",
  peopleTitle: 'Humans of Mox',
  peopleSubtitle: 'The community that makes Mox special',
  galleryTitle: 'The Space',
  gallerySubtitle: 'A glimpse into our home',
  footerText: 'A project of Manifund',
  footerContact: 'rachel@moxsf.com',
}

export const punkContent: HomeContent = {
  tagline: 'Mox is SICK AS HELL!! A space for rebels, makers, and absolute legends.',
  subtitle: '1680 Mission St, SF — come thru',
  location: 'https://maps.google.com/?q=Mox+1680+Mission+St+San+Francisco',
  communityTitle: 'Cool people you\'ll meet:',
  communityImage: '/images/014.jpg',
  communityTags: [
    'AI safety punks',
    'Startup anarchists',
    'Tech accelerationists',
    'Underground filmmakers',
    'Zine writers',
    'Nonprofit rebels',
    'DIY creators',
    'Card sharks',
    'Policy hackers',
    'Community organizers',
    'Chaotic good nerds',
  ],
  communityLink: 'Assholes you\'ll meet here ↓',
  offersTitle: 'What we got',
  offersImage: '/images/005.jpg',
  offersText:
    'Space for your sh*t! Deep work vibes! A community that actually gives a damn! Events that don\'t suck!',
  ctaButtons: {
    primary: { text: 'GET IN', href: '/apply' },
    secondary: { text: 'Office space??', href: 'mailto:rachel@moxsf.com' },
    tertiary: { text: 'Day pass', href: '/day-pass' },
  },
  eventsTitle: 'THINGS GOING ON',
  eventsSubtitle: 'Stuff happening rn',
  peopleTitle: 'THE HUMANS',
  peopleSubtitle: 'These people are cool as hell',
  galleryTitle: 'THE SPACE',
  gallerySubtitle: 'Look at this sick space',
  footerText: 'Powered by Manifund',
  footerContact: 'rachel@moxsf.com',
}

export const dinosaurContent: HomeContent = {
  tagline: 'An incubator where dinosaurs (metaphorically) help you build the future!',
  subtitle: '1680 Mission Street, San Francisco',
  location: 'https://maps.google.com/?q=Mox+1680+Mission+St+San+Francisco',
  communityTitle: 'The fellow dinosaurs you\'ll meet:',
  communityImage: '/images/014.jpg',
  communityTags: [
    'T-Rex startup founders',
    'Velociraptor researchers', 
    'Stegosaurus builders',
    'Pterodactyl visionaries',
    'Triceratops makers',
    'Brachiosaurus thinkers',
  ],
  communityLink: 'See all the dinosaurs!',
  offersTitle: 'What Mox offers',
  offersImage: '/images/005.jpg',
  offersText:
    'A prehistoric space for modern work! Community! Events! Everything a dinosaur needs to thrive in the 21st century!',
  ctaButtons: {
    primary: { text: 'Join the herd!', href: '/apply' },
    secondary: { text: 'Inquire about caves', href: 'mailto:rachel@moxsf.com' },
    tertiary: { text: 'Day pass for dinos', href: '/day-pass' },
  },
  eventsTitle: 'Dinosaur Gatherings',
  eventsSubtitle: 'When dinosaurs convene',
  peopleTitle: 'Our Dinosaurs',
  peopleSubtitle: 'The prehistoric crew',
  galleryTitle: 'The Habitat',
  gallerySubtitle: 'Where dinosaurs roam',
  footerText: 'A project of Manifund',
  footerContact: 'rachel@moxsf.com',
}
