import axios from "axios";
import * as cheerio from "cheerio";
import { ImageData } from "@shared/schema";
import crypto from "crypto";

interface ScrapeOptions {
  deduplicateImages: boolean;
  filterSmallImages: boolean;
}

// Default options
const defaultOptions: ScrapeOptions = {
  deduplicateImages: true,
  filterSmallImages: true,
};

// Minimum image dimensions to consider (for filtering small images)
const MIN_IMAGE_WIDTH = 100;
const MIN_IMAGE_HEIGHT = 100;

/**
 * Scrapes images from the provided URLs
 */
export async function scrapeImages(
  urls: string[],
  options: ScrapeOptions = defaultOptions
): Promise<ImageData[]> {
  try {
    // Scrape images from all URLs in parallel
    const scrapePromises = urls.map(url => scrapeImagesFromUrl(url));
    const results = await Promise.allSettled(scrapePromises);
    
    // Combine all successful results
    let allImages: ImageData[] = [];
    
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        const images = result.value.map(img => ({
          ...img,
          sourceUrl: urls[index]
        }));
        allImages = [...allImages, ...images];
      } else {
        console.error(`Failed to scrape ${urls[index]}:`, result.reason);
      }
    });
    
    // Apply filters based on options
    if (options.filterSmallImages) {
      allImages = filterSmallImages(allImages);
    }
    
    if (options.deduplicateImages) {
      allImages = deduplicateImages(allImages);
    }
    
    return allImages;
  } catch (error) {
    console.error("Error scraping images:", error);
    throw error;
  }
}

/**
 * Scrapes images from a single URL
 */
async function scrapeImagesFromUrl(url: string): Promise<Omit<ImageData, "sourceUrl">[]> {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 10000,
    });
    
    const $ = cheerio.load(response.data);
    const images: Omit<ImageData, "sourceUrl">[] = [];
    
    // Find all img tags
    $("img").each((_, element) => {
      const img = $(element);
      const src = img.attr("src");
      const srcset = img.attr("srcset");
      const alt = img.attr("alt") || "";
      
      // Get dimensions if available
      const width = parseInt(img.attr("width") || "0", 10) || undefined;
      const height = parseInt(img.attr("height") || "0", 10) || undefined;
      
      // Resolve relative URLs
      const resolveUrl = (relativeUrl: string) => {
        try {
          return new URL(relativeUrl, url).href;
        } catch {
          return relativeUrl;
        }
      };
      
      // Process src attribute
      if (src && isValidImageUrl(src)) {
        const imageUrl = resolveUrl(src);
        images.push({
          url: imageUrl,
          width,
          height,
          alt,
        });
      }
      
      // Process srcset attribute
      if (srcset) {
        const srcsetUrls = parseSrcSet(srcset);
        for (const srcsetUrl of srcsetUrls) {
          if (isValidImageUrl(srcsetUrl)) {
            const imageUrl = resolveUrl(srcsetUrl);
            if (!images.some(img => img.url === imageUrl)) {
              images.push({
                url: imageUrl,
                width,
                height,
                alt,
              });
            }
          }
        }
      }
    });
    
    return images;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    throw error;
  }
}

/**
 * Parses the srcset attribute to extract image URLs
 */
function parseSrcSet(srcset: string): string[] {
  return srcset
    .split(",")
    .map(set => set.trim().split(/\s+/)[0])
    .filter(Boolean);
}

/**
 * Checks if a URL is a valid image URL
 */
function isValidImageUrl(url: string): boolean {
  // Basic check for common image extensions
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"];
  const lowerCaseUrl = url.toLowerCase();
  
  // Skip data URLs, they're usually small images
  if (lowerCaseUrl.startsWith("data:image")) {
    return false;
  }
  
  // Check common image extensions
  return imageExtensions.some(ext => lowerCaseUrl.endsWith(ext)) || 
         lowerCaseUrl.includes(".jpg?") ||
         lowerCaseUrl.includes(".jpeg?") ||
         lowerCaseUrl.includes(".png?") ||
         lowerCaseUrl.includes(".gif?") ||
         lowerCaseUrl.includes(".webp?");
}

/**
 * Filters out small images
 */
function filterSmallImages(images: ImageData[]): ImageData[] {
  return images.filter(img => {
    // If we don't have dimensions, keep the image
    if (!img.width || !img.height) return true;
    
    return img.width >= MIN_IMAGE_WIDTH && img.height >= MIN_IMAGE_HEIGHT;
  });
}

/**
 * Deduplicates images by URL and image content hash (if available)
 */
function deduplicateImages(images: ImageData[]): ImageData[] {
  const uniqueUrls = new Set<string>();
  const uniqueImages: ImageData[] = [];
  
  for (const image of images) {
    // Create a simple hash of the URL
    const urlHash = crypto.createHash("md5").update(image.url).digest("hex");
    
    if (!uniqueUrls.has(urlHash)) {
      uniqueUrls.add(urlHash);
      uniqueImages.push(image);
    }
  }
  
  return uniqueImages;
}
