import Link from "next/link";
import Image from "next/image";

// Local dev ports for each tool (used when defined)
const LOCAL_DEV_PORTS: Record<string, number> = {
  battleterm: 5564,
  ucan: 5565,
  battleforge: 5566,
  battlemagic: 5567,
  wirewizard: 5563,
  "mosfet-calculator": 5561,
  "ohms-law-calculator": 5562,
};

const isDev = process.env.NODE_ENV === "development";

function getToolHref(toolSlug: string): string {
  if (isDev && LOCAL_DEV_PORTS[toolSlug]) {
    return `http://localhost:${LOCAL_DEV_PORTS[toolSlug]}`;
  }
  return `/tools/${toolSlug}`;
}

const tools = [
  {
    id: "01",
    category: "ELECTRONICS",
    name: "MOSFET Calculator",
    description:
      "Interactive tool for calculating MOSFET parameters, visualizing configurations, and determining conduction states.",
    href: getToolHref("mosfet-calculator"),
    logo: null,
  },
  {
    id: "02",
    category: "ELECTRONICS",
    name: "Ohm's Law Calculator",
    description:
      "Calculate voltage, current, resistance, and power using Ohm's Law with an interactive visualization and detailed explanations.",
    href: getToolHref("ohms-law-calculator"),
    logo: null,
  },
  {
    id: "03",
    category: "ENGINEERING",
    name: "Wire Wizard",
    description:
      "Create visual pinout & wiring harness maps for electrical connectors. Define, preview, and map electrical components.",
    href: getToolHref("wirewizard"),
    logo: "/images/tools/wirewizard.png",
  },
  {
    id: "04",
    category: "ENGINEERING",
    name: "BattleTerm",
    description:
      "Modern web-based serial port terminal with ANSI color support, hex view, macros, and full Unicode support for device communication.",
    href: getToolHref("battleterm"),
    logo: "/images/tools/battleterm.png",
  },
  {
    id: "05",
    category: "AUTOMOTIVE",
    name: "uCAN Monitor",
    description:
      "Browser-based CAN bus packet analyzer with real-time monitoring, filtering, and action automation for USB-to-CAN hardware.",
    href: getToolHref("ucan"),
    logo: "/images/tools/ucanlogo.png",
  },
  {
    id: "06",
    category: "EMBEDDED",
    name: "BattleForge",
    description:
      "Browser-based ARM development environment with in-browser compilation, flashing, and debugging for embedded systems.",
    href: getToolHref("battleforge"),
    logo: "/images/tools/battleforge.png",
  },
  {
    id: "07",
    category: "REVERSE ENGINEERING",
    name: "BattleMagic",
    description:
      "ARM firmware analysis and reverse engineering toolkit with disassembly, control flow graphs, and GDB integration.",
    href: getToolHref("battlemagic"),
    logo: "/images/tools/battlemagiclogo.png",
  },
];

export default function ToolsPage() {
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold font-mono mb-8 glow-text">
          <span className="text-green-400">&lt;</span> Interactive Tools{" "}
          <span className="text-green-400">/&gt;</span>
        </h1>

        <p className="text-xl text-gray-300 mb-12 max-w-3xl">
          Explore a collection of interactive engineering tools designed to
          simplify calculations and provide insights for hardware and software
          projects.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden hover:border-green-400/50 transition-all duration-300 transform hover:-translate-y-1 block !no-underline hover:!no-underline"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-green-400 font-mono text-sm">
                    {tool.id} {"//"} {tool.category}
                  </div>
                  {tool.logo && (
                    <Image
                      src={tool.logo}
                      alt={`${tool.name} logo`}
                      width={96}
                      height={96}
                      className="rounded"
                    />
                  )}
                </div>
                <h3 className="text-xl font-bold mb-3">{tool.name}</h3>
                <p className="text-gray-400 mb-4">{tool.description}</p>
                <span className="text-green-400 font-mono text-sm">
                  Open tool →
                </span>
              </div>
            </Link>
          ))}

          {/* Coming Soon Card */}
          <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden hover:border-green-400/50 transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="text-green-400 font-mono text-sm mb-4">
                COMING SOON
              </div>
              <h3 className="text-xl font-bold mb-3">More Tools</h3>
              <p className="text-gray-400 mb-4">
                Additional engineering and cybersecurity tools are in
                development.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
