import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// This tells Next.js to exclude this route from static export
export const dynamic = 'error';

/**
 * API route to serve blog content files (images, etc.)
 * Example: /api/blog-content/lora-without-lorawan/images/cover.png
 */
export async function GET(request: NextRequest) {
  try {
    // Get the file path from the URL directly instead of using route params
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/api/blog-content/')[1]?.split('/') || [];
    
    if (!pathParts.length) {
      return new NextResponse('Not found', { status: 404 });
    }
    
    // Construct the file path in the content directory
    const filePath = path.join(process.cwd(), 'src', 'content', 'blog', ...pathParts);
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return new NextResponse('Not found', { status: 404 });
    }
    
    // Read the file
    const fileContent = fs.readFileSync(filePath);
    
    // Determine content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream'; // Default
    
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.json') contentType = 'application/json';
    else if (ext === '.txt') contentType = 'text/plain';
    else if (ext === '.html') contentType = 'text/html';
    else if (ext === '.css') contentType = 'text/css';
    else if (ext === '.js') contentType = 'application/javascript';
    
    // Return the file with the appropriate content type
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Error serving blog content:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
