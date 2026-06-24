import React from 'react';
import { Inter, Playfair_Display } from 'next/font/google';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });

export const metadata = {
  title: {
    default: 'Luxury Properties Ltd — Premium Real Estate in Nigeria',
    template: '%s | Luxury Properties Ltd',
  },
  description: 'Luxury Properties Ltd is Nigeria\'s premier luxury real estate agency. Buy, sell, or rent exclusive high-end properties in Lagos, Abuja, and across Nigeria. Concierge service, off-market listings, and expert advisory.',
  keywords: ['luxury real estate Nigeria', 'luxury properties Lagos', 'buy property Lagos', 'sell property Nigeria', 'real estate agency', 'Ikoyi properties', 'Victoria Island', 'Banana Island', 'Lekki Phase 1', 'off-market properties'],
  authors: [{ name: 'Luxury Properties Ltd' }],
  creator: 'Luxury Properties Ltd',
  publisher: 'Luxury Properties Ltd',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://luxurypropertiesltd.com.ng'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://luxurypropertiesltd.com.ng',
    title: 'Luxury Properties Ltd — Premium Real Estate in Nigeria',
    description: 'Nigeria\'s premier luxury real estate agency. Exclusive high-end listings, concierge service, and off-market properties in Lagos, Abuja, and across Nigeria.',
    siteName: 'Luxury Properties Ltd',
    images: [
      {
        url: 'https://luxurypropertiesltd.com.ng/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Luxury Properties Ltd — Premium Luxury Real Estate in Nigeria',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luxury Properties Ltd — Premium Real Estate in Nigeria',
    description: 'Nigeria\'s premier luxury real estate agency. Exclusive high-end listings, concierge service, and off-market properties.',
    images: ['https://luxurypropertiesltd.com.ng/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['RealEstateAgent', 'LocalBusiness'],
    name: 'Luxury Properties Ltd',
    description: 'Premium luxury real estate agency in Nigeria. Exclusive high-end listings, concierge service, and off-market properties in Lagos, Abuja, and across Nigeria.',
    url: 'https://luxurypropertiesltd.com.ng',
    telephone: '+234-9056201176',
    email: 'info@luxurypropertiesltd.com.ng',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Lagos',
      addressRegion: 'Lagos State',
      addressCountry: 'NG',
    },
    priceRange: '₦50M - ₦5B',
    areaServed: ['Lagos', 'Abuja', 'Port Harcourt', 'Nigeria'],
    sameAs: [
      'https://www.instagram.com/luxurypropertiesltd',
      'https://www.linkedin.com/company/luxurypropertiesltd',
      'https://www.facebook.com/luxurypropertiesltd',
      'https://www.google.com/maps/search/Luxury+Properties+Ltd/@6.535036,2.8772119,9z/data=!3m1!4b1?entry=ttu&g_ep=EgoyMDI2MDYyMS4wIKXMDSoASAFQAw%3D%3D',
    ],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '18:00',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Luxury Property Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'Luxury Homes',
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: 'NGN',
              lowPrice: '50000000',
              highPrice: '5000000000',
              offerCount: '50',
            },
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'Off-Market Properties',
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: 'NGN',
              lowPrice: '100000000',
              highPrice: '5000000000',
              offerCount: '20',
            },
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Concierge Real Estate Service',
            offers: {
              '@type': 'Offer',
              priceCurrency: 'NGN',
              price: '0',
              priceSpecification: {
                '@type': 'PriceSpecification',
                description: 'Contact for pricing',
              },
            },
          },
        },
      ],
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="alternate" hreflang="en-ng" href="https://luxurypropertiesltd.com.ng" />
        <link rel="alternate" hreflang="en" href="https://luxurypropertiesltd.com.ng" />
        <link rel="alternate" hreflang="x-default" href="https://luxurypropertiesltd.com.ng" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}