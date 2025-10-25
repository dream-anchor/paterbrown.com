import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  robots?: string;
  canonical?: string;
}

export const SEO = ({ 
  title, 
  description, 
  robots = "index, follow",
  canonical 
}: SEOProps) => {
  const fullTitle = `${title} - Pater Brown Live-Hörspiel`;
  const canonicalUrl = canonical || `https://paterbrownlive.de${window.location.pathname}`;
  
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
      
      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
    </Helmet>
  );
};
