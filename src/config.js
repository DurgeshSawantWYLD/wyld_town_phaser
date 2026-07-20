// src/config.js

export const COLS = 22;
export const ROWS = 20;

export const REGIONS = {
  welcome: {
    id: 'welcome', title: 'Welcome Plaza', sub: 'Starting Point', emoji: '🏛',
    col: 10, row: 8, color: 0x00e5ff,
    unlocks: 'brands', cta: 'Unlock Brands Hub',
    desc: 'Welcome to WYLD Town! The neon central square — your journey begins here.',
    theme: {
      skyColors: ['#0d211f', '#122a27', '#1b3c38'],
      groundColor: 0x1f3b39,
      parallaxColor: '#2d5754',
      landColor: 0x6dbf67,
      roadColor: 0x8a9bb0,
      accentColor: 0x00e5ff,
      assets: {
        decorBuilding: 'civic_landmark',
        sideBuildings: ['office_tower', 'shop_corner', 'residential_tall'],
        decorProps: ['fountain', 'archway']
      }
    },
    tasks: [
      {
        id: 'welcome_1',
        title: 'Enter WYLD Town',
        desc: 'Approach the welcome plaza fountain to complete the intro sequence.',
        status: 'unlocked',
        col: 10, row: 8,
        asset: { type: 'procedural', shape: 'civic_landmark', height: 0.4, primaryColor: 0x00e5ff },
        rewards: [
          { type: 'coin', value: 100, label: '100 WYLD Coins', icon: '🪙' },
          { type: 'xp', value: 50, label: '50 Creator XP', icon: '⚡' }
        ]
      },
      {
        id: 'welcome_2',
        title: 'Claim Welcome Gift',
        desc: 'Visit the welcome news stand to claim your starter pack.',
        status: 'locked',
        col: 9, row: 11,
        asset: { type: 'procedural', shape: 'news_stand', height: 0.2, primaryColor: 0x00e5ff },
        rewards: [
          { type: 'coin', value: 150, label: '150 WYLD Coins', icon: '🪙' },
          { type: 'badge', value: 'Welcome Kit', label: 'Welcome Kit', icon: '🎁' }
        ]
      },
      {
        id: 'welcome_3',
        title: 'Connect Socials',
        desc: 'Verify and link your creator accounts to the brand sponsor engine.',
        status: 'locked',
        col: 6, row: 5,
        asset: { type: 'procedural', shape: 'office_tower', height: 0.8, primaryColor: 0xff00ff },
        rewards: [
          { type: 'coin', value: 200, label: '200 WYLD Coins', icon: '🪙' },
          { type: 'xp', value: 100, label: '100 Creator XP', icon: '⚡' }
        ]
      },
      {
        id: 'welcome_4',
        title: 'Set Up Camera',
        desc: 'Install the professional camera rig and neon highlights in the studio.',
        status: 'locked',
        col: 15, row: 4,
        asset: { type: 'procedural', shape: 'residential_tall', height: 0.7, primaryColor: 0xff3399 },
        rewards: [
          { type: 'coin', value: 300, label: '300 WYLD Coins', icon: '🪙' },
          { type: 'xp', value: 150, label: '150 Creator XP', icon: '⚡' }
        ]
      },
      {
        id: 'welcome_5',
        title: 'Broadcast Campaign',
        desc: 'Launch the campaign transmission feed using the tower satellite antenna.',
        status: 'locked',
        col: 18, row: 8,
        asset: { type: 'procedural', shape: 'civic_landmark', height: 0.6, primaryColor: 0x00ff88 },
        rewards: [
          { type: 'coin', value: 400, label: '400 WYLD Coins', icon: '🪙' },
          { type: 'xp', value: 200, label: '200 Creator XP', icon: '⚡' }
        ]
      },
      {
        id: 'welcome_6',
        title: 'Review Stats',
        desc: 'Verify click-through rate, views, and rewards generated in the stats dashboard.',
        status: 'locked',
        col: 17, row: 13,
        asset: { type: 'procedural', shape: 'office_tower', height: 0.75, primaryColor: 0x4488ff },
        rewards: [
          { type: 'coin', value: 500, label: '500 WYLD Coins', icon: '🪙' },
          { type: 'xp', value: 250, label: '250 Creator XP', icon: '⚡' }
        ]
      },
      {
        id: 'welcome_7',
        title: 'Browse Products',
        desc: 'Check the catalog for new brand merchandise and samples.',
        status: 'locked',
        col: 6, row: 13,
        asset: { type: 'procedural', shape: 'industrial_factory', height: 0.5, primaryColor: 0xfffc00 },
        rewards: [
          { type: 'coin', value: 600, label: '600 WYLD Coins', icon: '🪙' },
          { type: 'xp', value: 300, label: '300 Creator XP', icon: '⚡' }
        ]
      },
      {
        id: 'welcome_8',
        title: 'Join Creator Meetup',
        desc: 'Assemble at the pavilion to meet other top performing brand creators.',
        status: 'locked',
        col: 11, row: 15,
        asset: { type: 'procedural', shape: 'civic_landmark', height: 0.4, primaryColor: 0x00ff88 },
        rewards: [
          { type: 'coin', value: 800, label: '800 WYLD Coins', icon: '🪙' },
          { type: 'xp', value: 400, label: '400 Creator XP', icon: '⚡' }
        ]
      },
      {
        id: 'welcome_9',
        title: 'Clear Mountain Path',
        desc: 'Shovel snow off the mountain trails to open the path to the summit.',
        status: 'locked',
        col: 6, row: 17,
        asset: { type: 'procedural', shape: 'office_tower', height: 0.6, primaryColor: 0xb0bec5 },
        rewards: [
          { type: 'coin', value: 1100, label: '1100 WYLD Coins', icon: '🪙' },
          { type: 'xp', value: 450, label: '450 Creator XP', icon: '⚡' }
        ]
      },
      {
        id: 'welcome_10',
        title: 'Locate Hidden Oasis',
        desc: 'Find the secret water spring hidden deep inside the hot dunes.',
        status: 'locked',
        col: 16, row: 17,
        asset: { type: 'procedural', shape: 'civic_landmark', height: 0.5, primaryColor: 0xffb74d },
        rewards: [
          { type: 'coin', value: 1300, label: '1300 WYLD Coins', icon: '🪙' },
          { type: 'xp', value: 500, label: '500 Creator XP', icon: '⚡' }
        ]
      }
    ]
  },
  brands: {
    id: 'brands', title: 'Brands Hub', sub: 'Social Commerce Centre', emoji: '🏢',
    col: 6, row: 5, color: 0xff00ff,
    unlocks: 'creator', cta: 'Unlock Creator Studio',
    desc: 'Connect with top lifestyle & apparel brands like Coca-Cola, Nike, and Adidas.',
    tasks: [
      {
        id: 'brands_1',
        title: 'Connect Socials',
        desc: 'Verify and link your creator accounts to the brand sponsor engine.',
        status: 'locked',
        col: 6, row: 5,
        asset: { type: 'procedural', shape: 'office_tower', height: 0.8, primaryColor: 0xff00ff },
        rewards: [
          { type: 'coin', value: 200, label: '200 WYLD Coins', icon: '🪙' },
          { type: 'xp', value: 100, label: '100 Creator XP', icon: '⚡' }
        ]
      },
      {
        id: 'brands_2',
        title: 'Select Preferred Brand',
        desc: 'Interact with the neon billboard to choose your primary brand campaign.',
        status: 'locked',
        col: 5, row: 10,
        asset: { type: 'procedural', shape: 'office_low', height: 0.4, primaryColor: 0xff00ff },
        rewards: [
          { type: 'coin', value: 250, label: '250 WYLD Coins', icon: '🪙' },
          { type: 'coupon', value: '15% Brand Discount', label: '15% Brand Voucher', icon: '🏷️' }
        ]
      }
    ]
  },
  creator: {
    id: 'creator', title: 'Creator Studio', sub: 'Content Engine', emoji: '🎬',
    col: 15, row: 4, color: 0xff3399,
    unlocks: 'campaigns', cta: 'Assemble Campaigns',
    desc: 'Design tools, video setups, and co-working environments for creators.',
    tasks: [
      {
        id: 'creator_1',
        title: 'Set Up Camera',
        desc: 'Install the professional camera rig and neon highlights in the studio.',
        status: 'locked',
        col: 15, row: 4,
        asset: { type: 'procedural', shape: 'residential_tall', height: 0.7, primaryColor: 0xff3399 },
        rewards: [
          { type: 'coin', value: 300, label: '300 WYLD Coins', icon: '🪙' },
          { type: 'xp', value: 150, label: '150 Creator XP', icon: '⚡' }
        ]
      },
      {
        id: 'creator_2',
        title: 'Record First Clip',
        desc: 'Record a high-quality video clip to broadcast to your followers.',
        status: 'locked',
        col: 15, row: 8,
        asset: { type: 'procedural', shape: 'shop_corner', height: 0.35, primaryColor: 0xff3399 },
        rewards: [
          { type: 'coin', value: 350, label: '350 WYLD Coins', icon: '🪙' },
          { type: 'item', value: 'Golden Lens', label: 'Golden Lens NFT', icon: '📷' }
        ]
      }
    ]
  },
  campaigns: {
    id: 'campaigns', title: 'Campaigns Tower', sub: 'Marketing Broadcast', emoji: '📡',
    col: 18, row: 8, color: 0x00ff88,
    unlocks: 'analytics', cta: 'Deploy Analytics',
    desc: 'Broadcasting viral brand products and reward campaigns to the city.',
    tasks: [
      {
        id: 'campaigns_1',
        title: 'Broadcast Campaign',
        desc: 'Launch the campaign transmission feed using the tower satellite antenna.',
        status: 'locked',
        col: 18, row: 8,
        asset: { type: 'procedural', shape: 'civic_landmark', height: 0.6, primaryColor: 0x00ff88 },
        rewards: [
          { type: 'coin', value: 400, label: '400 WYLD Coins', icon: '🪙' },
          { type: 'xp', value: 200, label: '200 Creator XP', icon: '⚡' }
        ]
      },
      {
        id: 'campaigns_2',
        title: 'Distribute Flyers',
        desc: 'Send promotional materials to the local news stands.',
        status: 'locked',
        col: 13, row: 11,
        asset: { type: 'procedural', shape: 'restaurant', height: 0.3, primaryColor: 0x00ff88 },
        rewards: [
          { type: 'coin', value: 450, label: '450 WYLD Coins', icon: '🪙' },
          { type: 'reach', value: '+10% Brand Reach', label: '+10% Brand Reach', icon: '📈' }
        ]
      }
    ]
  },
  analytics: {
    id: 'analytics', title: 'Analytics Vault', sub: 'Data Analytics Center', emoji: '📊',
    col: 17, row: 13, color: 0x4488ff,
    unlocks: 'marketplace', cta: 'Open Marketplace',
    desc: 'Track conversion metrics and social media engagement data in real-time.',
    tasks: [
      {
        id: 'analytics_1',
        title: 'Review Stats',
        desc: 'Verify click-through rate, views, and rewards generated in the stats dashboard.',
        status: 'locked',
        col: 17, row: 13,
        asset: { type: 'procedural', shape: 'office_tower', height: 0.75, primaryColor: 0x4488ff },
        rewards: [
          { type: 'coin', value: 500, label: '500 WYLD Coins', icon: '🪙' },
          { type: 'xp', value: 250, label: '250 Creator XP', icon: '⚡' }
        ]
      },
      {
        id: 'analytics_2',
        title: 'Optimize Content',
        desc: 'Tweak layout parameters at the analytics lab to boost performance.',
        status: 'locked',
        col: 17, row: 7,
        asset: { type: 'procedural', shape: 'office_low', height: 0.45, primaryColor: 0x4488ff },
        rewards: [
          { type: 'coin', value: 550, label: '550 WYLD Coins', icon: '🪙' },
          { type: 'insights', value: 'Conversion Audit', label: 'Conversion Report', icon: '📊' }
        ]
      }
    ]
  },
  marketplace: {
    id: 'marketplace', title: 'Marketplace', sub: 'Commerce Bazaar', emoji: '🛍',
    col: 6, row: 13, color: 0xfffc00,
    unlocks: 'community', cta: 'Unlock Community Park',
    desc: 'The decentralized trading post where creators redeem products and swap tokens.',
    tasks: [
      {
        id: 'marketplace_1',
        title: 'Browse Products',
        desc: 'Check the catalog for new brand merchandise and samples.',
        status: 'locked',
        col: 6, row: 13,
        asset: { type: 'procedural', shape: 'industrial_factory', height: 0.5, primaryColor: 0xfffc00 },
        rewards: [
          { type: 'coin', value: 600, label: '600 WYLD Coins', icon: '🪙' },
          { type: 'xp', value: 300, label: '300 Creator XP', icon: '⚡' }
        ]
      },
      {
        id: 'marketplace_2',
        title: 'Redeem Reward',
        desc: 'Redeem your earned tokens for real brand vouchers.',
        status: 'locked',
        col: 7, row: 11,
        asset: { type: 'procedural', shape: 'shop_corner', height: 0.35, primaryColor: 0xfffc00 },
        rewards: [
          { type: 'coin', value: 700, label: '700 WYLD Coins', icon: '🪙' },
          { type: 'item', value: 'Exclusive Merch', label: 'WYLD Hoodie NFT', icon: '👕' }
        ]
      }
    ]
  },
  community: {
    id: 'community', title: 'Community Park', sub: 'The Pavilion', emoji: '🌳',
    col: 11, row: 15, color: 0x00ff88,
    unlocks: 'snow', cta: 'Unlock Snow Peaks',
    desc: 'Gathering ground for all creators and brand fans to collaborate and celebrate.',
    tasks: [
      {
        id: 'community_1',
        title: 'Join Creator Meetup',
        desc: 'Assemble at the pavilion to meet other top performing brand creators.',
        status: 'locked',
        col: 11, row: 15,
        asset: { type: 'procedural', shape: 'civic_landmark', height: 0.4, primaryColor: 0x00ff88 },
        rewards: [
          { type: 'coin', value: 800, label: '800 WYLD Coins', icon: '🪙' },
          { type: 'xp', value: 400, label: '400 Creator XP', icon: '⚡' }
        ]
      },
      {
        id: 'community_2',
        title: 'Celebrate Launch',
        desc: 'Host a celebration event at the local restaurant.',
        status: 'locked',
        col: 9, row: 14,
        asset: { type: 'procedural', shape: 'restaurant', height: 0.3, primaryColor: 0x00ff88 },
        rewards: [
          { type: 'coin', value: 1000, label: '1000 WYLD Coins', icon: '🪙' },
          { type: 'trophy', value: 'WYLD Champion', label: 'WYLD Champion Trophy', icon: '🏆' }
        ]
      }
    ]
  },
  snow: {
    id: 'snow', title: 'Snow Peaks', sub: 'Icy Wilderness', emoji: '❄️',
    col: 6, row: 17, color: 0xb0bec5,
    unlocks: 'desert', cta: 'Unlock Desert Dunes',
    desc: 'Brave the freezing trails and establish snowy creator chalets on the peak.',
    tasks: [
      {
        id: 'snow_1',
        title: 'Clear Mountain Path',
        desc: 'Shovel snow off the mountain trails to open the path to the summit.',
        status: 'locked',
        col: 6, row: 17,
        asset: { type: 'procedural', shape: 'office_tower', height: 0.6, primaryColor: 0xb0bec5 },
        rewards: [
          { type: 'coin', value: 1100, label: '1100 WYLD Coins', icon: '🪙' },
          { type: 'xp', value: 450, label: '450 Creator XP', icon: '⚡' }
        ]
      },
      {
        id: 'snow_2',
        title: 'Build Snow Chalet',
        desc: 'Construct a warm cozy igloo and cabin for frozen content sessions.',
        status: 'locked',
        col: 5, row: 16,
        asset: { type: 'procedural', shape: 'residential_house', height: 0.45, primaryColor: 0xb0bec5 },
        rewards: [
          { type: 'coin', value: 1200, label: '1200 WYLD Coins', icon: '🪙' },
          { type: 'item', value: 'Cozy Beanie', label: 'Cozy Beanie NFT', icon: '🤠' }
        ]
      }
    ]
  },
  desert: {
    id: 'desert', title: 'Desert Dunes', sub: 'Golden Oasis', emoji: '🏜️',
    col: 16, row: 17, color: 0xffb74d,
    unlocks: null, cta: '🏆 Complete!',
    desc: 'Explore the sweeping sand dunes and harness solar power in the sunny oasis.',
    tasks: [
      {
        id: 'desert_1',
        title: 'Locate Hidden Oasis',
        desc: 'Find the secret water spring hidden deep inside the hot dunes.',
        status: 'locked',
        col: 16, row: 17,
        asset: { type: 'procedural', shape: 'civic_landmark', height: 0.5, primaryColor: 0xffb74d },
        rewards: [
          { type: 'coin', value: 1300, label: '1300 WYLD Coins', icon: '🪙' },
          { type: 'xp', value: 500, label: '500 Creator XP', icon: '⚡' }
        ]
      },
      {
        id: 'desert_2',
        title: 'Deploy Solar Grid',
        desc: 'Install solar arrays around the oasis to power local creator hubs.',
        status: 'locked',
        col: 15, row: 16,
        asset: { type: 'procedural', shape: 'industrial_factory', height: 0.4, primaryColor: 0xffb74d },
        rewards: [
          { type: 'coin', value: 1400, label: '1400 WYLD Coins', icon: '🪙' },
          { type: 'item', value: 'Golden Sunglasses', label: 'Sun Shield Glasses', icon: '🕶️' }
        ]
      }
    ]
  }
};

// ─── Road Network ──────────────────────────────────────────────────────────
export const ROADS = [
  // Main Horizontal Expressway (row 9)
  {c:3,r:9},{c:4,r:9},{c:5,r:9},{c:6,r:9},{c:7,r:9},{c:8,r:9},{c:9,r:9},
  {c:10,r:9},{c:11,r:9},{c:12,r:9},{c:13,r:9},{c:14,r:9},{c:15,r:9},
  {c:16,r:9},{c:17,r:9},{c:18,r:9},{c:19,r:9},
  // Main Vertical Expressway (col 11)
  {c:11,r:2},{c:11,r:3},{c:11,r:4},{c:11,r:5},{c:11,r:6},{c:11,r:7},{c:11,r:8},
  {c:11,r:10},{c:11,r:11},{c:11,r:12},{c:11,r:13},{c:11,r:14},{c:11,r:15},
  {c:11,r:16},{c:11,r:17},
  // Left Loop (col 6)
  {c:6,r:6},{c:6,r:7},{c:6,r:8},{c:6,r:10},{c:6,r:11},{c:6,r:12},
  // Right Loop (col 16)
  {c:16,r:5},{c:16,r:6},{c:16,r:7},{c:16,r:8},{c:16,r:10},{c:16,r:11},{c:16,r:12},
  // Top connector roads
  {c:7,r:6},{c:8,r:6},{c:9,r:6},{c:10,r:6},
  {c:12,r:6},{c:13,r:6},{c:14,r:6},{c:15,r:6},
  // Bottom connector roads
  {c:7,r:12},{c:8,r:12},{c:9,r:12},{c:10,r:12},
  {c:12,r:12},{c:13,r:12},{c:14,r:12},{c:15,r:12},
  // Airport access road (row 16)
  {c:3,r:16},{c:4,r:16},{c:5,r:16},{c:6,r:16},{c:7,r:16},{c:8,r:16},{c:9,r:16},{c:10,r:16}
];

// Airport runway
export const RUNWAY = { startCol: 2, endCol: 9, row: 18 };

// Lakes
export const LAKES = [
  { c: 3, r: 3, w: 2.2, d: 2.2 },
  { c: 19, r: 16, w: 2.5, d: 2.5 }
];

// ─── ROAD_SET for quick lookup (used by config consumers) ──────────────────
export const ROAD_CELLS = new Set(ROADS.map(t => `${t.c},${t.r}`));
export const ROAD_SET = ROAD_CELLS;

// ─── Decor Buildings — all 10 types, verified road-safe positions ──────────
// Rule: NO building at any {c,r} that appears in ROADS above
export const DECOR_BUILDINGS = [
  // Office towers — tall, multi-floor
  { c:9,  r:5,  type:'office_tower' },
  { c:13, r:5,  type:'office_tower' },
  { c:19, r:5,  type:'office_tower' },
  { c:4,  r:11, type:'office_tower' },
  // Office low-rise
  { c:5,  r:7,  type:'office_low' },
  { c:17, r:7,  type:'office_low' },
  { c:10, r:11, type:'office_low' },
  { c:12, r:11, type:'office_low' },
  // Residential tall apartments
  { c:8,  r:3,  type:'residential_tall' },
  { c:14, r:3,  type:'residential_tall' },
  { c:19, r:11, type:'residential_tall' },
  // Residential houses
  { c:7,  r:14, type:'residential_house' },
  { c:15, r:14, type:'residential_house' },
  { c:10, r:14, type:'residential_house' },
  { c:12, r:14, type:'residential_house' },
  { c:5,  r:15, type:'residential_house' },
  { c:17, r:15, type:'residential_house' },
  // Industrial factory
  { c:4,  r:10, type:'industrial_factory' },
  { c:18, r:10, type:'industrial_factory' },
  // Industrial warehouse
  { c:13, r:10, type:'industrial_warehouse' },
  { c:9,  r:10, type:'industrial_warehouse' },
  // Corner shops
  { c:5,  r:8,  type:'shop_corner' },
  { c:17, r:8,  type:'shop_corner' },
  { c:7,  r:11, type:'shop_corner' },
  // Restaurants
  { c:14, r:11, type:'restaurant' },
  { c:9,  r:14, type:'restaurant' },
  // Parking structure
  { c:4,  r:7,  type:'parking_structure' },
  { c:18, r:7,  type:'parking_structure' },
  // Civic landmark
  { c:3,  r:5,  type:'civic_landmark' },
  { c:19, r:13, type:'civic_landmark' },
];

// ─── Tree Clusters — 6 types, grouped by zone for staggered reveal ──────────
// Types: 'pine' | 'lollipop' | 'oak' | 'palm' | 'bush' | 'autumn'
export const TREE_CLUSTERS = [
  {
    id: 'north_pines',
    type: 'pine',
    positions: [
      {c:1,r:1},{c:2,r:1},{c:3,r:1},{c:4,r:1},{c:5,r:1},{c:6,r:1},
      {c:17,r:1},{c:18,r:1},{c:19,r:1},{c:20,r:1},{c:21,r:1},
      {c:1,r:2},{c:2,r:2},{c:20,r:2},{c:21,r:2},
      {c:1,r:3},{c:2,r:3},{c:21,r:3},
    ]
  },
  {
    id: 'south_pines',
    type: 'pine',
    positions: [
      {c:1,r:17},{c:2,r:17},{c:3,r:17},{c:20,r:17},{c:21,r:17},
      {c:1,r:18},{c:2,r:18},{c:20,r:18},{c:21,r:18},
      {c:1,r:19},{c:2,r:19},{c:19,r:19},{c:20,r:19},{c:21,r:19},
    ]
  },
  {
    id: 'plaza_palms',
    type: 'palm',
    positions: [
      {c:8,r:6},{c:9,r:7},{c:12,r:7},{c:13,r:6},
      {c:8,r:9},{c:13,r:9},
      {c:9,r:6},{c:12,r:6},
    ]
  },
  {
    id: 'community_oaks',
    type: 'oak',
    positions: [
      {c:8,r:13},{c:9,r:13},{c:10,r:13},{c:12,r:13},{c:13,r:13},{c:14,r:13},
      {c:8,r:14},{c:9,r:14},{c:13,r:14},{c:14,r:14},
      {c:8,r:15},{c:9,r:15},{c:10,r:15},{c:12,r:15},{c:13,r:15},{c:14,r:15},
      {c:9,r:16},{c:10,r:16},{c:12,r:16},{c:13,r:16},
    ]
  },
  {
    id: 'north_oaks',
    type: 'oak',
    positions: [
      {c:7,r:3},{c:8,r:3},{c:9,r:3},{c:10,r:3},
      {c:13,r:3},{c:14,r:3},{c:15,r:3},{c:16,r:3},
      {c:7,r:4},{c:8,r:4},{c:14,r:4},{c:15,r:4},
    ]
  },
  {
    id: 'sidewalk_lollipops',
    type: 'lollipop',
    positions: [
      {c:5,r:8},{c:5,r:10},{c:17,r:8},{c:17,r:10},
      {c:10,r:4},{c:12,r:4},{c:10,r:13},{c:12,r:13},
      {c:4,r:6},{c:4,r:7},{c:18,r:6},{c:18,r:7},
      {c:7,r:11},{c:15,r:11},
    ]
  },
  {
    id: 'border_bushes',
    type: 'bush',
    positions: [
      {c:3,r:2},{c:4,r:2},{c:5,r:2},{c:6,r:2},{c:7,r:2},
      {c:15,r:2},{c:16,r:2},{c:17,r:2},{c:18,r:2},{c:19,r:2},
      {c:3,r:4},{c:3,r:5},{c:3,r:6},{c:3,r:7},
      {c:19,r:4},{c:19,r:5},{c:19,r:6},{c:19,r:7},
      {c:4,r:14},{c:5,r:14},{c:17,r:14},{c:18,r:14},
      {c:3,r:14},{c:3,r:15},{c:3,r:16},
    ]
  },
  {
    id: 'autumn_market',
    type: 'autumn',
    positions: [
      {c:5,r:11},{c:5,r:12},{c:5,r:13},
      {c:7,r:13},{c:7,r:14},{c:7,r:15},
      {c:17,r:13},{c:17,r:14},{c:15,r:13},
    ]
  },
  {
    id: 'airport_zone',
    type: 'pine',
    positions: [
      {c:2,r:15},{c:2,r:16},{c:2,r:17},
      {c:3,r:17},{c:4,r:17},{c:5,r:17},
    ]
  },
];

// Flat TREES list (for backward compatibility, derived from clusters)
export const TREES = TREE_CLUSTERS.flatMap(cl => cl.positions.map(p => ({ ...p, type: cl.type })));


// ─── Lamp Posts — strictly on sidewalk cells adjacent to roads ─────────────
// None of these coords are in ROADS
export const LAMP_POSTS = [
  // Along horizontal expressway (row 8 and row 10 — sidewalks)
  {c:5,r:8},{c:8,r:8},{c:14,r:8},{c:17,r:8},
  {c:5,r:10},{c:8,r:10},{c:14,r:10},{c:17,r:10},
  // Along vertical expressway (col 10 and col 12 — sidewalks)
  {c:10,r:4},{c:10,r:7},{c:10,r:13},{c:10,r:16},
  {c:12,r:4},{c:12,r:7},{c:12,r:13},{c:12,r:16},
  // Loop sidewalks
  {c:5,r:7},{c:5,r:11},{c:17,r:6},{c:17,r:11},
];

// ─── Benches — plaza/sidewalk only ────────────────────────────────────────
export const BENCHES = [
  {c:9,r:8},{c:12,r:8},   // near central horizontal road, sidewalk row
  {c:10,r:7},{c:12,r:7},  // top sidewalk
  {c:8,r:15},{c:13,r:15}, // residential park
];

// ─── Neon Billboards, Phone Booths, News Stands ───────────────────────────
export const BILLBOARDS = [
  {c:5,r:10},{c:14,r:10},{c:17,r:5},
];
export const PHONE_BOOTHS = [
  {c:7,r:8},{c:15,r:8},
];
export const NEWS_STANDS = [
  {c:9,r:11},{c:13,r:11},
];

// ─── Brands ────────────────────────────────────────────────────────────────
export const BRANDS = {
  cocacola: {
    id: 'cocacola', name: 'Coca-Cola', primaryColor: 0xf43f5e, accentColor: 0xffffff,
    tagline: 'Open Happiness', product: 'Original Taste Soda'
  },
  nike: {
    id: 'nike', name: 'Nike', primaryColor: 0x3b82f6, accentColor: 0xff6600,
    tagline: 'Just Do It', product: 'Air Max Sneaker'
  },
  adidas: {
    id: 'adidas', name: 'Adidas', primaryColor: 0x8b5cf6, accentColor: 0xffffff,
    tagline: 'Impossible Is Nothing', product: 'Classic Superstar'
  }
};
