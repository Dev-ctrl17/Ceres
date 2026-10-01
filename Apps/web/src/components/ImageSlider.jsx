import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PLACEHOLDER_IMAGE = 'https://lrmljudwbzjawafuztwp.supabase.co/storage/v1/object/public/property-images/placeholders/property-image-placeholder.svg';
const LOCAL_PLACEHOLDER_IMAGE = '/property-image-placeholder.svg';

const ImageSlider = ({ images, onSlideChange, alt = 'Property photo' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [failedImages, setFailedImages] = useState(() => new Map());
  const galleryImages = images?.length ? images : [null];

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
    onSlideChange?.(index);
  }, [onSlideChange]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev === 0 ? galleryImages.length - 1 : prev - 1;
      onSlideChange?.(next);
      return next;
    });
  }, [galleryImages.length, onSlideChange]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev === galleryImages.length - 1 ? 0 : prev + 1;
      onSlideChange?.(next);
      return next;
    });
  }, [galleryImages.length, onSlideChange]);

  useEffect(() => {
    if (isHovering) return;
    const interval = setInterval(() => {
      goToNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovering, goToNext]);

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {galleryImages.map((src, index) => {
        const stage = failedImages.get(index) || (src ? 'original' : 'placeholder');
        const imageSrc = stage === 'original' ? src : stage === 'local' ? LOCAL_PLACEHOLDER_IMAGE : PLACEHOLDER_IMAGE;
        return (
          <img
            key={index}
            src={imageSrc}
            alt={stage === 'original' ? alt : 'Property photo coming soon'}
            width={1200}
            height={675}
            loading={index === currentIndex ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => {
              setFailedImages((previous) => new Map(previous).set(index, stage === 'original' ? 'placeholder' : 'local'));
            }}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-800 ease-in-out"
            style={{
              opacity: index === currentIndex ? 1 : 0,
              zIndex: index === currentIndex ? 1 : 0,
            }}
          />
        );
      })}

      {/* Navigation Arrows - only show if more than 1 image */}
      {galleryImages.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goToPrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors text-white"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors text-white"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dot Indicators - only show if more than 1 image */}
      {galleryImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {galleryImages.map((_, index) => (
            <button
              key={index}
              onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white w-5'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageSlider;