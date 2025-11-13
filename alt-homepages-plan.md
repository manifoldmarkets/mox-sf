# Alternative Homepages Implementation Plan

## Phase 1: Refactor Current Homepage for Reusability

### Extract Shared Components
1. Create `app/components/home/` directory structure
2. Extract reusable sections into components:
   - `HeroSection.tsx` - Hero with logo/tagline
   - `CommunitySection.tsx` - "We bring together" card
   - `OffersSection.tsx` - What Mox offers card
   - `EventsSection.tsx` - Already exists, ensure it's importable
   - `PeopleSection.tsx` - Humans of Mox
   - `GallerySection.tsx` - The Space gallery
   - `Footer.tsx` - Footer component

3. Create shared data/content files:
   - `app/lib/homeContent.ts` - Export content objects for each theme
   - Structure: { default, punk, dinosaur, olde, cs }

4. Update `app/page.tsx` to use extracted components with default content

### Commit 1: "Refactor homepage into reusable components"

## Phase 2: Create Punk Zine Theme (/alt/punk)

### Design Elements
- Black background with neon colors (hot pink, electric blue, toxic green)
- Overlapping rotated elements with CSS transforms
- Glitch effects, diagonal cuts, torn paper textures
- GeoCities aesthetic: animated GIFs, marquees, wild fonts
- Comic Sans MS meets Impact meets custom punk fonts
- Spray paint/graffiti style text

### Content Updates
- "Mox is sick as hell!!"
- "Cool people!"
- "Space for your sh*t!"
- "Things going on!"
- "Assholes you'll meet here!"

### Implementation
1. Create `app/alt/punk/page.tsx`
2. Create `app/alt/punk/punk.css` with punk-specific styles
3. Reuse components with punk theme props
4. Add experimental CSS: clip-path, mix-blend-mode, filters

### Commit 2: "Add punk zine alternative homepage at /alt/punk"

## Phase 3: Create Dinosaur Comics Theme (/alt/dinosaur)

### Design Elements
- 6-panel comic layout (2 rows, 3 columns)
- Fixed dinosaur characters in poses (can use placeholder images or CSS art)
- Speech bubbles with black borders
- Simple flat colors (green T-Rex, orange dude, etc.)
- Comic Sans font
- Each "panel" contains a section of content

### Implementation
1. Create `app/alt/dinosaur/page.tsx`
2. Create `app/alt/dinosaur/dinosaur.css`
3. Build grid layout with comic panel styling
4. Add speech bubble components
5. Adapt content to fit comic narrative style

### Commit 3: "Add dinosaur comics alternative homepage at /alt/dinosaur"

## Phase 4: Create Olde English Theme (/alt/olde)

### Design Elements
- Parchment background texture
- Blackletter/Gothic fonts
- Illuminated manuscript style drop caps
- Sepia tones, brown/gold color scheme
- Ornate borders and decorative elements
- Faux medieval language

### Content Updates
- "Ye Olde Mox" header
- "A Guild Hall for Craftsmen and Scholars"
- "Faire Events and Gatherings"
- Anachronistic medieval-speak mixed with modern content

### Implementation
1. Create `app/alt/olde/page.tsx`
2. Create `app/alt/olde/olde.css`
3. Add medieval styling and typography
4. Implement parchment textures and ornate borders

### Commit 4: "Add ye olde alternative homepage at /alt/olde"

## Phase 5: Create 90s CS Professor Theme (/alt/cs)

### Design Elements
- Times New Roman font
- Blue hyperlinks (visited = purple)
- Simple grey background (#C0C0C0)
- Basic HTML tables for layout
- <blink> tag equivalent (CSS animation)
- "Last updated" timestamp
- Hit counter
- Under construction GIF
- Nested bullet points and numbered lists
- Minimal CSS, mostly semantic HTML

### Content Updates
- "Welcome to the Mox Homepage"
- Academic/formal tone
- Bullet-pointed lists of features
- "Research interests" style sections

### Implementation
1. Create `app/alt/cs/page.tsx`
2. Create `app/alt/cs/cs.css` (minimal styling)
3. Use table-based layout structure
4. Add retro academic website elements
5. Include fake visitor counter, last updated date

### Commit 5: "Add 90s CS professor alternative homepage at /alt/cs"

## Phase 6: Add Navigation Between Themes

1. Create theme switcher component
2. Add subtle links on each page to discover alternate versions
3. Consider easter egg approach (Konami code, hidden links)

### Commit 6: "Add theme navigation and easter eggs"

## Technical Notes

- Each theme route gets its own page.tsx
- Share components but override styling via theme props/CSS modules
- Use CSS modules or styled-jsx for theme-specific styles
- Keep content structure similar but allow copy variations
- Ensure all themes are responsive (except maybe CS professor one)
- Test accessibility for each theme