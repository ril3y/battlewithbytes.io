export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black"></div>
          {/* Animated circuit pattern background - purely CSS */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--accent-primary)_0.5px,_transparent_1px)] bg-[length:20px_20px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold font-mono mb-6 glow-text">
              <span className="text-white">Battle</span>
              <span className="text-green-400">With</span>
              <span className="text-white">Bytes</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 font-mono max-w-2xl mx-auto md:mx-0">
              <span className="text-green-400">$</span> Ask me about little data.
            </p>
            <p className="text-md md:text-lg text-gray-400 mb-12 max-w-2xl mx-auto md:mx-0">
              A personal hub for sharing insights on cybersecurity, embedded hardware, 
              and software engineering through a diverse mix of content.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a href="/blog" className="button">
                Read the Blog
              </a>
              <a href="/tools" className="button">
                Explore Tools
              </a>
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
                <a href="/blog" className="text-green-400 font-mono text-sm hover:underline">
                  Read more →
                </a>
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
                <a href="/tools" className="text-green-400 font-mono text-sm hover:underline">
                  Explore tools →
                </a>
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
                <a href="/projects" className="text-green-400 font-mono text-sm hover:underline">
                  View projects →
                </a>
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