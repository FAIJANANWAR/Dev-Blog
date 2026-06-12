interface SeoProps {
  title: string;
  description: string;
  imageUrl?: string;
  slug?: string;
}

/**
 * Dynamically injects SEO tags into the HTML document head.
 * Supports page titles, description meta tags, OpenGraph properties, and Twitter cards.
 */
export function updateMetaTags({ title, description, imageUrl, slug }: SeoProps) {
  // Update document title
  document.title = `${title} | DevBlog Platform`;

  // Utility to locate or create a meta tag dynamically
  const getOrCreateMeta = (name: string, isProperty: boolean = false) => {
    const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    let element = document.querySelector(selector);
    if (!element) {
      element = document.createElement('meta');
      if (isProperty) {
        element.setAttribute('property', name);
      } else {
        element.setAttribute('name', name);
      }
      document.head.appendChild(element);
    }
    return element;
  };

  // Set page description
  getOrCreateMeta('description').setAttribute('content', description);

  // Set OpenGraph tags (for platforms like Discord, LinkedIn, Facebook)
  getOrCreateMeta('og:title', true).setAttribute('content', title);
  getOrCreateMeta('og:description', true).setAttribute('content', description);
  getOrCreateMeta('og:type', true).setAttribute('content', 'article');
  
  if (slug) {
    const origin = window.location.origin;
    getOrCreateMeta('og:url', true).setAttribute('content', `${origin}/posts/${slug}`);
  }
  
  if (imageUrl) {
    getOrCreateMeta('og:image', true).setAttribute('content', imageUrl);
  }

  // Set Twitter Card headers
  getOrCreateMeta('twitter:card').setAttribute('content', 'summary_large_image');
  getOrCreateMeta('twitter:title').setAttribute('content', title);
  getOrCreateMeta('twitter:description').setAttribute('content', description);
  
  if (imageUrl) {
    getOrCreateMeta('twitter:image').setAttribute('content', imageUrl);
  }
}
