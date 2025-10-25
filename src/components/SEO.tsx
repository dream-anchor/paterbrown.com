import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  robots?: string;
  canonical?: string;
  image?: string;
  keywords?: string;
  type?: 'website' | 'article';
}

export const SEO = ({ 
  title, 
  description, 
  robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  canonical,
  image = "https://paterbrown.com/og-image.png",
  keywords,
  type = 'website'
}: SEOProps) => {
  const fullTitle = `${title} - Pater Brown Live-Hörspiel`;
  const canonicalUrl = canonical || `https://paterbrown.com${window.location.pathname}`;
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />
      <html lang="de" />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="de_DE" />
      <meta property="og:site_name" content="Pater Brown Live-Hörspiel" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content="Pater Brown - Das Live-Hörspiel Logo" />
    </Helmet>
  );
};
