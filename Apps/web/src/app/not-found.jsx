import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Home, Search } from 'lucide-react';

export const metadata = {
  title: '404 - Page Not Found | Luxury Properties Ltd',
  description: 'The page you are looking for does not exist. Browse luxury properties in Lagos, Nigeria or return to our homepage.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-[70vh] flex items-center justify-center py-24">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="text-8xl xs:text-9xl font-bold text-gold-primary/20 mb-6">404</div>
          <h1 className="heading-lg mb-4">Page Not Found</h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. Let us help you find your perfect property.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <button className="bg-gold-primary text-slate-950 px-6 py-3 rounded-lg font-medium hover:bg-gold-primary/90 transition-colors w-full sm:w-auto">
                <Home className="w-5 h-5 inline mr-2" />
                Return Home
              </button>
            </Link>
            <Link to="/properties">
              <button className="border border-gold-primary/50 text-gold-primary px-6 py-3 rounded-lg font-medium hover:bg-gold-primary/10 transition-colors w-full sm:w-auto">
                <Search className="w-5 h-5 inline mr-2" />
                Browse Properties
              </button>
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">Popular Pages</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                { label: 'Buy Property', path: '/buy' },
                { label: 'Rent Property', path: '/rent' },
                { label: 'Sell Property', path: '/sell' },
                { label: 'Services', path: '/services' },
                { label: 'FAQ', path: '/faq' },
                { label: 'Blog', path: '/blog' },
                { label: 'Contact Us', path: '/contact' },
              ].map(({ label, path }) => (
                <Link
                  key={path}
                  to={path}
                  className="px-4 py-2 bg-secondary/50 rounded-lg text-sm hover:bg-secondary transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}