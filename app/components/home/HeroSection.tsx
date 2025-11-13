import { HomeContent } from '@/app/lib/homeContent'

interface Props {
  content: HomeContent
  theme?: 'default' | 'punk' | 'dinosaur' | 'olde' | 'cs'
}

export default function HeroSection({ content, theme = 'default' }: Props) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-16 pb-32">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5 dark:invert"
        style={{ backgroundImage: 'url(/images/mox_sketch.png)' }}
      />
      <div className="relative z-10 max-w-4xl w-full">
        <div className="text-center mb-12">
          <img
            src="/images/mox_logo_text.svg"
            alt="Mox"
            className="mx-auto mb-8 w-full max-w-md dark:invert"
          />
          <p className="text-xl mb-4 leading-relaxed">
            <b>
              <em>{content.tagline}</em>
            </b>
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            <a
              href={content.location}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-800 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 underline decoration-dotted underline-offset-2"
            >
              {content.subtitle}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
