import Gallery from './gallery'
import PeopleGallery from './people-gallery'
import PeoplePage from './people/page'
import EventsPage from './events/page'
import HeroSection from './components/home/HeroSection'
import CommunitySection from './components/home/CommunitySection'
import OffersSection from './components/home/OffersSection'
import MoxFooter from './components/home/MoxFooter'
import { defaultContent } from './lib/homeContent'

export default function Component() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* Hero section */}
      <HeroSection content={defaultContent} />

      {/* Two-column cards */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 -mt-24">
        <div className="grid md:grid-cols-2 gap-6 mb-32">
          <CommunitySection content={defaultContent} />
          <OffersSection content={defaultContent} />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6">
        {/* Events section */}
        <section className="mb-16">
          <div className="bg-white dark:bg-gray-800 p-8 shadow-2xl rounded-3xl border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-amber-900 dark:text-amber-400 font-playfair mb-2">
                {defaultContent.eventsTitle}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {defaultContent.eventsSubtitle}
              </p>
            </div>
            <EventsPage />
          </div>
        </section>

        <section id="people" className="mb-16">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-amber-900 dark:text-amber-400 font-playfair mb-2">
              {defaultContent.peopleTitle}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {defaultContent.peopleSubtitle}
            </p>
          </div>
          <PeopleGallery />
        </section>

        <section className="mb-16">
          <PeoplePage />
        </section>

        <section className="mb-16">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-amber-900 dark:text-amber-400 font-playfair mb-2">
              {defaultContent.galleryTitle}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {defaultContent.gallerySubtitle}
            </p>
          </div>
          <Gallery />
        </section>
      </div>

      <MoxFooter content={defaultContent} />
    </div>
  )
}
