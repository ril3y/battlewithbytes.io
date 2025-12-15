# @battlewithbytes/ui

Shared UI component library for the BattleWithBytes monorepo.

## Components

This package provides the following React components:

- **Alert** - Alert notifications with variants (info, success, warning, danger)
- **Badge** - Styled badges with size and variant options
- **Button** - Button component with variants (primary, secondary, danger, ghost) and loading state
- **Card** - Card container with Header, Content, and Footer sub-components
- **Input** - Text input with label, error, and help text support
- **Select** - Select dropdown with label, error, and help text support
- **TextArea** - Multi-line text area with label, error, and help text support
- **Tooltip** - Hover tooltip with customizable position

## Installation

This package is part of the BattleWithBytes monorepo and is meant to be used as a workspace dependency.

```json
{
  "dependencies": {
    "@battlewithbytes/ui": "workspace:*"
  }
}
```

## Usage

```tsx
import { Button, Card, CardHeader, CardContent, Input } from "@battlewithbytes/ui";

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <h2>Example Form</h2>
      </CardHeader>
      <CardContent>
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
        />
        <Button variant="primary">Submit</Button>
      </CardContent>
    </Card>
  );
}
```

## Development

```bash
# Type checking
pnpm run type-check

# Linting
pnpm run lint
```

## Styling

All components use Tailwind CSS classes and include the `cn()` utility for class merging.
