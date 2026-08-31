import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell,
  ReferenceLine
} from 'recharts';
import { CropMarketTrend, MarketGraphAiAnalysis, CropCategory, UserProfile } from '../types';
import { CROP_MARKET_TRENDS, INITIAL_AI_GRAPH_ANALYSIS } from '../data/marketTrendsData';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Sparkles, 
  Sprout, 
  ShieldAlert, 
  ArrowUpRight, 
  BarChart3, 
  Layers, 
  RefreshCw, 
  HelpCircle, 
  CheckCircle2, 
  DollarSign, 
  Building2, 
  Scale, 
  Send, 
  Info,
  Calendar,
  Droplets,
  PackageCheck
} from 'lucide-react';

interface MarketTrendsSectionProps {
  currentUser: UserProfile;
  onSelectCropForPlanting?: (cropName: string, category: CropCategory) => void;
  onOpenCreateListing?: () => void;
  onOpenCreateRfq?: () => void;
}

type ChartMode = 'stocks_vs_demand' | 'price_vs_msp' | 'gap_index';

export const MarketTrendsSection: React.FC<MarketTrendsSectionProps> = ({
  currentUser,
  onSelectCropForPlanting,
  onOpenCreateListing,
  onOpenCreateRfq,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [chartMode, setChartMode] = useState<ChartMode>('stocks_vs_demand');
  const [sortBy, setSortBy] = useState<'deficit' | 'price' | 'glut' | 'roi'>('deficit');
  const [unitMode, setUnitMode] = useState<'tons' | 'quintals'>('tons');

  const [aiAnalysis, setAiAnalysis] = useState<MarketGraphAiAnalysis>(INITIAL_AI_GRAPH_ANALYSIS);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [userQuery, setUserQuery] = useState<string>('');
  const [customAnswer, setCustomAnswer] = useState<string | null>(null);

  // Categories list
  const categories: ('All' | CropCategory)[] = [
    'All',
    'Pulses & Legumes',
    'Oilseeds',
    'Grains',
    'Spices',
    'Fruits & Veg',
    'Cash Crops'
  ];

  // Filter and sort the trends data
  const filteredTrends = useMemo(() => {
    let list = [...CROP_MARKET_TRENDS];
    if (selectedCategory !== 'All') {
      list = list.filter((item) => item.category === selectedCategory);
    }

    if (sortBy === 'deficit') {
      list.sort((a, b) => b.deficitTons - a.deficitTons);
    } else if (sortBy === 'price') {
      list.sort((a, b) => (b.currentPricePerTon - b.mspPerTon) - (a.currentPricePerTon - a.mspPerTon));
    } else if (sortBy === 'glut') {
      list.sort((a, b) => b.supplyDemandRatio - a.supplyDemandRatio);
    } else if (sortBy === 'roi') {
      list.sort((a, b) => {
        const roiA = parseInt(a.projectedNextSeasonMargin.replace(/[^0-9-]/g, ''), 10) || 0;
        const roiB = parseInt(b.projectedNextSeasonMargin.replace(/[^0-9-]/g, ''), 10) || 0;
        return roiB - roiA;
      });
    }

    return list;
  }, [selectedCategory, sortBy]);

  // Formatted data for Recharts
  const chartData = useMemo(() => {
    return filteredTrends.map((item) => {
      const multiplier = unitMode === 'quintals' ? 10 : 1; // 1 Ton = 10 Quintals
      const priceDivisor = unitMode === 'quintals' ? 10 : 1; // Price per Ton / 10 = Price per Quintal

      return {
        id: item.id,
        rawCropName: item.cropName,
        name: item.cropName.length > 22 ? item.cropName.substring(0, 20) + '…' : item.cropName,
        category: item.category,
        demand: Math.round(item.buyerDemandTons * multiplier),
        stock: Math.round(item.currentStockTons * multiplier),
        deficit: Math.round(item.deficitTons * multiplier),
        spotPrice: Math.round(item.currentPricePerTon / priceDivisor),
        mspPrice: Math.round(item.mspPerTon / priceDivisor),
        pricePremium: Math.round((item.currentPricePerTon - item.mspPerTon) / priceDivisor),
        premiumPercentage: Math.round(((item.currentPricePerTon - item.mspPerTon) / item.mspPerTon) * 100),
        ratio: item.supplyDemandRatio,
        condition: item.marketCondition,
        verdict: item.recommendationVerdict,
        optimalSeason: item.optimalPlantingSeason,
        growthDriver: item.growthDriver,
        glutRiskReason: item.glutRiskReason,
      };
    });
  }, [filteredTrends, unitMode]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const topDeficit = [...CROP_MARKET_TRENDS].sort((a, b) => b.deficitTons - a.deficitTons)[0];
    const topGlut = [...CROP_MARKET_TRENDS].sort((a, b) => b.supplyDemandRatio - a.supplyDemandRatio)[0];
    const highestPremium = [...CROP_MARKET_TRENDS].sort((a, b) => 
      ((b.currentPricePerTon - b.mspPerTon) / b.mspPerTon) - ((a.currentPricePerTon - a.mspPerTon) / a.mspPerTon)
    )[0];
    const topRoi = [...CROP_MARKET_TRENDS].sort((a, b) => {
      const roiA = parseInt(a.projectedNextSeasonMargin.replace(/[^0-9-]/g, ''), 10) || 0;
      const roiB = parseInt(b.projectedNextSeasonMargin.replace(/[^0-9-]/g, ''), 10) || 0;
      return roiB - roiA;
    })[0];

    return { topDeficit, topGlut, highestPremium, topRoi };
  }, []);

  // AI Graph Analysis Handler
  const handleRunAiAnalysis = async (customPrompt?: string) => {
    setIsAiLoading(true);
    const queryToUse = customPrompt || userQuery;

    try {
      const res = await fetch('/api/ai/analyze-market-graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          chartMode,
          chartData: filteredTrends,
          userQuery: queryToUse,
          farmLocation: currentUser.location,
        }),
      });

      const data = await res.json();
      if (data && data.success) {
        if (data.analysis) {
          setAiAnalysis(data.analysis);
        }
        if (data.customAnswer) {
          setCustomAnswer(data.customAnswer);
        } else if (customPrompt) {
          setCustomAnswer(data.analysis?.executiveSummary || null);
        }
      }
    } catch (err) {
      console.warn('Network issue fetching AI graph analysis, using cached intelligence model:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner - Deep Botanical Forest */}
      <div className="bg-[#233B2B] text-[#FAF9F6] rounded-2xl p-6 sm:p-8 border border-[#3A5741] shadow-xs relative overflow-hidden">
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#1A2E21] text-amber-200 border border-[#3E5F46] px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-serif">
            <BarChart3 className="w-3.5 h-3.5 text-amber-300" />
            <span>Real-Time Mandi Prices, Warehouse Stocks & AI Agronomy Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#FAF9F6] tracking-tight">
            Mandi Price Benchmarks & Supply-Demand Deficits
          </h1>
          <p className="text-[#D0C8BB] text-xs sm:text-sm leading-relaxed max-w-3xl font-normal">
            Cross-examine real-time wholesale buyer procurement RFQs against warehouse godown inventories. Detect emerging commodity price surges, avoid disastrous market gluts (oversupplied stock collapses), and optimize next sowing cycles for peak farm profitability.
          </p>
        </div>
      </div>

      {/* Top 4 Key Metric Badges / High-Level Radar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Top Demand Deficit */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E5DF] shadow-xs hover:border-[#2D4F38] transition space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#2D4F38] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Highest Buyer Deficit
            </span>
            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              High Demand
            </span>
          </div>
          <div>
            <div className="text-base font-serif font-bold text-[#1C1C1C] truncate">
              {metrics.topDeficit?.cropName}
            </div>
            <div className="text-xs text-[#6B655B] font-mono mt-0.5">
              Deficit: <span className="font-bold text-emerald-700">+{metrics.topDeficit?.deficitTons.toLocaleString('en-IN')} MT</span> shortage
            </div>
          </div>
          <div className="pt-2 border-t border-[#F0ECE1] flex items-center justify-between text-[11px]">
            <span className="text-[#8A847A]">Spot Mandi Rate</span>
            <span className="font-bold text-[#233B2B] font-mono">₹{metrics.topDeficit?.currentPricePerTon.toLocaleString('en-IN')}/MT</span>
          </div>
        </div>

        {/* Metric 2: Critical Market Glut Alert */}
        <div className="bg-[#FFF8F6] rounded-2xl p-4 sm:p-5 border border-[#F5D5CE] shadow-xs hover:border-[#E05238] transition space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#C93B2B] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#C93B2B]" />
              Critical Market Glut Alert
            </span>
            <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-300">
              Oversupply Risk
            </span>
          </div>
          <div>
            <div className="text-base font-serif font-bold text-[#1C1C1C] truncate">
              {metrics.topGlut?.cropName}
            </div>
            <div className="text-xs text-[#C93B2B] font-mono mt-0.5">
              Surplus: <span className="font-bold">+{Math.abs(metrics.topGlut?.deficitTons || 0).toLocaleString('en-IN')} MT</span> unsold cold storage
            </div>
          </div>
          <div className="pt-2 border-t border-[#F5D5CE] flex items-center justify-between text-[11px]">
            <span className="text-[#8A847A]">Stock vs Demand</span>
            <span className="font-bold text-rose-700 font-mono">{(metrics.topGlut?.supplyDemandRatio || 0).toFixed(1)}x Surplus</span>
          </div>
        </div>

        {/* Metric 3: Highest Price Spread vs MSP */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E5DF] shadow-xs hover:border-[#D97706] transition space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8A5612] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-amber-600" />
              Highest MSP Premium
            </span>
            <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
              +60.9% Spread
            </span>
          </div>
          <div>
            <div className="text-base font-serif font-bold text-[#1C1C1C] truncate">
              {metrics.highestPremium?.cropName}
            </div>
            <div className="text-xs text-[#6B655B] font-mono mt-0.5">
              Spot: ₹{metrics.highestPremium?.currentPricePerTon.toLocaleString('en-IN')} vs MSP ₹{metrics.highestPremium?.mspPerTon.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="pt-2 border-t border-[#F0ECE1] flex items-center justify-between text-[11px]">
            <span className="text-[#8A847A]">Net Price Gain</span>
            <span className="font-bold text-amber-700 font-mono">+₹{((metrics.highestPremium?.currentPricePerTon || 0) - (metrics.highestPremium?.mspPerTon || 0)).toLocaleString('en-IN')}/MT</span>
          </div>
        </div>

        {/* Metric 4: Top Recommended Plantation */}
        <div className="bg-[#F2F7F4] rounded-2xl p-4 sm:p-5 border border-[#CDE3D3] shadow-xs hover:border-[#2D4F38] transition space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#233B2B] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-emerald-700" />
              Top Next Plantation Crop
            </span>
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
              {metrics.topRoi?.projectedNextSeasonMargin}
            </span>
          </div>
          <div>
            <div className="text-base font-serif font-bold text-[#1C1C1C] truncate">
              {metrics.topRoi?.cropName}
            </div>
            <div className="text-xs text-[#3E5C47] font-mono mt-0.5 truncate">
              Window: <span className="font-bold">{metrics.topRoi?.optimalPlantingSeason.split('(')[0]}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-[#CDE3D3] flex items-center justify-between text-[11px]">
            <span className="text-[#656E66]">Water Need</span>
            <span className="font-bold text-[#233B2B]">{metrics.topRoi?.waterRequirement.split('(')[0]}</span>
          </div>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#E8E5DF] shadow-xs space-y-6">
        {/* Controls & Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#F0ECE1]">
          {/* Chart View Modes */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="chart-mode-stocks-demand"
              onClick={() => setChartMode('stocks_vs_demand')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                chartMode === 'stocks_vs_demand'
                  ? 'bg-[#233B2B] text-amber-200 shadow-xs font-bold border border-[#3E5C47]'
                  : 'bg-[#F4F1EA] text-[#4A453E] hover:bg-[#EAE4D8] border border-[#E0DBD1]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Warehouse Stock vs Buyer Demand ({unitMode === 'tons' ? 'MT' : 'Quintals'})</span>
            </button>

            <button
              type="button"
              id="chart-mode-price-msp"
              onClick={() => setChartMode('price_vs_msp')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                chartMode === 'price_vs_msp'
                  ? 'bg-[#233B2B] text-amber-200 shadow-xs font-bold border border-[#3E5C47]'
                  : 'bg-[#F4F1EA] text-[#4A453E] hover:bg-[#EAE4D8] border border-[#E0DBD1]'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Mandi Spot Price vs MSP Benchmark (₹/{unitMode === 'tons' ? 'MT' : 'q'})</span>
            </button>

            <button
              type="button"
              id="chart-mode-gap-index"
              onClick={() => setChartMode('gap_index')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                chartMode === 'gap_index'
                  ? 'bg-[#233B2B] text-amber-200 shadow-xs font-bold border border-[#3E5C47]'
                  : 'bg-[#F4F1EA] text-[#4A453E] hover:bg-[#EAE4D8] border border-[#E0DBD1]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Net Supply-Demand Gap Index</span>
            </button>
          </div>

          {/* Unit & Sorting Toggle */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center bg-[#F4F1EA] rounded-xl p-1 border border-[#E0DBD1] text-xs">
              <button
                type="button"
                onClick={() => setUnitMode('tons')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  unitMode === 'tons' ? 'bg-[#233B2B] text-white shadow-xs' : 'text-[#5C554B] hover:text-[#1C1C1C]'
                }`}
              >
                Metric Ton (MT)
              </button>
              <button
                type="button"
                onClick={() => setUnitMode('quintals')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  unitMode === 'quintals' ? 'bg-[#233B2B] text-white shadow-xs' : 'text-[#5C554B] hover:text-[#1C1C1C]'
                }`}
              >
                Quintals (q)
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#5C554B]">
              <span className="hidden sm:inline font-mono">Sort:</span>
              <select
                id="chart-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort chart data"
                className="bg-[#F4F1EA] border border-[#E0DBD1] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#1C1C1C] focus:ring-1 focus:ring-[#2D4F38] focus:outline-hidden"
              >
                <option value="deficit">Highest Buyer Deficit</option>
                <option value="price">Highest Price Premium vs MSP</option>
                <option value="glut">Highest Market Glut / Oversupply</option>
                <option value="roi">Highest Next Season ROI %</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#2D4F38] text-white font-bold'
                  : 'bg-[#FAF9F6] text-[#5C554B] hover:bg-[#EFEBE3] border border-[#E8E5DF]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* The Recharts Bar Chart Container */}
        <div className="w-full h-[380px] sm:h-[430px] pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'stocks_vs_demand' ? (
              /* Bar Chart: Buyer Demand vs Warehouse Stock */
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 20, left: 10, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE5DC" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  angle={-30} 
                  textAnchor="end" 
                  interval={0} 
                  height={70} 
                  tick={{ fontSize: 11, fill: '#4A453E', fontFamily: 'serif' }} 
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#7A746B', fontFamily: 'monospace' }}
                  tickFormatter={(val) => `${val.toLocaleString('en-IN')} ${unitMode === 'tons' ? 'MT' : 'q'}`}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const isGlut = data.ratio > 1.3;
                      const isSevereDeficit = data.ratio < 0.5;

                      return (
                        <div className="bg-[#1C261F] text-[#FAF9F6] p-3.5 rounded-xl shadow-lg border border-[#2D4F38] text-xs max-w-xs space-y-2">
                          <div className="font-serif font-bold text-sm text-amber-200 border-b border-[#2E4233] pb-1">
                            {data.rawCropName}
                          </div>
                          <div className="space-y-1 font-mono text-[11px]">
                            <div className="flex justify-between text-[#B8C7BC]">
                              <span>Active Buyer Demand:</span>
                              <span className="font-bold text-white">{data.demand.toLocaleString('en-IN')} {unitMode === 'tons' ? 'MT' : 'q'}</span>
                            </div>
                            <div className="flex justify-between text-[#E8DCC4]">
                              <span>Warehouse Godown Stock:</span>
                              <span className="font-bold text-amber-300">{data.stock.toLocaleString('en-IN')} {unitMode === 'tons' ? 'MT' : 'q'}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-[#2E4233]">
                              <span>Net Market Deficit:</span>
                              <span className={`font-bold ${data.deficit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {data.deficit >= 0 ? `+${data.deficit.toLocaleString('en-IN')}` : data.deficit.toLocaleString('en-IN')} {unitMode === 'tons' ? 'MT' : 'q'}
                              </span>
                            </div>
                          </div>
                          <div className="pt-1 text-[10px]">
                            {isSevereDeficit && (
                              <span className="text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded font-bold">
                                🌟 Acute Deficit - High Farmer Margin
                              </span>
                            )}
                            {isGlut && (
                              <span className="text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded font-bold">
                                ⚠️ Market Glut - Avoid Uncontracted Sowing
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: 10, fontSize: '12px' }}
                  formatter={(value) => <span className="text-[#3A352F] font-medium">{value}</span>}
                />
                <Bar 
                  dataKey="demand" 
                  name={`Active Buyer Demand (${unitMode === 'tons' ? 'MT' : 'q'})`} 
                  fill="#233B2B" 
                  radius={[6, 6, 0, 0]} 
                />
                <Bar 
                  dataKey="stock" 
                  name={`Warehouse Godown Stock (${unitMode === 'tons' ? 'MT' : 'q'})`} 
                  fill="#D97706" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            ) : chartMode === 'price_vs_msp' ? (
              /* Bar Chart: Mandi Spot Rate vs Minimum Support Price (MSP) */
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 20, left: 10, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE5DC" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  angle={-30} 
                  textAnchor="end" 
                  interval={0} 
                  height={70} 
                  tick={{ fontSize: 11, fill: '#4A453E', fontFamily: 'serif' }} 
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#7A746B', fontFamily: 'monospace' }}
                  tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#1C261F] text-[#FAF9F6] p-3.5 rounded-xl shadow-lg border border-[#2D4F38] text-xs max-w-xs space-y-2">
                          <div className="font-serif font-bold text-sm text-amber-200 border-b border-[#2E4233] pb-1">
                            {data.rawCropName}
                          </div>
                          <div className="space-y-1 font-mono text-[11px]">
                            <div className="flex justify-between text-[#B8C7BC]">
                              <span>Current Mandi Spot Price:</span>
                              <span className="font-bold text-white">₹{data.spotPrice.toLocaleString('en-IN')}/{unitMode === 'tons' ? 'MT' : 'q'}</span>
                            </div>
                            <div className="flex justify-between text-[#E8DCC4]">
                              <span>Govt Minimum Support Price (MSP):</span>
                              <span className="font-bold text-amber-300">₹{data.mspPrice.toLocaleString('en-IN')}/{unitMode === 'tons' ? 'MT' : 'q'}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-[#2E4233]">
                              <span>Farmer Price Premium:</span>
                              <span className={`font-bold ${data.pricePremium >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {data.pricePremium >= 0 ? `+₹${data.pricePremium.toLocaleString('en-IN')} (+${data.premiumPercentage}%)` : `₹${data.pricePremium.toLocaleString('en-IN')}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: 10, fontSize: '12px' }}
                  formatter={(value) => <span className="text-[#3A352F] font-medium">{value}</span>}
                />
                <Bar 
                  dataKey="spotPrice" 
                  name={`Current Mandi Spot Price (₹/${unitMode === 'tons' ? 'MT' : 'q'})`} 
                  fill="#2D4F38" 
                  radius={[6, 6, 0, 0]} 
                />
                <Bar 
                  dataKey="mspPrice" 
                  name={`Govt Minimum Support Price (₹/${unitMode === 'tons' ? 'MT' : 'q'})`} 
                  fill="#9CA3AF" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            ) : (
              /* Bar Chart: Net Supply-Demand Gap Index (%) */
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 20, left: 10, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE5DC" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  angle={-30} 
                  textAnchor="end" 
                  interval={0} 
                  height={70} 
                  tick={{ fontSize: 11, fill: '#4A453E', fontFamily: 'serif' }} 
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#7A746B', fontFamily: 'monospace' }}
                  tickFormatter={(val) => `${val.toLocaleString('en-IN')} ${unitMode === 'tons' ? 'MT' : 'q'}`}
                />
                <ReferenceLine y={0} stroke="#4A453E" strokeWidth={1.5} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#1C261F] text-[#FAF9F6] p-3 rounded-xl shadow-lg border border-[#2D4F38] text-xs">
                          <div className="font-serif font-bold text-amber-200 pb-1 border-b border-[#2E4233]">
                            {data.rawCropName}
                          </div>
                          <div className="mt-1.5 font-mono text-[11px] space-y-1">
                            <div>Net Gap: <span className={data.deficit >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              {data.deficit >= 0 ? `+${data.deficit.toLocaleString('en-IN')} Deficit (Shortage)` : `${data.deficit.toLocaleString('en-IN')} Surplus (Glut)`}
                            </span></div>
                            <div className="text-[10px] text-[#A8A196]">Verdict: {data.verdict}</div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: 10, fontSize: '12px' }}
                  formatter={(value) => <span className="text-[#3A352F] font-medium">{value}</span>}
                />
                <Bar 
                  dataKey="deficit" 
                  name={`Net Deficit Shortage (+) vs Surplus Glut (-) [${unitMode === 'tons' ? 'MT' : 'q'}]`} 
                  radius={[6, 6, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.deficit >= 500 ? '#1E5128' : entry.deficit >= 0 ? '#4E7D55' : entry.deficit >= -1500 ? '#EA580C' : '#DC2626'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend Key Explanations */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#F0ECE1] text-[11px]">
          <div className="flex items-center gap-2 text-[#2D4F38]">
            <div className="w-3 h-3 rounded-xs bg-[#233B2B]" />
            <span><strong>Buyer Demand Deficit (Green)</strong>: Safe, high-ROI crops with aggressive procurement bids.</span>
          </div>
          <div className="flex items-center gap-2 text-[#D97706]">
            <div className="w-3 h-3 rounded-xs bg-[#D97706]" />
            <span><strong>Warehouse Stock (Amber)</strong>: Available mandi silos and cold storage carryover.</span>
          </div>
          <div className="flex items-center gap-2 text-[#DC2626]">
            <div className="w-3 h-3 rounded-xs bg-[#DC2626]" />
            <span><strong>Market Glut (Red)</strong>: Massive unsold surplus stockpile; high risk of price collapse.</span>
          </div>
        </div>
      </div>

      {/* AI GRAPH ANALYSIS & AGRO-MARKET INTELLIGENCE ENGINE */}
      <div className="bg-[#FAF9F6] border border-[#DCD6C9] rounded-2xl p-6 sm:p-8 space-y-7 shadow-xs">
        {/* Section Header with Live Gemini Tag */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E1D5]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[#2D4F38] text-xs font-bold uppercase tracking-wider font-mono">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Gemini 3.7 AI Graph Analysis & Mandi Intelligence</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1C1C]">
              AI Strategic Interpretation & Next Plantation Blueprint
            </h2>
          </div>
          <button
            type="button"
            onClick={() => handleRunAiAnalysis()}
            disabled={isAiLoading}
            className="self-start sm:self-auto px-4 py-2 bg-[#233B2B] hover:bg-[#1B2F22] text-amber-200 rounded-xl text-xs font-semibold transition flex items-center gap-2 border border-[#3E5C47] shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
            <span>{isAiLoading ? 'Analyzing Live Telemetry...' : 'Refresh AI Graph Analysis'}</span>
          </button>
        </div>

        {/* 1. Executive Summary from AI */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E8E5DF] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider font-serif text-[#233B2B]">
            <BarChart3 className="w-4 h-4 text-[#2D4F38]" />
            <span>Executive Mandi Telemetry Synthesis</span>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-[#2C2A26] font-normal">
            {aiAnalysis.executiveSummary}
          </p>
        </div>

        {/* 2. Market Gluts Warning Section (Surplus & Price Degradation Risk) */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#A82A18] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#C93B2B]" />
              Market Gluts Warning: Avoid Uncontracted Sowing of These Crops
            </h3>
            <span className="text-xs text-[#8C4A32] font-mono font-medium hidden sm:inline">
              High Cold Storage & Godown Carryover
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiAnalysis.marketGluts.map((glut, idx) => (
              <div 
                key={idx}
                className="bg-[#FFF8F6] border border-[#F5C7BD] rounded-2xl p-4 sm:p-5 space-y-3 hover:shadow-xs transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A82A18] font-mono block">
                      {glut.category}
                    </span>
                    <h4 className="font-serif font-bold text-sm sm:text-base text-[#1C1C1C] leading-snug">
                      {glut.cropName}
                    </h4>
                  </div>
                  <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-300 whitespace-nowrap">
                    {glut.riskLevel}
                  </span>
                </div>

                <div className="text-xs text-[#524B42] leading-relaxed">
                  <span className="font-semibold text-[#8C3A2B]">Why it is in glut: </span>
                  {glut.warningReason}
                </div>

                <div className="pt-2.5 border-t border-[#F5D5CE] text-[11px] text-[#2C2A26] bg-white/70 p-2.5 rounded-xl">
                  <span className="font-bold text-[#233B2B] block mb-0.5">💡 AI Loss Mitigation Strategy:</span>
                  <span>{glut.mitigationStrategy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Next Plantation Recommended Crops (High-Deficit & High-ROI) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#233B2B] flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-700" />
              AI Recommended Crops for Next Plantations (High Demand & Low Stock)
            </h3>
            <span className="text-xs text-[#2D4F38] font-mono font-medium hidden sm:inline">
              Deficit-Backed Sowing Strategies
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {aiAnalysis.topPlantingRecommendations.map((rec, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl p-5 border border-[#D5E5D8] hover:border-[#2D4F38] shadow-xs space-y-3.5 transition flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D4F38] font-mono block">
                        {rec.category} • {rec.sowingWindow}
                      </span>
                      <h4 className="font-serif font-bold text-base sm:text-lg text-[#1C1C1C]">
                        {rec.cropName}
                      </h4>
                    </div>
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold px-2.5 py-1 rounded-xl text-xs font-mono">
                      +{rec.projectedRoiPercentage}% Projected ROI
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#4A453E] leading-relaxed">
                    {rec.economicRationale}
                  </p>

                  <div className="bg-[#F8F6F0] p-2.5 rounded-xl text-xs space-y-1 border border-[#E8E5DF]">
                    <div className="text-[11px] text-[#5C554B]">
                      <strong>Soil & Water:</strong> {rec.soilAndWater}
                    </div>
                    <div className="text-[11px] text-[#2D4F38] flex flex-wrap items-center gap-1">
                      <strong>Active Buyers:</strong>
                      {rec.targetBuyers.map((b, bIdx) => (
                        <span key={bIdx} className="bg-white px-1.5 py-0.5 rounded text-[10px] border border-[#D5CCBD]">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F0ECE1] flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#8A847A] font-mono">Demand Score: {rec.demandIndex}/100</span>
                  
                  {onSelectCropForPlanting && (
                    <button
                      type="button"
                      onClick={() => onSelectCropForPlanting(rec.cropName, rec.category)}
                      className="px-3 py-1.5 bg-[#233B2B] hover:bg-[#1B2F22] text-amber-200 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                    >
                      <span>🌾 Plan in AI Advisor</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Strategic Agronomic Advice */}
        <div className="bg-[#F2F7F4] rounded-2xl p-5 sm:p-6 border border-[#CDE3D3] space-y-3">
          <h4 className="text-sm sm:text-base font-serif font-bold text-[#1C261F] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            Key Strategic Directives for Farmers & FPOs
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-[#2D3A30]">
            {aiAnalysis.strategicAdvice.map((advice, aIdx) => (
              <li key={aIdx} className="flex items-start gap-2">
                <span className="text-[#2D4F38] font-bold font-mono">0{aIdx + 1}.</span>
                <span>{advice}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 5. Interactive "Ask AI about this Graph" Q&A Box */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E0DBD1] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm sm:text-base font-serif font-bold text-[#1C1C1C] flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#2D4F38]" />
              Ask AI Agronomist & Economist About This Chart Data
            </h4>
            <span className="text-[11px] text-[#8A847A] font-mono">Interactive Grounded Analysis</span>
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#6B655B]">Quick Questions:</span>
            {[
              'Why is Mustard Demand surging over Stocks?',
              'How to mitigate the Potato & Onion glut?',
              'Best crop for 20 acres with low water in Rabi?',
              'Will Turmeric prices sustain current highs?'
            ].map((promptText, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => {
                  setUserQuery(promptText);
                  handleRunAiAnalysis(promptText);
                }}
                className="px-2.5 py-1 bg-[#F4F1EA] hover:bg-[#EAE4D8] text-[#3A352F] text-xs rounded-lg border border-[#D5CCBD] transition font-medium text-left"
              >
                💬 {promptText}
              </button>
            ))}
          </div>

          {/* User Custom Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (userQuery.trim()) handleRunAiAnalysis(userQuery);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="e.g. Compare ROI between Chana and Mustard for Central MP soil..."
              className="flex-1 bg-[#FAF9F6] border border-[#D5CCBD] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#1C1C1C] focus:ring-1 focus:ring-[#2D4F38] focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={isAiLoading || !userQuery.trim()}
              className="px-4 py-2 bg-[#2D4F38] hover:bg-[#1F3927] text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>
          </form>

          {/* Custom Answer Render */}
          {customAnswer && (
            <div className="bg-[#F8F6F0] p-4 rounded-xl border border-[#E0DBD1] text-xs sm:text-sm text-[#2C2A26] space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 font-bold text-[#233B2B] text-xs uppercase tracking-wider font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>AI Grounded Answer:</span>
              </div>
              <p className="leading-relaxed">{customAnswer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
