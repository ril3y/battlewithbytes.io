"use client";

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface ImageWidgetProps extends Omit<ImageProps, 'alt'> {
  alt: string; // Make alt explicitly required
  caption?: string;
  containerClassName?: string; // Optional class for the main wrapper
  imageClassName?: string;   // Optional class for the Next Image component itself
  // Allow any other Next.js ImageProps like priority, quality, fill, sizes, etc.
}

const ImageWidget: React.FC<ImageWidgetProps> = ({
  src,
  alt,
  width,
  height,
  caption,
  containerClassName = '',
  imageClassName = '',
  priority,
  quality,
  fill,
  sizes,
  ...rest
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const openLightbox = () => setIsLightboxOpen(true);
  const closeLightbox = () => setIsLightboxOpen(false);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLightbox();
      }
    };
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isLightboxOpen]);

  // Determine props for Next Image based on whether `fill` is used
  const imageProps: ImageProps = fill 
    ? { src, alt, fill: true, sizes, priority, quality, className: `rounded-lg ${imageClassName}`, ...rest }
    : { src, alt, width, height, priority, quality, className: `rounded-lg ${imageClassName}`, ...rest };

  return (
    <div className={`my-6 ${containerClassName}`}>
      <figure className="relative">
        <div
          className="cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95"
          onClick={openLightbox}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && openLightbox()}
          aria-label={`View larger image: ${alt}`}
        >
          <Image {...imageProps} />
        </div>
        {caption && (
          <figcaption className="mt-2 text-sm text-center text-gray-400 italic">
            {caption}
          </figcaption>
        )}
      </figure>

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4"
          onClick={closeLightbox} // Close on overlay click
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-caption"
          aria-describedby="lightbox-image-description"
        >
          <div
            className="relative max-w-6xl max-h-[95vh] bg-gray-900 p-4 rounded-xl shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the image/modal content
          >
            <button
              onClick={closeLightbox}
              className="absolute -top-3 -right-3 z-10 p-2 bg-gray-800 text-white rounded-full hover:bg-red-600 transition-colors text-2xl leading-none"
              aria-label="Close lightbox"
            >
              &times;
            </button>
            {/* For the lightbox, we typically want the image to scale to fit while maintaining aspect ratio */}
            {/* The parent needs position relative and defined dimensions or aspect ratio. */}
            {/* Changed h-auto to flex-1 to allow this container to grow within the flex-col parent */}
            <div className="relative w-full flex-1 overflow-hidden flex justify-center items-center">
              {/* DEBUG: Using standard img tag for lightbox to bypass Next/Image issues in modal */}
              <img 
                src={src as string} 
                alt={alt} 
                className="object-contain rounded-lg w-full h-full"
                style={{ display: 'block' }} // Ensure it's not display:none by other styles
              />
            </div>
            {caption && (
              <p id="lightbox-caption" className="mt-3 text-base text-center text-gray-200">
                {caption}
              </p>
            )}
            <p id="lightbox-image-description" className="sr-only">{alt}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageWidget;
