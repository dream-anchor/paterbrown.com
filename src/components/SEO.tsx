import { Helmet } from 'react-helmet-async';

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
  const canonicalUrl = canonical || `https://paterbrown.com${window.location.pathname}`;
  
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
