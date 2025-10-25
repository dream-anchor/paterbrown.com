import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  robots?: string;
  canonical?: string;
  image?: string;
}

export const SEO = ({ 
  title, 
  description, 
  robots = "index, follow",
  canonical,
  image = "https://paterbrownlive.com/og-image.png"
}: SEOProps) => {
  const fullTitle = `${title} - Pater Brown Live-Hörspiel`;
  const canonicalUrl = canonical || `https://paterbrownlive.com${window.location.pathname}`;
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      
      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};
