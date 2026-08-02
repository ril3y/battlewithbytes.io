/**
 * Component Library Entry Point
 *
 * Central registry for all modular components.
 * Components are organized in self-contained folders with:
 * - config.yaml: Component metadata and configuration schema
 * - generator.ts: SVG generation logic using shared utilities
 *
 * To add a new component:
 * 1. Create a folder in /components/{component-id}/
 * 2. Add config.yaml with metadata and config schema
 * 3. Add generator.ts implementing the GeneratorResult interface
 * 4. Import and register in the COMPONENT_REGISTRY below
 */

import type { ComponentDefinition, ComponentMetadata, ConfigField, ConnectionPointDefinition, GeneratorResult } from './types';

// Import component generators - Power Distribution
import { generate as generateBusBar, getDimensions as getBusBarDimensions } from './components/bus-bar/generator';
import { generate as generatePowerBusBar, getDimensions as getPowerBusBarDimensions } from './components/power-bus-bar/generator';
import { generate as generateCurrentShunt, getDimensions as getCurrentShuntDimensions } from './components/current-shunt/generator';
import { generate as generateFuseBlock, getDimensions as getFuseBlockDimensions } from './components/fuse-block/generator';
import { generate as generateInlineFuse, getDimensions as getInlineFuseDimensions } from './components/inline-fuse/generator';
import { generate as generateHeavyDutyFuse, getDimensions as getHeavyDutyFuseDimensions } from './components/heavy-duty-fuse/generator';
import { generate as generateDCDCConverter, getDimensions as getDCDCConverterDimensions } from './components/dc-dc-converter/generator';
import { generate as generateDalyBMS, getDimensions as getDalyBMSDimensions } from './components/daly-bms/generator';

// Import component generators - Relays & Switches
import { generate as generatePrechargeResistor, getDimensions as getPrechargeResistorDimensions } from './components/precharge-resistor/generator';
import { generate as generateFlybackDiode, getDimensions as getFlybackDiodeDimensions } from './components/flyback-diode/generator';
import { generate as generateRelay, getDimensions as getRelayDimensions } from './components/relay/generator';
import { generate as generateToggleSwitch, getDimensions as getToggleSwitchDimensions } from './components/toggle-switch/generator';
import { generate as generateIgnitionKeySwitch, getDimensions as getIgnitionKeySwitchDimensions } from './components/ignition-key-switch/generator';
import { generate as generateDCContactor, getDimensions as getDCContactorDimensions } from './components/dc-contactor/generator';

// Import component generators - Lighting
import { generate as generateLEDHeadlight, getDimensions as getLEDHeadlightDimensions } from './components/led-headlight/generator';

// Import component generators - Solar
import { generate as generateRenogyMPPT, getDimensions as getRenogyMPPTDimensions } from './components/renogy-mppt/generator';
import { generate as generateSolarPanel, getDimensions as getSolarPanelDimensions } from './components/solar-panel/generator';

// Import component generators - Motor Control
import { generate as generateKellyKLS, getDimensions as getKellyKLSDimensions } from './components/kelly-kls/generator';
import { generate as generateHubMotor, getDimensions as getHubMotorDimensions } from './components/hub-motor/generator';

// Import component generators - Microcontrollers
import { generate as generateESP32DevKit, getDimensions as getESP32DevKitDimensions } from './components/esp32-devkit/generator';
import { generate as generateSHCA1600, getDimensions as getSHCA1600Dimensions } from './components/shca-1600-4/generator';

// Import component generators - Generic Switches & Controls
import { generate as generateBatteryDisconnect, getDimensions as getBatteryDisconnectDimensions } from './components/battery-disconnect/generator';
import { generate as generatePushbutton, getDimensions as getPushbuttonDimensions } from './components/pushbutton/generator';
import { generate as generateSPSTSwitch, getDimensions as getSPSTSwitchDimensions } from './components/spst-switch/generator';
import { generate as generateKillSwitch, getDimensions as getKillSwitchDimensions } from './components/kill-switch/generator';

// Import component generators - Generic Passive Components
import { generate as generateBatterySymbol, getDimensions as getBatterySymbolDimensions } from './components/battery-symbol/generator';
import { generate as generateDiode, getDimensions as getDiodeDimensions } from './components/diode/generator';
import { generate as generateGroundSymbol, getDimensions as getGroundSymbolDimensions } from './components/ground-symbol/generator';
import { generate as generateCircuitBreaker, getDimensions as getCircuitBreakerDimensions } from './components/circuit-breaker/generator';
import { generate as generateLEDIndicator, getDimensions as getLEDIndicatorDimensions } from './components/led-indicator/generator';

// Import component generators - Generic Connectors & Terminals
import { generate as generateAndersonConnector, getDimensions as getAndersonConnectorDimensions } from './components/anderson-connector/generator';
import { generate as generateTerminalBlock, getDimensions as getTerminalBlockDimensions } from './components/terminal-block/generator';
import { generate as generateXTConnector, getDimensions as getXTConnectorDimensions } from './components/xt-connector/generator';
import { generate as generateRingTerminal, getDimensions as getRingTerminalDimensions } from './components/ring-terminal/generator';
import { generate as generateWireJunction, getDimensions as getWireJunctionDimensions } from './components/wire-junction/generator';

// NOTE: the custom-svg generator is not imported here — it is re-exported
// directly from its module further down (see the `export { ... } from
// './components/custom-svg/generator'` block).

// ============================================================================
// Component Metadata
// ============================================================================

const BUS_BAR_METADATA: ComponentMetadata = {
  id: 'bus-bar',
  name: 'Bus Bar',
  category: 'distribution',
  description: 'Power distribution bus bar with screw terminal lugs',
  tags: ['power', 'distribution', 'bus', 'rail', 'configurable'],
  isCommonBus: true,
  config: {
    numberOfLugs: {
      type: 'number',
      label: 'Number of Lugs',
      default: 4,
      min: 2,
      max: 12,
      step: 1,
      description: 'Number of connection points on the bus bar',
    },
    screwsPerLug: {
      type: 'select',
      label: 'Screws per Lug',
      default: 2,
      options: [
        { value: 1, label: 'Single' },
        { value: 2, label: 'Double' },
        { value: 3, label: 'Triple' },
      ],
      description: 'Number of screws for each lug position',
    },
    barColor: {
      type: 'select',
      label: 'Bar Material',
      default: '#c0c0c0',
      options: [
        { value: '#c0c0c0', label: 'Silver/Aluminum' },
        { value: '#d4a574', label: 'Copper/Brass' },
      ],
      description: 'Material color of the bus bar',
    },
    lugSpacing: {
      type: 'number',
      label: 'Lug Spacing',
      default: 45,
      min: 30,
      max: 60,
      step: 5,
      description: 'Space between lugs in pixels',
    },
  },
};

const POWER_BUS_BAR_METADATA: ComponentMetadata = {
  id: 'power-bus-bar',
  name: 'Power Bus Bar',
  category: 'distribution',
  description: 'Heavy-duty hex-stud bus bar for high-current battery / DC power distribution',
  tags: ['bus', 'bar', 'power', 'distribution', 'stud', 'battery', 'marine', 'high-current'],
  isCommonBus: true,
  config: {
    numberOfStuds: {
      type: 'number',
      label: 'Number of Studs',
      default: 6,
      min: 2,
      max: 10,
      step: 1,
    },
    studSize: {
      type: 'select',
      label: 'Stud Size',
      default: 'M8',
      options: [
        { value: 'M6', label: 'M6' },
        { value: 'M8', label: 'M8' },
        { value: 'M10', label: 'M10' },
      ],
    },
    baseColor: {
      type: 'color',
      label: 'Base Color',
      default: '#1a1a1a',
      description: 'Insulating base color (#cc0000 = positive, #1a1a1a = negative)',
    },
    currentRating: {
      type: 'select',
      label: 'Current Rating',
      default: 250,
      options: [
        { value: 100, label: '100A' },
        { value: 150, label: '150A' },
        { value: 250, label: '250A' },
        { value: 500, label: '500A' },
        { value: 800, label: '800A' },
      ],
    },
    showCover: {
      type: 'boolean',
      label: 'Show Clear Cover',
      default: false,
      description: 'Render a translucent plastic cover over the studs',
    },
    showLabel: {
      type: 'boolean',
      label: 'Show Rating Label',
      default: true,
    },
  },
};

const CURRENT_SHUNT_METADATA: ComponentMetadata = {
  id: 'current-shunt',
  name: 'Current Shunt',
  category: 'measurement',
  description: 'Precision current shunt resistor for high-current measurement',
  tags: ['current', 'measurement', 'shunt', 'resistor'],
  config: {
    resistance: {
      type: 'select',
      label: 'Resistance/Drop',
      default: 75,
      options: [
        { value: 50, label: '50mV' },
        { value: 75, label: '75mV' },
        { value: 100, label: '100mV' },
      ],
      description: 'Voltage drop at rated current',
    },
    currentRating: {
      type: 'select',
      label: 'Current Rating',
      default: 100,
      options: [
        { value: 50, label: '50A' },
        { value: 100, label: '100A' },
        { value: 200, label: '200A' },
        { value: 500, label: '500A' },
      ],
      description: 'Maximum rated current',
    },
    blockColor: {
      type: 'color',
      label: 'Terminal Color',
      default: '#d4a574',
      description: 'Color of the terminal blocks (brass/copper)',
    },
    baseColor: {
      type: 'color',
      label: 'Base Color',
      default: '#1a1a1a',
      description: 'Color of the insulating base',
    },
    showLabels: {
      type: 'boolean',
      label: 'Show Labels',
      default: true,
      description: 'Display current/voltage labels on the base',
    },
  },
};

const FUSE_BLOCK_METADATA: ComponentMetadata = {
  id: 'fuse-block',
  name: 'Fuse Block',
  category: 'protection',
  description: 'Multi-position automotive fuse block with configurable ratings',
  tags: ['fuse', 'power', 'distribution', 'automotive', 'configurable'],
  config: {
    numberOfFuses: {
      type: 'number',
      label: 'Number of Fuses',
      default: 6,
      min: 2,
      max: 12,
      step: 1,
      description: 'Total number of fuse positions',
    },
    layout: {
      type: 'select',
      label: 'Layout',
      default: 'single-row',
      options: [
        { value: 'single-row', label: 'Single Row' },
        { value: 'double-row', label: 'Double Row (2 columns)' },
      ],
      description: 'Arrangement of fuse positions',
    },
    fuseRatings: {
      type: 'array',
      label: 'Fuse Ratings',
      default: [10, 10, 15, 15, 20, 20],
      items: {
        type: 'number',
        label: 'Rating (A)',
        default: 10,
        min: 1,
        max: 120,
      },
      description: 'Amperage rating for each fuse position',
    },
    showRatings: {
      type: 'boolean',
      label: 'Show Ratings',
      default: true,
      description: 'Display amperage labels below each fuse',
    },
  },
};

const INLINE_FUSE_METADATA: ComponentMetadata = {
  id: 'inline-fuse',
  name: 'Inline Fuse',
  category: 'protection',
  description: 'Inline fuse holder with customizable amperage rating',
  tags: ['fuse', 'protection', 'inline'],
  config: {
    amperage: {
      type: 'select',
      label: 'Amperage',
      default: 10,
      options: [
        { value: 5, label: '5A (Tan)' },
        { value: 10, label: '10A (Red)' },
        { value: 15, label: '15A (Blue)' },
        { value: 20, label: '20A (Yellow)' },
        { value: 25, label: '25A (Clear)' },
        { value: 30, label: '30A (Green)' },
        { value: 35, label: '35A (Purple)' },
        { value: 40, label: '40A (Orange)' },
      ],
      description: 'Amperage rating of the fuse',
    },
    wireColor: {
      type: 'color',
      label: 'Wire Color',
      default: '#e74c3c',
      description: 'Color of the wire leads',
    },
  },
};

const HEAVY_DUTY_FUSE_METADATA: ComponentMetadata = {
  id: 'heavy-duty-fuse',
  name: 'High Current Fuse',
  category: 'protection',
  description: 'High amperage ANL-style fuse for main battery/inverter protection',
  tags: ['fuse', 'anl', 'high-current', 'protection', 'inverter', 'battery'],
  config: {
    amperage: {
      type: 'select',
      label: 'Amperage',
      default: 300,
      options: [
        { value: 80, label: '80A' },
        { value: 100, label: '100A' },
        { value: 150, label: '150A' },
        { value: 200, label: '200A' },
        { value: 250, label: '250A' },
        { value: 300, label: '300A' },
        { value: 400, label: '400A' },
        { value: 500, label: '500A' },
        { value: 600, label: '600A' },
        { value: 800, label: '800A' },
        { value: 1000, label: '1000A' }
      ],
      description: 'Fuse rating',
    },
  },
};

const DC_DC_CONVERTER_METADATA: ComponentMetadata = {
  id: 'dc-dc-converter',
  name: 'DC-DC Converter',
  category: 'distribution',
  description: 'Step-down DC-DC converter with heat sink',
  tags: ['converter', 'dc-dc', 'step-down', 'voltage', 'regulator'],
  config: {
    inputVoltage: {
      type: 'select',
      label: 'Input Voltage',
      default: 48,
      options: [
        { value: 24, label: '24V' },
        { value: 36, label: '36V' },
        { value: 48, label: '48V' },
        { value: 72, label: '72V' },
      ],
      description: 'Input voltage rating',
    },
    outputVoltage: {
      type: 'select',
      label: 'Output Voltage',
      default: 12,
      options: [
        { value: 5, label: '5V' },
        { value: 12, label: '12V' },
        { value: 24, label: '24V' },
      ],
      description: 'Output voltage rating',
    },
  },
};

const DALY_BMS_METADATA: ComponentMetadata = {
  id: 'daly-bms',
  name: 'Daly Smart BMS',
  category: 'distribution',
  description: 'Daly Smart BMS with communication ports',
  tags: ['bms', 'battery', 'management', 'daly', 'smart', 'lithium'],
  config: {
    cellCount: {
      type: 'select',
      label: 'Cell Count',
      default: 4,
      options: [
        { value: 3, label: '3S' },
        { value: 4, label: '4S' },
        { value: 7, label: '7S' },
        { value: 8, label: '8S' },
        { value: 13, label: '13S' },
        { value: 16, label: '16S' },
      ],
      description: 'Number of battery cells in series',
    },
    currentRating: {
      type: 'select',
      label: 'Current Rating',
      default: 100,
      options: [
        { value: 50, label: '50A' },
        { value: 100, label: '100A' },
        { value: 150, label: '150A' },
        { value: 200, label: '200A' },
      ],
      description: 'Maximum current rating',
    },
  },
};

const PRECHARGE_RESISTOR_METADATA: ComponentMetadata = {
  id: 'precharge-resistor',
  name: 'Precharge Resistor',
  category: 'protection',
  description: 'Inline ring-terminal power resistor for precharging motor controller capacitance',
  tags: ['precharge', 'resistor', 'inline', 'ring-terminal', 'contactor', 'ev'],
  config: {
    resistance: {
      type: 'number',
      label: 'Resistance (Ω)',
      default: 100,
      min: 1,
      max: 10000,
      step: 1,
      description: 'Resistance in ohms',
    },
    wattage: {
      type: 'select',
      label: 'Wattage',
      default: 25,
      options: [
        { value: 5, label: '5W' },
        { value: 10, label: '10W' },
        { value: 25, label: '25W' },
        { value: 50, label: '50W' },
      ],
      description: 'Power dissipation rating',
    },
    bodyColor: {
      type: 'color',
      label: 'Body Color',
      default: '#5fa8c0',
      description: 'Color of the resistor body',
    },
    terminalColor: {
      type: 'color',
      label: 'Heat Shrink Color',
      default: '#cc0000',
      description: 'Color of the heat shrink covering the leads',
    },
    studSize: {
      type: 'select',
      label: 'Stud Size',
      default: 'M8',
      options: [
        { value: 'M6', label: 'M6' },
        { value: 'M8', label: 'M8' },
        { value: 'M10', label: 'M10' },
      ],
      description: 'Ring terminal stud size',
    },
    showValue: {
      type: 'boolean',
      label: 'Show Value',
      default: true,
      description: 'Display the resistance/wattage label',
    },
  },
};

const FLYBACK_DIODE_METADATA: ComponentMetadata = {
  id: 'flyback-diode',
  name: 'Flyback Diode',
  category: 'protection',
  description: 'Inline ring-terminal diode assembly for suppressing contactor coil flyback spikes',
  tags: ['flyback', 'diode', 'inline', 'ring-terminal', 'contactor', 'snubber', 'coil'],
  config: {
    voltage: {
      type: 'select',
      label: 'Reverse Voltage',
      default: 600,
      options: [
        { value: 50, label: '50V' },
        { value: 100, label: '100V' },
        { value: 200, label: '200V' },
        { value: 400, label: '400V' },
        { value: 600, label: '600V' },
        { value: 1000, label: '1000V' },
      ],
      description: 'Maximum reverse voltage rating (PIV)',
    },
    current: {
      type: 'select',
      label: 'Forward Current',
      default: 6,
      options: [
        { value: 1, label: '1A' },
        { value: 3, label: '3A' },
        { value: 6, label: '6A' },
        { value: 10, label: '10A' },
      ],
      description: 'Continuous forward current rating',
    },
    cathodeOnRight: {
      type: 'boolean',
      label: 'Cathode on Right',
      default: true,
      description: 'Orientation of the diode (cathode side has the band)',
    },
    diodeBodyColor: {
      type: 'color',
      label: 'Diode Body Color',
      default: '#1a1a1a',
      description: 'Color of the diode body',
    },
    terminalColor: {
      type: 'color',
      label: 'Heat Shrink Color',
      default: '#cc0000',
      description: 'Color of the heat shrink covering the leads',
    },
    studSize: {
      type: 'select',
      label: 'Stud Size',
      default: 'M8',
      options: [
        { value: 'M6', label: 'M6' },
        { value: 'M8', label: 'M8' },
        { value: 'M10', label: 'M10' },
      ],
      description: 'Ring terminal stud size',
    },
    showValue: {
      type: 'boolean',
      label: 'Show Value',
      default: true,
      description: 'Display the diode rating label',
    },
  },
};

const RELAY_METADATA: ComponentMetadata = {
  id: 'relay',
  name: 'Automotive Relay',
  category: 'relays',
  description: 'Configurable automotive relay (4-pin/5-pin)',
  tags: ['relay', 'switch', 'automotive', 'spst', 'spdt'],
  config: {
    type: {
      type: 'select',
      label: 'Type',
      default: '5-pin',
      options: [
        { value: '4-pin', label: '4-Pin (SPST)' },
        { value: '5-pin', label: '5-Pin (SPDT)' },
      ],
      description: 'Relay configuration',
    },
    label: {
      type: 'string',
      label: 'Label',
      default: 'RELAY',
      description: 'Label printed on the relay',
    },
    voltage: {
      type: 'select',
      label: 'Voltage',
      default: 12,
      options: [
        { value: 12, label: '12V' },
        { value: 24, label: '24V' },
        { value: 48, label: '48V' },
      ],
      description: 'Rated coil voltage',
    },
    amperage: {
      type: 'select',
      label: 'Amperage',
      default: 40,
      options: [
        { value: 20, label: '20A' },
        { value: 30, label: '30A' },
        { value: 40, label: '40A' },
        { value: 60, label: '60A' },
        { value: 80, label: '80A' },
      ],
      description: 'Rated contact current',
    },
    bodyColor: {
      type: 'color',
      label: 'Body Color',
      default: '#1a1a1a',
      description: 'Color of relay housing',
    },
    showSchematic: {
      type: 'boolean',
      label: 'Show Schematic',
      default: true,
      description: 'Display circuit schematic on top',
    }
  },
};

const TOGGLE_SWITCH_METADATA: ComponentMetadata = {
  id: 'toggle-switch',
  name: 'Toggle Switch',
  category: 'relays',
  description: 'Simple toggle switch',
  tags: ['switch', 'toggle', 'manual'],
  config: {
    leverColor: {
      type: 'color',
      label: 'Lever Color',
      default: '#d32f2f',
      description: 'Color of the toggle lever',
    },
  },
};

const IGNITION_KEY_SWITCH_METADATA: ComponentMetadata = {
  id: 'ignition-key-switch',
  name: 'Ignition Key Switch',
  category: 'relays',
  description: 'Automotive ignition key switch with 4 positions',
  tags: ['ignition', 'key', 'switch', 'automotive', 'starter'],
  config: {
    position: {
      type: 'select',
      label: 'Key Position',
      default: 'off',
      options: [
        { value: 'off', label: 'OFF' },
        { value: 'acc', label: 'ACC' },
        { value: 'ign', label: 'IGN' },
        { value: 'start', label: 'START' },
      ],
      description: 'Current key position',
    },
  },
};

const DC_CONTACTOR_METADATA: ComponentMetadata = {
  id: 'dc-contactor',
  name: 'DC Contactor',
  category: 'relays',
  description: 'High current DC Contactor (e.g., for battery disconnect)',
  tags: ['contactor', 'relay', 'high-current', 'battery', 'disconnect', 'mzj'],
  config: {
    modelLabel: {
      type: 'string',
      label: 'Model Label',
      default: 'MZJ-600A',
      description: 'Text printed on the front face of the contactor',
    },
    amperage: {
      type: 'select',
      label: 'Amperage',
      default: 200,
      options: [
        { value: 100, label: '100A' },
        { value: 200, label: '200A' },
        { value: 300, label: '300A' },
        { value: 400, label: '400A' },
        { value: 500, label: '500A' },
      ],
      description: 'Rated continuous current',
    },
    voltage: {
      type: 'select',
      label: 'Voltage',
      default: 48,
      options: [
        { value: 12, label: '12V' },
        { value: 24, label: '24V' },
        { value: 48, label: '48V' },
        { value: 72, label: '72V' },
      ],
      description: 'Rated coil voltage',
    },
    bodyColor: {
      type: 'color',
      label: 'Body Color',
      default: '#34495e',
      description: 'Color of contactor housing',
    },
    flipHorizontal: {
      type: 'boolean',
      label: 'Flip Horizontal',
      default: false,
      description: 'Mirror the contactor left↔right (also swaps MAIN 1/MAIN 2 and A1/A2 labels)',
    },
  },
};

const LED_HEADLIGHT_METADATA: ComponentMetadata = {
  id: 'led-headlight',
  name: 'LED Headlight',
  category: 'lighting',
  description: 'LED headlight with halo ring (4-wire)',
  tags: ['light', 'led', 'headlight', 'automotive', 'halo', 'drl'],
  config: {
    haloColor: {
      type: 'color',
      label: 'Halo Color',
      default: '#ff7700',
      description: 'Color of the LED halo ring',
    },
    ledCount: {
      type: 'number',
      label: 'LED Modules',
      default: 5,
      min: 3,
      max: 7,
      step: 1,
      description: 'Number of LED modules',
    },
  },
};

const RENOGY_MPPT_METADATA: ComponentMetadata = {
  id: 'renogy-mppt',
  name: 'Renogy Rover MPPT',
  category: 'solar',
  description: 'Renogy Rover MPPT Solar Charge Controller',
  tags: ['solar', 'mppt', 'charger', 'renogy', 'rover'],
  config: {
    amperage: {
      type: 'select',
      label: 'Amperage',
      default: 10,
      options: [
        { value: 10, label: '10A' },
        { value: 20, label: '20A' },
        { value: 30, label: '30A' },
        { value: 40, label: '40A' },
      ],
      description: 'Maximum charge current',
    },
  },
};

const SOLAR_PANEL_METADATA: ComponentMetadata = {
  id: 'solar-panel',
  name: 'Solar Panel',
  category: 'solar',
  description: 'Photovoltaic solar module',
  tags: ['solar', 'pv', 'panel', 'module', 'renewable', 'charging'],
  config: {
    power: {
      type: 'number',
      label: 'Power (Watts)',
      default: 100,
      min: 10,
      max: 600,
      step: 10,
      description: 'Maximum power rating in Watts',
    },
    voltage: {
      type: 'number',
      label: 'Voltage (V)',
      default: 18,
      min: 12,
      max: 60,
      description: 'Operating voltage (Vmpp)',
    },
  },
};

const KELLY_KLS_METADATA: ComponentMetadata = {
  id: 'kelly-kls',
  name: 'Kelly KLS Controller',
  category: 'motor-control',
  description: 'Kelly KLS motor controller with signal connectors',
  tags: ['motor', 'controller', 'kelly', 'kls', 'ev'],
  config: {
    voltage: {
      type: 'select',
      label: 'Voltage',
      default: 48,
      options: [
        { value: 24, label: '24V' },
        { value: 36, label: '36V' },
        { value: 48, label: '48V' },
        { value: 72, label: '72V' },
        { value: 96, label: '96V' },
      ],
      description: 'System voltage',
    },
    currentRating: {
      type: 'select',
      label: 'Current Rating',
      default: 200,
      options: [
        { value: 100, label: '100A' },
        { value: 150, label: '150A' },
        { value: 200, label: '200A' },
        { value: 350, label: '350A' },
        { value: 500, label: '500A' },
      ],
      description: 'Peak current rating',
    },
  },
};

const HUB_MOTOR_METADATA: ComponentMetadata = {
  id: 'hub-motor',
  name: 'Brushless Hub Motor',
  category: 'motor-control',
  description: 'Brushless hub motor with 3-phase wires and harness connectors',
  tags: ['motor', 'hub', 'brushless', 'bldc', 'ev', 'electric', 'wheel'],
  config: {
    hubDiameter: {
      type: 'number',
      label: 'Hub Diameter',
      default: 120,
      min: 80,
      max: 200,
      step: 10,
      description: 'Diameter of the motor hub in pixels',
    },
    voltage: {
      type: 'select',
      label: 'Voltage',
      default: 48,
      options: [
        { value: 24, label: '24V' },
        { value: 36, label: '36V' },
        { value: 48, label: '48V' },
        { value: 60, label: '60V' },
        { value: 72, label: '72V' },
        { value: 84, label: '84V' },
        { value: 96, label: '96V' },
      ],
      description: 'Motor voltage rating',
    },
    powerRating: {
      type: 'select',
      label: 'Power Rating',
      default: 3000,
      options: [
        { value: 500, label: '500W' },
        { value: 1000, label: '1000W' },
        { value: 1500, label: '1500W' },
        { value: 2000, label: '2000W' },
        { value: 3000, label: '3000W' },
        { value: 5000, label: '5000W' },
        { value: 8000, label: '8000W' },
      ],
      description: 'Motor power rating',
    },
    cableColor: {
      type: 'color',
      label: 'Cable Color',
      default: '#ff6600',
      description: 'Color of the phase cable bundle',
    },
    boltCount: {
      type: 'select',
      label: 'Mounting Bolts',
      default: 6,
      options: [
        { value: 4, label: '4 bolts' },
        { value: 6, label: '6 bolts' },
        { value: 8, label: '8 bolts' },
      ],
      description: 'Number of visible mounting bolts',
    },
    showBolts: {
      type: 'boolean',
      label: 'Show Bolts',
      default: true,
      description: 'Display mounting bolts on the hub',
    },
  },
};

const SHCA_1600_4_METADATA: ComponentMetadata = {
  id: 'shca-1600-4',
  name: 'Sky High 1600.4',
  category: 'power',
  description: 'Sky High Car Audio SHCA-1600.4 4-channel amplifier (1600W RMS)',
  tags: ['amplifier', 'amp', 'sky-high', 'shca', '1600', '4-channel', 'car-audio'],
  config: {
    modelLabel: {
      type: 'string',
      label: 'Model Label',
      default: 'SHCA-1600.4',
    },
    showLogo: {
      type: 'boolean',
      label: 'Show Cross Logo',
      default: true,
    },
    showFanConnectors: {
      type: 'boolean',
      label: 'Show Fan Connectors',
      default: true,
    },
  },
};

const ESP32_DEVKIT_METADATA: ComponentMetadata = {
  id: 'esp32-devkit',
  name: 'ESP32 DevKit V1',
  category: 'microcontrollers',
  description: 'ESP32-WROOM-32 development board with 30 GPIO pins',
  tags: ['esp32', 'microcontroller', 'wifi', 'bluetooth', 'devkit', 'iot'],
  config: {
    boardColor: {
      type: 'color',
      label: 'Board Color',
      default: '#1a1a1a',
      description: 'PCB color',
    },
    showPinLabels: {
      type: 'boolean',
      label: 'Show Pin Labels',
      default: true,
      description: 'Display GPIO labels on the board',
    },
  },
};

// ============================================================================
// Generic Switches & Controls Metadata
// ============================================================================

const BATTERY_DISCONNECT_METADATA: ComponentMetadata = {
  id: 'battery-disconnect',
  name: 'Battery Disconnect Switch',
  category: 'relays',
  description: 'Rotary battery disconnect/isolator switch',
  tags: ['battery', 'disconnect', 'isolator', 'switch', 'kill'],
  config: {
    position: { type: 'select', label: 'Position', default: 'off', options: [{ value: 'on', label: 'ON' }, { value: 'off', label: 'OFF' }] },
    amperage: { type: 'select', label: 'Amperage', default: 200, options: [{ value: 100, label: '100A' }, { value: 200, label: '200A' }, { value: 300, label: '300A' }, { value: 400, label: '400A' }] },
    handleColor: { type: 'color', label: 'Handle Color', default: '#e74c3c' },
  },
};

const PUSHBUTTON_METADATA: ComponentMetadata = {
  id: 'pushbutton',
  name: 'Pushbutton Switch',
  category: 'relays',
  description: 'Momentary pushbutton switch (NO/NC)',
  tags: ['pushbutton', 'momentary', 'switch', 'button'],
  config: {
    type: { type: 'select', label: 'Type', default: 'NO', options: [{ value: 'NO', label: 'Normally Open' }, { value: 'NC', label: 'Normally Closed' }] },
    buttonColor: { type: 'color', label: 'Button Color', default: '#3498db' },
    label: { type: 'string', label: 'Label', default: '' },
    showLabel: { type: 'boolean', label: 'Show Label', default: false },
  },
};

const SPST_SWITCH_METADATA: ComponentMetadata = {
  id: 'spst-switch',
  name: 'SPST Switch',
  category: 'relays',
  description: 'Generic single pole single throw switch',
  tags: ['switch', 'spst', 'toggle', 'single-pole'],
  config: {
    state: { type: 'select', label: 'State', default: 'open', options: [{ value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' }] },
    leverColor: { type: 'color', label: 'Lever Color', default: '#888888' },
  },
};

const KILL_SWITCH_METADATA: ComponentMetadata = {
  id: 'kill-switch',
  name: 'Kill Switch / E-Stop',
  category: 'relays',
  description: 'Emergency stop mushroom button',
  tags: ['kill', 'estop', 'emergency', 'stop', 'mushroom', 'safety'],
  config: {
    type: { type: 'select', label: 'Type', default: 'NC', options: [{ value: 'NO', label: 'Normally Open' }, { value: 'NC', label: 'Normally Closed' }] },
    isEngaged: { type: 'boolean', label: 'Engaged', default: false },
    buttonColor: { type: 'color', label: 'Button Color', default: '#e74c3c' },
  },
};

// ============================================================================
// Generic Passive Components Metadata
// ============================================================================

const BATTERY_SYMBOL_METADATA: ComponentMetadata = {
  id: 'battery-symbol',
  name: 'Battery Symbol',
  category: 'power',
  description: 'Generic battery cell symbol',
  tags: ['battery', 'power', 'cell', 'symbol', 'schematic'],
  config: {
    cellCount: { type: 'number', label: 'Cell Count', default: 1, min: 1, max: 16, step: 1 },
    voltage: { type: 'number', label: 'Voltage', default: 12, min: 1, max: 120 },
    showVoltageLabel: { type: 'boolean', label: 'Show Voltage', default: true },
  },
};

const DIODE_METADATA: ComponentMetadata = {
  id: 'diode',
  name: 'Diode',
  category: 'protection',
  description: 'Diode symbol (standard, LED, Zener, Schottky)',
  tags: ['diode', 'protection', 'led', 'zener', 'schottky', 'rectifier'],
  config: {
    diodeType: { type: 'select', label: 'Type', default: 'standard', options: [{ value: 'standard', label: 'Standard' }, { value: 'led', label: 'LED' }, { value: 'zener', label: 'Zener' }, { value: 'schottky', label: 'Schottky' }] },
    ledColor: { type: 'color', label: 'LED Color', default: '#ff0000' },
    showLabels: { type: 'boolean', label: 'Show Labels', default: true },
  },
};

const GROUND_SYMBOL_METADATA: ComponentMetadata = {
  id: 'ground-symbol',
  name: 'Ground Symbol',
  category: 'distribution',
  description: 'Electrical ground reference symbol',
  tags: ['ground', 'earth', 'gnd', 'symbol', 'chassis'],
  config: {
    variant: { type: 'select', label: 'Variant', default: 'earth', options: [{ value: 'earth', label: 'Earth Ground' }, { value: 'chassis', label: 'Chassis Ground' }, { value: 'signal', label: 'Signal Ground' }] },
    showLabel: { type: 'boolean', label: 'Show Label', default: false },
  },
};

const CIRCUIT_BREAKER_METADATA: ComponentMetadata = {
  id: 'circuit-breaker',
  name: 'Circuit Breaker',
  category: 'protection',
  description: 'Resettable circuit breaker',
  tags: ['breaker', 'circuit', 'protection', 'overcurrent', 'reset'],
  config: {
    rating: { type: 'select', label: 'Rating', default: 20, options: [{ value: 5, label: '5A' }, { value: 10, label: '10A' }, { value: 15, label: '15A' }, { value: 20, label: '20A' }, { value: 30, label: '30A' }, { value: 40, label: '40A' }, { value: 50, label: '50A' }] },
    state: { type: 'select', label: 'State', default: 'on', options: [{ value: 'on', label: 'ON' }, { value: 'off', label: 'OFF' }, { value: 'tripped', label: 'Tripped' }] },
  },
};

const LED_INDICATOR_METADATA: ComponentMetadata = {
  id: 'led-indicator',
  name: 'LED Indicator',
  category: 'lighting',
  description: 'Panel mount LED indicator light',
  tags: ['led', 'indicator', 'light', 'panel', 'status'],
  config: {
    color: { type: 'color', label: 'LED Color', default: '#2ecc71' },
    state: { type: 'select', label: 'State', default: 'off', options: [{ value: 'on', label: 'ON' }, { value: 'off', label: 'OFF' }] },
    size: { type: 'select', label: 'Size', default: 'medium', options: [{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }] },
    shape: { type: 'select', label: 'Shape', default: 'round', options: [{ value: 'round', label: 'Round' }, { value: 'square', label: 'Square' }] },
  },
};

// ============================================================================
// Generic Connectors & Terminals Metadata
// ============================================================================

const ANDERSON_CONNECTOR_METADATA: ComponentMetadata = {
  id: 'anderson-connector',
  name: 'Anderson Connector',
  category: 'connector',
  description: 'Anderson SB-series power connector',
  tags: ['anderson', 'connector', 'power', 'sb50', 'sb175', 'sb350'],
  config: {
    size: { type: 'select', label: 'Size', default: 'SB175', options: [{ value: 'SB50', label: 'SB50 (50A)' }, { value: 'SB175', label: 'SB175 (175A)' }, { value: 'SB350', label: 'SB350 (350A)' }] },
    voltage: { type: 'select', label: 'Voltage', default: 48, options: [{ value: 12, label: '12V (Red)' }, { value: 24, label: '24V (Gray)' }, { value: 36, label: '36V (Yellow)' }, { value: 48, label: '48V (Blue)' }] },
    gender: { type: 'select', label: 'Gender', default: 'plug', options: [{ value: 'plug', label: 'Plug' }, { value: 'receptacle', label: 'Receptacle' }] },
  },
};

const TERMINAL_BLOCK_METADATA: ComponentMetadata = {
  id: 'terminal-block',
  name: 'Terminal Block (Barrier Strip)',
  category: 'connector',
  description: 'Multi-position barrier-style terminal block with Phillips screws',
  tags: ['terminal', 'block', 'screw', 'barrier', 'strip', 'distribution', 'wire'],
  config: {
    positions: { type: 'number', label: 'Positions', default: 4, min: 2, max: 16, step: 1 },
    rows: {
      type: 'select',
      label: 'Rows',
      default: 2,
      options: [{ value: 1, label: '1 (single row)' }, { value: 2, label: '2 (dual row)' }],
      description: 'Single row or dual-row barrier block',
    },
    bodyColor: {
      type: 'color',
      label: 'Body Color',
      default: '#1a1a1a',
      description: 'Plastic body color',
    },
    screwColor: {
      type: 'color',
      label: 'Screw Color',
      default: '#cfd2d6',
      description: 'Screw / hardware color (silver, brass, etc.)',
    },
    showPositionNumbers: { type: 'boolean', label: 'Show Numbers', default: true },
  },
};

const XT_CONNECTOR_METADATA: ComponentMetadata = {
  id: 'xt-connector',
  name: 'XT60/XT90 Connector',
  category: 'connector',
  description: 'XT-series power connector',
  tags: ['xt60', 'xt90', 'connector', 'power', 'lipo', 'battery'],
  config: {
    size: { type: 'select', label: 'Size', default: 'XT60', options: [{ value: 'XT60', label: 'XT60 (60A)' }, { value: 'XT90', label: 'XT90 (90A)' }] },
    gender: { type: 'select', label: 'Gender', default: 'male', options: [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }] },
  },
};

const RING_TERMINAL_METADATA: ComponentMetadata = {
  id: 'ring-terminal',
  name: 'Ring Terminal',
  category: 'connector',
  description: 'Crimp ring terminal / lug',
  tags: ['ring', 'terminal', 'crimp', 'lug', 'connector'],
  config: {
    wireGauge: { type: 'select', label: 'Wire Gauge', default: 10, options: [{ value: 4, label: '4 AWG' }, { value: 6, label: '6 AWG' }, { value: 8, label: '8 AWG' }, { value: 10, label: '10 AWG' }, { value: 12, label: '12 AWG' }] },
    studSize: { type: 'select', label: 'Stud Size', default: 8, options: [{ value: 6, label: 'M6' }, { value: 8, label: 'M8' }, { value: 10, label: 'M10' }] },
    insulation: { type: 'select', label: 'Insulation', default: 'vinyl', options: [{ value: 'bare', label: 'Bare' }, { value: 'vinyl', label: 'Vinyl' }, { value: 'heat-shrink', label: 'Heat Shrink' }, { value: 'nylon', label: 'Nylon' }] },
    insulationColor: { type: 'color', label: 'Insulation Color', default: '#3498db' },
  },
};

const WIRE_JUNCTION_METADATA: ComponentMetadata = {
  id: 'wire-junction',
  name: 'Wire Junction',
  category: 'distribution',
  description: 'Wire splice / junction point',
  tags: ['junction', 'splice', 'wire', 'connection', 'tap'],
  config: {
    type: { type: 'select', label: 'Type', default: 'T', options: [{ value: 'T', label: 'T-Junction' }, { value: 'Y', label: 'Y-Junction' }, { value: 'inline', label: 'Inline' }, { value: 'tap', label: 'Tap' }] },
    showSolder: { type: 'boolean', label: 'Show Solder', default: true },
  },
};

// ============================================================================
// Component Registry — framework field wrappers
// ============================================================================

/**
 * Framework-level config field keys that the wrapper auto-injects into every
 * component's config schema. Code that reads/writes these reserves them so
 * they don't collide with component-specific keys.
 */
export const FRAMEWORK_CONFIG_KEYS = ['scale', 'wiresOnTop'] as const;
export type FrameworkConfigKey = (typeof FRAMEWORK_CONFIG_KEYS)[number];

/**
 * Auto-injected `scale` config field. Every registered component picks this up
 * via `withFrameworkFields`, so generators don't have to handle scaling themselves.
 *
 * 100% is the maximum (the component's native size). Smaller values shrink it.
 */
const SCALE_FIELD: ConfigField = {
  type: 'select',
  label: 'Scale',
  default: 1,
  options: [
    { value: 0.1, label: '10%' },
    { value: 0.2, label: '20%' },
    { value: 0.3, label: '30%' },
    { value: 0.4, label: '40%' },
    { value: 0.5, label: '50%' },
    { value: 0.6, label: '60%' },
    { value: 0.7, label: '70%' },
    { value: 0.8, label: '80%' },
    { value: 0.9, label: '90%' },
    { value: 1, label: '100%' },
  ],
  description: 'Display scale relative to the component\'s native size (100% = native)',
};

const SCALE_BOUNDS = { min: 0.1, max: 1 };

/**
 * Auto-injected `wiresOnTop` field. Storage lives on `Block.wiresOnTop`
 * (so `WireLayers` keeps working unchanged); `useComponentConfig` is the
 * single point that copies the form value to/from that field.
 */
const WIRES_ON_TOP_FIELD: ConfigField = {
  type: 'boolean',
  label: 'Wires on Top',
  default: true,
  description: 'Render wires connected to this component above its body (so they\'re not hidden underneath)',
};

function clampScale(raw: unknown): number {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 1;
  return Math.min(SCALE_BOUNDS.max, Math.max(SCALE_BOUNDS.min, n));
}

/**
 * Default connection-point color by type. Used when a generator doesn't
 * specify a color explicitly. All chosen to be visible on the app's dark
 * canvas background.
 */
const DEFAULT_POINT_COLOR_BY_TYPE: Record<ConnectionPointDefinition['type'], string> = {
  power: '#ff5252',   // red
  ground: '#9aa0a6',  // medium gray (pure black would be invisible on dark bg)
  signal: '#4aa3ff',  // blue
  sense: '#ff8800',   // orange
  data: '#2ecc71',    // green
};

/**
 * Apply the default-by-type color to any connection point that doesn't already
 * have one. Generators stay free to override with a specific color.
 */
function applyDefaultPointColors(result: GeneratorResult): GeneratorResult {
  return {
    ...result,
    connectionPoints: result.connectionPoints.map((cp) =>
      cp.color ? cp : { ...cp, color: DEFAULT_POINT_COLOR_BY_TYPE[cp.type] ?? '#9aa0a6' },
    ),
  };
}

/**
 * Strip framework-only keys from a config object before passing it to a
 * generator (which doesn't know about them).
 */
function stripFrameworkKeys(config: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!config) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(config)) {
    if (!(FRAMEWORK_CONFIG_KEYS as readonly string[]).includes(k)) {
      out[k] = v;
    }
  }
  return out;
}

/**
 * Apply uniform scaling to a generator's output. Stretches the outer SVG via
 * its width/height attributes (viewBox stays at native), and multiplies every
 * connection-point coordinate by the same factor.
 */
function applyScaleToResult(result: GeneratorResult, scale: number): GeneratorResult {
  if (scale === 1) return result;
  const W = result.dimensions.width * scale;
  const H = result.dimensions.height * scale;
  // Replace just the outer <svg ... width="..." height="..." attrs. The
  // non-greedy [^>]*? stops at the first '>', so this never touches inner
  // <svg>/<rect>/etc. width attributes.
  const svg = result.svg
    .replace(/(<svg\b[^>]*?)\bwidth="[^"]*"/, `$1width="${W}"`)
    .replace(/(<svg\b[^>]*?)\bheight="[^"]*"/, `$1height="${H}"`);
  return {
    svg,
    dimensions: { width: W, height: H },
    connectionPoints: result.connectionPoints.map((cp) => ({
      ...cp,
      x: cp.x * scale,
      y: cp.y * scale,
    })),
  };
}

/**
 * Wrap a raw component definition with framework-level config fields. Auto-
 * injects `scale` (size) and `wiresOnTop` (rendering layer) into the config
 * schema, scales the generator's output uniformly, and strips framework keys
 * from the config object before forwarding to the generator.
 */
function withFrameworkFields(def: ComponentDefinition): ComponentDefinition {
  return {
    metadata: {
      ...def.metadata,
      config: {
        ...def.metadata.config,
        scale: SCALE_FIELD,
        wiresOnTop: WIRES_ON_TOP_FIELD,
      },
    },
    generate: (config) => {
      const scale = clampScale(config?.scale ?? 1);
      const native = def.generate(stripFrameworkKeys(config));
      return applyDefaultPointColors(applyScaleToResult(native, scale));
    },
    getDimensions: def.getDimensions
      ? (config) => {
          const scale = clampScale(config?.scale ?? 1);
          const d = def.getDimensions!(stripFrameworkKeys(config));
          return { width: d.width * scale, height: d.height * scale };
        }
      : undefined,
  };
}

// ============================================================================
// Component Registry
// ============================================================================

/**
 * Raw, un-scaled component entries. Public consumers use COMPONENT_REGISTRY
 * (declared below) which wraps each entry with `withScale`.
 */
const RAW_REGISTRY: Record<string, ComponentDefinition> = {
  // Power Distribution
  'bus-bar': {
    metadata: BUS_BAR_METADATA,
    generate: generateBusBar,
    getDimensions: getBusBarDimensions,
  },
  'power-bus-bar': {
    metadata: POWER_BUS_BAR_METADATA,
    generate: generatePowerBusBar,
    getDimensions: getPowerBusBarDimensions,
  },
  'current-shunt': {
    metadata: CURRENT_SHUNT_METADATA,
    generate: generateCurrentShunt,
    getDimensions: getCurrentShuntDimensions,
  },
  'fuse-block': {
    metadata: FUSE_BLOCK_METADATA,
    generate: generateFuseBlock,
    getDimensions: getFuseBlockDimensions,
  },
  'inline-fuse': {
    metadata: INLINE_FUSE_METADATA,
    generate: generateInlineFuse,
    getDimensions: getInlineFuseDimensions,
  },
  'heavy-duty-fuse': {
    metadata: HEAVY_DUTY_FUSE_METADATA,
    generate: generateHeavyDutyFuse,
    getDimensions: getHeavyDutyFuseDimensions,
  },
  'dc-dc-converter': {
    metadata: DC_DC_CONVERTER_METADATA,
    generate: generateDCDCConverter,
    getDimensions: getDCDCConverterDimensions,
  },
  'daly-bms': {
    metadata: DALY_BMS_METADATA,
    generate: generateDalyBMS,
    getDimensions: getDalyBMSDimensions,
  },
  // Relays & Switches
  'relay': {
    metadata: RELAY_METADATA,
    generate: generateRelay,
    getDimensions: getRelayDimensions,
  },
  'toggle-switch': {
    metadata: TOGGLE_SWITCH_METADATA,
    generate: generateToggleSwitch,
    getDimensions: getToggleSwitchDimensions,
  },
  'ignition-key-switch': {
    metadata: IGNITION_KEY_SWITCH_METADATA,
    generate: generateIgnitionKeySwitch,
    getDimensions: getIgnitionKeySwitchDimensions,
  },
  'dc-contactor': {
    metadata: DC_CONTACTOR_METADATA,
    generate: generateDCContactor,
    getDimensions: getDCContactorDimensions,
  },
  'precharge-resistor': {
    metadata: PRECHARGE_RESISTOR_METADATA,
    generate: generatePrechargeResistor,
    getDimensions: getPrechargeResistorDimensions,
  },
  'flyback-diode': {
    metadata: FLYBACK_DIODE_METADATA,
    generate: generateFlybackDiode,
    getDimensions: getFlybackDiodeDimensions,
  },
  // Lighting
  'led-headlight': {
    metadata: LED_HEADLIGHT_METADATA,
    generate: generateLEDHeadlight,
    getDimensions: getLEDHeadlightDimensions,
  },
  // Solar
  'renogy-mppt': {
    metadata: RENOGY_MPPT_METADATA,
    generate: generateRenogyMPPT,
    getDimensions: getRenogyMPPTDimensions,
  },
  'solar-panel': {
    metadata: SOLAR_PANEL_METADATA,
    generate: generateSolarPanel,
    getDimensions: getSolarPanelDimensions,
  },
  // Motor Control
  'kelly-kls': {
    metadata: KELLY_KLS_METADATA,
    generate: generateKellyKLS,
    getDimensions: getKellyKLSDimensions,
  },
  'hub-motor': {
    metadata: HUB_MOTOR_METADATA,
    generate: generateHubMotor,
    getDimensions: getHubMotorDimensions,
  },
  // Microcontrollers
  'esp32-devkit': {
    metadata: ESP32_DEVKIT_METADATA,
    generate: generateESP32DevKit,
    getDimensions: getESP32DevKitDimensions,
  },
  // Car audio amplifier(s)
  'shca-1600-4': {
    metadata: SHCA_1600_4_METADATA,
    generate: generateSHCA1600,
    getDimensions: getSHCA1600Dimensions,
  },
  // Generic Switches & Controls
  'battery-disconnect': {
    metadata: BATTERY_DISCONNECT_METADATA,
    generate: generateBatteryDisconnect,
    getDimensions: getBatteryDisconnectDimensions,
  },
  'pushbutton': {
    metadata: PUSHBUTTON_METADATA,
    generate: generatePushbutton,
    getDimensions: getPushbuttonDimensions,
  },
  'spst-switch': {
    metadata: SPST_SWITCH_METADATA,
    generate: generateSPSTSwitch,
    getDimensions: getSPSTSwitchDimensions,
  },
  'kill-switch': {
    metadata: KILL_SWITCH_METADATA,
    generate: generateKillSwitch,
    getDimensions: getKillSwitchDimensions,
  },
  // Generic Passive Components
  'battery-symbol': {
    metadata: BATTERY_SYMBOL_METADATA,
    generate: generateBatterySymbol,
    getDimensions: getBatterySymbolDimensions,
  },
  'diode': {
    metadata: DIODE_METADATA,
    generate: generateDiode,
    getDimensions: getDiodeDimensions,
  },
  'ground-symbol': {
    metadata: GROUND_SYMBOL_METADATA,
    generate: generateGroundSymbol,
    getDimensions: getGroundSymbolDimensions,
  },
  'circuit-breaker': {
    metadata: CIRCUIT_BREAKER_METADATA,
    generate: generateCircuitBreaker,
    getDimensions: getCircuitBreakerDimensions,
  },
  'led-indicator': {
    metadata: LED_INDICATOR_METADATA,
    generate: generateLEDIndicator,
    getDimensions: getLEDIndicatorDimensions,
  },
  // Generic Connectors & Terminals
  'anderson-connector': {
    metadata: ANDERSON_CONNECTOR_METADATA,
    generate: generateAndersonConnector,
    getDimensions: getAndersonConnectorDimensions,
  },
  'terminal-block': {
    metadata: TERMINAL_BLOCK_METADATA,
    generate: generateTerminalBlock,
    getDimensions: getTerminalBlockDimensions,
  },
  'xt-connector': {
    metadata: XT_CONNECTOR_METADATA,
    generate: generateXTConnector,
    getDimensions: getXTConnectorDimensions,
  },
  'ring-terminal': {
    metadata: RING_TERMINAL_METADATA,
    generate: generateRingTerminal,
    getDimensions: getRingTerminalDimensions,
  },
  'wire-junction': {
    metadata: WIRE_JUNCTION_METADATA,
    generate: generateWireJunction,
    getDimensions: getWireJunctionDimensions,
  },
};

/**
 * Public registry — every entry has framework config fields (`scale`,
 * `wiresOnTop`) auto-injected and its generate/getDimensions wrapped to apply
 * the chosen scale uniformly.
 */
export const COMPONENT_REGISTRY: Record<string, ComponentDefinition> = Object.fromEntries(
  Object.entries(RAW_REGISTRY).map(([id, def]) => [id, withFrameworkFields(def)]),
);

// ============================================================================
// Public API
// ============================================================================

/**
 * Get all registered components
 */
export function getAllComponents(): ComponentDefinition[] {
  return Object.values(COMPONENT_REGISTRY);
}

/**
 * Get components grouped by category
 */
export function getComponentsByCategory(): Record<string, ComponentDefinition[]> {
  const grouped: Record<string, ComponentDefinition[]> = {};

  for (const component of Object.values(COMPONENT_REGISTRY)) {
    const category = component.metadata.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(component);
  }

  return grouped;
}

/**
 * Get a component by ID
 */
export function getComponent(id: string): ComponentDefinition | undefined {
  return COMPONENT_REGISTRY[id];
}

/**
 * Generate SVG for a component with given config
 */
export function generateComponent(id: string, config: Record<string, unknown> = {}): GeneratorResult {
  const component = COMPONENT_REGISTRY[id];
  if (!component) {
    throw new Error(`Unknown component: ${id}`);
  }
  return component.generate(config);
}

/**
 * Get component dimensions without generating full SVG
 */
export function getComponentDimensions(id: string, config: Record<string, unknown> = {}): { width: number; height: number } {
  const component = COMPONENT_REGISTRY[id];
  if (!component) {
    throw new Error(`Unknown component: ${id}`);
  }
  if (component.getDimensions) {
    return component.getDimensions(config);
  }
  // Fall back to generating and extracting dimensions
  const result = component.generate(config);
  return result.dimensions;
}

/**
 * Search components by name, description, or tags. Empty query returns all.
 */
export function searchComponents(query: string): ComponentDefinition[] {
  const q = query.toLowerCase().trim();
  if (!q) return Object.values(COMPONENT_REGISTRY);

  return Object.values(COMPONENT_REGISTRY).filter((c) => {
    const m = c.metadata;
    if (m.name.toLowerCase().includes(q)) return true;
    if (m.description.toLowerCase().includes(q)) return true;
    if (m.id.toLowerCase().includes(q)) return true;
    if (m.tags?.some((t) => t.toLowerCase().includes(q))) return true;
    return false;
  });
}

// Re-export types
export * from './types';
export * from './utils';

// Export custom SVG generator for user-provided components
export {
  generate as generateCustomSVG,
  getDimensions as getCustomSVGDimensions,
  createFromUrl as createCustomSVGFromUrl,
} from './components/custom-svg/generator';
export type { CustomSVGConfig } from './components/custom-svg/generator';
