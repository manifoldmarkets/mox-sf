import { Metadata } from 'next'
import Image from 'next/image'
import { getFloors } from '@/app/lib/floors'
import type { Floor } from '@/app/lib/floors'

export const metadata: Metadata = {
  title: 'Floorplans | Mox',
  description: 'Explore the four floors of Mox SF — coworking, private offices, event spaces, and more.',
}

export default async function FloorplansPage() {
  const floors = await getFloors()

  return (
    <div className="min-h-screen bg-background-page dark:bg-background-page-dark text-text-primary dark:text-text-primary-dark">
      {/* Header */}
      <div className="relative py-16 sm:py-20 px-4 sm:px-6 text-center border-b border-gray-200 dark:border-gray-700">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5 dark:invert"
          style={{ backgroundImage: 'url(/images/mox_sketch.png)' }}
        />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-200 font-display mb-4">
            Floorplans
          </h1>
          <p className="text-lg text-text-secondary dark:text-text-secondary-dark max-w-2xl mx-auto">
            Mox occupies four floors at 1680 Mission Street, San Francisco. Each floor has its own
            character — from event spaces on the ground floor to focused work areas above.
          </p>
        </div>
      </div>

      {/* Floors */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-20">
        {floors.map((floor) => (
          <FloorSection key={floor.id} floor={floor} />
        ))}
      </div>
    </div>
  )
}

function FloorSection({ floor }: { floor: Floor }) {
  return (
    <section id={`floor-${floor.number}`}>
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-200 font-display mb-2">
          {floor.name}
        </h2>
        {floor.description && (
          <p className="text-text-secondary dark:text-text-secondary-dark text-base">
            {floor.description}
          </p>
        )}
      </div>

      {/* SVG Floorplan */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-6">
        <div className="p-4 sm:p-6">
          <img
            src={floor.svgPath}
            alt={`${floor.name} floorplan`}
            className="w-full h-auto dark:invert dark:opacity-90"
          />
        </div>
      </div>

      {/* Photos from Airtable */}
      {floor.images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {floor.images.map((img, i) => (
            <div
              key={img.url}
              className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
            >
              <Image
                src={img.url}
                alt={`${floor.name} — photo ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
