import { WireMapper } from "@/components/WireMapper";

export default function WireMapperPage() {
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold font-mono mb-8 glow-text">
          <span className="text-green-400">&lt;</span> Wire Mapper{" "}
          <span className="text-green-400">/&gt;</span>
        </h1>

        <p className="text-xl text-gray-300 mb-12 max-w-3xl">
          Create visual pinout & wiring harness maps for electrical connectors.
          Define connector layouts, assign pin names, and map connections with
          this interactive tool.
        </p>

        <WireMapper />
      </div>
    </main>
  );
}
