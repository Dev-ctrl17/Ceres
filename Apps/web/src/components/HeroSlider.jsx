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
              fetchpriority={slide.title === '100% Verified Luxury Properties in Lagos' ? 'high' : 'auto'}
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

        {/* Caption Overlay - responsive for 768px and 1024px */}
        <div className="absolute inset-0 z-[15] hidden md:flex md:items-center md:justify-start md:px-6 lg:px-8 max-w-7xl md:mx-auto w-full md:left-1/2 md:-translate-x-1/2 pointer-events-none">
          <div
            key={currentIndex}
            className="max-w-3xl bg-black/50 md:backdrop-blur-sm p-4 md:p-6 lg:p-10 rounded-xl md:rounded-2xl pointer-events-auto"
          >
            <h1 className="slide-title text-base md:text-lg lg:text-2xl xl:text-3xl 2xl:text-5xl font-extrabold text-white mb-2 md:mb-4 leading-tight">
              {slides[currentIndex].title}
            </h1>
            <p className="slide-subtitle text-xs md:text-sm lg:text-base xl:text-lg text-slate-200 mb-3 md:mb-4 lg:mb-8 max-w-2xl leading-relaxed">
              {slides[currentIndex].subtitle}
            </p>
            <div className="slide-cta flex flex-wrap gap-2 md:gap-3">
              <Link
                to={slides[currentIndex].ctaLink}
                className="inline-flex items-center bg-primary text-primary-foreground font-semibold px-3 md:px-4 lg:px-6 xl:px-8 h-8 md:h-9 lg:h-10 xl:h-[52px] text-xs md:text-sm lg:text-base transition-colors hover:bg-primary/90 rounded-lg"
              >
                {slides[currentIndex].ctaText}
              </Link>
              <a
                href="https://wa.me/2349056201176?text=Hello%20Luxury%20Properties%2C%20I'm%20interested%20in%20luxury%20homes%20in%20Ikoyi%2C%20Banana%20Island%2C%20Parkview%20or%20Victoria%20Island."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 md:gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold px-3 md:px-4 lg:px-6 xl:px-8 h-8 md:h-9 lg:h-10 xl:h-[52px] text-xs md:text-sm lg:text-base rounded-lg transition-colors shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                <span className="hidden md:inline">Chat on WhatsApp</span>
                <span className="md:hidden">WhatsApp</span>
              </a>
            </div>
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