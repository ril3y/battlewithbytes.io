import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black"></div>
          {/* Updated grid pattern to match global style */}
          <div className="absolute inset-0 bg-[linear-gradient(var(--grid-color)_1px,_transparent_1px),_linear-gradient(90deg,_var(--grid-color)_1px,_transparent_1px)] bg-[length:30px_30px] bg-[0_0]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between py-8 gap-8 md:gap-16">
            <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-start">
              <img
                src="/images/site_logo.png"
                alt="Battle With Bytes Logo"
                width={700}
                height={380}
                className="drop-shadow-2xl rounded-2xl border border-gray-800 bg-black"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
            <div className="flex-1 text-center md:text-left max-w-xl">
              <div className="h-16 md:h-24" aria-hidden="true"></div>
              <p className="text-xl md:text-2xl text-gray-300 mb-4 font-mono">
                <span className="text-green-400">$</span> Ask me about little data.
              </p>
              <p className="text-md md:text-lg text-gray-400 mb-8 font-mono">
                A personal hub for sharing insights on cybersecurity, embedded hardware,<br />
                and software engineering through a diverse mix of content.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/blog" className="button">
                  Read the Blog
                </Link>
                <Link href="/tools" className="button">
                  Explore Tools
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content Section */}
      <section className="py-16 px-4 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-mono font-bold mb-12 text-center">
            <span className="text-green-400">&lt;</span> Featured Content <span className="text-green-400">/&gt;</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Featured Blog */}
            <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden hover:border-green-400/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6">
                <div className="text-green-400 font-mono text-sm mb-2">01 // BLOG</div>
                <h3 className="text-xl font-bold mb-3">Cybersecurity Insights</h3>
                <p className="text-gray-400 mb-4">
                  Deep dives into security topics, vulnerability research, and practical defense strategies.
                </p>
                <Link href="/blog" className="text-green-400 font-mono text-sm hover:underline">
                  Read more →
                </Link>
              </div>
            </div>
            
            {/* Featured Tools */}
            <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden hover:border-green-400/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6">
                <div className="text-green-400 font-mono text-sm mb-2">02 // TOOLS</div>
                <h3 className="text-xl font-bold mb-3">Engineering Calculators</h3>
                <p className="text-gray-400 mb-4">
                  Interactive tools for hardware engineers, including MOSFET power calculators and more.
                </p>
                <Link href="/tools" className="text-green-400 font-mono text-sm hover:underline">
                  Explore tools →
                </Link>
              </div>
            </div>
            
            {/* Featured Projects */}
            <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden hover:border-green-400/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6">
                <div className="text-green-400 font-mono text-sm mb-2">03 // PROJECTS</div>
                <h3 className="text-xl font-bold mb-3">Open Source Work</h3>
                <p className="text-gray-400 mb-4">
                  Highlights of personal and collaborative projects in embedded systems and software development.
                </p>
                <Link href="/projects" className="text-green-400 font-mono text-sm hover:underline">
                  View projects →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Terminal Tip Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block bg-black/70 border border-gray-800 rounded-lg p-6 font-mono">
            <p className="text-gray-400 mb-2">Press <kbd className="bg-gray-800 px-2 py-1 rounded text-xs">~</kbd> to access the terminal</p>
            <p className="text-green-400">Try commands like <code>help</code>, <code>about</code>, or <code>blog</code></p>
          </div>
        </div>
      </section>
    </main>
  );
}