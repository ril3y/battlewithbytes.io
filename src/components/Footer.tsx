"use client";

import Link from "next/link";
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 py-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-green-400 font-mono text-lg font-semibold mb-4">
              Battle<span className="text-white">With</span>Bytes
            </h3>
            <p className="text-sm font-mono">
              Ask me about little data.
              <br />
              A hub for cybersecurity, embedded hardware, and software engineering.
            </p>
          </div>
          <div>
            <h3 className="text-green-400 font-mono text-lg font-semibold mb-4">Links</h3>
            <ul className="space-y-2 font-mono text-sm">
              <li>
                <Link href="/blog" className="hover:text-green-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/tools" className="hover:text-green-400 transition-colors">
                  Tools
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-green-400 transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-green-400 transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-green-400 font-mono text-lg font-semibold mb-4">Connect</h3>
            <ul className="space-y-2 font-mono text-sm">
              <li>
                <a
                  href="https://github.com/ril3y"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-400 transition-colors flex items-center gap-2"
                >
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.304.762-1.604-2.665-.3-5.466-1.334-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.123-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.241 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.625-5.475 5.921.43.372.823 1.102.823 2.222v3.293c0 .322.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://bsky.app/profile/ril3s.bsky.social"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-400 transition-colors flex items-center gap-2"
                >
                  <svg width="24" height="24" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="BlueSky">
                    <circle cx="60" cy="60" r="60" fill="currentColor"/>
                    <path d="M60 92c-9.6-9.8-28-27.2-28-43.2C32 35.2 44.2 28 60 28s28 7.2 28 20.8C88 64.8 69.6 82.2 60 92z" fill="var(--accent-secondary)"/>
                  </svg>
                  BlueSky
                </a>
              </li>
              <li>
                <a
                  href="https://www.flux.ai/ril3y"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-400 transition-colors flex items-center gap-2"
                >
                  <Image 
                    src="https://www.flux.ai/static/media/flux_icon.eca0a11ea2f721d680d9.svg" 
                    alt="Flux" 
                    width={20} 
                    height={20} 
                    style={{ display: 'inline-block', verticalAlign: 'middle' }} 
                  />
                  Flux
                </a>
              </li>
              <li>
                <a
                  href="/rss.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-400 transition-colors flex items-center gap-2"
                >
                  <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    <rect width="256" height="256" fill="none"></rect>
                    <circle cx="68" cy="188" r="28" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="20"></circle>
                    <path d="M40,80a144,144,0,0,1,144,144" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="20"></path>
                    <path d="M40,136a88,88,0,0,1,88,88" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="20"></path>
                  </svg>
                  RSS Feed
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/rileycporter/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-400 transition-colors flex items-center gap-2"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11.75 20h-3v-10h3v10zm-1.5-11.27c-.97 0-1.75-.79-1.75-1.76s.78-1.76 1.75-1.76 1.75.79 1.75 1.76-.78 1.76-1.75 1.76zm15.25 11.27h-3v-5.6c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.7h-3v-10h2.89v1.36h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.59v5.61z"/>
                  </svg>
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-800 text-center font-mono text-xs">
          <p> {currentYear} Battle With Bytes. All rights reserved.</p>
          <p className="mt-2">
            <span className="text-green-400">$</span> Press <kbd className="bg-gray-800 px-2 py-1 rounded text-xs">~</kbd> to access terminal
          </p>
        </div>
      </div>
    </footer>
  );
}
