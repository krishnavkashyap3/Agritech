import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';
import { 
  LIVE_COMMODITIES, 
  AI_MARKET_INSIGHT_HIGHLIGHTS, 
  LiveCommodityData, 
  PricePoint 
} from '../data/liveMarketData';
import { UserProfile } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  Sparkles, 
  Filter, 
  MapPin, 
  ArrowUpRight, 
  ArrowDownRight, 
  Scale, 
  Calendar, 
  Layers, 
  BarChart3, 
  ShoppingBag, 
  ChevronRight, 
  ShieldAlert, 
  Sprout, 
  CheckCircle2, 
  RefreshCw,
  SlidersHorizontal,
  Info
} from 'lucide-react';

interface LiveMarketSectionProps {
  currentUser: UserProfile;
  initialCommodityId?: string;
  onNavigateToMarketplace?: (cropName?: string) => void;
  onOpenCreateListing?: () => void;
  onOpenCreateRfq?: () => void;
}

type MarketTab = 'commodity' | 'overview';
type Timeframe = '7d' | '30d';
type OverviewSort = 'default' | 'demand' | 'price_change_desc' | 'price_change_asc' | 'price_desc';
type OverviewFilter = 'all' | 'rising' | 'glut' | 'planting';

export const LiveMarketSection: React.FC<LiveMarketSectionProps> = ({
  currentUser,
  initialCommodityId = 'onion',
  onNavigateToMarketplace,
  onOpenCreateListing,
  onOpenCreateRfq,
}) => {
  // Tab state
  const [activeTab, setActiveTab] = useState<MarketTab>('commodity');

  // Commodity View state
  const [selectedCropId, setSelectedCropId] = useState<string>(initialCommodityId);
  const [cropSearchQuery, setCropSearchQuery] = useState<string>('');
  const [timeframe, setTimeframe] = useState<Timeframe>('7d');
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('All');

  // Overview View state
  const [overviewSort, setOverviewSort] = useState<OverviewSort>('default');
  const [overviewFilter, setOverviewFilter] = useState<OverviewFilter>('all');
  const [overviewSearch, setOverviewSearch] = useState<string>('');
  const [activeInsightIndex, setActiveInsightIndex] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Selected commodity object
  const currentCommodity: LiveCommodityData = useMemo(() => {
    return LIVE_COMMODITIES.find((c) => c.id === selectedCropId) || LIVE_COMMODITIES[0];
  }, [selectedCropId]);

  // Unique states for selected commodity
  const availableStates = useMemo(() => {
    const states = currentCommodity.regionalPrices.map((r) => r.state);
    return ['All', ...Array.from(new Set(states))];
  }, [currentCommodity]);

  // Filtered regional prices based on state filter
  const filteredRegionalPrices = useMemo(() => {
    if (selectedStateFilter === 'All') return currentCommodity.regionalPrices;
    return currentCommodity.regionalPrices.filter((r) => r.state === selectedStateFilter);
  }, [currentCommodity, selectedStateFilter]);

  // Active chart data
  const chartData: PricePoint[] = useMemo(() => {
    return timeframe === '7d' ? currentCommodity.history7d : currentCommodity.history30d;
  }, [currentCommodity, timeframe]);

  // Buy vs Sell calculations
  const totalVolume = currentCommodity.buyVolumeQuintals + currentCommodity.sellVolumeQuintals;
  const buyPercentage = totalVolume > 0 
    ? Math.round((currentCommodity.buyVolumeQuintals / totalVolume) * 100) 
    : 50;
  const sellPercentage = 100 - buyPercentage;

  // Filtered commodities for search dropdown
  const searchMatchingCrops = useMemo(() => {
    if (!cropSearchQuery.trim()) return LIVE_COMMODITIES;
    return LIVE_COMMODITIES.filter((c) => 
      c.name.toLowerCase().includes(cropSearchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(cropSearchQuery.toLowerCase()) ||
      c.variety.toLowerCase().includes(cropSearchQuery.toLowerCase())
    );
  }, [cropSearchQuery]);

  // Filtered & Sorted Overview Commodities
  const overviewCommodities = useMemo(() => {
    let list = [...LIVE_COMMODITIES];

    // Search filter
    if (overviewSearch.trim()) {
      const q = overviewSearch.toLowerCase();
      list = list.filter((c) => 
        c.name.toLowerCase().includes(q) || 
        c.category.toLowerCase().includes(q) ||
        c.variety.toLowerCase().includes(q)
      );
    }

    // Category / AI tag filter
    if (overviewFilter === 'rising') {
      list = list.filter((c) => c.aiBadge.includes('Rising Demand'));
    } else if (overviewFilter === 'glut') {
      list = list.filter((c) => c.aiBadge.includes('Glut Risk'));
    } else if (overviewFilter === 'planting') {
      list = list.filter((c) => c.aiBadge.includes('Recommended for Planting'));
    }

    // Sorting
    if (overviewSort === 'demand') {
      list.sort((a, b) => b.buyVolumeQuintals - a.buyVolumeQuintals);
    } else if (overviewSort === 'price_change_desc') {
      list.sort((a, b) => b.changePercent - a.changePercent);
    } else if (overviewSort === 'price_change_asc') {
      list.sort((a, b) => a.changePercent - b.changePercent);
    } else if (overviewSort === 'price_desc') {
      list.sort((a, b) => b.currentPrice - a.currentPrice);
    }

    return list;
  }, [overviewSearch, overviewFilter, overviewSort]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleSelectFromOverview = (id: string) => {
    setSelectedCropId(id);
    setSelectedStateFilter('All');
    setActiveTab('commodity');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Helper for badge visual classes
  const getBadgeStyle = (badge: string) => {
    if (badge.includes('Rising Demand')) {
      return 'bg-rose-50 text-rose-800 border-rose-200 font-bold';
    }
    if (badge.includes('Glut Risk')) {
      return 'bg-amber-50 text-amber-900 border-amber-200 font-bold';
    }
    if (badge.includes('Recommended for Planting')) {
      return 'bg-emerald-50 text-emerald-900 border-emerald-200 font-bold';
    }
    return 'bg-[#EBF3ED] text-[#233B2B] border-[#C6DFC9] font-bold';
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header & Navigation Banner */}
      <div className="bg-[#233B2B] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg border border-[#3A5C44]">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-900/80 text-emerald-200 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Mandi Feed
              </span>
              <span className="text-xs text-[#C2B7A3] font-mono">
                Synced with e-NAM & APMC Hubs • Updated Just Now
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#FAF9F6] tracking-tight">
              Live Agricultural Market & Price Discovery
            </h1>
            <p className="text-xs sm:text-sm text-[#D5CCBD] leading-relaxed">
              Real-time matched clearing prices, live buy/sell volume depth, and AI-predicted supply trends for transparent farmgate trade across India.
            </p>
          </div>

          {/* Refresh and Quick Action */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              type="button"
              id="refresh-live-market-btn"
              onClick={handleRefresh}
              className={`p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition flex items-center gap-2 text-xs font-semibold ${
                isRefreshing ? 'opacity-75' : ''
              }`}
              title="Refresh Live APMC Tickers"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-300' : 'text-amber-200'}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
            
            {currentUser.role === 'farmer' ? (
              <button
                type="button"
                id="live-market-sell-crop-btn"
                onClick={onOpenCreateListing}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#1C1C1C] font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <Sprout className="w-4 h-4 text-[#233B2B]" />
                <span>List Crop for Sale</span>
              </button>
            ) : (
              <button
                type="button"
                id="live-market-buy-crop-btn"
                onClick={onOpenCreateRfq}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#1C1C1C] font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4 text-[#233B2B]" />
                <span>Post Buy Order (RFQ)</span>
              </button>
            )}
          </div>
        </div>

        {/* View Switcher Tabs at top of dashboard */}
        <div className="mt-8 pt-4 border-t border-white/15 flex flex-wrap items-center gap-3">
          <div className="bg-[#182C1F] p-1 rounded-2xl border border-white/15 inline-flex">
            <button
              type="button"
              id="tab-commodity-view"
              onClick={() => setActiveTab('commodity')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'commodity'
                  ? 'bg-amber-300 text-[#1C1C1C] shadow-md'
                  : 'text-[#C5BEB1] hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>1. Commodity View (Per-Item)</span>
            </button>

            <button
              type="button"
              id="tab-overview-view"
              onClick={() => setActiveTab('overview')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-amber-300 text-[#1C1C1C] shadow-md'
                  : 'text-[#C5BEB1] hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-800" />
              <span>2. Market Overview (AI-Powered)</span>
            </button>
          </div>

          <div className="text-xs text-[#C5BEB1] ml-auto hidden lg:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Active Commodity: <strong>{currentCommodity.name}</strong></span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: COMMODITY VIEW (Per-Item View) */}
      {/* ========================================================================= */}
      {activeTab === 'commodity' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Filter Bar: Crop Selector & Region Filter */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E5DF] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Crop Selector Search & Dropdown */}
            <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8A847A] absolute left-3.5 top-3" />
                <input
                  type="text"
                  id="commodity-search-input"
                  value={cropSearchQuery}
                  onChange={(e) => setCropSearchQuery(e.target.value)}
                  placeholder="Search crop (e.g. Tomato, Wheat, Onion)..."
                  className="w-full bg-[#FAF9F6] border border-[#D5CCBD] rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-[#1C1C1C] focus:ring-1 focus:ring-[#2D4F38] focus:outline-hidden"
                />
              </div>

              {/* Direct Select Dropdown */}
              <div className="sm:w-64 shrink-0">
                <select
                  id="commodity-select-dropdown"
                  value={selectedCropId}
                  onChange={(e) => {
                    setSelectedCropId(e.target.value);
                    setSelectedStateFilter('All');
                    setCropSearchQuery('');
                  }}
                  className="w-full bg-[#FAF9F6] border border-[#D5CCBD] rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#1C1C1C] focus:ring-1 focus:ring-[#2D4F38] focus:outline-hidden cursor-pointer"
                >
                  {searchMatchingCrops.map((crop) => (
                    <option key={crop.id} value={crop.id}>
                      {crop.icon} {crop.name} — ₹{crop.currentPrice.toLocaleString('en-IN')}/qtl
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Region / State Filter Dropdown */}
            <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#F0ECE1]">
              <MapPin className="w-4 h-4 text-[#8C4A32] shrink-0" />
              <label htmlFor="state-filter-dropdown" className="text-xs font-semibold text-[#6B655B] whitespace-nowrap">
                State / Hub:
              </label>
              <select
                id="state-filter-dropdown"
                value={selectedStateFilter}
                onChange={(e) => setSelectedStateFilter(e.target.value)}
                className="bg-[#FAF9F6] border border-[#D5CCBD] rounded-xl px-3 py-2 text-xs font-semibold text-[#1C1C1C] focus:ring-1 focus:ring-[#2D4F38] focus:outline-hidden cursor-pointer"
              >
                {availableStates.map((st) => (
                  <option key={st} value={st}>
                    {st === 'All' ? 'All Mandi States' : st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Crop Chips for instantaneous one-click selection */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-[#7A746B] uppercase tracking-wider whitespace-nowrap pl-1">
              Popular Crops:
            </span>
            {LIVE_COMMODITIES.map((c) => {
              const isSelected = c.id === selectedCropId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedCropId(c.id);
                    setSelectedStateFilter('All');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-[#233B2B] text-amber-200 border-[#233B2B] shadow-xs'
                      : 'bg-white text-[#4A453E] border-[#E8E5DF] hover:bg-[#F4F1EA] hover:border-[#D5CCBD]'
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{c.name.split(' ')[0]}</span>
                  <span className={`text-[11px] font-mono ${isSelected ? 'text-amber-300' : 'text-[#6B655B]'}`}>
                    ₹{c.currentPrice.toLocaleString('en-IN')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Commodity Display: Clean Card-Based Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left Col (2 Columns on Desktop): Live Matched Price, Volume Gauge & Interactive Trend Line Chart */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* PRIMARY CARD: Live Matched Price & Live Buy vs Sell Volume */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E5DF] shadow-xs space-y-6">
                
                {/* Crop Title & AI Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0ECE1] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#F4F1EA] border border-[#E0DBD1] flex items-center justify-center text-2xl shadow-xs">
                      {currentCommodity.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1C1C]">
                          {currentCommodity.name}
                        </h2>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-[#F4F1EA] text-[#6B655B] font-medium border border-[#E0DBD1]">
                          {currentCommodity.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#7A746B]">
                        Variety: <span className="font-semibold text-[#4A453E]">{currentCommodity.variety}</span>
                      </p>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border self-start sm:self-center shadow-xs ${getBadgeStyle(currentCommodity.aiBadge)}`}>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{currentCommodity.aiBadge}</span>
                  </span>
                </div>

                {/* Price Display Section (Large, Prominent Bold Number) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-[#FAF9F6] rounded-2xl border border-[#E8E5DF]">
                  <div className="sm:col-span-2 space-y-1">
                    <span className="text-[11px] font-bold text-[#7A746B] uppercase tracking-wider">
                      Current Live Matched Price (Modal)
                    </span>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-[#1C1C1C] tracking-tight">
                        ₹{currentCommodity.currentPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-sm font-semibold text-[#6B655B]">
                        / quintal (100 kg)
                      </span>
                    </div>
                    
                    {/* Price change badge */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${
                        currentCommodity.changeType === 'up'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : currentCommodity.changeType === 'down'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-stone-100 text-stone-700 border border-stone-300'
                      }`}>
                        {currentCommodity.changeType === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
                        {currentCommodity.changeType === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
                        {currentCommodity.changeType === 'neutral' && <Minus className="w-3.5 h-3.5" />}
                        <span>
                          {currentCommodity.changePercent > 0 ? `+${currentCommodity.changePercent}%` : `${currentCommodity.changePercent}%`} vs Yesterday
                        </span>
                      </span>
                      <span className="text-xs text-[#8A847A]">
                        (Prev Close: ₹{currentCommodity.previousDayPrice.toLocaleString('en-IN')})
                      </span>
                    </div>
                  </div>

                  {/* Day range & MSP stats */}
                  <div className="flex flex-col justify-center space-y-2 sm:border-l sm:border-[#E8E5DF] sm:pl-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#7A746B]">24h High:</span>
                      <span className="font-bold text-[#1C1C1C]">₹{currentCommodity.dayHigh.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#7A746B]">24h Low:</span>
                      <span className="font-bold text-[#1C1C1C]">₹{currentCommodity.dayLow.toLocaleString('en-IN')}</span>
                    </div>
                    {currentCommodity.msp ? (
                      <div className="flex justify-between text-xs pt-1 border-t border-[#E8E5DF]">
                        <span className="text-[#7A746B]">Govt MSP:</span>
                        <span className="font-bold text-[#233B2B] bg-[#EBF3ED] px-1.5 py-0.5 rounded">
                          ₹{currentCommodity.msp.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-xs pt-1 border-t border-[#E8E5DF]">
                        <span className="text-[#7A746B]">Market Type:</span>
                        <span className="font-medium text-[#4A453E]">Open Market Price</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Buy Volume vs Sell Volume (Comparison Gauge / Bar) */}
                <div className="space-y-2 p-4 bg-white rounded-2xl border border-[#E8E5DF]">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-1.5 text-emerald-800">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                      <span>Live Buy Bids: <strong>{currentCommodity.buyVolumeQuintals.toLocaleString('en-IN')} Qtl</strong></span>
                      <span className="text-[11px] text-emerald-700 font-mono">({buyPercentage}%)</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-[#8C4A32]">
                      <span className="text-[11px] text-[#8C4A32] font-mono">({sellPercentage}%)</span>
                      <span>Live Sell Asks: <strong>{currentCommodity.sellVolumeQuintals.toLocaleString('en-IN')} Qtl</strong></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#8C4A32] inline-block" />
                    </div>
                  </div>

                  {/* Visual Split Bar */}
                  <div className="w-full h-3.5 bg-[#E8E5DF] rounded-full overflow-hidden flex shadow-inner">
                    <div 
                      style={{ width: `${buyPercentage}%` }} 
                      className="h-full bg-emerald-600 transition-all duration-500 relative group"
                      title={`Buyer Demand: ${buyPercentage}%`}
                    />
                    <div 
                      style={{ width: `${sellPercentage}%` }} 
                      className="h-full bg-[#8C4A32] transition-all duration-500 relative group"
                      title={`Seller Supply: ${sellPercentage}%`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#7A746B] pt-0.5">
                    <span>
                      Market Sentiment:{' '}
                      <strong className={buyPercentage > 55 ? 'text-emerald-700' : buyPercentage < 45 ? 'text-amber-700' : 'text-[#4A453E]'}>
                        {buyPercentage > 55 ? 'Bullish (Demand Outpacing Supply)' : buyPercentage < 45 ? 'Bearish (Oversupply / Glut Risk)' : 'Balanced Trading Depth'}
                      </strong>
                    </span>
                    <span>Total Matched Depth: <strong>{totalVolume.toLocaleString('en-IN')} Quintals</strong></span>
                  </div>
                </div>

                {/* Price Trend Line Chart Section (Last 7 / 30 Days) */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-serif font-bold text-[#1C1C1C] flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#2D4F38]" />
                        <span>Price Trend History ({timeframe === '7d' ? 'Last 7 Days' : 'Last 30 Days'})</span>
                      </h3>
                      <p className="text-xs text-[#7A746B]">
                        Modal clearing prices recorded across central APMC mandi terminals
                      </p>
                    </div>

                    {/* Timeframe selector toggle */}
                    <div className="bg-[#FAF9F6] border border-[#D5CCBD] p-1 rounded-xl flex items-center self-start sm:self-auto">
                      <button
                        type="button"
                        id="timeframe-7d-btn"
                        onClick={() => setTimeframe('7d')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          timeframe === '7d'
                            ? 'bg-[#233B2B] text-amber-200 shadow-xs'
                            : 'text-[#6B655B] hover:text-[#1C1C1C]'
                        }`}
                      >
                        7 Days
                      </button>
                      <button
                        type="button"
                        id="timeframe-30d-btn"
                        onClick={() => setTimeframe('30d')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          timeframe === '30d'
                            ? 'bg-[#233B2B] text-amber-200 shadow-xs'
                            : 'text-[#6B655B] hover:text-[#1C1C1C]'
                        }`}
                      >
                        30 Days
                      </button>
                    </div>
                  </div>

                  {/* Recharts Area / Line Chart */}
                  <div className="h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2D4F38" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#2D4F38" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EAE6DF" vertical={false} />
                        <XAxis 
                          dataKey="displayDate" 
                          stroke="#8A847A" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={{ stroke: '#E0DBD1' }} 
                        />
                        <YAxis 
                          stroke="#8A847A" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false}
                          domain={['dataMin - 100', 'dataMax + 100']}
                          tickFormatter={(val) => `₹${val}`}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload as PricePoint;
                              return (
                                <div className="bg-[#1C1C1C] text-white p-3 rounded-xl shadow-xl border border-white/10 text-xs space-y-1">
                                  <p className="font-bold text-amber-300">{data.displayDate} ({data.date})</p>
                                  <p className="text-sm font-bold text-white">Modal Price: ₹{data.price.toLocaleString('en-IN')}/qtl</p>
                                  <div className="text-[10px] text-stone-300 pt-1 border-t border-white/10 flex justify-between gap-3">
                                    <span>High: ₹{data.maxPrice}</span>
                                    <span>Low: ₹{data.minPrice}</span>
                                    <span>Vol: {data.volumeQuintals} Qtl</span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        {currentCommodity.msp && (
                          <ReferenceLine 
                            y={currentCommodity.msp} 
                            stroke="#8C4A32" 
                            strokeDasharray="4 4" 
                            label={{ value: `MSP ₹${currentCommodity.msp}`, fill: '#8C4A32', fontSize: 10, position: 'right' }} 
                          />
                        )}
                        <Area 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#233B2B" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#priceGradient)" 
                          dot={{ r: 4, fill: '#233B2B', stroke: '#FAF9F6', strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: '#D97706', stroke: '#FFFFFF', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Regional Mandi Price Breakdown */}
              <div className="bg-white rounded-3xl p-6 border border-[#E8E5DF] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#1C1C1C] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#8C4A32]" />
                      <span>Regional Mandi Price Breakdown</span>
                    </h3>
                    <p className="text-xs text-[#7A746B]">
                      Current spot prices and daily arrivals reported by registered APMCs
                    </p>
                  </div>
                  {selectedStateFilter !== 'All' && (
                    <button
                      type="button"
                      onClick={() => setSelectedStateFilter('All')}
                      className="text-xs font-bold text-[#2D4F38] hover:underline"
                    >
                      Clear State Filter
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E8E5DF] text-[#7A746B] font-semibold">
                        <th className="py-2.5 px-3">State & District</th>
                        <th className="py-2.5 px-3">Mandi / Terminal Market</th>
                        <th className="py-2.5 px-3 text-right">Modal Price (₹/Qtl)</th>
                        <th className="py-2.5 px-3 text-right">Daily Arrivals</th>
                        <th className="py-2.5 px-3 text-right">Price Spread</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0ECE1]">
                      {filteredRegionalPrices.map((mandi, idx) => {
                        const diff = mandi.price - currentCommodity.currentPrice;
                        return (
                          <tr key={idx} className="hover:bg-[#FAF9F6] transition">
                            <td className="py-3 px-3 font-semibold text-[#1C1C1C]">
                              {mandi.state} <span className="text-[#7A746B] font-normal">({mandi.district})</span>
                            </td>
                            <td className="py-3 px-3 font-medium text-[#4A453E]">
                              {mandi.mandi}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-sm text-[#1C1C1C]">
                              ₹{mandi.price.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-[#6B655B]">
                              {mandi.arrivalsQuintals.toLocaleString('en-IN')} Qtl
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span className={`inline-block px-2 py-0.5 rounded font-mono text-[11px] font-semibold ${
                                diff > 0 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : diff < 0 
                                  ? 'bg-rose-100 text-rose-800' 
                                  : 'bg-stone-100 text-stone-700'
                              }`}>
                                {diff > 0 ? `+₹${diff}` : diff < 0 ? `-₹${Math.abs(diff)}` : 'Equal'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Right Col (1 Column on Desktop): AI Insight Card & Direct Action */}
            <div className="space-y-6">
              
              {/* AI Market Signal Card */}
              <div className="bg-gradient-to-br from-[#FAF8F3] to-[#F1EDE2] rounded-3xl p-6 border border-[#E0DBD1] shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-[#8C4A32]">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8C4A32]">
                    AI Market Intelligence
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-lg text-[#1C1C1C] leading-snug">
                    {currentCommodity.aiBadge}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#4A453E] leading-relaxed bg-white/80 p-3.5 rounded-2xl border border-[#E8E1D5]">
                    {currentCommodity.aiInsight}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-[#7A746B] uppercase tracking-wider block">
                    Key Supply & Demand Drivers:
                  </span>
                  <ul className="space-y-2">
                    {currentCommodity.growthDrivers.map((driver, idx) => (
                      <li key={idx} className="text-xs text-[#4A453E] flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2D4F38] shrink-0 mt-0.5" />
                        <span>{driver}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Banner for the selected Crop */}
              <div className="bg-[#233B2B] text-white rounded-3xl p-6 border border-[#3A5C44] shadow-md space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-300 text-[#1C1C1C] flex items-center justify-center font-bold text-lg">
                    {currentCommodity.icon}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#FAF9F6]">
                      Trade {currentCommodity.name.split(' ')[0]} Now
                    </h4>
                    <p className="text-[11px] text-[#D5CCBD]">
                      Lock in live price without intermediary commissions
                    </p>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  {onNavigateToMarketplace && (
                    <button
                      type="button"
                      id="view-marketplace-listings-btn"
                      onClick={() => onNavigateToMarketplace(currentCommodity.name.split(' ')[0])}
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#F4F1EA] text-[#1C1C1C] font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#233B2B]" />
                      <span>Browse Listings in Marketplace</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {currentUser.role === 'farmer' ? (
                    <button
                      type="button"
                      id="create-farmer-listing-btn"
                      onClick={onOpenCreateListing}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#1C1C1C] font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
                    >
                      <Sprout className="w-3.5 h-3.5 text-[#233B2B]" />
                      <span>List My {currentCommodity.name.split(' ')[0]} Lot</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      id="create-buyer-rfq-btn"
                      onClick={onOpenCreateRfq}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#1C1C1C] font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
                    >
                      <Scale className="w-3.5 h-3.5 text-[#233B2B]" />
                      <span>Post Buy RFQ for {currentCommodity.name.split(' ')[0]}</span>
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: MARKET OVERVIEW (AI-Powered, All Commodities) */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* AI Insight Highlight Banner at Top */}
          <div className="bg-gradient-to-r from-[#233B2B] via-[#1E3626] to-[#2D4F38] text-white rounded-3xl p-5 sm:p-6 border border-[#3E5C47] shadow-lg relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-[#1C1C1C] flex items-center justify-center shrink-0 shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400/20 text-amber-200 border border-amber-300/30">
                      {AI_MARKET_INSIGHT_HIGHLIGHTS[activeInsightIndex].tag}
                    </span>
                    <span className="text-[11px] text-[#C2B7A3]">
                      Crop: {AI_MARKET_INSIGHT_HIGHLIGHTS[activeInsightIndex].crop}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-serif font-bold text-[#FAF9F6] leading-snug">
                    {AI_MARKET_INSIGHT_HIGHLIGHTS[activeInsightIndex].headline}
                  </p>
                  <p className="text-xs text-[#D5CCBD]">
                    Strategic Action: <span className="font-semibold text-amber-200">{AI_MARKET_INSIGHT_HIGHLIGHTS[activeInsightIndex].action}</span>
                  </p>
                </div>
              </div>

              {/* Insight selector buttons */}
              <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                {AI_MARKET_INSIGHT_HIGHLIGHTS.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveInsightIndex(idx)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      activeInsightIndex === idx
                        ? 'bg-amber-300 text-[#1C1C1C]'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {item.crop}
                  </button>
                ))}
              </div>

            </div>
          </div>

          {/* Sort & Filter Toolbar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E5DF] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8A847A] absolute left-3.5 top-3" />
              <input
                type="text"
                id="overview-search-input"
                value={overviewSearch}
                onChange={(e) => setOverviewSearch(e.target.value)}
                placeholder="Filter commodities by name, variety, or category..."
                className="w-full bg-[#FAF9F6] border border-[#D5CCBD] rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-[#1C1C1C] focus:ring-1 focus:ring-[#2D4F38] focus:outline-hidden"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                type="button"
                id="filter-all-btn"
                onClick={() => setOverviewFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  overviewFilter === 'all'
                    ? 'bg-[#233B2B] text-[#FAF9F6]'
                    : 'bg-[#FAF9F6] text-[#6B655B] hover:bg-[#EAE6DF]'
                }`}
              >
                All ({LIVE_COMMODITIES.length})
              </button>
              <button
                type="button"
                id="filter-rising-btn"
                onClick={() => setOverviewFilter('rising')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                  overviewFilter === 'rising'
                    ? 'bg-rose-800 text-rose-50'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                <span>🔺 Rising Demand</span>
              </button>
              <button
                type="button"
                id="filter-glut-btn"
                onClick={() => setOverviewFilter('glut')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                  overviewFilter === 'glut'
                    ? 'bg-amber-800 text-amber-50'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
                }`}
              >
                <span>⚠️ Glut Risk Only</span>
              </button>
              <button
                type="button"
                id="filter-planting-btn"
                onClick={() => setOverviewFilter('planting')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                  overviewFilter === 'planting'
                    ? 'bg-emerald-800 text-emerald-50'
                    : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                }`}
              >
                <span>💡 Recommended for Planting</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-[#8A847A]" />
              <select
                id="overview-sort-dropdown"
                value={overviewSort}
                onChange={(e) => setOverviewSort(e.target.value as OverviewSort)}
                className="bg-[#FAF9F6] border border-[#D5CCBD] rounded-xl px-3 py-2 text-xs font-semibold text-[#1C1C1C] focus:ring-1 focus:ring-[#2D4F38] focus:outline-hidden cursor-pointer"
              >
                <option value="default">Default Market Ranking</option>
                <option value="demand">Sort by Demand (Buy Volume)</option>
                <option value="price_change_desc">Sort by Price Gain (↑ Highest)</option>
                <option value="price_change_asc">Sort by Price Drop (↓ Lowest)</option>
                <option value="price_desc">Sort by Price (₹ High to Low)</option>
              </select>
            </div>

          </div>

          {/* Commodities Card Grid & Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {overviewCommodities.map((crop) => {
              const cropVolTotal = crop.buyVolumeQuintals + crop.sellVolumeQuintals;
              const cropBuyPct = cropVolTotal > 0 ? Math.round((crop.buyVolumeQuintals / cropVolTotal) * 100) : 50;

              return (
                <div
                  key={crop.id}
                  className="bg-white rounded-3xl p-5 border border-[#E8E5DF] hover:border-[#2D4F38] hover:shadow-md transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
                  onClick={() => handleSelectFromOverview(crop.id)}
                >
                  {/* Card Header: Icon, Name, Category & AI Badge */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#F4F1EA] border border-[#E0DBD1] flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shadow-xs">
                          {crop.icon}
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-lg text-[#1C1C1C] group-hover:text-[#233B2B] transition">
                            {crop.name}
                          </h3>
                          <span className="text-xs text-[#7A746B]">
                            {crop.category} • {crop.variety}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* AI Tag */}
                    <div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs border ${getBadgeStyle(crop.aiBadge)}`}>
                        <span>{crop.aiBadge}</span>
                      </span>
                    </div>

                    {/* Price & Change Indicator */}
                    <div className="p-3.5 bg-[#FAF9F6] rounded-2xl border border-[#E8E5DF] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-[#7A746B] uppercase tracking-wider block">
                          Current Price
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-serif font-black text-[#1C1C1C]">
                            ₹{crop.currentPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs font-semibold text-[#7A746B]">/qtl</span>
                        </div>
                      </div>

                      {/* Price change indicator (↑ green / ↓ red / → neutral) */}
                      <div className="text-right">
                        <span className="text-[10px] font-semibold text-[#7A746B] block">vs Yesterday</span>
                        <div className={`flex items-center justify-end gap-0.5 font-bold text-xs ${
                          crop.changeType === 'up' 
                            ? 'text-emerald-700' 
                            : crop.changeType === 'down' 
                            ? 'text-rose-700' 
                            : 'text-stone-700'
                        }`}>
                          {crop.changeType === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
                          {crop.changeType === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
                          {crop.changeType === 'neutral' && <Minus className="w-3.5 h-3.5" />}
                          <span>{crop.changePercent > 0 ? `+${crop.changePercent}%` : `${crop.changePercent}%`}</span>
                        </div>
                      </div>
                    </div>

                    {/* Mini Buy vs Sell Depth */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-[#7A746B]">
                        <span>Bids: <strong className="text-emerald-700">{crop.buyVolumeQuintals} Qtl</strong></span>
                        <span>Asks: <strong className="text-[#8C4A32]">{crop.sellVolumeQuintals} Qtl</strong></span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E8E5DF] rounded-full overflow-hidden flex">
                        <div style={{ width: `${cropBuyPct}%` }} className="h-full bg-emerald-600" />
                        <div style={{ width: `${100 - cropBuyPct}%` }} className="h-full bg-[#8C4A32]" />
                      </div>
                    </div>

                    {/* Short AI Snippet */}
                    <p className="text-xs text-[#5A554D] line-clamp-2 italic bg-[#F7F5EE] p-2 rounded-xl border border-[#ECE7DC]">
                      "{crop.aiInsight}"
                    </p>
                  </div>

                  {/* Card Footer: Interactive View Detail Button */}
                  <div className="pt-2 border-t border-[#F0ECE1] flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#8A847A]">
                      Top Mandi: {crop.regionalPrices[0]?.mandi.split(' ')[0] || 'Direct APMC'}
                    </span>
                    <button
                      type="button"
                      className="text-xs font-bold text-[#233B2B] group-hover:text-[#1B2F22] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>View Detailed Chart</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state if search finds nothing */}
          {overviewCommodities.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-[#E8E5DF] p-6 space-y-3">
              <ShieldAlert className="w-10 h-10 text-amber-600 mx-auto" />
              <h3 className="text-lg font-serif font-bold text-[#1C1C1C]">No matching commodities found</h3>
              <p className="text-xs text-[#7A746B]">
                Try adjusting your search keywords or clearing selected category filters.
              </p>
              <button
                type="button"
                onClick={() => { setOverviewSearch(''); setOverviewFilter('all'); }}
                className="px-4 py-2 bg-[#233B2B] text-amber-200 text-xs font-bold rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
