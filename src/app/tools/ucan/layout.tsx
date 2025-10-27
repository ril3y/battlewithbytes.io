/**
 * Custom layout for uCAN tool
 *
 * Bypasses the site navigation/footer to provide a full-screen experience
 */
export default function UCANLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
