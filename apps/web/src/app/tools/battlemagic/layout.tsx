/**
 * Custom layout for BattleMagic tool
 *
 * Bypasses the site navigation/footer to provide a full-screen experience
 */
export default function BattleMagicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
