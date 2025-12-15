# BattleMagic Project File Format Specification

Version 1.0 | November 2, 2025

## Overview

BattleMagic project files (.bmproj) use JSON format to store complete debugging session state. This specification defines the structure, validation rules, and migration strategy.

## File Extension

- **Primary**: `.bmproj`
- **Alternate**: `.json` (for compatibility)

## MIME Type

- `application/json`
- Recommended custom MIME: `application/x-battlemagic-project+json`

## Character Encoding

- UTF-8 (no BOM)

## Format Version

Current version: **1**

Version numbering:

- Increment for breaking changes
- Maintain backward compatibility via migration
- Version field required in all projects

## Schema Definition

### Root Object

```typescript
interface BattleMagicProject {
  metadata: ProjectMetadata;
  gdbSettings: GdbConnectionSettings;
  memoryMap: MemoryMapViewState;
  breakpoints: Breakpoint[];
  notes?: SessionNotes;
  activePanel?: string;
  customData?: Record<string, unknown>;
}
```

### ProjectMetadata

```typescript
interface ProjectMetadata {
  name: string; // Required, 1-100 characters
  description?: string; // Optional, 0-1000 characters
  createdAt: string; // Required, ISO 8601 timestamp
  lastModified: string; // Required, ISO 8601 timestamp
  version: number; // Required, integer >= 1
}
```

**Validation Rules:**

- `name`: Non-empty string, max 100 chars
- `description`: Optional string, max 1000 chars
- `createdAt`: Valid ISO 8601 datetime string
- `lastModified`: Valid ISO 8601 datetime string, >= createdAt
- `version`: Positive integer

### GdbConnectionSettings

```typescript
interface GdbConnectionSettings {
  baudRate: number; // Required, standard baud rate
  commandTimeout?: number; // Optional, milliseconds
}
```

**Validation Rules:**

- `baudRate`: Standard baud rate (9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600)
- `commandTimeout`: Optional, positive integer (1000-60000 ms)

**Standard Values:**

- Default baudRate: 230400
- Default commandTimeout: 15000

### MemoryMapViewState

```typescript
interface MemoryMapViewState {
  zoom: number; // Required, 0.5-3.0
  offset: {
    // Required
    x: number; // Pixels
    y: number; // Pixels
  };
  selectedCpu: string; // Required, CPU ID
  customRegions: MemoryRegion[]; // Required, can be empty
}

interface MemoryRegion {
  name: string; // Required
  start: number; // Required, hex address
  end: number; // Required, hex address
  size: number; // Required, bytes
  type: MemoryType; // Required, enum value
  permissions?: {
    // Optional
    read: boolean;
    write: boolean;
    execute: boolean;
  };
  description?: string; // Optional
  used?: number; // Optional, bytes
}

enum MemoryType {
  FLASH = "FLASH",
  RAM = "RAM",
  SRAM = "SRAM",
  PERIPHERAL = "PERIPHERAL",
  EXTERNAL_RAM = "EXTERNAL_RAM",
  EXTERNAL_DEVICE = "EXTERNAL_DEVICE",
  SYSTEM = "SYSTEM",
  RESERVED = "RESERVED",
  UNKNOWN = "UNKNOWN",
}
```

**Validation Rules:**

- `zoom`: Number between 0.5 and 3.0
- `offset`: Valid x/y pixel coordinates
- `selectedCpu`: Non-empty string matching a known CPU ID
- `customRegions`: Array of MemoryRegion objects
- `start`: Must be < end
- `end`: Must be > start
- `size`: Must equal (end - start + 1)
- `type`: Must be valid MemoryType enum value

### Breakpoint

```typescript
interface Breakpoint {
  id: string; // Required, unique identifier
  address: string; // Required, hex address or symbol
  type: "hardware" | "software"; // Required
  enabled: boolean; // Required
  condition?: string; // Optional, GDB condition
  hitCount?: number; // Optional, non-negative integer
  symbol?: string; // Optional, symbol name
  description?: string; // Optional, user description
}
```

**Validation Rules:**

- `id`: Non-empty unique string
- `address`: Valid hex address (0x...) or symbol name
- `type`: Must be 'hardware' or 'software'
- `enabled`: Boolean
- `condition`: Optional GDB condition expression
- `hitCount`: Optional non-negative integer
- `symbol`: Optional symbol name
- `description`: Optional string, max 200 chars

**ID Format:**

- Pattern: `bp_{timestamp}_{random}`
- Example: `bp_1730573456789_abc123def`

### SessionNotes

```typescript
interface SessionNotes {
  general?: string; // Optional, markdown text
  entries?: Array<{
    // Optional, timestamped entries
    timestamp: string; // ISO 8601
    note: string; // Entry text
  }>;
}
```

**Validation Rules:**

- `general`: Optional string, max 10000 chars
- `entries`: Optional array of note entries
- `timestamp`: Valid ISO 8601 datetime string
- `note`: Non-empty string, max 1000 chars per entry

## Example Project File

```json
{
  "metadata": {
    "name": "STM32F4 Motor Controller Debug",
    "description": "Debugging PWM generation and motor control logic",
    "createdAt": "2025-11-02T10:00:00.000Z",
    "lastModified": "2025-11-02T15:30:45.123Z",
    "version": 1
  },
  "gdbSettings": {
    "baudRate": 230400,
    "commandTimeout": 15000
  },
  "memoryMap": {
    "zoom": 1.5,
    "offset": {
      "x": 0,
      "y": 0
    },
    "selectedCpu": "stm32f407vg",
    "customRegions": [
      {
        "name": "External SRAM",
        "start": 1610612736,
        "end": 1611661311,
        "size": 1048576,
        "type": "EXTERNAL_RAM",
        "permissions": {
          "read": true,
          "write": true,
          "execute": false
        },
        "description": "IS62WV51216 SRAM on FSMC"
      }
    ]
  },
  "breakpoints": [
    {
      "id": "bp_1730573456789_abc123",
      "address": "0x08000000",
      "type": "hardware",
      "enabled": true,
      "description": "Main entry point",
      "hitCount": 0
    },
    {
      "id": "bp_1730573567890_def456",
      "address": "0x08001234",
      "type": "software",
      "enabled": true,
      "condition": "motor_speed > 1000",
      "description": "Motor overspeed check",
      "hitCount": 5
    }
  ],
  "notes": {
    "general": "## Session Goals\n\n1. Debug PWM generation\n2. Test motor control loop\n3. Verify safety limits",
    "entries": [
      {
        "timestamp": "2025-11-02T11:15:00.000Z",
        "note": "Found PWM frequency calculation error in TIM3 setup"
      },
      {
        "timestamp": "2025-11-02T14:20:00.000Z",
        "note": "Motor control PID gains need tuning - too aggressive"
      }
    ]
  },
  "activePanel": "breakpoints",
  "customData": {
    "projectTags": ["motor-control", "stm32", "pwm"],
    "hardware": "Custom motor controller board v2.1"
  }
}
```

## Validation Process

### Load-Time Validation

1. **JSON Parsing**: Valid JSON syntax
2. **Schema Validation**: All required fields present
3. **Type Checking**: Fields have correct types
4. **Value Validation**: Values within acceptable ranges
5. **Relationship Validation**: Cross-field constraints (e.g., start < end)
6. **Version Check**: Version number recognized

### Validation Function

```typescript
export function isValidProject(data: unknown): data is BattleMagicProject {
  if (!data || typeof data !== "object") return false;

  const project = data as BattleMagicProject;

  // Check required top-level properties
  if (
    !project.metadata ||
    !project.gdbSettings ||
    !project.memoryMap ||
    !project.breakpoints
  ) {
    return false;
  }

  // Check metadata
  if (
    !project.metadata.name ||
    !project.metadata.createdAt ||
    !project.metadata.lastModified
  ) {
    return false;
  }

  // Check version
  if (typeof project.metadata.version !== "number") {
    return false;
  }

  // Check gdbSettings
  if (typeof project.gdbSettings.baudRate !== "number") {
    return false;
  }

  // Check memoryMap
  if (
    typeof project.memoryMap.zoom !== "number" ||
    !project.memoryMap.offset ||
    !project.memoryMap.selectedCpu ||
    !Array.isArray(project.memoryMap.customRegions)
  ) {
    return false;
  }

  // Check breakpoints
  if (!Array.isArray(project.breakpoints)) {
    return false;
  }

  return true;
}
```

## Migration Strategy

### Version 1 → Version 2 (Future)

```typescript
export function migrateProject(
  project: BattleMagicProject,
): BattleMagicProject {
  const migrated = { ...project };

  // Ensure version is set
  if (!migrated.metadata.version) {
    migrated.metadata.version = 1;
  }

  // Version 1 → 2 migration
  if (migrated.metadata.version < 2) {
    // Add new fields with defaults
    // Example: migrated.newField = defaultValue;
  }

  // Update version number
  migrated.metadata.version = PROJECT_FORMAT_VERSION;

  return migrated;
}
```

### Backward Compatibility

- Older versions can be loaded and migrated automatically
- New optional fields have sensible defaults
- Breaking changes require major version increment
- Warning logged when migration occurs

## File Size Considerations

### Typical Sizes

| Project Type                                | Approximate Size |
| ------------------------------------------- | ---------------- |
| Minimal (no breakpoints, default CPU)       | ~1 KB            |
| Small (5-10 breakpoints)                    | ~3-5 KB          |
| Medium (20-50 breakpoints, notes)           | ~10-20 KB        |
| Large (100+ breakpoints, extensive notes)   | ~50-100 KB       |
| Very Large (custom regions, extensive data) | ~100-500 KB      |

### Optimization Tips

1. **Minimize Notes**: Keep session notes concise
2. **Remove Unused Breakpoints**: Clean up before saving
3. **Limit Custom Regions**: Only add necessary regions
4. **Compress**: Consider gzip for very large projects (future)

## Error Handling

### Common Errors

| Error                    | Cause                        | Recovery                       |
| ------------------------ | ---------------------------- | ------------------------------ |
| JSON Parse Error         | Invalid JSON syntax          | Show error, request valid file |
| Missing Required Field   | Incomplete project data      | Show specific field missing    |
| Invalid Version          | Unsupported version number   | Attempt migration or reject    |
| Invalid Memory Region    | start >= end or invalid type | Skip region with warning       |
| Duplicate Breakpoint IDs | Non-unique breakpoint IDs    | Regenerate IDs automatically   |

### Error Messages

- Clear, actionable error messages
- Indicate specific problem field
- Suggest correction when possible
- Log detailed errors to console

## Security Considerations

### File Upload

- **Size Limit**: Enforce max file size (e.g., 5MB)
- **Content Validation**: Strict JSON validation
- **Injection Prevention**: Sanitize string fields
- **Type Checking**: Verify all field types

### localStorage

- **Quota Management**: Handle quota exceeded
- **Data Validation**: Validate on every load
- **Corruption Detection**: Graceful handling of corrupt data
- **Clear Old Data**: Implement cleanup strategy

## Browser Compatibility

### localStorage Limits

| Browser | Limit  |
| ------- | ------ |
| Chrome  | ~10 MB |
| Firefox | ~10 MB |
| Safari  | ~5 MB  |
| Edge    | ~10 MB |

### Feature Detection

```typescript
function isLocalStorageAvailable(): boolean {
  try {
    const test = "__test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}
```

## Best Practices

### For Developers

1. **Always Validate**: Validate project data on load
2. **Handle Errors**: Graceful error handling
3. **Migrate Forward**: Support old versions
4. **Document Changes**: Update spec for new versions
5. **Test Thoroughly**: Test with various project sizes

### For Users

1. **Save Frequently**: Use auto-save or manual saves
2. **Descriptive Names**: Use clear project names
3. **Version Control**: Keep .bmproj in git
4. **Backup Important Sessions**: Download critical projects
5. **Clean Up**: Remove old/unnecessary breakpoints

## Future Enhancements

### Planned Features

1. **Compression**: Gzip compressed .bmproj.gz files
2. **Encryption**: Optional project encryption
3. **Metadata**: Additional tags, categories
4. **History**: Snapshots and version history
5. **Collaboration**: Multi-user support
6. **Cloud Storage**: Remote project storage

### Format Extensions

Future versions may include:

- Execution traces
- Performance profiling data
- Custom script attachments
- Binary file references
- Team collaboration metadata

## Change Log

### Version 1 (2025-11-02)

- Initial release
- Basic project structure
- Metadata, settings, breakpoints
- Memory map configuration
- Session notes support

---

**Specification Version**: 1.0
**Last Updated**: November 2, 2025
**Maintained By**: BattleMagic Development Team
