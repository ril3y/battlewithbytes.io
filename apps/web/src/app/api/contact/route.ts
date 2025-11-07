import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Rate limiting to prevent abuse
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const MAX_REQUESTS_PER_WINDOW = 3;

// Simple in-memory store for rate limiting
// In production, you would use Redis or another external store
const ipRequestCounts: Record<string, { count: number; resetTime: number }> = {};

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting - using headers for IP since NextRequest.ip may not be available
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
    
    // Check rate limit
    const now = Date.now();
    if (!ipRequestCounts[ip] || ipRequestCounts[ip].resetTime < now) {
      // Reset counter for this IP
      ipRequestCounts[ip] = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
    }
    
    // Increment counter
    ipRequestCounts[ip].count += 1;
    
    // Check if rate limit exceeded
    if (ipRequestCounts[ip].count > MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        { message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { name, email, subject, message } = body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { message: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }
    
    // Create a nodemailer transporter
    // NOTE: In production, use environment variables for these credentials
    const transporter = nodemailer.createTransport({
      // Replace with your SMTP settings from environment variables
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Boolean(process.env.SMTP_SECURE) || false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    
    // Setup email data
    const mailOptions = {
      from: `"Battle With Bytes Contact Form" <${process.env.SMTP_USER}>`,
      to: 'contact@battlewithbytes.io',
      replyTo: email,
      subject: `Contact Form: ${subject || 'New message from website'}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Subject:</strong> ${subject || 'No subject'}</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 4px;">
            <p style="margin-top: 0;"><strong>Message:</strong></p>
            <p style="white-space: pre-line;">${message}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This email was sent from the contact form on Battle With Bytes website.
          </p>
        </div>
      `,
    };
    
    // Only actually send in production
    if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
      await transporter.sendMail(mailOptions);
    } else {
      // In development, just log the email
      console.log('Email would be sent in production:');
      console.log(mailOptions);
    }
    
    return NextResponse.json({ message: 'Message sent successfully!' });
    
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { message: 'An error occurred while sending your message.' },
      { status: 500 }
    );
  }
}
