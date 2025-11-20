export default function STM32IDELayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Empty layout to bypass site navigation for fullscreen tool
  return <>{children}</>;
}
