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
  cold: {
    id: 'cold', title: 'Cold Summit', sub: 'Chapter 2: Frozen Peaks', emoji: '❄️',
    col: 6, row: 17, color: 0x38bdf8,
    unlocks: 'desert', cta: 'Cross into Desert Dunes',
    desc: 'Navigate icy glaciers, frozen fjords, and snowy peaks in the arctic summit.',
    theme: {
      skyColors: ['#041019', '#092133', '#0e314a'],
      groundColor: 0xddeef5,
      parallaxColor: '#b0cddb',
      landColor: 0xa5f3fc,
      roadColor: 0xc4b5fd,
      accentColor: 0x38bdf8,
      assets: {
        decorBuilding: 'civic_landmark',
        sideBuildings: ['office_tower', 'shop_corner'],
        decorProps: ['snowman', 'pine_tree']
      }
    },
    tasks: [
      { id: 'cold_1', title: 'Glacier Crossing', desc: 'Step across the crevasse over icy bridges.', status: 'locked', col: 6, row: 17, asset: { type: 'procedural', shape: 'civic_landmark', height: 0.5, primaryColor: 0x38bdf8 }, rewards: [{ type: 'coin', value: 1500, label: '1500 WYLD Coins', icon: '🪙' }] },
      { id: 'cold_2', title: 'Build Igloo Outpost', desc: 'Assemble a shelter against sub-zero mountain winds.', status: 'locked', col: 7, row: 17, asset: { type: 'procedural', shape: 'shop_corner', height: 0.3, primaryColor: 0x0284c7 }, rewards: [{ type: 'coin', value: 1600, label: '1600 WYLD Coins', icon: '🪙' }] },
      { id: 'cold_3', title: 'Frost Crystal Mining', desc: 'Extract glowing ice crystals embedded in the glacier.', status: 'locked', col: 8, row: 17, asset: { type: 'procedural', shape: 'office_low', height: 0.4, primaryColor: 0xbae6fd }, rewards: [{ type: 'coin', value: 1700, label: '1700 WYLD Coins', icon: '🪙' }] },
      { id: 'cold_4', title: 'Snowmobile Dash', desc: 'Race across the frozen lakebed to reach the weather station.', status: 'locked', col: 9, row: 17, asset: { type: 'procedural', shape: 'office_tower', height: 0.7, primaryColor: 0x38bdf8 }, rewards: [{ type: 'coin', value: 1800, label: '1800 WYLD Coins', icon: '🪙' }] },
      { id: 'cold_5', title: 'Aurora Beacon', desc: 'Calibrate the magnetic beacon to project the northern lights.', status: 'locked', col: 10, row: 17, asset: { type: 'procedural', shape: 'civic_landmark', height: 0.6, primaryColor: 0x818cf8 }, rewards: [{ type: 'coin', value: 1900, label: '1900 WYLD Coins', icon: '🪙' }] },
      { id: 'cold_6', title: 'Yeti Cavern', desc: 'Explore the shimmering ice cave without disturbing the yeti.', status: 'locked', col: 11, row: 17, asset: { type: 'procedural', shape: 'shop_corner', height: 0.35, primaryColor: 0x0284c7 }, rewards: [{ type: 'coin', value: 2000, label: '2000 WYLD Coins', icon: '🪙' }] },
      { id: 'cold_7', title: 'Frozen Waterfall Summit', desc: 'Scale the sheer ice wall using spiked crampons.', status: 'locked', col: 12, row: 17, asset: { type: 'procedural', shape: 'industrial_factory', height: 0.5, primaryColor: 0xbae6fd }, rewards: [{ type: 'coin', value: 2100, label: '2100 WYLD Coins', icon: '🪙' }] },
      { id: 'cold_8', title: 'Blizzard Rescue', desc: 'Guiding lost explorers safely through the whiteout.', status: 'locked', col: 13, row: 17, asset: { type: 'procedural', shape: 'office_tower', height: 0.65, primaryColor: 0x38bdf8 }, rewards: [{ type: 'coin', value: 2200, label: '2200 WYLD Coins', icon: '🪙' }] },
      { id: 'cold_9', title: 'Ice Citadel Keep', desc: 'Unlock the ancient gates carved into the solid ice glacier.', status: 'locked', col: 14, row: 17, asset: { type: 'procedural', shape: 'civic_landmark', height: 0.75, primaryColor: 0x818cf8 }, rewards: [{ type: 'coin', value: 2300, label: '2300 WYLD Coins', icon: '🪙' }] },
      { id: 'cold_10', title: 'Summit Flag Victory', desc: 'Plant the WYLD Creator banner on the highest snowy peak.', status: 'locked', col: 15, row: 17, asset: { type: 'procedural', shape: 'office_tower', height: 0.8, primaryColor: 0x38bdf8 }, rewards: [{ type: 'coin', value: 2500, label: '2500 WYLD Coins', icon: '🪙' }] }
    ]
  },
  desert: {
    id: 'desert', title: 'Desert Dunes', sub: 'Chapter 3: Sunbaked Sands', emoji: '🏜️',
    col: 16, row: 17, color: 0xf59e0b,
    unlocks: 'fire', cta: 'Descend to Volcanic Caldera',
    desc: 'Brave golden dunes, ancient pyramids, and scorching desert oases.',
    theme: {
      skyColors: ['#1f0e04', '#381a07', '#54270a'],
      groundColor: 0xe2a85e,
      parallaxColor: '#cca064',
      landColor: 0xfcd34d,
      roadColor: 0xfde047,
      accentColor: 0xf59e0b,
      assets: {
        decorBuilding: 'civic_landmark',
        sideBuildings: ['shop_corner'],
        decorProps: ['cactus', 'camel', 'tent']
      }
    },
    tasks: [
      { id: 'desert_1', title: 'Dune Caravan', desc: 'Trek across undulating sand dunes guided by camels.', status: 'locked', col: 16, row: 17, asset: { type: 'procedural', shape: 'civic_landmark', height: 0.5, primaryColor: 0xf59e0b }, rewards: [{ type: 'coin', value: 2600, label: '2600 WYLD Coins', icon: '🪙' }] },
      { id: 'desert_2', title: 'Oasis Market', desc: 'Trade spices and silk under palm trees at the desert oasis.', status: 'locked', col: 17, row: 17, asset: { type: 'procedural', shape: 'shop_corner', height: 0.3, primaryColor: 0xd97706 }, rewards: [{ type: 'coin', value: 2700, label: '2700 WYLD Coins', icon: '🪙' }] },
      { id: 'desert_3', title: 'Pyramid Threshold', desc: 'Uncover ancient hieroglyph stone tablets in the sands.', status: 'locked', col: 18, row: 17, asset: { type: 'procedural', shape: 'office_low', height: 0.4, primaryColor: 0xfcd34d }, rewards: [{ type: 'coin', value: 2800, label: '2800 WYLD Coins', icon: '🪙' }] },
      { id: 'desert_4', title: 'Sandstorm Navigation', desc: 'Use celestial compass navigation during a golden dust storm.', status: 'locked', col: 19, row: 17, asset: { type: 'procedural', shape: 'office_tower', height: 0.7, primaryColor: 0xf59e0b }, rewards: [{ type: 'coin', value: 2900, label: '2900 WYLD Coins', icon: '🪙' }] },
      { id: 'desert_5', title: 'Sun Dial Alignment', desc: 'Align the ancient golden mirror array to harvest solar energy.', status: 'locked', col: 20, row: 17, asset: { type: 'procedural', shape: 'civic_landmark', height: 0.6, primaryColor: 0xfbbf24 }, rewards: [{ type: 'coin', value: 3000, label: '3000 WYLD Coins', icon: '🪙' }] },
      { id: 'desert_6', title: 'Mirage Canyon', desc: 'Navigate shimmering illusions through sandstone slot canyons.', status: 'locked', col: 21, row: 17, asset: { type: 'procedural', shape: 'shop_corner', height: 0.35, primaryColor: 0xd97706 }, rewards: [{ type: 'coin', value: 3100, label: '3100 WYLD Coins', icon: '🪙' }] },
      { id: 'desert_7', title: 'Nomad Campfire', desc: 'Share stories and music with desert wanderers at nightfall.', status: 'locked', col: 22, row: 17, asset: { type: 'procedural', shape: 'industrial_factory', height: 0.5, primaryColor: 0xfcd34d }, rewards: [{ type: 'coin', value: 3200, label: '3200 WYLD Coins', icon: '🪙' }] },
      { id: 'desert_8', title: 'Scorpion Ridge Pass', desc: 'Safely bypass rocky escarpments guarded by desert fauna.', status: 'locked', col: 23, row: 17, asset: { type: 'procedural', shape: 'office_tower', height: 0.65, primaryColor: 0xf59e0b }, rewards: [{ type: 'coin', value: 3300, label: '3300 WYLD Coins', icon: '🪙' }] },
      { id: 'desert_9', title: 'Golden Sphinx Vault', desc: 'Solve the riddle of the golden sphinx gatehouse.', status: 'locked', col: 24, row: 17, asset: { type: 'procedural', shape: 'civic_landmark', height: 0.75, primaryColor: 0xfbbf24 }, rewards: [{ type: 'coin', value: 3400, label: '3400 WYLD Coins', icon: '🪙' }] },
      { id: 'desert_10', title: 'Sultan Palace Gate', desc: 'Reach the majestic golden palace at the edge of the desert.', status: 'locked', col: 25, row: 17, asset: { type: 'procedural', shape: 'office_tower', height: 0.8, primaryColor: 0xf59e0b }, rewards: [{ type: 'coin', value: 3500, label: '3500 WYLD Coins', icon: '🪙' }] }
    ]
  },
  fire: {
    id: 'fire', title: 'Fire Caldera', sub: 'Chapter 4: Volcanic Realm', emoji: '🌋',
    col: 26, row: 17, color: 0xef4444,
    unlocks: null, cta: 'Master of WYLD Town',
    desc: 'Face glowing lava streams, obsidian crags, and fiery volcanic power.',
    theme: {
      skyColors: ['#1c0404', '#380707', '#540b0b'],
      groundColor: 0x5c1409,
      parallaxColor: '#4a1515',
      landColor: 0xf87171,
      roadColor: 0xfca5a5,
      accentColor: 0xef4444,
      assets: {
        decorBuilding: 'civic_landmark',
        sideBuildings: ['industrial_factory'],
        decorProps: ['lava_pillar', 'torch']
      }
    },
    tasks: [
      { id: 'fire_1', title: 'Obsidian Ridge', desc: 'Traverse sharp black obsidian rocks over glowing magma.', status: 'locked', col: 26, row: 17, asset: { type: 'procedural', shape: 'civic_landmark', height: 0.5, primaryColor: 0xef4444 }, rewards: [{ type: 'coin', value: 3600, label: '3600 WYLD Coins', icon: '🪙' }] },
      { id: 'fire_2', title: 'Magma Forge', desc: 'Forge fireproof creator armor in molten subterranean heat.', status: 'locked', col: 27, row: 17, asset: { type: 'procedural', shape: 'industrial_factory', height: 0.4, primaryColor: 0xb91c1c }, rewards: [{ type: 'coin', value: 3700, label: '3700 WYLD Coins', icon: '🪙' }] },
      { id: 'fire_3', title: 'Eruption Warning System', desc: 'Activate geothermal sensors around the smoking crater.', status: 'locked', col: 28, row: 17, asset: { type: 'procedural', shape: 'office_low', height: 0.4, primaryColor: 0xfca5a5 }, rewards: [{ type: 'coin', value: 3800, label: '3800 WYLD Coins', icon: '🪙' }] },
      { id: 'fire_4', title: 'Basalt Bridge Crossing', desc: 'Cross a swinging bridge suspended over active lava falls.', status: 'locked', col: 29, row: 17, asset: { type: 'procedural', shape: 'office_tower', height: 0.7, primaryColor: 0xef4444 }, rewards: [{ type: 'coin', value: 3900, label: '3900 WYLD Coins', icon: '🪙' }] },
      { id: 'fire_5', title: 'Phoenix Flame Pillar', desc: 'Kindle the legendary flame pillar on top of the volcanic crest.', status: 'locked', col: 30, row: 17, asset: { type: 'procedural', shape: 'civic_landmark', height: 0.6, primaryColor: 0xf87171 }, rewards: [{ type: 'coin', value: 4000, label: '4000 WYLD Coins', icon: '🪙' }] },
      { id: 'fire_6', title: 'Subterranean Tunnels', desc: 'Navigate geothermal steam tunnels deep inside the mountain.', status: 'locked', col: 31, row: 17, asset: { type: 'procedural', shape: 'shop_corner', height: 0.35, primaryColor: 0xb91c1c }, rewards: [{ type: 'coin', value: 4200, label: '4200 WYLD Coins', icon: '🪙' }] },
      { id: 'fire_7', title: 'Lava Surfing Rapids', desc: 'Rider heat shields across molten basalt channels.', status: 'locked', col: 32, row: 17, asset: { type: 'procedural', shape: 'industrial_factory', height: 0.5, primaryColor: 0xfca5a5 }, rewards: [{ type: 'coin', value: 4400, label: '4400 WYLD Coins', icon: '🪙' }] },
      { id: 'fire_8', title: 'Dragon Roost Summit', desc: 'Ascend the highest volcanic pinnacle overlooking the realm.', status: 'locked', col: 33, row: 17, asset: { type: 'procedural', shape: 'office_tower', height: 0.65, primaryColor: 0xef4444 }, rewards: [{ type: 'coin', value: 4600, label: '4600 WYLD Coins', icon: '🪙' }] },
      { id: 'fire_9', title: 'Caldera Core Engine', desc: 'Harness raw volcanic heat to power the WYLD network.', status: 'locked', col: 34, row: 17, asset: { type: 'procedural', shape: 'civic_landmark', height: 0.75, primaryColor: 0xf87171 }, rewards: [{ type: 'coin', value: 4800, label: '4800 WYLD Coins', icon: '🪙' }] },
      { id: 'fire_10', title: 'Ultimate WYLD Crown', desc: 'Claim the Grand Master crown at the apex of the Fire Caldera.', status: 'locked', col: 35, row: 17, asset: { type: 'procedural', shape: 'office_tower', height: 0.85, primaryColor: 0xef4444 }, rewards: [{ type: 'coin', value: 5000, label: '5000 WYLD Coins', icon: '🪙' }] }
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
