import Gallery from '@/app/gallery'
import PeopleGallery from '@/app/people-gallery'
import { dinosaurContent } from '@/app/lib/homeContent'
import styles from './dinosaur.module.css'

export default function DinosaurPage() {
  return (
    <div className={styles.dinoContainer}>
      {/* Comic Title */}
      <div className="py-8">
        <h1 className={styles.comicTitle}>MOX: A DINOSAUR COMIC</h1>
        <p className="text-center text-lg font-bold">About community and collaboration!</p>
      </div>

      {/* Panel 1-3: Introduction */}
      <div className={styles.panelGrid}>
        {/* Panel 1: T-Rex introduces Mox */}
        <div className={styles.comicPanel}>
          <div className={`${styles.dinoCharacter} ${styles.tRexGreen}`}>
            🦖
          </div>
          <div className={styles.speechBubble}>
            <p className={styles.comicText}>
              <span className={styles.boldText}>HEY EVERYONE!</span> Have you heard about Mox? It's this amazing space in San Francisco where people build the future!
            </p>
          </div>
        </div>

        {/* Panel 2: Dromiceiomimus responds */}
        <div className={styles.comicPanel}>
          <div className={`${styles.dinoCharacter} ${styles.dromiceiomimusBlue}`}>
            🦕
          </div>
          <div className={styles.speechBubble}>
            <p className={styles.comicText}>
              That sounds interesting, T-Rex! What kinds of people work there?
            </p>
          </div>
        </div>

        {/* Panel 3: T-Rex explains community */}
        <div className={styles.comicPanel}>
          <div className={`${styles.dinoCharacter} ${styles.tRexGreen}`}>
            🦖
          </div>
          <div className={styles.speechBubble}>
            <p className={styles.comicText}>
              <span className={styles.boldText}>ALL KINDS!</span> AI researchers, startup founders, filmmakers, writers, and more!
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {dinosaurContent.communityTags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.comicTag}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Panel 4: Utahraptor asks about location */}
        <div className={styles.comicPanel}>
          <div className={`${styles.dinoCharacter} ${styles.utahraptorRed}`}>
            🦴
          </div>
          <div className={styles.speechBubble}>
            <p className={styles.comicText}>
              WHERE is this place exactly, T-Rex?
            </p>
          </div>
        </div>

        {/* Panel 5: T-Rex gives location */}
        <div className={styles.comicPanel}>
          <div className={`${styles.dinoCharacter} ${styles.tRexGreen}`}>
            🦖
          </div>
          <div className={styles.speechBubble}>
            <p className={styles.comicText}>
              <a 
                href={dinosaurContent.location}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-bold"
              >
                {dinosaurContent.subtitle}
              </a>
              <br/><br/>
              They have everything you need: deep work spaces, a great community, and meaningful events!
            </p>
          </div>
        </div>

        {/* Panel 6: Call to action */}
        <div className={styles.comicPanel}>
          <div className={`${styles.dinoCharacter} ${styles.raptorOrange}`}>
            🦖
          </div>
          <div className={styles.thoughtBubble}>
            <p className={styles.comicText}>
              <span className={styles.soundEffect}>WOW!</span>
              <br/>
              I should check this out!
            </p>
          </div>
          <div className="mt-16 flex flex-col gap-3">
            <a
              href={dinosaurContent.ctaButtons.primary.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.dinoButton}
            >
              {dinosaurContent.ctaButtons.primary.text}
            </a>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className={styles.comicPanel}>
          <div className={styles.narrationBox}>
            <p className="text-center text-xl font-bold">
              MEANWHILE, AT MOX, EXCITING THINGS ARE HAPPENING...
            </p>
          </div>
          <h2 className="text-4xl font-black text-center my-6">
            {dinosaurContent.eventsTitle}
          </h2>
          <div className={styles.speechBubble}>
            <p><a href="/events" style={{ color: '#000', textDecoration: 'underline' }}>View all events →</a></p>
          </div>
        </div>
      </div>

      {/* People Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className={styles.comicPanel}>
          <h2 className="text-4xl font-black text-center mb-6">
            {dinosaurContent.peopleTitle}
          </h2>
          <div className={styles.speechBubble}>
            <p className={styles.comicText}>
              Look at all these amazing dinosaurs collaborating!
            </p>
          </div>
          <div className="mt-6">
            <PeopleGallery />
          </div>
        </div>
      </div>

      {/* People List */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className={styles.comicPanel}>
          <p><a href="/people" style={{ color: '#000', textDecoration: 'underline' }}>View all members →</a></p>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className={styles.comicPanel}>
          <h2 className="text-4xl font-black text-center mb-6">
            {dinosaurContent.galleryTitle}
          </h2>
          <div className={styles.thoughtBubble}>
            <p className={styles.comicText}>
              This habitat looks incredible for productive work!
            </p>
          </div>
          <div className="mt-16">
            <Gallery />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-12 bg-white border-t-4 border-black">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className={styles.speechBubble}>
            <p className={styles.comicText}>
              <span className={styles.boldText}>THE END!</span>
              <br/><br/>
              This has been a Mox production, brought to you by{' '}
              <a
                href="https://manifund.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-bold"
              >
                Manifund
              </a>
              !
              <br/><br/>
              Questions? Contact{' '}
              <a
                href={`mailto:${dinosaurContent.footerContact}`}
                className="underline font-bold"
              >
                {dinosaurContent.footerContact}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
