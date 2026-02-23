import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://paterbrown.com';

interface SEOProps {
  title: string;
  description?: string;
  robots?: string;
  canonical?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  /** JSON-LD Structured Data (wird als <script type="application/ld+json"> eingefügt) */
  schema?: Record<string, unknown> | Record<string, unknown>[];
}

export const SEO = ({
  title,
  description,
  robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  canonical,
  keywords,
  ogTitle,
  ogDescription,
  ogImage = '/og-image.png',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  schema,
}: SEOProps) => {
  const fullTitle = title.includes('Pater Brown') ? title : `${title} | Pater Brown`;

  const getCanonicalUrl = () => {
    if (canonical) {
      if (canonical.startsWith('/')) {
        const cleanPath = canonical === '/' ? '' : canonical.replace(/\/$/, '');
        return `${BASE_URL}${cleanPath}`;
      }
      if (canonical.startsWith('http')) {
        return canonical;
      }
      return `${BASE_URL}/${canonical}`;
    }
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    const cleanPath = pathname === '/' ? '' : pathname.replace(/\/$/, '');
    return `${BASE_URL}${cleanPath}`;
  };

  const canonicalUrl = getCanonicalUrl();
  const finalOgTitle = ogTitle || fullTitle;
  const finalOgDescription = ogDescription || description;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`;

  // Schema kann ein einzelnes Objekt oder ein Array sein
  const schemas = schema
    ? Array.isArray(schema)
      ? schema
      : [schema]
    : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Hreflang – DE, AT, CH */}
      <link rel="alternate" hrefLang="de-DE" href={canonicalUrl} />
      <link rel="alternate" hrefLang="de-AT" href={canonicalUrl} />
      <link rel="alternate" hrefLang="de-CH" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={finalOgTitle} />
      {finalOgDescription && <meta property="og:description" content={finalOgDescription} />}
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:type" content={ogType} />
      <meta property="og:locale" content="de_DE" />
      <meta property="og:site_name" content="Pater Brown Live-Hörspiel" />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={finalOgTitle} />
      {finalOgDescription && <meta name="twitter:description" content={finalOgDescription} />}
      <meta name="twitter:image" content={fullOgImage} />

      <html lang="de" />

      {/* JSON-LD Structured Data */}
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
};
