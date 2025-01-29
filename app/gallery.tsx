"use client";

import Masonry from "./components/justified-grid";

export default function GalleryPage() {
  const images = [
    "/images/006.jpg",
    "/images/003.jpg",
    "/images/002.jpg",
    "/images/001.jpg",
    "/images/004.jpg",
    "/images/007.jpg",
    "/images/009.jpg",
    "/images/008.jpg",
    "/images/005.jpg",
  ];

  const sizes = {
    "/images/006.jpg": [1757, 835],
    "/images/003.jpg": [1512, 1009],
    "/images/002.jpg": [2016, 1512],
    "/images/001.jpg": [2016, 1512],
    "/images/004.jpg": [2016, 1512],
    "/images/007.jpg": [1940, 1455],
    "/images/009.jpg": [2016, 1512],
    "/images/008.jpg": [1943, 1458],
    "/images/005.jpg": [2016, 1134],
  } as Record<string, [number, number]>;

  return <Masonry images={images} sizes={sizes} />;
}
