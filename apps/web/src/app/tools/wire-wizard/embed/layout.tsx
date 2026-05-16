// Embed route runs full-viewport with no site chrome — designed to be
// loaded inside an <iframe> on any other page.

export default function WireWizardEmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0a0a' }}>
      {children}
    </div>
  );
}
