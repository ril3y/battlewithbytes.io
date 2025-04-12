"use client";

import Link from "next/link";

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
                  className="hover:text-green-400 transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-400 transition-colors"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-400 transition-colors"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-800 text-center font-mono text-xs">
          <p>© {currentYear} Battle With Bytes. All rights reserved.</p>
          <p className="mt-2">
            <span className="text-green-400">$</span> Press <kbd className="bg-gray-800 px-2 py-1 rounded text-xs">~</kbd> to access terminal
          </p>
        </div>
      </div>
    </footer>
  );
}
