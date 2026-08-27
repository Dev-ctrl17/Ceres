import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import BlogPostLayout from '@/components/BlogPostLayout.jsx';
import { blogPostsData, loadPostContent } from '@/data/blogPosts.js';

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      const fullPost = await loadPostContent(slug);
      if (fullPost) {
        setPost(fullPost);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
      setLoading(false);
      // Dispatch render-event for prerendering (vite-plugin-prerender / Puppeteer)
      // so the snapshot captures real blog content, not the loading state.
      document.dispatchEvent(new Event('render-event'));
    }
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading... | Luxury Properties Ltd</title>
        </Helmet>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </>
    );
  }

  if (notFound || !post) {
    return (
      <>
        <Helmet>
          <title>Blog Post Not Found | Luxury Properties Ltd</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-4xl font-bold mb-4">Blog Post Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The blog post you're looking for doesn't exist or has been moved.
            </p>
            <Link
              to="/blog"
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Back to Blog
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const canonicalUrl = `https://luxurypropertiesltd.com.ng/blog/${post.slug}`;

  return (
    <>
      <Helmet>
        <title>{post.title} | Luxury Properties Ltd</title>
        <meta name="description" content={post.metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Luxury Properties Ltd" />
        <meta property="og:locale" content="en_NG" />
        {post.ogImage && <meta property="og:image" content={post.ogImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.metaDescription} />
        {post.ogImage && <meta name="twitter:image" content={post.ogImage} />}
        <meta property="article:published_time" content={post.datePublished} />
        <meta property="article:modified_time" content={post.dateModified} />
        <meta property="article:author" content="Luxury Properties Ltd" />

        {/* JSON-LD Article Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": canonicalUrl
            },
            "headline": post.title,
            "description": post.metaDescription,
            "image": post.ogImage || "https://luxurypropertiesltd.com.ng/og-image.png",
            "author": {
              "@type": "Organization",
              "name": "Luxury Properties Ltd",
              "url": "https://luxurypropertiesltd.com.ng"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Luxury Properties Ltd",
              "logo": {
                "@type": "ImageObject",
                "url": "https://luxurypropertiesltd.com.ng/favicon.svg"
              }
            },
            "datePublished": post.datePublished,
            "dateModified": post.dateModified
          })}
        </script>

        {/* JSON-LD FAQ Schema */}
        {post.faqSchema && post.faqSchema.length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": post.faqSchema.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            })}
          </script>
        )}
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 overflow-hidden">
          <div className="absolute inset-0 z-0">
            {post.ogImage ? (
              <img
                src={post.ogImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
            )}
            <div className="absolute inset-0 bg-black/60" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <nav className="mb-6">
              <Link
                to="/blog"
                className="inline-flex items-center text-white/70 hover:text-white transition-colors text-sm font-medium"
              >
                ← Back to Blog
              </Link>
            </nav>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                {post.category}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
              <span>
                {new Date(post.date).toLocaleDateString('en-NG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span>·</span>
              <span>{post.readTime}</span>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <BlogPostLayout post={post} />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Find Your Dream Property?
            </h2>
            <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
              Browse our exclusive collection of luxury properties or speak with our expert advisors today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/properties">
                <button className="bg-background text-foreground px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Browse Properties
                </button>
              </Link>
              <Link to="/contact">
                <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
                  Contact Us
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default BlogPostPage;
