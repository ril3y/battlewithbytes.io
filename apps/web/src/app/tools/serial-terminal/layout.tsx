import { Metadata } from "next";

export const metadata: Metadata = {
  manifest: "/tools/serial-terminal/manifest.json",
};

export default function SerialTerminalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Empty layout to bypass site navigation for fullscreen tool
  return <>{children}</>;
}
