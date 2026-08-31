export interface RegionalMandiPrice {
  state: string;
  district: string;
  mandi: string;
  price: number; // in ₹/quintal
  arrivalsQuintals: number;
}

export interface PricePoint {
  date: string;
  displayDate: string;
  price: number;
  minPrice: number;
  maxPrice: number;
  volumeQuintals: number;
}

export type AiMarketTag = 
  | '🔺 Rising Demand'
  | '⚠️ Glut Risk'
  | '💡 Recommended for Planting'
  | '🔥 High Liquidity'
  | '⚖️ Rangebound / Stable';

export interface LiveCommodityData {
  id: string;
  name: string;
  category: string;
  icon: string;
  variety: string;
  currentPrice: number; // ₹ per quintal
  unit: string; // '₹/quintal'
  previousDayPrice: number;
  changePercent: number;
  changeType: 'up' | 'down' | 'neutral';
  dayHigh: number;
  dayLow: number;
  msp?: number; // Minimum Support Price if applicable
  buyVolumeQuintals: number;
  sellVolumeQuintals: number;
  aiBadge: AiMarketTag;
  aiBadgeColor: 'emerald' | 'rose' | 'amber' | 'blue' | 'purple';
  aiInsight: string;
  growthDrivers: string[];
  regionalPrices: RegionalMandiPrice[];
  history7d: PricePoint[];
  history30d: PricePoint[];
}

export const LIVE_COMMODITIES: LiveCommodityData[] = [
  {
    id: 'onion',
    name: 'Onion (Nashik Red)',
    category: 'Vegetables',
    icon: '🧅',
    variety: 'Garwa / Red Medium',
    currentPrice: 3180,
    unit: '₹/quintal',
    previousDayPrice: 2685,
    changePercent: 18.44,
    changeType: 'up',
    dayHigh: 3350,
    dayLow: 2920,
    msp: undefined,
    buyVolumeQuintals: 4800,
    sellVolumeQuintals: 2100,
    aiBadge: '🔺 Rising Demand',
    aiBadgeColor: 'rose',
    aiInsight: 'Onion prices expected to rise 12-15% over the next 10 days due to delayed storage unloading in Lasalgaon and strong metro wholesale demand.',
    growthDrivers: [
      'Delayed monsoon in key peninsular pockets holding back early kharif transplanting',
      'High institutional procurement from Delhi-NCR and Bengaluru retail chains',
      'Export parity attractive to UAE & Bangladesh cross-border traders'
    ],
    regionalPrices: [
      { state: 'Maharashtra', district: 'Nashik', mandi: 'Lasalgaon APMC', price: 3250, arrivalsQuintals: 1250 },
      { state: 'Maharashtra', district: 'Nashik', mandi: 'Pimpalgaon APMC', price: 3180, arrivalsQuintals: 940 },
      { state: 'Gujarat', district: 'Bhavnagar', mandi: 'Mahuva Mandi', price: 2950, arrivalsQuintals: 820 },
      { state: 'Karnataka', district: 'Hubli', mandi: 'Hubli APMC', price: 3340, arrivalsQuintals: 650 },
      { state: 'Madhya Pradesh', district: 'Indore', mandi: 'Choithram Mandi', price: 3050, arrivalsQuintals: 1100 },
    ],
    history7d: [
      { date: '2026-08-25', displayDate: 'Aug 25', price: 2650, minPrice: 2480, maxPrice: 2720, volumeQuintals: 1800 },
      { date: '2026-08-26', displayDate: 'Aug 26', price: 2720, minPrice: 2550, maxPrice: 2800, volumeQuintals: 2100 },
      { date: '2026-08-27', displayDate: 'Aug 27', price: 2810, minPrice: 2680, maxPrice: 2900, volumeQuintals: 2450 },
      { date: '2026-08-28', displayDate: 'Aug 28', price: 2950, minPrice: 2820, maxPrice: 3080, volumeQuintals: 3100 },
      { date: '2026-08-29', displayDate: 'Aug 29', price: 3040, minPrice: 2910, maxPrice: 3180, volumeQuintals: 3900 },
      { date: '2026-08-30', displayDate: 'Aug 30', price: 2685, minPrice: 2580, maxPrice: 2790, volumeQuintals: 4200 },
      { date: '2026-08-31', displayDate: 'Today', price: 3180, minPrice: 2920, maxPrice: 3350, volumeQuintals: 4800 },
    ],
    history30d: [
      { date: '2026-08-02', displayDate: 'Aug 02', price: 2100, minPrice: 1950, maxPrice: 2200, volumeQuintals: 1500 },
      { date: '2026-08-07', displayDate: 'Aug 07', price: 2250, minPrice: 2100, maxPrice: 2380, volumeQuintals: 1800 },
      { date: '2026-08-12', displayDate: 'Aug 12', price: 2400, minPrice: 2280, maxPrice: 2520, volumeQuintals: 2200 },
      { date: '2026-08-17', displayDate: 'Aug 17', price: 2320, minPrice: 2200, maxPrice: 2450, volumeQuintals: 2000 },
      { date: '2026-08-22', displayDate: 'Aug 22', price: 2580, minPrice: 2400, maxPrice: 2680, volumeQuintals: 2600 },
      { date: '2026-08-27', displayDate: 'Aug 27', price: 2810, minPrice: 2680, maxPrice: 2900, volumeQuintals: 3200 },
      { date: '2026-08-31', displayDate: 'Today', price: 3180, minPrice: 2920, maxPrice: 3350, volumeQuintals: 4800 },
    ]
  },
  {
    id: 'tomato',
    name: 'Tomato (Hybrid / Fresh)',
    category: 'Vegetables',
    icon: '🍅',
    variety: 'Abhinav / Sahu Special',
    currentPrice: 2450,
    unit: '₹/quintal',
    previousDayPrice: 2130,
    changePercent: 15.02,
    changeType: 'up',
    dayHigh: 2600,
    dayLow: 2280,
    msp: undefined,
    buyVolumeQuintals: 3600,
    sellVolumeQuintals: 1950,
    aiBadge: '🔺 Rising Demand',
    aiBadgeColor: 'rose',
    aiInsight: 'Tomato spot rates jumping sharply due to heavy rainfall disruptions across Kolar and Narayangaon transport corridors.',
    growthDrivers: [
      'Transport bottleneck in Western Ghats slowing down dispatch to Northern terminal mandis',
      'Food processing and ketchup puree plants running 3-shift sourcing schedules',
      'Low crate arrivals in Azadpur Mandi leading to bidding premiums'
    ],
    regionalPrices: [
      { state: 'Maharashtra', district: 'Pune', mandi: 'Narayangaon Mandi', price: 2550, arrivalsQuintals: 850 },
      { state: 'Karnataka', district: 'Kolar', mandi: 'Kolar APMC', price: 2400, arrivalsQuintals: 1100 },
      { state: 'Andhra Pradesh', district: 'Chittoor', mandi: 'Madanapalle APMC', price: 2380, arrivalsQuintals: 950 },
      { state: 'Delhi', district: 'North Delhi', mandi: 'Azadpur Wholesale', price: 2750, arrivalsQuintals: 1400 },
    ],
    history7d: [
      { date: '2026-08-25', displayDate: 'Aug 25', price: 1850, minPrice: 1700, maxPrice: 1950, volumeQuintals: 2100 },
      { date: '2026-08-26', displayDate: 'Aug 26', price: 1920, minPrice: 1800, maxPrice: 2050, volumeQuintals: 2300 },
      { date: '2026-08-27', displayDate: 'Aug 27', price: 2040, minPrice: 1910, maxPrice: 2180, volumeQuintals: 2600 },
      { date: '2026-08-28', displayDate: 'Aug 28', price: 2110, minPrice: 1980, maxPrice: 2240, volumeQuintals: 2900 },
      { date: '2026-08-29', displayDate: 'Aug 29', price: 2200, minPrice: 2050, maxPrice: 2320, volumeQuintals: 3100 },
      { date: '2026-08-30', displayDate: 'Aug 30', price: 2130, minPrice: 2000, maxPrice: 2260, volumeQuintals: 3200 },
      { date: '2026-08-31', displayDate: 'Today', price: 2450, minPrice: 2280, maxPrice: 2600, volumeQuintals: 3600 },
    ],
    history30d: [
      { date: '2026-08-02', displayDate: 'Aug 02', price: 1450, minPrice: 1300, maxPrice: 1550, volumeQuintals: 1900 },
      { date: '2026-08-07', displayDate: 'Aug 07', price: 1600, minPrice: 1480, maxPrice: 1720, volumeQuintals: 2200 },
      { date: '2026-08-12', displayDate: 'Aug 12', price: 1520, minPrice: 1400, maxPrice: 1650, volumeQuintals: 2100 },
      { date: '2026-08-17', displayDate: 'Aug 17', price: 1750, minPrice: 1600, maxPrice: 1880, volumeQuintals: 2400 },
      { date: '2026-08-22', displayDate: 'Aug 22', price: 1820, minPrice: 1690, maxPrice: 1940, volumeQuintals: 2600 },
      { date: '2026-08-27', displayDate: 'Aug 27', price: 2040, minPrice: 1910, maxPrice: 2180, volumeQuintals: 3000 },
      { date: '2026-08-31', displayDate: 'Today', price: 2450, minPrice: 2280, maxPrice: 2600, volumeQuintals: 3600 },
    ]
  },
  {
    id: 'wheat',
    name: 'Wheat (Mill Quality / Sharbati)',
    category: 'Grains',
    icon: '🌾',
    variety: 'Sharbati A-Grade & Lokwan',
    currentPrice: 2820,
    unit: '₹/quintal',
    previousDayPrice: 2780,
    changePercent: 1.44,
    changeType: 'up',
    dayHigh: 2860,
    dayLow: 2790,
    msp: 2275,
    buyVolumeQuintals: 6200,
    sellVolumeQuintals: 5400,
    aiBadge: '💡 Recommended for Planting',
    aiBadgeColor: 'emerald',
    aiInsight: 'Wheat remains exceptionally steady with strong institutional flour mill buying well above government MSP of ₹2,275/qtl.',
    growthDrivers: [
      'Government open market tender (OMSS) supply calibrated to maintain floor pricing',
      'High demand from corporate biscuit and packaged atta manufacturers (ITC, Britannia)',
      'Low warehouse carryover stocks assuring strong opening for next rabi season'
    ],
    regionalPrices: [
      { state: 'Madhya Pradesh', district: 'Sehore', mandi: 'Sehore Mandi', price: 2950, arrivalsQuintals: 2200 },
      { state: 'Madhya Pradesh', district: 'Indore', mandi: 'Indore APMC', price: 2840, arrivalsQuintals: 1900 },
      { state: 'Punjab', district: 'Ludhiana', mandi: 'Khanna Grain Market', price: 2760, arrivalsQuintals: 2800 },
      { state: 'Haryana', district: 'Karnal', mandi: 'Karnal Mandi', price: 2790, arrivalsQuintals: 1800 },
      { state: 'Uttar Pradesh', district: 'Bareilly', mandi: 'Bareilly APMC', price: 2720, arrivalsQuintals: 1450 },
    ],
    history7d: [
      { date: '2026-08-25', displayDate: 'Aug 25', price: 2740, minPrice: 2690, maxPrice: 2780, volumeQuintals: 5100 },
      { date: '2026-08-26', displayDate: 'Aug 26', price: 2750, minPrice: 2710, maxPrice: 2790, volumeQuintals: 5300 },
      { date: '2026-08-27', displayDate: 'Aug 27', price: 2760, minPrice: 2720, maxPrice: 2800, volumeQuintals: 5500 },
      { date: '2026-08-28', displayDate: 'Aug 28', price: 2775, minPrice: 2730, maxPrice: 2820, volumeQuintals: 5800 },
      { date: '2026-08-29', displayDate: 'Aug 29', price: 2780, minPrice: 2740, maxPrice: 2830, volumeQuintals: 5900 },
      { date: '2026-08-30', displayDate: 'Aug 30', price: 2780, minPrice: 2745, maxPrice: 2825, volumeQuintals: 6000 },
      { date: '2026-08-31', displayDate: 'Today', price: 2820, minPrice: 2790, maxPrice: 2860, volumeQuintals: 6200 },
    ],
    history30d: [
      { date: '2026-08-02', displayDate: 'Aug 02', price: 2650, minPrice: 2600, maxPrice: 2700, volumeQuintals: 4600 },
      { date: '2026-08-07', displayDate: 'Aug 07', price: 2680, minPrice: 2620, maxPrice: 2720, volumeQuintals: 4800 },
      { date: '2026-08-12', displayDate: 'Aug 12', price: 2710, minPrice: 2650, maxPrice: 2750, volumeQuintals: 5000 },
      { date: '2026-08-17', displayDate: 'Aug 17', price: 2700, minPrice: 2640, maxPrice: 2740, volumeQuintals: 4900 },
      { date: '2026-08-22', displayDate: 'Aug 22', price: 2730, minPrice: 2680, maxPrice: 2770, volumeQuintals: 5200 },
      { date: '2026-08-27', displayDate: 'Aug 27', price: 2760, minPrice: 2720, maxPrice: 2800, volumeQuintals: 5500 },
      { date: '2026-08-31', displayDate: 'Today', price: 2820, minPrice: 2790, maxPrice: 2860, volumeQuintals: 6200 },
    ]
  },
  {
    id: 'soybean',
    name: 'Soybean (Yellow Non-GMO)',
    category: 'Oilseeds',
    icon: '🌱',
    variety: 'JS-335 & JS-9560',
    currentPrice: 4620,
    unit: '₹/quintal',
    previousDayPrice: 4810,
    changePercent: -3.95,
    changeType: 'down',
    dayHigh: 4750,
    dayLow: 4580,
    msp: 4600,
    buyVolumeQuintals: 3100,
    sellVolumeQuintals: 5200,
    aiBadge: '⚠️ Glut Risk',
    aiBadgeColor: 'amber',
    aiInsight: 'Soybean facing temporary spot glut due to accelerated farmer selling in MP & Maharashtra ahead of upcoming harvesting season.',
    growthDrivers: [
      'Heavy import volumes of cheaper palm and sunflower crude edible oil weighing on crusher margins',
      'De-oiled cake (DOC) export bids subdued in European markets',
      'Solvent extraction plants maintaining minimal inventory safety buffers'
    ],
    regionalPrices: [
      { state: 'Madhya Pradesh', district: 'Ujjain', mandi: 'Ujjain Krishi Mandi', price: 4620, arrivalsQuintals: 1800 },
      { state: 'Madhya Pradesh', district: 'Dewas', mandi: 'Dewas Mandi', price: 4590, arrivalsQuintals: 1400 },
      { state: 'Maharashtra', district: 'Latur', mandi: 'Latur APMC', price: 4680, arrivalsQuintals: 1600 },
      { state: 'Maharashtra', district: 'Akola', mandi: 'Akola Cotton & Soy Market', price: 4640, arrivalsQuintals: 950 },
      { state: 'Rajasthan', district: 'Kota', mandi: 'Bhamashah Mandi', price: 4570, arrivalsQuintals: 1100 },
    ],
    history7d: [
      { date: '2026-08-25', displayDate: 'Aug 25', price: 4920, minPrice: 4850, maxPrice: 4980, volumeQuintals: 4100 },
      { date: '2026-08-26', displayDate: 'Aug 26', price: 4890, minPrice: 4820, maxPrice: 4940, volumeQuintals: 4300 },
      { date: '2026-08-27', displayDate: 'Aug 27', price: 4850, minPrice: 4790, maxPrice: 4910, volumeQuintals: 4600 },
      { date: '2026-08-28', displayDate: 'Aug 28', price: 4820, minPrice: 4750, maxPrice: 4880, volumeQuintals: 4900 },
      { date: '2026-08-29', displayDate: 'Aug 29', price: 4800, minPrice: 4720, maxPrice: 4860, volumeQuintals: 5000 },
      { date: '2026-08-30', displayDate: 'Aug 30', price: 4810, minPrice: 4740, maxPrice: 4870, volumeQuintals: 5100 },
      { date: '2026-08-31', displayDate: 'Today', price: 4620, minPrice: 4580, maxPrice: 4750, volumeQuintals: 5200 },
    ],
    history30d: [
      { date: '2026-08-02', displayDate: 'Aug 02', price: 5150, minPrice: 5080, maxPrice: 5220, volumeQuintals: 3600 },
      { date: '2026-08-07', displayDate: 'Aug 07', price: 5100, minPrice: 5020, maxPrice: 5180, volumeQuintals: 3800 },
      { date: '2026-08-12', displayDate: 'Aug 12', price: 5020, minPrice: 4950, maxPrice: 5100, volumeQuintals: 4000 },
      { date: '2026-08-17', displayDate: 'Aug 17', price: 4980, minPrice: 4900, maxPrice: 5050, volumeQuintals: 4200 },
      { date: '2026-08-22', displayDate: 'Aug 22', price: 4940, minPrice: 4860, maxPrice: 5010, volumeQuintals: 4400 },
      { date: '2026-08-27', displayDate: 'Aug 27', price: 4850, minPrice: 4790, maxPrice: 4910, volumeQuintals: 4800 },
      { date: '2026-08-31', displayDate: 'Today', price: 4620, minPrice: 4580, maxPrice: 4750, volumeQuintals: 5200 },
    ]
  },
  {
    id: 'cotton',
    name: 'Cotton (Shankar-6 / Medium Staple)',
    category: 'Cash Crops',
    icon: '🌿',
    variety: 'Shankar-6 & Bunny BT',
    currentPrice: 7480,
    unit: '₹/quintal',
    previousDayPrice: 7420,
    changePercent: 0.81,
    changeType: 'neutral',
    dayHigh: 7550,
    dayLow: 7400,
    msp: 7020,
    buyVolumeQuintals: 2900,
    sellVolumeQuintals: 2750,
    aiBadge: '💡 Recommended for Planting',
    aiBadgeColor: 'emerald',
    aiInsight: 'Cotton prices consolidating at healthy profit margins. Domestic textile spinners actively locking forward raw contracts.',
    growthDrivers: [
      'Ginning mills operating near full seasonal capacity with consistent yarn off-take',
      'Favorable global ICE cotton futures supporting spot procurement sentiment',
      'Stable export inquiries from Vietnam and Bangladesh spinning clusters'
    ],
    regionalPrices: [
      { state: 'Gujarat', district: 'Rajkot', mandi: 'Rajkot Cotton Exchange', price: 7520, arrivalsQuintals: 1650 },
      { state: 'Gujarat', district: 'Mehsana', mandi: 'Kadi Ginning Market', price: 7480, arrivalsQuintals: 1300 },
      { state: 'Telangana', district: 'Warangal', mandi: 'Warangal Enugula Mandi', price: 7410, arrivalsQuintals: 950 },
      { state: 'Punjab', district: 'Bathinda', mandi: 'Bathinda Cotton Yard', price: 7460, arrivalsQuintals: 720 },
      { state: 'Maharashtra', district: 'Yavatmal', mandi: 'Yavatmal APMC', price: 7390, arrivalsQuintals: 880 },
    ],
    history7d: [
      { date: '2026-08-25', displayDate: 'Aug 25', price: 7380, minPrice: 7300, maxPrice: 7450, volumeQuintals: 2600 },
      { date: '2026-08-26', displayDate: 'Aug 26', price: 7390, minPrice: 7320, maxPrice: 7460, volumeQuintals: 2650 },
      { date: '2026-08-27', displayDate: 'Aug 27', price: 7410, minPrice: 7340, maxPrice: 7480, volumeQuintals: 2700 },
      { date: '2026-08-28', displayDate: 'Aug 28', price: 7400, minPrice: 7330, maxPrice: 7470, volumeQuintals: 2720 },
      { date: '2026-08-29', displayDate: 'Aug 29', price: 7415, minPrice: 7350, maxPrice: 7490, volumeQuintals: 2780 },
      { date: '2026-08-30', displayDate: 'Aug 30', price: 7420, minPrice: 7360, maxPrice: 7500, volumeQuintals: 2820 },
      { date: '2026-08-31', displayDate: 'Today', price: 7480, minPrice: 7400, maxPrice: 7550, volumeQuintals: 2900 },
    ],
    history30d: [
      { date: '2026-08-02', displayDate: 'Aug 02', price: 7250, minPrice: 7180, maxPrice: 7320, volumeQuintals: 2300 },
      { date: '2026-08-07', displayDate: 'Aug 07', price: 7290, minPrice: 7210, maxPrice: 7360, volumeQuintals: 2400 },
      { date: '2026-08-12', displayDate: 'Aug 12', price: 7340, minPrice: 7260, maxPrice: 7410, volumeQuintals: 2500 },
      { date: '2026-08-17', displayDate: 'Aug 17', price: 7320, minPrice: 7240, maxPrice: 7390, volumeQuintals: 2450 },
      { date: '2026-08-22', displayDate: 'Aug 22', price: 7360, minPrice: 7280, maxPrice: 7430, volumeQuintals: 2550 },
      { date: '2026-08-27', displayDate: 'Aug 27', price: 7410, minPrice: 7340, maxPrice: 7480, volumeQuintals: 2700 },
      { date: '2026-08-31', displayDate: 'Today', price: 7480, minPrice: 7400, maxPrice: 7550, volumeQuintals: 2900 },
    ]
  },
  {
    id: 'potato',
    name: 'Potato (Jyoti / Chipsona)',
    category: 'Vegetables',
    icon: '🥔',
    variety: 'Kufri Chipsona & Jyoti',
    currentPrice: 1680,
    unit: '₹/quintal',
    previousDayPrice: 1790,
    changePercent: -6.15,
    changeType: 'down',
    dayHigh: 1740,
    dayLow: 1620,
    msp: undefined,
    buyVolumeQuintals: 2100,
    sellVolumeQuintals: 4400,
    aiBadge: '⚠️ Glut Risk',
    aiBadgeColor: 'amber',
    aiInsight: 'Large-scale unloading from commercial cold storages in Agra and Hooghly clusters is causing transient mandi oversupply.',
    growthDrivers: [
      'Cold storage operators releasing summer-stored tubers to clear room for early kharif harvest',
      'Processing grade Chipsona contracts remaining protected, but table variety prices softening',
      'Recommend staggered release by farmers to capture festive rebound next month'
    ],
    regionalPrices: [
      { state: 'Uttar Pradesh', district: 'Agra', mandi: 'Agra Mandi Samiti', price: 1620, arrivalsQuintals: 2400 },
      { state: 'Uttar Pradesh', district: 'Farrukhabad', mandi: 'Farrukhabad APMC', price: 1590, arrivalsQuintals: 1950 },
      { state: 'West Bengal', district: 'Hooghly', mandi: 'Tarkeshwar Mandi', price: 1710, arrivalsQuintals: 1800 },
      { state: 'Gujarat', district: 'Banaskantha', mandi: 'Deesa Potato Yard', price: 1750, arrivalsQuintals: 1100 },
    ],
    history7d: [
      { date: '2026-08-25', displayDate: 'Aug 25', price: 1880, minPrice: 1800, maxPrice: 1940, volumeQuintals: 3200 },
      { date: '2026-08-26', displayDate: 'Aug 26', price: 1850, minPrice: 1780, maxPrice: 1910, volumeQuintals: 3400 },
      { date: '2026-08-27', displayDate: 'Aug 27', price: 1820, minPrice: 1750, maxPrice: 1880, volumeQuintals: 3700 },
      { date: '2026-08-28', displayDate: 'Aug 28', price: 1800, minPrice: 1730, maxPrice: 1860, volumeQuintals: 3900 },
      { date: '2026-08-29', displayDate: 'Aug 29', price: 1780, minPrice: 1710, maxPrice: 1840, volumeQuintals: 4100 },
      { date: '2026-08-30', displayDate: 'Aug 30', price: 1790, minPrice: 1720, maxPrice: 1850, volumeQuintals: 4200 },
      { date: '2026-08-31', displayDate: 'Today', price: 1680, minPrice: 1620, maxPrice: 1740, volumeQuintals: 4400 },
    ],
    history30d: [
      { date: '2026-08-02', displayDate: 'Aug 02', price: 2050, minPrice: 1980, maxPrice: 2120, volumeQuintals: 2800 },
      { date: '2026-08-07', displayDate: 'Aug 07', price: 1980, minPrice: 1910, maxPrice: 2050, volumeQuintals: 3000 },
      { date: '2026-08-12', displayDate: 'Aug 12', price: 1940, minPrice: 1870, maxPrice: 2010, volumeQuintals: 3100 },
      { date: '2026-08-17', displayDate: 'Aug 17', price: 1900, minPrice: 1830, maxPrice: 1970, volumeQuintals: 3300 },
      { date: '2026-08-22', displayDate: 'Aug 22', price: 1860, minPrice: 1790, maxPrice: 1930, volumeQuintals: 3500 },
      { date: '2026-08-27', displayDate: 'Aug 27', price: 1820, minPrice: 1750, maxPrice: 1880, volumeQuintals: 3800 },
      { date: '2026-08-31', displayDate: 'Today', price: 1680, minPrice: 1620, maxPrice: 1740, volumeQuintals: 4400 },
    ]
  },
  {
    id: 'basmati',
    name: 'Basmati Rice (Pusa 1121)',
    category: 'Grains',
    icon: '🍚',
    variety: 'Pusa 1121 Steam & Traditional',
    currentPrice: 4150,
    unit: '₹/quintal',
    previousDayPrice: 3950,
    changePercent: 5.06,
    changeType: 'up',
    dayHigh: 4220,
    dayLow: 4020,
    msp: 2320,
    buyVolumeQuintals: 4200,
    sellVolumeQuintals: 2600,
    aiBadge: '🔺 Rising Demand',
    aiBadgeColor: 'rose',
    aiInsight: 'Export shipments to Saudi Arabia and Iran resuming briskly, pushing paddy prices higher in North Indian mill belts.',
    growthDrivers: [
      'MEA export clearances accelerated for certified pesticide-residue tested consignments',
      'Private exporters competing against cooperative millers for uniform-length paddy',
      'Farmer direct farmgate bids trading at a 15% premium over open mandi floor'
    ],
    regionalPrices: [
      { state: 'Haryana', district: 'Karnal', mandi: 'Taraori Basmati Yard', price: 4250, arrivalsQuintals: 1500 },
      { state: 'Punjab', district: 'Amritsar', mandi: 'Amritsar Grain Mandi', price: 4180, arrivalsQuintals: 1350 },
      { state: 'Uttar Pradesh', district: 'Saharanpur', mandi: 'Saharanpur APMC', price: 4050, arrivalsQuintals: 980 },
      { state: 'Madhya Pradesh', district: 'Raisen', mandi: 'Raisen Mandi', price: 4100, arrivalsQuintals: 820 },
    ],
    history7d: [
      { date: '2026-08-25', displayDate: 'Aug 25', price: 3820, minPrice: 3750, maxPrice: 3890, volumeQuintals: 3400 },
      { date: '2026-08-26', displayDate: 'Aug 26', price: 3850, minPrice: 3780, maxPrice: 3920, volumeQuintals: 3500 },
      { date: '2026-08-27', displayDate: 'Aug 27', price: 3890, minPrice: 3820, maxPrice: 3960, volumeQuintals: 3650 },
      { date: '2026-08-28', displayDate: 'Aug 28', price: 3910, minPrice: 3840, maxPrice: 3980, volumeQuintals: 3800 },
      { date: '2026-08-29', displayDate: 'Aug 29', price: 3940, minPrice: 3870, maxPrice: 4010, volumeQuintals: 3950 },
      { date: '2026-08-30', displayDate: 'Aug 30', price: 3950, minPrice: 3880, maxPrice: 4020, volumeQuintals: 4000 },
      { date: '2026-08-31', displayDate: 'Today', price: 4150, minPrice: 4020, maxPrice: 4220, volumeQuintals: 4200 },
    ],
    history30d: [
      { date: '2026-08-02', displayDate: 'Aug 02', price: 3650, minPrice: 3580, maxPrice: 3720, volumeQuintals: 2900 },
      { date: '2026-08-07', displayDate: 'Aug 07', price: 3700, minPrice: 3620, maxPrice: 3780, volumeQuintals: 3100 },
      { date: '2026-08-12', displayDate: 'Aug 12', price: 3750, minPrice: 3680, maxPrice: 3820, volumeQuintals: 3200 },
      { date: '2026-08-17', displayDate: 'Aug 17', price: 3780, minPrice: 3700, maxPrice: 3850, volumeQuintals: 3300 },
      { date: '2026-08-22', displayDate: 'Aug 22', price: 3810, minPrice: 3740, maxPrice: 3880, volumeQuintals: 3400 },
      { date: '2026-08-27', displayDate: 'Aug 27', price: 3890, minPrice: 3820, maxPrice: 3960, volumeQuintals: 3700 },
      { date: '2026-08-31', displayDate: 'Today', price: 4150, minPrice: 4020, maxPrice: 4220, volumeQuintals: 4200 },
    ]
  }
];

export const AI_MARKET_INSIGHT_HIGHLIGHTS = [
  {
    id: 'insight-1',
    crop: 'Onion',
    headline: 'AI Insight: Onion prices expected to rise 12-15% next week due to low regional supply & delayed peninsular harvest.',
    tag: '🔺 Critical Price Surge',
    action: 'Hold stock for next 7 days or execute staggered contracts.',
    urgency: 'high'
  },
  {
    id: 'insight-2',
    crop: 'Wheat',
    headline: 'AI Insight: Wheat procurement volumes hitting 3-year highs with millers bidding 24% over MSP. Ideal for steady contract lock-in.',
    tag: '💡 High Liquidity Window',
    action: 'Recommended for forward enterprise buy orders.',
    urgency: 'medium'
  },
  {
    id: 'insight-3',
    crop: 'Soybean',
    headline: 'AI Insight: Temporary soybean glut warning across MP mandis due to imported edible oil flows. Expect consolidation near ₹4,600/qtl.',
    tag: '⚠️ Supply Overhang Alert',
    action: 'Buyers can leverage spot discounts; farmers advise delayed selling.',
    urgency: 'high'
  },
  {
    id: 'insight-4',
    crop: 'Tomato',
    headline: 'AI Insight: Tomato arrivals down 28% in North Indian hubs due to monsoon transit bottlenecks, creating short-term spot spikes.',
    tag: '🔥 Volatility Spike',
    action: 'FPOs with cold transit can command premium realizations.',
    urgency: 'medium'
  }
];
