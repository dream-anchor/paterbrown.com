import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://paterbrownlive.com';

interface SEOProps {
  title: string;
  description?: string;
  robots?: string;
  canonical?: string;
  keywords?: string;
}

export const SEO = ({ 
  title, 
  description, 
  robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  canonical,
  keywords
}: SEOProps) => {
  const fullTitle = `${title} - Pater Brown Live-Hörspiel`;
  
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
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />
      <html lang="de" />
    </Helmet>
  );
};
