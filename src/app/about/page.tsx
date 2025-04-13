import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Riley Porter | Battle With Bytes',
  description: 'Learn about Riley Porter, a cybersecurity engineer, reverse engineer, and firmware developer specializing in malware analysis, embedded systems, and secure software development.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-[#111111] p-6 sm:p-8 rounded-lg shadow-lg border border-gray-700">
        <h1 className="text-3xl font-bold text-[var(--accent-primary)] mb-6 border-b border-gray-600 pb-2">
          About Me
        </h1>

        <p className="text-[var(--foreground)] mb-4">
          Hi, I&apos;m <strong className="text-[var(--accent-primary)]">Riley Porter</strong>, a passionate cybersecurity engineer, reverse engineer, and firmware developer based in the United States. With a deep curiosity and a hands-on approach to technology, I spend my days immersed in the fascinating intersections of software, hardware, and security.
        </p>

        <h2 className="text-2xl font-semibold text-[var(--accent-primary)] mt-6 mb-3">My Work</h2>
        <p className="text-[var(--foreground)] mb-4">
          Professionally, I&apos;m dedicated to cybersecurity, specializing in malware analysis, reverse engineering, and exploit development. My toolkit regularly features <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">IDA Pro</code>, <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">YARA rules</code>, and <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">Python</code>, which help me dissect complex threats and secure digital environments. I&apos;m continually refining my skills, particularly in Android and Windows reverse engineering, and exploring <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">Rust</code> for secure and performant software development.
        </p>

        <h2 className="text-2xl font-semibold text-[var(--accent-primary)] mt-6 mb-3">Embedded Enthusiast</h2>
        <p className="text-[var(--foreground)] mb-4">
          Outside of my primary work, I find joy and creativity in embedded programming and electronics design. My projects often involve microcontrollers such as the <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">Raspberry Pi Pico</code>, <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">STM32</code>, and <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">nRF52840</code>, pushing the boundaries of what&apos;s possible with bare-metal programming, circuit design, and low-power solutions. Notably, my ongoing &quot;<strong className="text-[var(--accent-primary)]">Boats No Woes</strong>&quot; project exemplifies my dedication to creating practical, secure, and efficient IoT solutions.
        </p>

        <h2 className="text-2xl font-semibold text-[var(--accent-primary)] mt-6 mb-3">Software and Tools</h2>
        <p className="text-[var(--foreground)] mb-4">
          I&apos;m proficient in <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">Python</code>, employing it for everything from automation scripts to complex data analysis. My preferred development tools include <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">PyCharm</code>, <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">Visual Studio Code</code>, and <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">GitHub Actions</code> for CI/CD workflows. I&apos;m also familiar with modern frameworks and technologies like <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">FastAPI</code>, <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">Next.js</code>, <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">Flutter</code>, and <code className="bg-[#1a1a1a] text-[var(--foreground)] px-1 rounded">Flet</code>, using them to build responsive and robust applications.
        </p>

        <h2 className="text-2xl font-semibold text-[var(--accent-primary)] mt-6 mb-3">Maker and Innovator</h2>
        <p className="text-[var(--foreground)] mb-4">
          In my downtime, I embrace my maker side—whether it&apos;s CNC machining, PCB design, or exploring new culinary adventures. Engineering permeates all aspects of my life, even influencing my hobbies like grilling and fishing. I love experimenting and learning through hands-on experiences.
        </p>

        <h2 className="text-2xl font-semibold text-[var(--accent-primary)] mt-6 mb-3">Continuous Learner</h2>
        <p className="text-[var(--foreground)] mb-4">
          Driven by curiosity, I&apos;m always looking to deepen my understanding of advanced topics such as machine learning and firmware fuzzing. I&apos;m currently exploring the application of AI-driven automation for firmware security analysis and the use of machine learning techniques for practical, everyday problem-solving.
        </p>

        <h2 className="text-2xl font-semibold text-[var(--accent-primary)] mt-6 mb-3">Connect With Me</h2>
        <p className="text-[var(--foreground)] mb-4">
          I&apos;m always interested in discussing new projects, innovative ideas, or tackling challenging problems. Feel free to reach out if you&apos;d like to collaborate, share insights, or simply chat about tech over a cup of coffee!
        </p>

        <p className="text-[var(--foreground)] mt-8">
          Thanks for stopping by,
        </p>
        <p className="text-[var(--accent-primary)] font-semibold mt-1">
          Riley Porter
        </p>
      </div>
    </main>
  );
}
