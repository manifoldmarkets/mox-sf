# Mox Alternative Homepage Themes

This project includes multiple alternative homepage designs, each with a unique visual style and personality.

## Available Themes

### 1. Default Theme (`/`)
**Location:** `/`
**Style:** Clean, modern, professional
- Amber and slate color scheme
- Dark mode support
- Rounded corners and smooth transitions
- Professional imagery and copy

### 2. Punk Zine Theme (`/alt/punk`)
**Location:** `/alt/punk`
**Style:** Black neon GeoCities chaos
- Black background with neon pink, cyan, and yellow colors
- Glitch effects and animations
- Rotated, overlapping card layouts
- Diagonal cuts and experimental CSS
- Punk attitude copy: "Mox is sick as hell!!"
- Comic Sans meets Impact typography
- Spray paint aesthetic with overlapping textures

### 3. Dinosaur Comics Theme (`/alt/dinosaur`)
**Location:** `/alt/dinosaur`
**Style:** Ryan North's Dinosaur Comics inspired
- 6-panel comic strip layout
- Speech bubbles and thought bubbles
- Comic Sans MS font throughout
- Flat bright colors (green T-Rex, orange raptor, blue dromiceiomimus)
- Dinosaur emoji characters
- Narrative-driven content presentation
- Classic webcomic aesthetic

### 4. Ye Olde Medieval Theme (`/alt/olde`)
**Location:** `/alt/olde`
**Style:** Illuminated manuscript meets medieval website
- Parchment background with texture effects
- Illuminated manuscript styling with drop caps
- Blackletter (UnifrakturMaguntia) and Cinzel fonts
- Ornate borders and decorative elements
- Medieval language with long-s (ſ) characters
- Sepia, brown, and gold color scheme
- Wax seal badges for community tags
- Fleurons (❦ ❧) as decorative elements

### 5. 90s CS Professor Theme (`/alt/cs`)
**Location:** `/alt/cs`
**Style:** Academic homepage from 1997
- Times New Roman font throughout
- Grey background (#C0C0C0)
- Blue hyperlinks (#0000EE), purple for visited (#551A8B)
- Table-based layout (authentic 90s HTML)
- Working visitor counter with pseudo-random numbers
- "Last updated" timestamp
- Minimal CSS, semantic HTML focus
- Academic/formal tone
- "Best viewed with Netscape Navigator 4.0 or higher" footer
- Blinking dot indicator
- Classic button styles with outset borders

## Implementation Details

### Architecture
All themes share:
- The same underlying content (people, events, gallery)
- Reusable React components
- Content configuration system (`app/lib/homeContent.ts`)
- Individual styling via CSS modules

### Content Configuration
Each theme has its own content object in `app/lib/homeContent.ts`:
- `defaultContent` - Professional, modern copy
- `punkContent` - Edgy, rebellious copy
- `dinosaurContent` - Playful, prehistoric themes
- `oldeContent` - Medieval language and formality
- `csContent` - Academic, research-focused language

### Component Structure
```
app/
├── components/home/       # Reusable homepage components
│   ├── HeroSection.tsx
│   ├── CommunitySection.tsx
│   ├── OffersSection.tsx
│   └── MoxFooter.tsx
├── lib/
│   └── homeContent.ts     # Theme content configurations
├── page.tsx               # Default homepage
└── alt/                   # Alternative themes
    ├── punk/
    │   ├── page.tsx
    │   └── punk.module.css
    ├── dinosaur/
    │   ├── page.tsx
    │   └── dinosaur.module.css
    ├── olde/
    │   ├── page.tsx
    │   └── olde.module.css
    └── cs/
        ├── page.tsx
        └── cs.module.css
```

## Design Philosophy

Each theme demonstrates a different approach to web design:

1. **Default** - Modern best practices, accessibility, professionalism
2. **Punk** - Experimental CSS, maximalist design, breaking conventions
3. **Dinosaur** - Narrative structure, comic aesthetics, character-driven
4. **Olde** - Historical design language, decorative elements, anachronism
5. **CS** - Minimalism, table layouts, authenticity to an era

## Easter Eggs

- The punk theme has animated glitch effects and rotating cards
- The dinosaur theme includes T-Rex wisdom about community
- The olde theme uses authentic medieval typography characters
- The CS theme includes a working visitor counter that changes each visit
- All themes maintain full functionality (events, people directory, gallery)

## Future Enhancements

Potential additions:
- Theme switcher component for easy navigation between styles
- More themes (brutalist, vaporwave, terminal/hacker, art deco, etc.)
- User preference persistence
- Konami code to unlock hidden themes
- Randomized theme selection

## Credits

Designed and implemented by Codebuff 🤖
Concept inspired by the rich diversity of web design aesthetics throughout history.
