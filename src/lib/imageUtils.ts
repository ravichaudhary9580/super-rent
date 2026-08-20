/**
 * Client-side Image Processing Utilities for WebP Conversion and Compression
 */

export interface WebPOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
}

/**
 * Converts any image File (JPEG, PNG, etc.) to a lightweight compressed WebP File before uploading to AWS S3.
 */
export async function convertToWebP(
  file: File,
  options: WebPOptions = {}
): Promise<File> {
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.85 } = options;

  // Don't convert SVG or PDF
  if (file.type === "image/svg+xml" || file.type === "application/pdf") {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate scaled dimensions if exceeding max limits while maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Unable to create canvas 2D rendering context."));
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas image to WebP blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error("Failed to convert image to WebP format."));
            }

            const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
            const webpFile = new File([blob], `${baseName}.webp`, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            resolve(webpFile);
          },
          "image/webp",
          quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image for WebP conversion."));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}
