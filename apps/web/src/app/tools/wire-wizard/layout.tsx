// Full-bleed layout for the Wire Wizard editor — overrides the parent
// app shell so the editor can claim the entire viewport. The page
// component is a 100vw/100vh client component.

export default function WireWizardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0a0a' }}>
      {children}
    </div>
  );
}
