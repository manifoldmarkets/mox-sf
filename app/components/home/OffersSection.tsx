import { HomeContent } from '@/app/lib/homeContent'

interface Props {
  content: HomeContent
  theme?: 'default' | 'punk' | 'dinosaur' | 'olde' | 'cs'
}

export default function OffersSection({ content, theme = 'default' }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 bg-opacity-95 dark:bg-opacity-95 p-6 shadow-xl rounded-3xl flex flex-col">
      <img
        src={content.offersImage}
        alt="Mox space"
        className="w-full h-48 object-cover rounded-2xl mb-4"
      />
      <p className="text-base text-gray-700 dark:text-gray-200 mb-6 leading-relaxed text-center">
        {content.offersText}
      </p>

      <div className="flex flex-col gap-2">
        <a
          href={content.ctaButtons.primary.href}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 text-sm text-center bg-amber-800 dark:bg-amber-700 text-white font-semibold hover:bg-amber-900 dark:hover:bg-amber-800 transition-colors rounded-full"
        >
          {content.ctaButtons.primary.text}
        </a>
        <a
          href={content.ctaButtons.secondary.href}
          className="px-6 py-3 text-sm text-center bg-white dark:bg-gray-700 border-2 border-amber-800 dark:border-amber-700 text-amber-800 dark:text-amber-300 font-semibold hover:bg-amber-50 dark:hover:bg-gray-600 transition-colors rounded-full"
        >
          {content.ctaButtons.secondary.text}
        </a>
        <a
          href={content.ctaButtons.tertiary.href}
          className="px-6 py-3 text-sm text-center bg-white dark:bg-gray-700 border-2 border-amber-800 dark:border-amber-700 text-amber-800 dark:text-amber-300 font-semibold hover:bg-amber-50 dark:hover:bg-gray-600 transition-colors rounded-full"
        >
          {content.ctaButtons.tertiary.text}
        </a>
      </div>
    </div>
  )
}
