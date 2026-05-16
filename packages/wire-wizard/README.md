# @battlewithbytes/wire-wizard

Interactive wiring-diagram editor and read-only viewer. Used by the
`/tools/wire-wizard` route on the main site, and embeddable into MDX
project pages via `<WireWizardViewer diagram={...} />`.

## Usage

```tsx
import { WireWizardEditor, WireWizardViewer } from '@battlewithbytes/wire-wizard';

// Full editor
<WireWizardEditor fullScreen />

// Read-only embed in MDX
import diagram from './wiring.json';
<WireWizardViewer diagram={diagram} height={500} />
```

## Build

```
pnpm --filter @battlewithbytes/wire-wizard build
```

Produces `dist/` consumed by `apps/web`.
