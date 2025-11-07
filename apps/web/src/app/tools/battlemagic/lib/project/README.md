# BattleMagic Project System

The BattleMagic project system provides comprehensive save/load functionality for debugging sessions, allowing users to persist their work and share debugging configurations.

## Features

- **Project Files (.bmproj)**: JSON-based format for portable debugging sessions
- **Auto-Save**: Automatic saving to localStorage every 30 seconds (configurable)
- **Version Control**: Schema versioning for future format migrations
- **Complete State Capture**: Saves all essential debugging state

## Architecture

### Core Components

1. **types.ts** - TypeScript interfaces and validation
2. **ProjectManager.ts** - Service class for project operations
3. **ProjectMenu.tsx** - React component for UI

### What Gets Saved

A BattleMagic project includes:

- **Metadata**: Name, description, timestamps, version
- **GDB Settings**: Baud rate, connection timeout
- **Memory Map**: Selected CPU, custom regions, zoom/pan state
- **Breakpoints**: All breakpoints with conditions and hit counts
- **Session Notes**: Optional notes for documentation
- **Active Panel**: Last active debugging view

## Project File Format

### Structure

```json
{
  "metadata": {
    "name": "My Debug Session",
    "description": "Description here",
    "createdAt": "2025-11-02T18:00:00.000Z",
    "lastModified": "2025-11-02T18:30:00.000Z",
    "version": 1
  },
  "gdbSettings": {
    "baudRate": 230400,
    "commandTimeout": 15000
  },
  "memoryMap": {
    "zoom": 1.5,
    "offset": { "x": 0, "y": 0 },
    "selectedCpu": "stm32f407vg",
    "customRegions": [
      {
        "name": "External RAM",
        "start": 1610612736,
        "end": 1619001343,
        "size": 8388608,
        "type": "EXTERNAL_RAM",
        "permissions": {
          "read": true,
          "write": true,
          "execute": false
        }
      }
    ]
  },
  "breakpoints": [
    {
      "id": "bp_1730573456789_abc123",
      "address": "0x08000000",
      "type": "hardware",
      "enabled": true,
      "condition": "r0 == 0x42",
      "description": "Main entry point",
      "hitCount": 0
    }
  ],
  "notes": {
    "general": "Session notes here",
    "entries": [
      {
        "timestamp": "2025-11-02T18:00:00.000Z",
        "note": "Found bug in ISR handler"
      }
    ]
  },
  "activePanel": "breakpoints"
}
```

### Versioning

The project format uses semantic versioning:
- **Version 1**: Initial release format
- Future versions will include migration support

## Usage

### Creating a New Project

```typescript
import { ProjectManager } from './lib/project/ProjectManager';

const projectManager = new ProjectManager({
  onProjectLoaded: (project) => {
    console.log('Loaded:', project.metadata.name);
  },
  onProjectSaved: (project) => {
    console.log('Saved:', project.metadata.name);
  },
  onError: (message) => {
    console.error('Error:', message);
  }
});

// Create new project
const project = projectManager.newProject('My Debug Session');
```

### Saving a Project

```typescript
// Save to file (downloads .bmproj)
projectManager.saveToFile();

// Save to localStorage
projectManager.saveToLocalStorage();

// Export as JSON string
const json = projectManager.exportAsJson();
```

### Loading a Project

```typescript
// Load from file
await projectManager.loadFromFile(file);

// Load from localStorage
const loaded = projectManager.loadFromLocalStorage();

// Import from JSON string
projectManager.importFromJson(jsonString);
```

### Auto-Save

```typescript
// Enable auto-save (saves every 30 seconds)
projectManager.setAutoSave(true);
projectManager.startAutoSave();

// Disable auto-save
projectManager.setAutoSave(false);
projectManager.stopAutoSave();

// Check if auto-save is enabled
const enabled = projectManager.isAutoSaveEnabled();
```

### Updating Project State

```typescript
// Update entire project
projectManager.updateProject({
  gdbSettings: { baudRate: 115200 },
  memoryMap: { selectedCpu: 'stm32f407vg', customRegions: [...] },
  breakpoints: [...]
});

// Update just metadata
projectManager.updateMetadata('New Name', 'New description');

// Check for unsaved changes
const hasChanges = projectManager.hasChanges();
```

## UI Integration

The ProjectMenu component provides a dropdown interface:

```tsx
<ProjectMenu
  projectName={projectName}
  hasUnsavedChanges={hasUnsavedChanges}
  autoSaveEnabled={autoSaveEnabled}
  onNew={handleNewProject}
  onSave={handleSaveProject}
  onLoad={handleLoadProject}
  onAutoSaveToggle={handleAutoSaveToggle}
  onEditMetadata={handleEditMetadata}
/>
```

### Menu Options

- **New Project**: Create fresh project (warns if unsaved changes)
- **Save Project**: Download .bmproj file
- **Load Project**: Upload .bmproj file
- **Edit Project Info**: Change name and description
- **Auto-save Toggle**: Enable/disable auto-save

## Implementation Details

### State Management

The project system integrates with BattleMagicMonitor's state:

1. Project state is initialized on mount
2. Changes to any tracked state trigger project updates
3. Auto-save monitors changes and saves periodically
4. Manual saves download the project file

### localStorage Keys

- `battlemagic_current_project` - Current project data
- `battlemagic_autosave_enabled` - Auto-save preference

### Error Handling

All operations include try/catch blocks and notify via callbacks:
- Invalid JSON format
- Missing required fields
- File read/write failures
- localStorage quota exceeded

## Future Enhancements

Potential additions for future versions:

1. **IndexedDB Storage**: Multiple saved projects
2. **Cloud Sync**: Share projects across devices
3. **Project Templates**: Pre-configured setups
4. **Export/Import Formats**: Support for other debugger formats
5. **Compression**: Gzip compressed project files
6. **Session Recording**: Capture execution history
7. **Diff View**: Compare project states
8. **Team Collaboration**: Shared debugging sessions

## Migration Support

When loading projects with older version numbers:

```typescript
export function migrateProject(project: BattleMagicProject): BattleMagicProject {
  const migrated = { ...project };

  // Version 1 -> 2 migration
  if (migrated.metadata.version < 2) {
    // Add new fields with defaults
    migrated.newField = defaultValue;
  }

  // Update version
  migrated.metadata.version = PROJECT_FORMAT_VERSION;
  return migrated;
}
```

## File Size Considerations

Typical project file sizes:
- Minimal project: ~1KB
- With breakpoints and notes: ~5-10KB
- With extensive custom regions: ~20-50KB

localStorage quota is typically 5-10MB per origin, sufficient for many projects.

## Best Practices

1. **Save frequently**: Use auto-save for automatic backups
2. **Descriptive names**: Use clear project names for organization
3. **Add notes**: Document findings and issues in session notes
4. **Version control**: Keep .bmproj files in your project repository
5. **Export important sessions**: Download critical debugging configurations

## Troubleshooting

### Project won't load
- Check file is valid JSON
- Verify all required fields are present
- Check console for specific error messages

### Auto-save not working
- Verify auto-save is enabled
- Check localStorage is available
- Check for quota exceeded errors

### Lost project data
- Check localStorage for auto-saved data
- Look for .bmproj files in downloads folder
- Browser cache may contain backup data

## API Reference

See individual files for detailed API documentation:
- [types.ts](./types.ts) - Type definitions and validation
- [ProjectManager.ts](./ProjectManager.ts) - Core project operations
- [ProjectMenu.tsx](../components/ProjectMenu.tsx) - UI component
