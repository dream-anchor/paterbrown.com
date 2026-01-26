/**
 * Client-side image resizing utilities for 3-tier optimization
 * - Thumbnail: 400px max dimension (for grid)
 * - Preview: 1600px max dimension (for lightbox)
 * - Original: full size (for download)
 */

export interface ResizedImages {
  thumbnail: Blob;
  preview: Blob;
  original: File;
}

/**
 * Resize an image to fit within maxSize while maintaining aspect ratio
 */
export const resizeImage = (
  file: File,
  maxSize: number,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      URL.revokeObjectURL(img.src);
      
      let { width, height } = img;
      
      // Calculate new dimensions maintaining aspect ratio
      if (width > height) {
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Use high-quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob"));
          }
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Failed to load image"));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Generate all 3 versions of an image
 */
export const generateImageVersions = async (
  file: File
): Promise<ResizedImages> => {
  // Generate thumbnail (400px, 75% quality for smallest size)
  const thumbnail = await resizeImage(file, 400, 0.75);
  
  // Generate preview (1600px, 80% quality for good balance)
  const preview = await resizeImage(file, 1600, 0.8);

  return {
    thumbnail,
    preview,
    original: file,
  };
};

/**
 * Check if image needs resizing (already small enough)
 */
export const shouldResize = async (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      // If image is already smaller than thumbnail size, no need to resize
      resolve(img.width > 400 || img.height > 400);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve(false); // If we can't read it, don't try to resize
    };
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Get file extension for storage path
 */
export const getFileExtension = (fileName: string): string => {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "jpg";
};

/**
 * Generate unique file paths for all versions
 */
export const generateFilePaths = (
  baseFileName: string,
  folder: string
): { thumbnailPath: string; previewPath: string; originalPath: string } => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const ext = getFileExtension(baseFileName);
  const baseName = baseFileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
  const uniqueName = `${baseName}_${timestamp}_${random}`;

  return {
    thumbnailPath: `${folder}/thumbnails/${uniqueName}.jpg`,
    previewPath: `${folder}/previews/${uniqueName}.jpg`,
    originalPath: `${folder}/originals/${uniqueName}.${ext}`,
  };
};
