'use client'

import Masonry from './components/justified-grid'

export default function GalleryPage() {
  const images = [
    '/images/021.jpg',
    '/images/011.jpg',
    '/images/012.jpg',
    '/images/010.jpg',
    '/images/014.jpg',
    '/images/020.jpg',
    '/images/016.jpg',
    '/images/018.jpg',
    '/images/022.jpg',
  ]

  const sizes = {
    '/images/021.jpg': [1757, 835],
    '/images/011.jpg': [1512, 1009],
    '/images/012.jpg': [2016, 1512],
    '/images/013.jpg': [1512, 1512],
    '/images/014.jpg': [2016, 1512],
    '/images/020.jpg': [1940, 1455],
    '/images/016.jpg': [2016, 1512],
    '/images/018.jpg': [1943, 1458],
    '/images/022.jpg': [2016, 1134],
  } as Record<string, [number, number]>

  return <Masonry images={images} sizes={sizes} />
}
