import Gallery from '@/app/gallery'
import PeopleGallery from '@/app/people-gallery'
import { oldeContent } from '@/app/lib/homeContent'
import styles from './olde.module.css'

export default function OldePage() {
  return (
    <div className={styles.oldeContainer}>
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center px-6 py-16 pb-32">
        <div className="relative z-10 max-w-4xl w-full">
          <div className={`${styles.parchment} ${styles.vineDeco} p-12`}>
            <h1 className={styles.illuminated} style={{ textAlign: 'center' }}>
              MOX
            </h1>
            <div className={styles.ornament}>❦ ❧ ❦</div>
            <p className={`${styles.gothicText} text-2xl text-center mb-8`}>
              {oldeContent.tagline}
            </p>
            <p className="text-center text-lg">
              <a
                href={oldeContent.location}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-wavy"
                style={{ color: '#8b0000' }}
              >
                {oldeContent.subtitle}
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Cards */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 -mt-24 mb-32">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Community Card */}
          <div className={`${styles.parchment} p-8`}>
            <img
              src={oldeContent.communityImage}
              alt="Guild members"
              className={`w-full h-48 object-cover mb-6 ${styles.manuscriptBorder}`}
            />
            <h3 className={`${styles.ornateTitle} text-2xl mb-4`}>
              {oldeContent.communityTitle}
            </h3>

            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {oldeContent.communityTags.map((tag) => (
                <div key={tag} className={styles.sealBadge}>
                  <p className="text-xs">{tag}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <a
                href="#people"
                className={`${styles.rubrication} underline decoration-double`}
              >
                {oldeContent.communityLink}
              </a>
            </div>
          </div>

          {/* Offers Card */}
          <div className={`${styles.parchment} p-8`}>
            <img
              src={oldeContent.offersImage}
              alt="The guild hall"
              className={`w-full h-48 object-cover mb-6 ${styles.manuscriptBorder}`}
            />
            <p className={`${styles.oldeParagraph} text-lg mb-8`}>
              <span className={styles.dropCap}>M</span>
              {oldeContent.offersText.substring(1)}
            </p>

            <div className="flex flex-col gap-3">
              <a
                href={oldeContent.ctaButtons.primary.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.scrollButton}
                style={{ width: '100%', textAlign: 'center' }}
              >
                {oldeContent.ctaButtons.primary.text}
              </a>
              <a
                href={oldeContent.ctaButtons.secondary.href}
                className={styles.scrollButton}
                style={{ width: '100%', textAlign: 'center', fontSize: '0.9rem' }}
              >
                {oldeContent.ctaButtons.secondary.text}
              </a>
              <a
                href={oldeContent.ctaButtons.tertiary.href}
                className={styles.scrollButton}
                style={{ width: '100%', textAlign: 'center', fontSize: '0.9rem' }}
              >
                {oldeContent.ctaButtons.tertiary.text}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="max-w-4xl mx-auto px-6 mb-16">
        <div className={`${styles.parchment} p-12`}>
          <h2 className={`${styles.ornateTitle} text-4xl`}>
            {oldeContent.eventsTitle}
          </h2>
          <div className={styles.ornament}>❧</div>
          <p className="text-center text-lg mb-8" style={{ fontStyle: 'italic' }}>
            {oldeContent.eventsSubtitle}
          </p>
          <div className={styles.illuminatedBorder}>
            <p style={{ textAlign: 'center' }}><a href="/events" style={{ color: '#5c4033' }}>View ye olde events →</a></p>
          </div>
        </div>
      </div>

      {/* People Section */}
      <div className="max-w-4xl mx-auto px-6 mb-16" id="people">
        <div className={`${styles.parchment} p-12`}>
          <h2 className={`${styles.ornateTitle} text-4xl`}>
            {oldeContent.peopleTitle}
          </h2>
          <div className={styles.ornament}>❦</div>
          <p className="text-center text-lg mb-8" style={{ fontStyle: 'italic' }}>
            {oldeContent.peopleSubtitle}
          </p>
          <PeopleGallery />
        </div>
      </div>

      {/* People List */}
      <div className="max-w-4xl mx-auto px-6 mb-16">
        <div className={`${styles.parchment} p-8`}>
          <p style={{ textAlign: 'center' }}><a href="/people" style={{ color: '#5c4033' }}>View all denizens →</a></p>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="max-w-4xl mx-auto px-6 mb-16">
        <div className={`${styles.parchment} p-12`}>
          <h2 className={`${styles.ornateTitle} text-4xl`}>
            {oldeContent.galleryTitle}
          </h2>
          <div className={styles.ornament}>❧</div>
          <p className="text-center text-lg mb-8" style={{ fontStyle: 'italic' }}>
            {oldeContent.gallerySubtitle}
          </p>
          <Gallery />
        </div>
      </div>

      {/* Footer */}
      <footer className="py-16" style={{ background: '#e8dcc8', borderTop: '4px solid #8b7355' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className={styles.ornament}>❦ ❧ ❦</div>
          <p className="text-lg mb-4">
            <span className={styles.rubrication}>{oldeContent.footerText.split('Manifund')[0]}</span>
            <a
              href="https://manifund.org"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.rubrication} underline decoration-double`}
            >
              Manifund
            </a>
          </p>
          <p className="text-base">
            <span className={styles.capitalLetter}>F</span>or Inquiries, Adreſs thy Meſſages to{' '}
            <a
              href={`mailto:${oldeContent.footerContact}`}
              className={`${styles.rubrication} underline`}
            >
              {oldeContent.footerContact}
            </a>
          </p>
          <div className={styles.ornament} style={{ marginTop: '2rem' }}>❦</div>
        </div>
      </footer>
    </div>
  )
}
