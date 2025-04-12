import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QuakeTerminal from '@/components/QuakeTerminal';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Battle With Bytes | Cybersecurity, Embedded Hardware & Software Engineering",
  description: "A personal hub for sharing insights on cybersecurity, embedded hardware, and software engineering. Ask me about little data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navigation />
        <div className="pt-16 flex-grow">
          {children}
        </div>
        <Footer />
        <QuakeTerminal />
      </body>
    </html>
  );
}
