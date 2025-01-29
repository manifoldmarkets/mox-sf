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

  return <Masonry images={images} />;
}
