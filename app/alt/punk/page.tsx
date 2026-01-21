import Gallery from '@/app/gallery'
import PeopleGallery from '@/app/people-gallery'
import PeoplePage from '@/app/people/page'
import EventsPage from '@/app/events/page'
import { punkContent } from '@/app/lib/homeContent'
import styles from './punk.module.css'

export default function PunkPage() {
  return (
    <div className={styles.punkContainer}>
      <div className={styles.chaosOverlay} />
      
      {/* Punk Hero */}
      <div className="relative min-h-screen flex items-center justify-center px-6 py-16 pb-32">
        <div className="relative z-10 max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className={`text-7xl md:text-9xl font-black mb-8 ${styles.neonText} ${styles.glitchText}`}>
              MOX
            </h1>
            <p className={`text-3xl md:text-4xl mb-4 ${styles.sprayPaint}`}>
              {punkContent.tagline}
            </p>
            <p className="text-xl" style={{ color: '#00ff00' }}>
              <a
                href={punkContent.location}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ textShadow: '0 0 10px #00ff00' }}
              >
                {punkContent.subtitle}
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Chaotic two-column cards */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 -mt-32">
        <div className="grid md:grid-cols-2 gap-8 mb-32">
          {/* Community card - rotated */}
          <div className={`${styles.punkCard} ${styles.rotatedCard} ${styles.textureOverlay} p-6`}
               style={{ borderColor: '#ff00ff' }}>
            <img
              src={punkContent.communityImage}
              alt="Cool people"
              className={`w-full h-48 object-cover mb-4 ${styles.diagonalCut}`}
              style={{ filter: 'contrast(1.2) saturate(1.5)' }}
            />
            <p className="text-2xl mb-4 text-center font-black" style={{ color: '#00ffff' }}>
              {punkContent.communityTitle}
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {punkContent.communityTags.map((tag) => (
                <div key={tag} className={styles.punkTag}>
                  <p className="text-xs px-3 py-1 whitespace-nowrap">{tag}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <a
                href="#people"
                className="text-lg font-black"
                style={{
                  color: '#ffff00',
                  textShadow: '0 0 10px #ffff00, 2px 2px 0 #000'
                }}
              >
                {punkContent.communityLink}
              </a>
            </div>
          </div>

          {/* Offers card - rotated opposite */}
          <div className={`${styles.punkCard} ${styles.textureOverlay} p-6`}
               style={{ 
                 borderColor: '#00ffff',
                 transform: 'rotate(2deg)',
                 animation: 'rotate-chaos 3.5s ease-in-out infinite reverse'
               }}>
            <img
              src={punkContent.offersImage}
              alt="The space"
              className={`w-full h-48 object-cover mb-4 ${styles.diagonalCut}`}
              style={{ filter: 'contrast(1.2) saturate(1.5)' }}
            />
            <p className="text-xl mb-6 text-center font-bold leading-relaxed" style={{ color: '#ff00ff' }}>
              {punkContent.offersText}
            </p>

            <div className="flex flex-col gap-3">
              <a
                href={punkContent.ctaButtons.primary.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.punkButton} px-6 py-4 text-center`}
              >
                {punkContent.ctaButtons.primary.text}
              </a>
              <a
                href={punkContent.ctaButtons.secondary.href}
                className={`${styles.punkButton} px-6 py-3 text-sm text-center`}
                style={{
                  background: 'linear-gradient(135deg, #00ffff 0%, #0080ff 100%)',
                  fontSize: '0.9rem'
                }}
              >
                {punkContent.ctaButtons.secondary.text}
              </a>
              <a
                href={punkContent.ctaButtons.tertiary.href}
                className={`${styles.punkButton} px-6 py-3 text-sm text-center`}
                style={{
                  background: 'linear-gradient(135deg, #ffff00 0%, #ff8800 100%)',
                  fontSize: '0.9rem'
                }}
              >
                {punkContent.ctaButtons.tertiary.text}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Events section */}
      <div className="max-w-4xl mx-auto px-6">
        <section className="mb-16">
          <div className={`${styles.punkCard} ${styles.staticNoise} p-8`} 
               style={{ borderColor: '#ffff00' }}>
            <div className="text-center mb-6">
              <h2 className={`text-5xl font-black mb-2 ${styles.glitchText}`} 
                  style={{ color: '#ff00ff', textShadow: '3px 3px 0 #00ffff' }}>
                {punkContent.eventsTitle}
              </h2>
              <p className="text-lg" style={{ color: '#00ff00' }}>
                {punkContent.eventsSubtitle}
              </p>
            </div>
            <div style={{ filter: 'hue-rotate(270deg) saturate(1.3)' }}>
              <EventsPage />
            </div>
          </div>
        </section>

        {/* People section */}
        <section id="people" className="mb-16">
          <div className="text-center mb-6">
            <h2 className={`text-5xl font-black mb-2 ${styles.neonText}`}
                style={{ transform: 'rotate(-1deg)' }}>
              {punkContent.peopleTitle}
            </h2>
            <p className="text-xl font-bold" style={{ color: '#00ffff' }}>
              {punkContent.peopleSubtitle}
            </p>
          </div>
          <div style={{ filter: 'contrast(1.1) saturate(1.2)' }}>
            <PeopleGallery />
          </div>
        </section>

        <section className="mb-16">
          <PeoplePage />
        </section>

        {/* Gallery */}
        <section className="mb-16">
          <div className="text-center mb-6">
            <h2 className={`text-5xl font-black mb-2`}
                style={{ 
                  color: '#ffff00',
                  textShadow: '3px 3px 0 #ff00ff, -2px -2px 0 #00ffff',
                  transform: 'rotate(1deg)'
                }}>
              {punkContent.galleryTitle}
            </h2>
            <p className="text-xl font-bold" style={{ color: '#00ffff' }}>
              {punkContent.gallerySubtitle}
            </p>
          </div>
          <div style={{ filter: 'contrast(1.2) saturate(1.3)' }}>
            <Gallery />
          </div>
        </section>
      </div>

      {/* Punk Footer */}
      <footer className="mt-24 border-t-4 py-12"
              style={{ 
                borderColor: '#ff00ff',
                background: 'rgba(20, 20, 20, 0.95)'
              }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-lg mb-2" style={{ color: '#00ffff' }}>
            {punkContent.footerText.includes('Manifund') ? (
              <>
                Powered by{' '}
                <a
                  href="https://manifund.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-black hover:underline"
                  style={{ color: '#ff00ff', textShadow: '0 0 10px #ff00ff' }}
                >
                  Manifund
                </a>
              </>
            ) : (
              punkContent.footerText
            )}
          </p>
          <p style={{ color: '#ffff00' }}>
            Questions? Hit up{' '}
            <a
              href={`mailto:${punkContent.footerContact}`}
              className="font-black hover:underline"
              style={{ textShadow: '0 0 10px #ffff00' }}
            >
              {punkContent.footerContact}
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
