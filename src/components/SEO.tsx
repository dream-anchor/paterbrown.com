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
  twitterCard = 'summary_large_image'
}: SEOProps) => {
  const fullTitle = title.includes('Pater Brown') ? title : `${title} | Pater Brown`;
  
  // Build canonical URL: use provided canonical or derive from pathname
  const getCanonicalUrl = () => {
    if (canonical) {
      // If canonical starts with /, prepend base URL
      if (canonical.startsWith('/')) {
        const cleanPath = canonical === '/' ? '' : canonical.replace(/\/$/, '');
        return `${BASE_URL}${cleanPath}`;
      }
      // If it's already a full URL, use as-is
      if (canonical.startsWith('http')) {
        return canonical;
      }
      return `${BASE_URL}/${canonical}`;
    }
    // Default: use current pathname without trailing slash
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    const cleanPath = pathname === '/' ? '' : pathname.replace(/\/$/, '');
    return `${BASE_URL}${cleanPath}`;
  };

  const canonicalUrl = getCanonicalUrl();
  const finalOgTitle = ogTitle || fullTitle;
  const finalOgDescription = ogDescription || description;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`;
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />
      
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
    </Helmet>
  );
};
