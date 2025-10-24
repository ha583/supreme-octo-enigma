/**
 * Uploads a file to Vercel Blob and returns the URL
 */
export async function uploadToBlob(file: File, filename: string): Promise<string> {
  const response = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
    method: 'POST',
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  const { url } = await response.json();
  return url;
}

/**
 * Converts a blob URL back to a File object for uploading
 */
export async function blobUrlToFile(blobUrl: string, filename: string): Promise<File> {
  // Skip if it's already a proper URL (not a blob URL)
  if (!blobUrl.startsWith('blob:')) {
    throw new Error('URL is not a blob URL, upload may have already been completed');
  }
  
  try {
    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Try to determine the correct file extension from the blob type
    let finalFilename = filename;
    if (blob.type && !filename.includes('.')) {
      const extension = getExtensionFromMimeType(blob.type);
      finalFilename = `${filename}.${extension}`;
    }
    
    return new File([blob], finalFilename, { type: blob.type });
  } catch (error) {
    console.error('Error converting blob URL to file:', error);
    throw new Error(`Failed to convert blob URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get file extension from MIME type
 */
function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: { [key: string]: string } = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg', 
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff'
  };
  return mimeToExt[mimeType] || 'jpg';
}

/**
 * Generates a unique filename for uploads
 */
export function generateFilename(originalName: string, prefix: string = ''): string {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop() || 'jpg';
  const cleanPrefix = prefix.toLowerCase().replace(/\s+/g, '-');
  return `${cleanPrefix ? cleanPrefix + '-' : ''}${timestamp}.${extension}`;
}

/**
 * Checks if a URL is a blob URL that needs to be uploaded
 */
export function isBlobUrl(url: string): boolean {
  return url.startsWith('blob:');
}

/**
 * Checks if a URL is already uploaded to Vercel Blob
 */
export function isUploadedUrl(url: string): boolean {
  return url.includes('blob.vercel-storage.com') || url.startsWith('https://');
}

/**
 * Handles conditional upload - only uploads if it's a blob URL
 */
export async function conditionalUpload(
  imageUrl: string, 
  prefix: string = 'file'
): Promise<string> {
  if (!imageUrl) return '';
  
  // If it's already uploaded, return as is
  if (isUploadedUrl(imageUrl)) {
    return imageUrl;
  }
  
  // If it's a blob URL, upload it
  if (isBlobUrl(imageUrl)) {
    // Get the file extension from the blob URL if possible, or default to jpg
    const tempFile = await blobUrlToFile(imageUrl, `temp.jpg`);
    const fileExtension = tempFile.name.split('.').pop() || 'jpg';
    const filename = `${prefix}.${fileExtension}`;
    const uniqueFilename = generateFilename(filename, '');
    return await uploadToBlob(tempFile, uniqueFilename);
  }
  
  // Otherwise, return as is
  return imageUrl;
}