import { toPng } from 'html-to-image';
import type { CalculationResult } from './calculationUtils';

interface ShareableImage {
  dataUrl: string;
  text: string;
}

/**
 * Generates an anonymized image from the chart for social media sharing
 * Removes actual salary values and only shows percentage changes
 */
export const generateShareableImage = async (
  element: HTMLElement,
  results: CalculationResult[]
): Promise<ShareableImage> => {
  try {
    // Clone the element to modify it without affecting the original
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Anonymize the data by converting to percentages
    const baseValue = results[0].nominalSalary;
    const anonymizedResults = results.map(result => ({
      ...result,
      nominalSalary: (result.nominalSalary / baseValue) * 100,
      realSalary: (result.realSalary / baseValue) * 100,
    }));
    
    // Update Y-axis to show percentages
    const yAxis = clone.querySelector('.recharts-yAxis');
    if (yAxis) {
      const ticks = yAxis.querySelectorAll('.recharts-cartesian-axis-tick-value');
      ticks.forEach(tick => {
        const value = parseFloat(tick.textContent || '0');
        tick.textContent = `${((value / baseValue) * 100).toFixed(0)}%`;
      });
    }
    
    // Generate image
    const dataUrl = await toPng(clone, {
      quality: 0.95,
      width: 1200,
      height: 630,
      style: {
        background: 'white',
        padding: '20px',
      },
    });
    
    // Calculate total loss for sharing text
    const totalLoss = results[results.length - 1].percentDifference;
    const sharingText = `My salary lost ${totalLoss.toFixed(1)}% of its value due to inflation! Check your salary's real value: #InflationImpact`;
    
    return {
      dataUrl,
      text: sharingText,
    };
  } catch (error) {
    console.error('Error generating shareable image:', error);
    throw error;
  }
};

/**
 * Opens a social media sharing dialog
 */
export const shareOnSocialMedia = (
  platform: 'twitter' | 'facebook' | 'linkedin' | 'mastodon' | 'bluesky',
  text: string,
  url: string,
  imageUrl?: string
) => {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  
  let shareUrl = '';
  
  switch (platform) {
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
      break;
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
      break;
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      break;
    case 'mastodon':
      // For Mastodon, we need to know the instance, but this is handled in the component
      // This is a fallback that opens a generic share dialog
      shareUrl = `https://mastodon.social/share?text=${encodedText}%20${encodedUrl}`;
      break;
    case 'bluesky':
      // BlueSky doesn't have a direct share URL scheme yet
      // We'll copy to clipboard and open BlueSky in a new tab
      // This logic is handled in the component directly
      shareUrl = 'https://bsky.app';
      break;
  }
  
  window.open(shareUrl, '_blank', 'width=600,height=400');
};

/**
 * Share to Mastodon with a specific instance
 */
export const shareToMastodon = (
  instanceUrl: string,
  text: string,
  url: string
) => {
  const encodedText = encodeURIComponent(`${text} ${url}`);
  // Remove any http:// or https:// from the instance URL if present
  const cleanInstanceUrl = instanceUrl.replace(/^https?:\/\//, '');
  const shareUrl = `https://${cleanInstanceUrl}/share?text=${encodedText}`;
  window.open(shareUrl, '_blank', 'width=600,height=400');
};

/**
 * Share to BlueSky (currently just copies to clipboard and opens BlueSky)
 */
export const shareToBlueSky = (
  text: string,
  url: string
): Promise<void> => {
  const shareText = `${text} ${url}`;
  return navigator.clipboard.writeText(shareText)
    .then(() => {
      window.open('https://bsky.app', '_blank');
      alert('Share text copied to clipboard. Please paste it in your BlueSky post.');
    })
    .catch((error) => {
      console.error('Failed to copy text to clipboard:', error);
      throw error;
    });
};

/**
 * Generates Open Graph meta tags for social media sharing
 */
export const generateOGMetaTags = (data: {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
}) => {
  return {
    'og:title': data.title,
    'og:description': data.description,
    'og:image': data.imageUrl,
    'og:url': data.url,
    'og:type': 'website',
    'twitter:card': 'summary_large_image',
    'twitter:title': data.title,
    'twitter:description': data.description,
    'twitter:image': data.imageUrl,
  };
};