import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSlider = ({ slides, onSlideChange }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState({});
  const loadedRef = useRef(false);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
    onSlideChange?.(index);
  }, [onSlideChange]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev === 0 ? slides.length - 1 : prev - 1;
      onSlideChange?.(next);
      return next;
    });
  }, [slides.length, onSlideChange]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev === slides.length - 1 ? 0 : prev + 1;
      onSlideChange?.(next);
      return next;
    });
  }, [slides.length, onSlideChange]);

  // Preload adjacent slides for smoother transitions without affecting LCP
  useEffect(() => {
    if (!slides || slides.length === 0 || loadedRef.current) return;
    
    // Preload the next slide's image (skip first slide - it's already preloaded in HTML)
    const preloadNext = new window.Image();
    const nextIndex = currentIndex === slides.length - 1 ? 0 : currentIndex + 1;
    preloadNext.src = slides[nextIndex].image;
    
    loadedRef.current = true;
  }, [slides, currentIndex]);

  useEffect(() => {
    if (isHovering) return;
    const interval = setInterval(() => {
      goToNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovering, goToNext]);

  const handleImageLoad = useCallback((index) => {
    setImagesLoaded(prev => ({ ...prev, [index]: true }));
  }, []);

  if (!slides || slides.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .slide-title { animation: fadeInLeft 0.8s ease-out 0.3s both; }
        .slide-subtitle { animation: fadeInRight 0.8s ease-out 0.5s both; }
        .slide-cta { animation: fadeInUp 0.8s ease-out 0.7s both; }
        
        /* Image transition optimization */
        .hero-slide-img {
          transition: opacity 0.8s ease-in-out;
        }
        .hero-slide-img.loading {
          opacity: 0;
        }
        .hero-slide-img.loaded {
          opacity: 1;
        }
      `}</style>

      <div
        className="relative w-full h-full overflow-hidden"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className="hero-slide"
            style={{
              zIndex: index === currentIndex ? 1 : 0,
            }}
          >
            {/* 
              LCP Optimization: Use semantic <img> instead of CSS background-image
              - First slide uses fetchpriority="high" for immediate discovery
              - All slides use loading="eager" (not lazy) since hero images are above the fold
              - decoding="async" allows the browser to decode the image off the main thread
              - width/height prevent CLS
            */}
            <img
              src={slide.image}
              alt={slide.title || `Luxury real estate slide ${index + 1}`}
              className={`hero-slide-img w-full h-full object-cover ${imagesLoaded[index] ? 'loaded' : 'loading'}`}
              fetchpriority={index === 0 ? 'high' : 'auto'}
              loading="eager"
              decoding="async"
              width="1920"
              height="1080"
              onLoad={() => handleImageLoad(index)}
              onError={() => handleImageLoad(index)}
              style={{
                position: 'absolute',
                inset: 0,
              }}
            />
          </div>
        ))}

        {/* Mobile-only background overlay for text readability */}
        <div className="absolute inset-0 z-[5] bg-black/30 md:bg-transparent" />

        {/* Navigation Arrows */}
        <button
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors text-white hidden md:block"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors text-white hidden md:block"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Caption Overlay - hidden on mobile */}
        <div className="absolute inset-0 z-[15] flex items-center justify-start px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full left-1/2 -translate-x-1/2 hidden md:flex pointer-events-none">
          <div
            key={currentIndex}
            className="max-w-3xl bg-black/50 backdrop-blur-sm p-8 md:p-10 rounded-2xl pointer-events-auto"
          >
            <h1 className="slide-title text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
              {slides[currentIndex].title}
            </h1>
            <p className="slide-subtitle text-lg md:text-xl text-slate-200 mb-8 max-w-2xl leading-relaxed">
              {slides[currentIndex].subtitle}
            </p>
            <Link
              to={slides[currentIndex].ctaLink}
              className="slide-cta inline-flex items-center bg-primary text-primary-foreground font-semibold px-8 h-[52px] text-base transition-colors hover:bg-primary/90 rounded-lg"
            >
              {slides[currentIndex].ctaText}
            </Link>
          </div>
        </div>

        {/* Dot Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[16] flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-primary w-6'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default HeroSlider;