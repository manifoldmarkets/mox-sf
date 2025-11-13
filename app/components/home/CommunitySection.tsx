import { HomeContent } from '@/app/lib/homeContent'

interface Props {
  content: HomeContent
  theme?: 'default' | 'punk' | 'dinosaur' | 'olde' | 'cs'
}

export default function CommunitySection({ content, theme = 'default' }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 bg-opacity-95 dark:bg-opacity-95 p-6 shadow-xl rounded-3xl">
      <img
        src={content.communityImage}
        alt="Mox community"
        className="w-full h-48 object-cover rounded-2xl mb-4"
      />
      <p className="text-base text-gray-700 dark:text-gray-200 mb-4 text-center font-semibold">
        {content.communityTitle}
      </p>

      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {content.communityTags.map((tag) => (
          <div
            key={tag}
            className="bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 px-3 py-1 rounded-full"
          >
            <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm whitespace-nowrap">
              {tag}
            </p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <a
          href="#people"
          className="text-sm text-amber-800 dark:text-yellow-500 hover:text-amber-900 dark:hover:text-yellow-400 underline decoration-dotted underline-offset-2"
        >
          {content.communityLink}
        </a>
      </div>
    </div>
  )
}
