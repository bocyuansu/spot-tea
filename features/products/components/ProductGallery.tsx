'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

type ProductGalleryProps = {
  images: string[];
  alt: string;
};

export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeImage = images[selectedIndex];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
            <Leaf className="size-16" />
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`檢視第 ${index + 1} 張圖片`}
              className={cn(
                'relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10',
                index === selectedIndex && 'ring-2 ring-primary',
              )}
            >
              <Image
                src={image}
                alt={`${alt} 縮圖 ${index + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
