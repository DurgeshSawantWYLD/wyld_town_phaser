// svgs.js
// Stores all SVG assets as XML strings. These will be loaded directly into Phaser 3 as Data URIs.

const SvgAssets = {
  // FLOOR TILES (128x64 pixels)
  tile_grass: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64" width="128" height="64">
      <polygon points="64,0 128,32 64,64 0,32" fill="#A8D5BA" stroke="#97C8A9" stroke-width="1"/>
      <polygon points="64,4 120,32 64,60 8,32" fill="#BCE4C9" opacity="0.3"/>
    </svg>
  `,
  tile_stone: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64" width="128" height="64">
      <polygon points="64,0 128,32 64,64 0,32" fill="#EAE6DF" stroke="#D3CDC3" stroke-width="1"/>
      <polygon points="64,2 124,32 64,62 4,32" fill="#F4EFEB" opacity="0.6"/>
      <line x1="32" y1="16" x2="96" y2="48" stroke="#D3CDC3" stroke-width="0.5"/>
      <line x1="96" y1="16" x2="32" y2="48" stroke="#D3CDC3" stroke-width="0.5"/>
    </svg>
  `,
  tile_road_ew: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64" width="128" height="64">
      <polygon points="64,0 128,32 64,64 0,32" fill="#7A7F85" stroke="#686C72" stroke-width="1"/>
      <line x1="16" y1="24" x2="112" y2="40" stroke="#F4D03F" stroke-width="2" stroke-dasharray="8,6"/>
    </svg>
  `,
  tile_road_ns: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64" width="128" height="64">
      <polygon points="64,0 128,32 64,64 0,32" fill="#7A7F85" stroke="#686C72" stroke-width="1"/>
      <line x1="112" y1="24" x2="16" y2="40" stroke="#F4D03F" stroke-width="2" stroke-dasharray="8,6"/>
    </svg>
  `,

  // BUILDINGS (Base isometric layout projection: 128 wide, body height varies)
  building_plaza: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 160" width="128" height="160">
      <!-- Shadow -->
      <ellipse cx="64" cy="140" rx="45" ry="15" fill="#000" opacity="0.15"/>
      <!-- Main Fountain Base -->
      <polygon points="64,100 114,125 64,150 14,125" fill="#AAB7B8" stroke="#889495" stroke-width="1.5"/>
      <polygon points="64,108 104,128 64,148 24,128" fill="#3498DB"/>
      <!-- Fountain Spire & Water -->
      <rect x="61" y="60" width="6" height="60" fill="#EAECEE" rx="3"/>
      <path d="M 64 60 Q 40 90 40 125 M 64 60 Q 88 90 88 125" stroke="#AED6F1" stroke-width="3" fill="none" opacity="0.8"/>
      <!-- Surrounding Pillars -->
      <polygon points="25,95 32,98 32,118 25,115" fill="#BDC3C7"/>
      <polygon points="32,98 39,95 39,115 32,118" fill="#D5D8DC"/>
      <polygon points="25,95 32,92 39,95 32,98" fill="#E5E8E8"/>

      <polygon points="96,95 103,98 103,118 96,115" fill="#BDC3C7"/>
      <polygon points="103,98 110,95 110,115 103,118" fill="#D5D8DC"/>
      <polygon points="96,95 103,92 110,95 103,98" fill="#E5E8E8"/>
    </svg>
  `,
  building_office: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 180" width="128" height="180">
      <!-- Shadow -->
      <ellipse cx="64" cy="160" rx="55" ry="16" fill="#000" opacity="0.15"/>
      <!-- Left Side -->
      <polygon points="10,60 64,87 64,167 10,140" fill="#4B6584"/>
      <!-- Right Side -->
      <polygon points="64,87 118,60 118,140 64,167" fill="#778CA3"/>
      <!-- Roof -->
      <polygon points="10,60 64,33 118,60 64,87" fill="#A5B1C2"/>
      <!-- Windows Left -->
      <polygon points="20,80 32,86 32,106 20,100" fill="#D1D8E0" opacity="0.8"/>
      <polygon points="40,90 52,96 52,116 40,110" fill="#D1D8E0" opacity="0.8"/>
      <polygon points="20,110 32,116 32,136 20,130" fill="#D1D8E0" opacity="0.8"/>
      <polygon points="40,120 52,126 52,146 40,140" fill="#D1D8E0" opacity="0.8"/>
      <!-- Windows Right -->
      <polygon points="76,96 88,90 88,110 76,116" fill="#D1D8E0" opacity="0.8"/>
      <polygon points="96,86 108,80 108,100 96,106" fill="#D1D8E0" opacity="0.8"/>
      <polygon points="76,126 88,120 88,140 76,146" fill="#D1D8E0" opacity="0.8"/>
      <polygon points="96,116 108,110 108,130 96,136" fill="#D1D8E0" opacity="0.8"/>
      <!-- Glass HeliPad -->
      <polygon points="45,50 64,40 83,50 64,60" fill="#45AAF2" opacity="0.5"/>
    </svg>
  `,
  building_studio: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 170" width="128" height="170">
      <ellipse cx="64" cy="150" rx="50" ry="15" fill="#000" opacity="0.15"/>
      <!-- Lower block -->
      <polygon points="14,90 64,115 64,155 14,130" fill="#EA8685"/>
      <polygon points="64,115 114,90 114,130 64,155" fill="#F3A683"/>
      <polygon points="14,90 64,65 114,90 64,115" fill="#F7D794"/>
      <!-- Upper Offset Block -->
      <polygon points="34,60 74,80 74,115 34,95" fill="#E66767"/>
      <polygon points="74,80 104,65 104,100 74,115" fill="#F5CD79"/>
      <polygon points="34,60 64,45 104,65 74,80" fill="#F8A5C2"/>
      <!-- Big Screen Display -->
      <polygon points="44,70 64,80 64,95 44,85" fill="#574B90"/>
      <polygon points="46,72 62,80 62,93 46,85" fill="#303952"/>
      <polygon points="50,76 58,80 58,88 50,84" fill="#3DC1D3" opacity="0.8"/>
    </svg>
  `,
  building_campaign: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 180" width="128" height="180">
      <ellipse cx="64" cy="160" rx="45" ry="14" fill="#000" opacity="0.15"/>
      <!-- Billboard Tower Base -->
      <polygon points="54,120 74,130 74,160 54,150" fill="#57606F"/>
      <polygon points="74,130 94,120 94,150 74,160" fill="#747D8C"/>
      <polygon points="54,120 74,110 94,120 74,130" fill="#A4B0BE"/>
      <!-- Metal Lattice Legs -->
      <line x1="60" y1="120" x2="60" y2="60" stroke="#747D8C" stroke-width="3"/>
      <line x1="88" y1="120" x2="88" y2="60" stroke="#57606F" stroke-width="3"/>
      <line x1="60" y1="110" x2="88" y2="70" stroke="#747D8C" stroke-width="1.5"/>
      <line x1="60" y1="70" x2="88" y2="110" stroke="#747D8C" stroke-width="1.5"/>
      <!-- Big Billboard Screen -->
      <polygon points="20,40 108,40 108,90 20,90" fill="#2F3542" stroke="#747D8C" stroke-width="4"/>
      <!-- Interactive glowing ad artwork -->
      <rect x="25" y="45" width="78" height="40" fill="#FF4757" rx="2"/>
      <polygon points="35,75 55,55 75,70 95,50" fill="none" stroke="#FFFFFF" stroke-width="3"/>
      <circle cx="95" cy="50" r="4" fill="#ECCC68"/>
    </svg>
  `,
  building_analytics: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 190" width="128" height="190">
      <ellipse cx="64" cy="170" rx="55" ry="15" fill="#000" opacity="0.15"/>
      <!-- Tech Pyramid base -->
      <polygon points="14,120 64,145 64,165 14,140" fill="#3F51B5"/>
      <polygon points="64,145 114,120 114,140 64,165" fill="#5C6BC0"/>
      <polygon points="14,120 64,95 114,120 64,145" fill="#7986CB"/>
      <!-- Floating Hologram Spire -->
      <polygon points="44,80 64,90 64,115 44,105" fill="#00E676" opacity="0.6"/>
      <polygon points="64,90 84,80 84,105 64,115" fill="#00B0FF" opacity="0.6"/>
      <polygon points="44,80 64,70 84,80 64,90" fill="#B2FF59" opacity="0.7"/>
      <!-- Glowing Core Center -->
      <circle cx="64" cy="92" r="8" fill="#FFFF00" filter="drop-shadow(0px 0px 5px #FFFF00)"/>
    </svg>
  `,
  building_market: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 170" width="128" height="170">
      <ellipse cx="64" cy="150" rx="55" ry="15" fill="#000" opacity="0.15"/>
      <!-- Ground Stall Columns -->
      <rect x="25" y="90" width="6" height="50" fill="#A1A1A1"/>
      <rect x="97" y="90" width="6" height="50" fill="#787878"/>
      <rect x="61" y="100" width="6" height="45" fill="#8C8C8C"/>
      <!-- Shop Counter -->
      <polygon points="20,120 108,120 98,140 30,140" fill="#E2A76F"/>
      <!-- Canopy Roof (Striped) -->
      <polygon points="14,80 64,105 114,80 64,55" fill="#E74C3C"/>
      <polygon points="24,85 64,105 54,100 14,80" fill="#ECF0F1"/>
      <polygon points="104,85 64,105 74,100 114,80" fill="#ECF0F1"/>
    </svg>
  `,
  building_community: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 160" width="128" height="160">
      <ellipse cx="64" cy="140" rx="50" ry="14" fill="#000" opacity="0.15"/>
      <!-- Pavilion Deck -->
      <polygon points="19,105 64,128 109,105 64,82" fill="#85C1E9"/>
      <polygon points="19,105 64,128 64,138 19,115" fill="#5499C7"/>
      <polygon points="64,128 109,105 109,115 64,138" fill="#2E86C1"/>
      <!-- Pavilion Roof (Teal Glass Dome) -->
      <path d="M 19 80 Q 64 25 109 80 Z" fill="#1ABC9C" opacity="0.6"/>
      <polygon points="19,80 64,95 109,80 64,65" fill="#16A085" opacity="0.4"/>
      <!-- Supporting Pillars -->
      <line x1="28" y1="110" x2="28" y2="82" stroke="#FFFFFF" stroke-width="4"/>
      <line x1="100" y1="110" x2="100" y2="82" stroke="#EAECEE" stroke-width="4"/>
    </svg>
  `,

  // AMBIENT DECORATIONS
  asset_tree: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96" width="64" height="96">
      <!-- Shadow -->
      <ellipse cx="32" cy="85" rx="16" ry="6" fill="#000" opacity="0.15"/>
      <!-- Trunk -->
      <rect x="29" y="60" width="6" height="25" fill="#8B4513"/>
      <!-- Leaf Canopies -->
      <circle cx="32" cy="50" r="18" fill="#2E7D32"/>
      <circle cx="24" cy="36" r="14" fill="#388E3C"/>
      <circle cx="40" cy="36" r="13" fill="#4CAF50"/>
      <circle cx="32" cy="24" r="12" fill="#81C784"/>
    </svg>
  `,
  asset_flag: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 80" width="48" height="80">
      <!-- Pole -->
      <line x1="20" y1="80" x2="20" y2="10" stroke="#7F8C8D" stroke-width="2.5"/>
      <!-- Gold Orb at Top -->
      <circle cx="20" cy="8" r="3" fill="#F1C40F"/>
      <!-- Flag Waving (Teal Gradient) -->
      <path d="M 20 12 Q 30 5 42 16 Q 30 25 20 20 Z" fill="#1abc9c"/>
    </svg>
  `,
  asset_truck: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 48" width="72" height="48">
      <!-- Truck Body -->
      <polygon points="10,32 50,32 68,22 68,14 45,6 10,6" fill="#3498DB"/>
      <!-- Truck Cabin windshield -->
      <polygon points="46,8 60,14 54,22 46,22" fill="#AED6F1" opacity="0.8"/>
      <!-- Wheels -->
      <circle cx="22" cy="34" r="7" fill="#2C3E50" stroke="#BDC3C7" stroke-width="1.5"/>
      <circle cx="50" cy="34" r="7" fill="#2C3E50" stroke="#BDC3C7" stroke-width="1.5"/>
      <!-- Cargo Graphics -->
      <text x="14" y="20" font-family="sans-serif" font-size="10" font-weight="bold" fill="#FFFFFF">WYLD</text>
    </svg>
  `,
  locked_cloud: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
      <!-- Cloudy overlay with high translucency -->
      <circle cx="44" cy="64" r="28" fill="#F2F4F4" opacity="0.85"/>
      <circle cx="84" cy="64" r="28" fill="#F2F4F4" opacity="0.85"/>
      <circle cx="64" cy="50" r="34" fill="#F8F9F9" opacity="0.95"/>
      <circle cx="64" cy="74" r="26" fill="#F2F4F4" opacity="0.85"/>
      <!-- Brass Lock Icon inside cloud -->
      <rect x="54" y="62" width="20" height="16" fill="#F39C12" rx="3"/>
      <path d="M 58 62 L 58 54 Q 64 46 70 54 L 70 62" stroke="#D35400" stroke-width="3.5" fill="none"/>
      <circle cx="64" cy="70" r="2.5" fill="#34495E"/>
    </svg>
  `
};

if (typeof window !== 'undefined') {
  window.SvgAssets = SvgAssets;
}
