import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSlider = ({ slides, onSlideChange }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

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

  useEffect(() => {
    if (isHovering) return;
    const interval = setInterval(() => {
      goToNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovering, goToNext]);

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
      `}</style>

      <div
        className="absolute inset-0 z-0"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className="absolute inset-0 w-full h-full transition-opacity duration-800 ease-in-out"
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: index === currentIndex ? 1 : 0,
              zIndex: index === currentIndex ? 1 : 0,
            }}
          />
        ))}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-slate-950/60 mix-blend-multiply z-[2]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-[3]" />

        {/* Navigation Arrows */}
        <button
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors text-white hidden md:block"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors text-white hidden md:block"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Caption Overlay - hidden on mobile */}
        <div className="absolute inset-0 z-[5] flex items-center justify-start px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full left-1/2 -translate-x-1/2 hidden md:flex">
          <div
            key={currentIndex}
            className="max-w-3xl bg-black/50 backdrop-blur-sm p-8 md:p-10 rounded-2xl"
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
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[6] flex gap-2">
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