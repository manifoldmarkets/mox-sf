"use client";

import { useEffect, useState, useRef } from "react";
import NextImage from "next/image";

interface MasonryProps {
  images: string[];
  targetRowHeight?: number;
  sizes?: Record<string, [number, number]>;
}

export default function Masonry({
  images,
  sizes,
  targetRowHeight = 300,
}: MasonryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const initRatios = Object.values(sizes).map(
    ([width, height]) => width / height
  );
  const [imageRatios, setImageRatios] = useState<number[]>(initRatios);
  const [containerWidth, setContainerWidth] = useState(900);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.getBoundingClientRect().width);
      }
    };

    updateContainerWidth();
    window.addEventListener("resize", updateContainerWidth);
    return () => window.removeEventListener("resize", updateContainerWidth);
  }, []);

  // Fancy code to calculate image dimensions, if not provided
  useEffect(() => {
    const loadImages = async () => {
      const ratios = await Promise.all(
        images.map(
          (src) =>
            new Promise<number>((resolve) => {
              const img = new Image();
              img.onload = () => resolve(img.width / img.height);
              img.src = src;
            })
        )
      );
      setImageRatios(ratios);
    };

    if (!sizes) {
      loadImages();
    }
  }, [images]);

  const getRows = () => {
    const rows: { src: string; width: number; height: number }[][] = [];

    // Process images in groups of 3
    for (let i = 0; i < images.length; i += 3) {
      const rowImages = images.slice(i, i + 3);
      const rowRatios = imageRatios.slice(i, i + 3);

      // Skip if we don't have ratio data yet
      if (rowRatios.some((r) => !r)) continue;

      // Calculate row layout
      const spacing = 16; // 4 units of gap (4 * 4px = 16px)
      const availableWidth = containerWidth - spacing * 2; // Account for gaps

      // Initial widths at target height
      const initialWidths = rowRatios.map((ratio) => targetRowHeight * ratio);
      const totalWidth = initialWidths.reduce((sum, w) => sum + w, 0);

      // Scale factor to fit container
      const scale = availableWidth / totalWidth;
      const rowHeight = targetRowHeight * scale;

      // Create row with calculated dimensions
      rows.push(
        rowImages.map((src, j) => ({
          src,
          width: initialWidths[j] * scale,
          height: rowHeight,
        }))
      );
    }

    console.log("rows measured at", rows);

    return rows;
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-2">
      {getRows().map((row, i) => (
        <div key={i} className="flex gap-2">
          {row.map(({ src, width, height }, j) => {
            const isSelected = src === selectedImage;
            const [origWidth, origHeight] = sizes?.[src] || [0, 0];
            if (isSelected) {
              return (
                <NextImage
                  key={j}
                  src={src}
                  alt=""
                  width={origWidth}
                  height={origHeight}
                  className="cursor-pointer fixed inset-0 z-50 w-full h-full object-contain bg-black/90"
                  onClick={() => setSelectedImage(null)}
                />
              );
            }

            return (
              <NextImage
                key={j}
                src={src}
                alt=""
                width={Math.round(width)}
                height={Math.round(height)}
                className={`object-cover cursor-pointer hover:opacity-80`}
                loading="lazy"
                onClick={() => setSelectedImage(isSelected ? null : src)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
