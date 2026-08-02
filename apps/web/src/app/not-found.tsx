import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-xl w-full text-center font-mono">
        <p className="text-green-400 text-sm mb-4">
          $ curl --fail battlewithbytes.io{" "}
          <span className="text-gray-500">{"// exit code 22"}</span>
        </p>
        <h1 className="text-6xl md:text-8xl font-bold glow-text mb-4">
          <span className="text-green-400">4</span>0
          <span className="text-green-400">4</span>
        </h1>
        <p className="text-xl text-gray-300 mb-2">SIGNAL NOT FOUND</p>
        <p className="text-gray-500 mb-8">
          The page you probed does not exist, was moved, or never enumerated.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="border border-green-400/50 text-green-400 px-6 py-2 rounded hover:bg-green-400/10 transition-colors"
          >
            cd ~/
          </Link>
          <Link
            href="/blog"
            className="border border-gray-700 text-gray-300 px-6 py-2 rounded hover:border-green-400/50 hover:text-green-400 transition-colors"
          >
            ls /blog
          </Link>
          <Link
            href="/tools"
            className="border border-gray-700 text-gray-300 px-6 py-2 rounded hover:border-green-400/50 hover:text-green-400 transition-colors"
          >
            ls /tools
          </Link>
        </div>
      </div>
    </main>
  );
}
