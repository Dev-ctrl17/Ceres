import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Helmet } from 'react-helmet';

const Breadcrumb = ({ items, schemaType = 'BreadcrumbList' }) => {
  if (!items || items.length === 0) return null;

  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href,
    })),
  };

  return (
    <>
      {schemaType === 'BreadcrumbList' && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(breadcrumbList)}
          </script>
        </Helmet>
      )}
      <nav aria-label="Breadcrumb" className="bg-muted/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 py-3 xs:py-4">
          <ol className="flex items-center space-x-2 text-sm flex-wrap">
            <li>
              <Link
                to="/"
                className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                aria-label="Home"
              >
                <Home className="w-4 h-4" />
              </Link>
            </li>
            {items.map((item, index) => (
              <li key={item.href} className="flex items-center space-x-2">
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                {index === items.length - 1 ? (
                  <span className="text-foreground font-medium" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  );
};

export default Breadcrumb;