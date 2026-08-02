import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/dropcap.css";
import "../styles/prism-theme.css";
import ClientQuakeTerminalWrapper from "@/components/ClientQuakeTerminalWrapper";
import StandaloneWrapper from "@/components/StandaloneWrapper";
import GoatCounter from "@/components/GoatCounter";
import { SITE_URL } from "@/lib/utils/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_TITLE =
  "Battle With Bytes | Cybersecurity, Embedded Hardware & Software Engineering";
const SITE_DESCRIPTION =
  "A personal hub for sharing insights on cybersecurity, embedded hardware, and software engineering. Ask me about little data.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  // Site-wide social defaults; pages that call buildMetadata() override these
  openGraph: {
    type: "website",
    siteName: "Battle With Bytes",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/images/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/images/favicon.ico", sizes: "any" },
      { url: "/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/images/apple-touch-icon.png",
    shortcut: "/images/favicon.ico",
  },
  manifest: "/images/site.webmanifest",
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
        <GoatCounter />
        <StandaloneWrapper>{children}</StandaloneWrapper>
        <ClientQuakeTerminalWrapper />
      </body>
    </html>
  );
}
