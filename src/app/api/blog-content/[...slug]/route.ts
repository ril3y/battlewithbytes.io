import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';

/**
 * API route to serve blog content files (images, etc.)
 * This allows us to access files from the src/content/blog directory
 * Example: /api/blog-content/lora-without-lorawan/images/cover.png
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    // Get the file path from the URL
    const slug = params.slug || [];
    
    if (!slug.length) {
      return new NextResponse('Not found', { status: 404 });
    }
    
    // Construct the file path in the content directory
    const filePath = path.join(process.cwd(), 'src', 'content', 'blog', ...slug);
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }
    
    // Get the file contents
    const fileContents = fs.readFileSync(filePath);
    
    // Determine content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream'; // Default
    
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.webp') contentType = 'image/webp';
    
    // Set cache headers based on environment
    const cacheControl = isDev 
      ? 'no-store, must-revalidate' // No caching in development
      : 'public, max-age=86400';     // Cache for 1 day in production
    
    // Return the file
    return new NextResponse(fileContents, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
      },
    });
  } catch (error) {
    console.error('Error serving blog content:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
