import { HomeContent } from '@/app/lib/homeContent'

interface Props {
  content: HomeContent
  theme?: 'default' | 'punk' | 'dinosaur' | 'olde' | 'cs'
}

export default function MoxFooter({ content, theme = 'default' }: Props) {
  return (
    <footer className="mt-24 border-t border-gray-200 dark:border-gray-700 py-12 bg-white dark:bg-gray-800">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          {content.footerText.includes('Manifund') ? (
            <>
              A project of{' '}
              <a
                href="https://manifund.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-800 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 underline decoration-dotted underline-offset-2"
              >
                Manifund
              </a>
            </>
          ) : (
            content.footerText
          )}
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Questions? Contact{' '}
          <a
            href={`mailto:${content.footerContact}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-800 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 underline decoration-dotted underline-offset-2"
          >
            {content.footerContact}
          </a>
        </p>
      </div>
    </footer>
  )
}
