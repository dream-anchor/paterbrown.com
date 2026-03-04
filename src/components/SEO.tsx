import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
}

const SEO = ({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  noIndex = false,
}: SEOProps) => {
  useEffect(() => {
    // Title
    document.title = title;

    // Helper: upsert a <meta> tag
    const setMeta = (selector: string, attrName: string, attrValue: string, content: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper: upsert a <link> tag
    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel='${rel}']`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // Meta description
    if (description) {
      setMeta("meta[name='description']", 'name', 'description', description);
    }

    // Canonical
    if (canonical) {
      setLink('canonical', canonical);
    }

    // Robots: noindex für Admin und andere interne Seiten
    if (noIndex) {
      setMeta("meta[name='robots']", 'name', 'robots', 'noindex,nofollow');
    } else {
      // Sicherstellen dass keine noindex-Direktive auf öffentlichen Seiten sitzt
      const robotsMeta = document.querySelector("meta[name='robots']") as HTMLMetaElement | null;
      if (robotsMeta) {
        robotsMeta.setAttribute('content', 'index,follow');
      }
    }

    // Open Graph
    setMeta("meta[property='og:title']", 'property', 'og:title', ogTitle ?? title);
    if (ogDescription ?? description) {
      setMeta("meta[property='og:description']", 'property', 'og:description', (ogDescription ?? description) as string);
    }
    if (canonical) {
      setMeta("meta[property='og:url']", 'property', 'og:url', canonical);
    }
    if (ogImage) {
      setMeta("meta[property='og:image']", 'property', 'og:image', ogImage);
    }

    // Twitter Card
    setMeta("meta[name='twitter:card']", 'name', 'twitter:card', 'summary_large_image');
    setMeta("meta[name='twitter:title']", 'name', 'twitter:title', ogTitle ?? title);
    if (ogDescription ?? description) {
      setMeta("meta[name='twitter:description']", 'name', 'twitter:description', (ogDescription ?? description) as string);
    }
    if (ogImage) {
      setMeta("meta[name='twitter:image']", 'name', 'twitter:image', ogImage);
    }
  }, [title, description, canonical, ogTitle, ogDescription, ogImage, noIndex]);

  return null;
};

export default SEO;
