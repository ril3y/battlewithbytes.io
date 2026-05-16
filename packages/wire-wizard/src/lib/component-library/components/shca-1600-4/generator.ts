/**
 * Sky High Car Audio 1600.4 Amplifier — SVG Generator
 *
 * Top-down view of the SHCA-1600.4. Black aluminum heatsink body with the
 * Sky High cross logo and model badge centered, a power-end with three
 * set-screw lugs (GND / REM / +12V) and a 4-binding-post speaker strip
 * (CH1+/-, CH2+/- with BRIDGED marking), and four RCA signal inputs along
 * the opposite edge with status LEDs, gain/HPF/LPF detail, and fan
 * connectors flanking the chassis.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';

export interface SHCA1600Config {
  modelLabel?: string;
  showLogo?: boolean;
  showFanConnectors?: boolean;
}

const DEFAULT_CONFIG: Required<SHCA1600Config> = {
  modelLabel: 'SHCA-1600.4',
  showLogo: true,
  showFanConnectors: true,
};

const WIDTH = 520;
const HEIGHT = 210;

export function getDimensions(): { width: number; height: number } {
  return { width: WIDTH, height: HEIGHT };
}

export function generate(config: SHCA1600Config = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };
  const id = Math.random().toString(36).substring(2, 9);

  // Layout zones (horizontal):
  //   x=0..18  outer fan side wing (with FAN connector)
  //   x=18..170 LEFT end-panel (signal side: RCAs, LEDs, gain/HPF/LPF, INPUT MODE)
  //   x=170..350 chassis top (heatsink + cross logo + model badge)
  //   x=350..502 RIGHT end-panel (power side: GND/REM/+12V + speaker strip)
  //   x=502..520 outer fan side wing
  //
  // Y is roughly symmetric — features sit between y=24 and y=186.

  // ---------- Connection-point coordinates ----------
  // Signal side (LEFT panel)
  const rca1 = { x: 56, y: 60 };
  const rca2 = { x: 90, y: 60 };
  const rca3 = { x: 56, y: 130 };
  const rca4 = { x: 90, y: 130 };

  // Power side (RIGHT panel)
  const gnd = { x: 376, y: 80 };
  const rem = { x: 408, y: 80 };
  const v12 = { x: 440, y: 80 };

  // Speaker strip — two rows of binding posts, CH1+ CH1- CH2+ CH2-
  const spkY1 = 130;
  const spkY2 = 168;
  const spkXs = [378, 410, 442, 474];
  const ch1Pos = { x: spkXs[0], y: spkY1 };
  const ch1Neg = { x: spkXs[1], y: spkY1 };
  const ch2Pos = { x: spkXs[2], y: spkY1 };
  const ch2Neg = { x: spkXs[3], y: spkY1 };
  // Lower-row terminals are visible but tied to the same channels (dual
  // binding posts) — we don't expose them as separate connection points to
  // avoid clutter; the user wires to the top row.

  // Fans on the outer wings
  const fanLeft = { x: 9, y: 105 };
  const fanRight = { x: WIDTH - 9, y: 105 };

  // ---------- SVG body ----------
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
      <defs>
        <linearGradient id="chassis-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#2a2a2a"/>
          <stop offset="50%" stop-color="#141414"/>
          <stop offset="100%" stop-color="#050505"/>
        </linearGradient>
        <pattern id="fins-${id}" x="0" y="0" width="8" height="80" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="4" height="80" fill="#1c1c1c"/>
          <rect x="4" y="0" width="4" height="80" fill="#0c0c0c"/>
        </pattern>
        <radialGradient id="metal-${id}" cx="30%" cy="30%" r="75%">
          <stop offset="0%" stop-color="#f5f5f5"/>
          <stop offset="55%" stop-color="#bcbcbc"/>
          <stop offset="100%" stop-color="#6a6a6a"/>
        </radialGradient>
        <radialGradient id="rca-${id}" cx="30%" cy="30%" r="80%">
          <stop offset="0%" stop-color="#d8d8d8"/>
          <stop offset="55%" stop-color="#888"/>
          <stop offset="100%" stop-color="#2a2a2a"/>
        </radialGradient>
        <linearGradient id="badge-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#e0e0e0"/>
          <stop offset="100%" stop-color="#888"/>
        </linearGradient>
      </defs>

      <!-- Outer side wings (fan tabs) -->
      <rect x="0" y="60" width="18" height="90" rx="3" fill="${'#0a0a0a'}" stroke="#222" stroke-width="0.4"/>
      <rect x="${WIDTH - 18}" y="60" width="18" height="90" rx="3" fill="${'#0a0a0a'}" stroke="#222" stroke-width="0.4"/>

      <!-- Main chassis -->
      <rect x="18" y="14" width="${WIDTH - 36}" height="${HEIGHT - 28}" rx="6"
            fill="url(#chassis-${id})" stroke="#000" stroke-width="1"/>

      <!-- Heatsink top band (vented) -->
      <rect x="174" y="22" width="170" height="48" rx="3"
            fill="url(#fins-${id})" stroke="#000" stroke-width="0.5"/>
      <!-- Heatsink vent slots -->
      <g fill="#050505">
        <rect x="180" y="34" width="50" height="3" rx="1"/>
        <rect x="180" y="44" width="50" height="3" rx="1"/>
        <rect x="180" y="54" width="50" height="3" rx="1"/>
        <rect x="290" y="34" width="50" height="3" rx="1"/>
        <rect x="290" y="44" width="50" height="3" rx="1"/>
        <rect x="290" y="54" width="50" height="3" rx="1"/>
      </g>

      ${c.showLogo ? skullCrossLogo(id) : ''}

      <!-- Model badge plate -->
      <rect x="${WIDTH / 2 - 50}" y="125" width="100" height="18" rx="2"
            fill="url(#badge-${id})" stroke="#444" stroke-width="0.5"/>
      <text x="${WIDTH / 2}" y="137" text-anchor="middle"
            font-family="Arial Black, Arial, sans-serif" font-size="9" font-weight="bold"
            fill="#1a1a1a" letter-spacing="0.5">${escapeXml(c.modelLabel)}</text>

      <!-- Mounting screws on heatsink corners -->
      ${cornerScrew(184, 32, id)} ${cornerScrew(334, 32, id)}
      ${cornerScrew(184, 62, id)} ${cornerScrew(334, 62, id)}

      <!-- LEFT (signal) end-panel — recessed inset -->
      <rect x="32" y="34" width="130" height="148" rx="3"
            fill="#0a0a0a" stroke="#000" stroke-width="0.6"/>

      <!-- INPUT label -->
      <text x="73" y="46" text-anchor="middle" font-family="Arial, sans-serif" font-size="7" fill="#fff" font-weight="bold">INPUT</text>
      <text x="56" y="46" text-anchor="end" font-family="Arial, sans-serif" font-size="6" fill="#fff">1CH</text>
      <text x="90" y="46" text-anchor="start" font-family="Arial, sans-serif" font-size="6" fill="#fff">2CH</text>

      <!-- RCA jacks (upper pair) -->
      ${rcaJack(rca1.x, rca1.y, id)}
      ${rcaJack(rca2.x, rca2.y, id)}

      <!-- INPUT MODE / 3CH-4CH region label -->
      <text x="73" y="118" text-anchor="middle" font-family="Arial, sans-serif" font-size="5" fill="#bbb">INPUT MODE</text>
      <text x="56" y="155" text-anchor="end" font-family="Arial, sans-serif" font-size="6" fill="#fff">3CH</text>
      <text x="90" y="155" text-anchor="start" font-family="Arial, sans-serif" font-size="6" fill="#fff">4CH</text>

      <!-- RCA jacks (lower pair) -->
      ${rcaJack(rca3.x, rca3.y, id)}
      ${rcaJack(rca4.x, rca4.y, id)}

      <!-- Status LEDs -->
      <circle cx="120" cy="60" r="2.5" fill="#22c55e" stroke="#0f3a1f" stroke-width="0.4"/>
      <text x="126" y="62" font-family="Arial, sans-serif" font-size="5" fill="#22c55e">POWER</text>
      <circle cx="120" cy="72" r="2.5" fill="#dc2626" stroke="#3a0f0f" stroke-width="0.4"/>
      <text x="126" y="74" font-family="Arial, sans-serif" font-size="5" fill="#dc2626">PROTECT</text>
      <circle cx="120" cy="130" r="2.5" fill="#facc15" stroke="#3a3010" stroke-width="0.4"/>
      <text x="126" y="132" font-family="Arial, sans-serif" font-size="5" fill="#facc15">1/2 CLIP</text>
      <circle cx="120" cy="142" r="2.5" fill="#facc15" stroke="#3a3010" stroke-width="0.4"/>
      <text x="126" y="144" font-family="Arial, sans-serif" font-size="5" fill="#facc15">3/4 CLIP</text>

      <!-- Controls block (gain, HPF, LPF — decorative) -->
      ${controlsCluster(345, 88, id)}

      <!-- RIGHT (power/speaker) end-panel — recessed inset -->
      <rect x="356" y="60" width="146" height="122" rx="3"
            fill="#0a0a0a" stroke="#000" stroke-width="0.6"/>

      <!-- GND / REM / +12V labels -->
      <text x="${gnd.x}" y="68" text-anchor="middle" font-family="Arial, sans-serif" font-size="6" font-weight="bold" fill="#fff">GND</text>
      <text x="${rem.x}" y="68" text-anchor="middle" font-family="Arial, sans-serif" font-size="6" font-weight="bold" fill="#fff">REM</text>
      <text x="${v12.x}" y="68" text-anchor="middle" font-family="Arial, sans-serif" font-size="6" font-weight="bold" fill="#fff">+12V</text>

      ${powerLug(gnd, 10, id)}
      ${powerLug(rem, 5, id)}
      ${powerLug(v12, 10, id)}

      <!-- Speaker strip header -->
      <text x="${spkXs[0]}" y="122" text-anchor="middle" font-family="Arial, sans-serif" font-size="5" font-weight="bold" fill="#cc3333">+</text>
      <text x="${spkXs[1]}" y="122" text-anchor="middle" font-family="Arial, sans-serif" font-size="5" font-weight="bold" fill="#9aa0a6">−</text>
      <text x="${spkXs[2]}" y="122" text-anchor="middle" font-family="Arial, sans-serif" font-size="5" font-weight="bold" fill="#cc3333">+</text>
      <text x="${spkXs[3]}" y="122" text-anchor="middle" font-family="Arial, sans-serif" font-size="5" font-weight="bold" fill="#9aa0a6">−</text>
      <text x="${(spkXs[0] + spkXs[1]) / 2}" y="114" text-anchor="middle" font-family="Arial, sans-serif" font-size="5" fill="#fff">CH1</text>
      <text x="${(spkXs[2] + spkXs[3]) / 2}" y="114" text-anchor="middle" font-family="Arial, sans-serif" font-size="5" fill="#fff">CH2</text>
      <text x="${(spkXs[1] + spkXs[2]) / 2}" y="114" text-anchor="middle" font-family="Arial, sans-serif" font-size="4.5" fill="#888">BRIDGED</text>

      <!-- Speaker binding posts — dual row -->
      ${spkXs.map((x) => speakerPost(x, spkY1, id)).join('')}
      ${spkXs.map((x) => speakerPost(x, spkY2, id)).join('')}

      ${c.showFanConnectors ? fanConnector(fanLeft.x, fanLeft.y, id) + fanConnector(fanRight.x, fanRight.y, id) : ''}
    </svg>
  `;

  const connectionPoints: ConnectionPointDefinition[] = [
    // RCA signal inputs
    { id: 'in-1', label: '1CH', x: rca1.x, y: rca1.y, type: 'signal', shape: 'circle', radius: 4, color: '#4aa3ff', description: 'RCA input — Channel 1' },
    { id: 'in-2', label: '2CH', x: rca2.x, y: rca2.y, type: 'signal', shape: 'circle', radius: 4, color: '#4aa3ff', description: 'RCA input — Channel 2' },
    { id: 'in-3', label: '3CH', x: rca3.x, y: rca3.y, type: 'signal', shape: 'circle', radius: 4, color: '#4aa3ff', description: 'RCA input — Channel 3' },
    { id: 'in-4', label: '4CH', x: rca4.x, y: rca4.y, type: 'signal', shape: 'circle', radius: 4, color: '#4aa3ff', description: 'RCA input — Channel 4' },

    // Power
    { id: 'gnd', label: 'GND',  x: gnd.x, y: gnd.y, type: 'ground', shape: 'circle', radius: 6, color: '#9aa0a6', description: 'Chassis ground (set-screw lug, large gauge)' },
    { id: 'rem', label: 'REM',  x: rem.x, y: rem.y, type: 'signal', shape: 'circle', radius: 3, color: '#3498db', description: 'Remote turn-on (head-unit trigger)' },
    { id: 'v12', label: '+12V', x: v12.x, y: v12.y, type: 'power',  shape: 'circle', radius: 6, color: '#ffcc00', description: '+12V battery feed (fused, large gauge)' },

    // Speaker outputs
    { id: 'ch1-pos', label: 'CH1+', x: ch1Pos.x, y: ch1Pos.y, type: 'power', shape: 'circle', radius: 4, color: '#cc3333', description: 'Channel 1 speaker positive' },
    { id: 'ch1-neg', label: 'CH1−', x: ch1Neg.x, y: ch1Neg.y, type: 'power', shape: 'circle', radius: 4, color: '#9aa0a6', description: 'Channel 1 speaker negative' },
    { id: 'ch2-pos', label: 'CH2+', x: ch2Pos.x, y: ch2Pos.y, type: 'power', shape: 'circle', radius: 4, color: '#cc3333', description: 'Channel 2 speaker positive (use bridged across CH1−/CH2+ for bridged mono)' },
    { id: 'ch2-neg', label: 'CH2−', x: ch2Neg.x, y: ch2Neg.y, type: 'power', shape: 'circle', radius: 4, color: '#9aa0a6', description: 'Channel 2 speaker negative' },

    // Optional fan connectors
    ...(c.showFanConnectors
      ? [
          { id: 'fan-l', label: 'FAN L', x: fanLeft.x, y: fanLeft.y, type: 'signal' as const, shape: 'circle' as const, radius: 4, color: '#9aa0a6', description: 'External fan connector (left side)' },
          { id: 'fan-r', label: 'FAN R', x: fanRight.x, y: fanRight.y, type: 'signal' as const, shape: 'circle' as const, radius: 4, color: '#9aa0a6', description: 'External fan connector (right side)' },
        ]
      : []),
  ];

  return {
    svg,
    dimensions: { width: WIDTH, height: HEIGHT },
    connectionPoints,
  };
}

// ---- SVG fragment helpers ----

function skullCrossLogo(id: string): string {
  // Stylised X cross with a faux skull center — the Sky High brand mark.
  const cx = WIDTH / 2;
  const cy = 92;
  return `
    <g transform="translate(${cx}, ${cy})">
      <!-- diagonal bone arms -->
      <g stroke="#999" stroke-width="2.5" stroke-linecap="round" fill="none">
        <line x1="-28" y1="-28" x2="28" y2="28"/>
        <line x1="-28" y1="28" x2="28" y2="-28"/>
      </g>
      <!-- knob ends -->
      <g fill="url(#metal-${id})" stroke="#444" stroke-width="0.5">
        <circle cx="-28" cy="-28" r="3.2"/>
        <circle cx="28" cy="28" r="3.2"/>
        <circle cx="-28" cy="28" r="3.2"/>
        <circle cx="28" cy="-28" r="3.2"/>
      </g>
      <!-- center skull plate -->
      <circle cx="0" cy="0" r="9" fill="#1a1a1a" stroke="#888" stroke-width="0.6"/>
      <circle cx="-3" cy="-1.5" r="1.8" fill="#080808"/>
      <circle cx="3" cy="-1.5" r="1.8" fill="#080808"/>
      <rect x="-1.5" y="2" width="3" height="2" fill="#080808"/>
    </g>
  `;
}

function cornerScrew(x: number, y: number, id: string): string {
  return `
    <circle cx="${x}" cy="${y}" r="2.6" fill="url(#metal-${id})" stroke="#222" stroke-width="0.4"/>
    <line x1="${x - 1.5}" y1="${y - 1.5}" x2="${x + 1.5}" y2="${y + 1.5}" stroke="#222" stroke-width="0.5"/>
  `;
}

function rcaJack(x: number, y: number, id: string): string {
  return `
    <circle cx="${x}" cy="${y}" r="10" fill="url(#rca-${id})" stroke="#000" stroke-width="0.6"/>
    <circle cx="${x}" cy="${y}" r="6.5" fill="#0a0a0a" stroke="#000" stroke-width="0.4"/>
    <circle cx="${x}" cy="${y}" r="1.5" fill="#9a9a9a"/>
  `;
}

function powerLug({ x, y }: { x: number; y: number }, r: number, id: string): string {
  return `
    <circle cx="${x}" cy="${y}" r="${r + 2}" fill="#040404" stroke="#3a3a3a" stroke-width="0.4"/>
    <circle cx="${x}" cy="${y}" r="${r}" fill="url(#metal-${id})" stroke="#5a5a5a" stroke-width="0.4"/>
    <!-- internal set-screw -->
    <rect x="${x - 1.6}" y="${y - 1.6}" width="3.2" height="3.2" fill="#1a1a1a" stroke="#2a2a2a" stroke-width="0.3"/>
    <line x1="${x - 1.2}" y1="${y}" x2="${x + 1.2}" y2="${y}" stroke="#404040" stroke-width="0.4"/>
  `;
}

function speakerPost(x: number, y: number, id: string): string {
  return `
    <circle cx="${x}" cy="${y}" r="6" fill="#040404" stroke="#333" stroke-width="0.4"/>
    <circle cx="${x}" cy="${y}" r="4.5" fill="url(#metal-${id})" stroke="#555" stroke-width="0.4"/>
    <rect x="${x - 1.3}" y="${y - 1.3}" width="2.6" height="2.6" fill="#202020"/>
  `;
}

function fanConnector(x: number, y: number, id: string): string {
  return `
    <g>
      <rect x="${x - 6}" y="${y - 9}" width="12" height="18" rx="1.5" fill="#0a0a0a" stroke="#444" stroke-width="0.4"/>
      <rect x="${x - 4}" y="${y - 7}" width="3" height="14" fill="url(#metal-${id})"/>
      <rect x="${x + 1}" y="${y - 7}" width="3" height="14" fill="url(#metal-${id})"/>
      <text x="${x}" y="${y - 11}" text-anchor="middle" font-family="Arial, sans-serif" font-size="5" fill="#888">FAN</text>
      <text x="${x - 3}" y="${y + 14}" font-family="Arial, sans-serif" font-size="5" fill="#888">+</text>
      <text x="${x + 1}" y="${y + 14}" font-family="Arial, sans-serif" font-size="5" fill="#888">−</text>
    </g>
  `;
}

function controlsCluster(x: number, y: number, id: string): string {
  // Decorative GAIN / HPF / LPF knobs and switches (non-interactive).
  return `
    <g transform="translate(${x}, ${y})">
      <!-- HPF + LPF block headers -->
      <text x="-90" y="-30" font-family="Arial, sans-serif" font-size="5.5" fill="#fff" font-weight="bold">GAIN</text>
      <text x="-58" y="-30" font-family="Arial, sans-serif" font-size="5.5" fill="#fff" font-weight="bold">1/2 HPF</text>
      <text x="-6" y="-30" font-family="Arial, sans-serif" font-size="5.5" fill="#fff" font-weight="bold">1/2 LPF</text>
      <!-- Row 1 knobs -->
      <g transform="translate(-80, -18)"><circle cx="0" cy="0" r="4" fill="url(#metal-${id})" stroke="#444" stroke-width="0.4"/><line x1="0" y1="0" x2="0" y2="-3" stroke="#222" stroke-width="0.6" stroke-linecap="round"/></g>
      <g transform="translate(-46, -18)"><circle cx="0" cy="0" r="4" fill="url(#metal-${id})" stroke="#444" stroke-width="0.4"/><line x1="0" y1="0" x2="3" y2="-1" stroke="#222" stroke-width="0.6" stroke-linecap="round"/></g>
      <g transform="translate(6, -18)"><circle cx="0" cy="0" r="4" fill="url(#metal-${id})" stroke="#444" stroke-width="0.4"/><line x1="0" y1="0" x2="-2" y2="-3" stroke="#222" stroke-width="0.6" stroke-linecap="round"/></g>
      <!-- Row 2 knobs -->
      <text x="-90" y="14" font-family="Arial, sans-serif" font-size="5.5" fill="#fff" font-weight="bold">GAIN</text>
      <text x="-58" y="14" font-family="Arial, sans-serif" font-size="5.5" fill="#fff" font-weight="bold">3/4 HPF</text>
      <text x="-6" y="14" font-family="Arial, sans-serif" font-size="5.5" fill="#fff" font-weight="bold">3/4 LPF</text>
      <g transform="translate(-80, 26)"><circle cx="0" cy="0" r="4" fill="url(#metal-${id})" stroke="#444" stroke-width="0.4"/><line x1="0" y1="0" x2="0" y2="-3" stroke="#222" stroke-width="0.6" stroke-linecap="round"/></g>
      <g transform="translate(-46, 26)"><circle cx="0" cy="0" r="4" fill="url(#metal-${id})" stroke="#444" stroke-width="0.4"/><line x1="0" y1="0" x2="2" y2="-2" stroke="#222" stroke-width="0.6" stroke-linecap="round"/></g>
      <g transform="translate(6, 26)"><circle cx="0" cy="0" r="4" fill="url(#metal-${id})" stroke="#444" stroke-width="0.4"/><line x1="0" y1="0" x2="-3" y2="-1" stroke="#222" stroke-width="0.6" stroke-linecap="round"/></g>
    </g>
  `;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default { generate, getDimensions };
