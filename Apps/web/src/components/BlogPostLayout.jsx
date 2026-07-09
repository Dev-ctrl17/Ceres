import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';

const ContentImage = ({ src, alt, caption }) => (
  <figure className="my-8">
    <img
      src={src}
      alt={alt}
      className="w-full rounded-lg shadow-md"
      loading="lazy"
    />
    {caption && (
      <figcaption className="text-sm text-muted-foreground text-center mt-2 italic">
        {caption}
      </figcaption>
    )}
  </figure>
);

const ContentHeading = ({ level, text }) => {
  const Tag = `h${level}`;
  const className = level === 2
    ? "text-3xl font-bold mt-12 mb-6 text-foreground border-b border-border pb-3"
    : "text-2xl font-semibold mt-8 mb-4 text-foreground";
  return <Tag className={className}>{text}</Tag>;
};

const ContentParagraph = ({ text }) => (
  <p className="text-base leading-relaxed mb-6 text-muted-foreground">{text}</p>
);

const ContentList = ({ items }) => (
  <ul className="list-disc pl-6 mb-6 space-y-3 text-muted-foreground">
    {items.map((item, i) => (
      <li key={i} className="text-base leading-relaxed">{item}</li>
    ))}
  </ul>
);

const ContentOrderedList = ({ items }) => (
  <ol className="list-decimal pl-6 mb-6 space-y-3 text-muted-foreground">
    {items.map((item, i) => (
      <li key={i} className="text-base leading-relaxed">{item}</li>
    ))}
  </ol>
);

const ContentChecklist = ({ title, items }) => (
  <div className="bg-muted/40 border border-border rounded-lg p-6 my-8">
    {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
    <ol className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-muted-foreground">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium mt-0.5">
            {i + 1}
          </span>
          <span className="text-base leading-relaxed">{item}</span>
        </li>
      ))}
    </ol>
  </div>
);

const ContentBlockquote = ({ text }) => (
  <blockquote className="border-l-4 border-primary bg-muted/30 pl-6 py-4 pr-4 my-8 rounded-r-lg">
    <p className="text-lg italic text-muted-foreground leading-relaxed">"{text}"</p>
  </blockquote>
);

const ContentInsightBox = ({ title, text }) => (
  <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-6 my-8">
    {title && (
      <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-2">{title}</h4>
    )}
    <p className="text-muted-foreground leading-relaxed">{text}</p>
  </div>
);

const ContentTable = ({ headers, rows }) => (
  <div className="overflow-x-auto my-8 rounded-lg border border-border">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-primary text-primary-foreground">
          {headers.map((header, i) => (
            <th key={i} className="px-4 py-3 text-left font-semibold">{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
            {row.map((cell, j) => (
              <td key={j} className="px-4 py-3 border-t border-border">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ContentFAQ = ({ items }) => (
  <div className="my-8 space-y-4">
    <h2 className="text-3xl font-bold mb-6 text-foreground border-b border-border pb-3">
      Frequently Asked Questions (FAQ)
    </h2>
    {items.map((item, i) => (
      <div key={i} className="border-b border-border pb-4">
        <p className="font-semibold text-foreground mb-2">{i + 1}. {item.q}</p>
        <p className="text-muted-foreground leading-relaxed">{item.a}</p>
      </div>
    ))}
  </div>
);

const ContentCTA = ({ title, text, buttonText, buttonLink }) => (
  <section className="bg-primary text-primary-foreground rounded-lg p-8 md:p-12 my-10 text-center">
    <h3 className="text-2xl md:text-3xl font-bold mb-4">{title}</h3>
    <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8 leading-relaxed">
      {text}
    </p>
    <Link
      to={buttonLink}
      className="inline-block bg-background text-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
    >
      {buttonText}
    </Link>
  </section>
);

const renderContent = (block) => {
  switch (block.type) {
    case 'image':
      return <ContentImage key={block.src} {...block} />;
    case 'heading':
      return <ContentHeading key={block.text} {...block} />;
    case 'paragraph':
      return <ContentParagraph key={block.text.slice(0, 40)} text={block.text} />;
    case 'list':
      return <ContentList key={block.items[0]} items={block.items} />;
    case 'orderedList':
      return <ContentOrderedList key={block.items[0]} items={block.items} />;
    case 'checklist':
      return <ContentChecklist key={block.title} {...block} />;
    case 'blockquote':
      return <ContentBlockquote key={block.text.slice(0, 40)} text={block.text} />;
    case 'insightBox':
      return <ContentInsightBox key={block.text.slice(0, 40)} {...block} />;
    case 'table':
      return <ContentTable key={block.headers[0]} {...block} />;
    case 'faq':
      return <ContentFAQ key="faq" items={block.items} />;
    case 'cta':
      return <ContentCTA key="cta" {...block} />;
    default:
      return null;
  }
};

const BlogPostLayout = ({ post }) => {
  if (!post) return null;

  return (
    <article className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link
          to="/blog"
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>
      </nav>

      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
            {post.category}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {new Date(post.date).toLocaleDateString('en-NG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {post.readTime}
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        {post.content.map(renderContent)}
      </div>
    </article>
  );
};

export default BlogPostLayout;
