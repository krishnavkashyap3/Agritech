import React, { useState } from 'react';
import { AIPlantingRecommendation, UserProfile } from '../types';
import { PRESET_AI_RECOMMENDATIONS } from '../data/mockData';
import { 
  Sparkles, 
  Sprout, 
  TrendingUp, 
  AlertTriangle, 
  Droplets, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Building2, 
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Zap
} from 'lucide-react';

interface AiPlantingAdvisorProps {
  currentUser: UserProfile;
  onPreListCrop?: (cropRecommendation: AIPlantingRecommendation) => void;
}

export const AiPlantingAdvisor: React.FC<AiPlantingAdvisorProps> = ({
  currentUser,
  onPreListCrop,
}) => {
  const [acreage, setAcreage] = useState<number>(50);
  const [soilType, setSoilType] = useState<string>('Well-drained Loam');
  const [region, setRegion] = useState<string>(currentUser.location || 'Midwest Agricultural Belt');
  const [waterSource, setWaterSource] = useState<string>('Canal & Drip Irrigation');
  const [targetSeason, setTargetSeason] = useState<string>('Upcoming Spring Planting Cycle');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<AIPlantingRecommendation[]>(PRESET_AI_RECOMMENDATIONS);
  const [marketSummary, setMarketSummary] = useState<string>(
    'Current agricultural commodity models detect an acute deficit in plant protein pulses and non-GMO high-oleic oilseeds due to surging industrial processing demand and depleted commercial carryover stocks.'
  );
  const [glutWarning, setGlutWarning] = useState<string>(
    'Warning: Standard yellow field feed corn and uncontracted commodity white potatoes exhibit high regional surplus inventory. Planting without forward contracts carries high price degradation risk.'
  );

  const handleGenerateAdvice = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/planting-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acreage,
          soilType,
          region,
          waterSource,
          targetSeason,
          existingExperience: 'Commercial production',
        }),
      });
      const data = await res.json();
      if (data && data.success && data.recommendations && data.recommendations.length > 0) {
        setRecommendations(data.recommendations);
        if (data.marketSummary) setMarketSummary(data.marketSummary);
        if (data.glutWarning) setGlutWarning(data.glutWarning);
      }
    } catch (err) {
      console.warn('Network issue fetching AI advice, retaining current market model:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header banner - Deep Botanical Forest with Serif Typography */}
      <div className="bg-[#233B2B] text-[#FAF9F6] rounded-2xl p-6 sm:p-8 border border-[#3A5741] shadow-xs relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2.5">
          <div className="inline-flex items-center gap-2 bg-[#1A2E21] text-amber-200 border border-[#3E5F46] px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-serif">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Gemini 3.7 AI Predictive Agronomy & Market Gaps Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#FAF9F6] tracking-tight">
            High-Demand Crop Planner for Upcoming Planting Cycles
          </h1>
          <p className="text-[#D0C8BB] text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
            Our AI model cross-references wholesale buyer procurement deficits, regional soil dynamics, and industrial processing trends to recommend high-ROI crops and warn against over-supplied market gluts.
          </p>
        </div>
      </div>

      {/* Input Farm Profile Form */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E8E5DF] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
          <h2 className="text-sm sm:text-base font-serif font-bold text-[#1C1C1C] flex items-center gap-2">
            <Sprout className="w-5 h-5 text-[#2D4F38]" />
            Customize Farm Conditions & Soil Parameters
          </h2>
          <span className="text-xs text-[#8A847A] font-medium font-mono">Real-time personalized calculation</span>
        </div>

        <form onSubmit={handleGenerateAdvice} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs">
          <div>
            <label className="block text-[#5C554B] font-semibold mb-1">Total Acreage (Acres)</label>
            <input
              type="number"
              id="ai-acreage-input"
              min={1}
              value={acreage}
              onChange={(e) => setAcreage(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg font-mono font-semibold text-[#1C1C1C] focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#5C554B] font-semibold mb-1">Dominant Soil Type</label>
            <select
              id="ai-soil-select"
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg text-[#1C1C1C] font-medium focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
            >
              <option value="Well-drained Loam">Well-drained Loam</option>
              <option value="Clay Loam / Heavy Clay">Clay Loam / Heavy Clay</option>
              <option value="Sandy Loam">Sandy Loam</option>
              <option value="Alluvial Riverine Soil">Alluvial Riverine Soil</option>
              <option value="Black Cotton / Volcanic">Black Soil / Volcanic</option>
            </select>
          </div>

          <div>
            <label className="block text-[#5C554B] font-semibold mb-1">Region / Climate Zone</label>
            <input
              type="text"
              id="ai-region-input"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg text-[#1C1C1C] font-medium focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
              placeholder="e.g. Midwest, California Valley, Ontario"
            />
          </div>

          <div>
            <label className="block text-[#5C554B] font-semibold mb-1">Water & Irrigation Access</label>
            <select
              id="ai-water-select"
              value={waterSource}
              onChange={(e) => setWaterSource(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg text-[#1C1C1C] font-medium focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
            >
              <option value="Canal & Drip Irrigation">Canal & Drip Irrigation</option>
              <option value="Borewell / Ground Pump">Borewell / Ground Pump</option>
              <option value="Rainfed / Moderate Rainfall">Rainfed / Moderate Rainfall</option>
              <option value="Arid / Limited Water">Arid / Limited Water</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              id="run-ai-advisor-btn"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#C2593F] hover:bg-[#A84A33] disabled:bg-[#D5CCBD] text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-xs border border-[#D97259]"
            >
              {isLoading ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing Market Gaps...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-200" />
                  <span>Run AI Advisor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Market Guts & Glut Warning Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Market Deficit Opportunity */}
        <div className="bg-[#EBF3ED] border border-[#C6DFC9] rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#233B2B] font-bold text-xs uppercase tracking-wider font-serif">
            <TrendingUp className="w-4 h-4 text-[#2D4F38]" />
            <span>Market Deficit & High-Margin Opportunity</span>
          </div>
          <p className="text-xs text-[#3D3830] leading-relaxed font-normal">
            {marketSummary}
          </p>
        </div>

        {/* Glut / Over-Supply Warning */}
        <div className="bg-[#FDF2F0] border border-[#F5C7C0] rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#8C3420] font-bold text-xs uppercase tracking-wider font-serif">
            <AlertTriangle className="w-4 h-4 text-[#C2593F]" />
            <span>Glut Risk: Crops with Projected Surplus</span>
          </div>
          <p className="text-xs text-[#3D3830] leading-relaxed font-normal">
            {glutWarning}
          </p>
        </div>
      </div>

      {/* Recommendation Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-serif font-bold text-[#1C1C1C] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C2593F]" />
            Top 3 High-Demand Crop Suggestions for Next Season
          </h2>
          <span className="text-xs text-[#7A746B] font-medium">Ranked by projected net margin & buyer deficit</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              id={`crop-recommendation-${index}`}
              className="bg-white rounded-2xl border border-[#E8E5DF] p-5 sm:p-6 flex flex-col justify-between hover:border-[#2D4F38]/70 shadow-xs hover:shadow-md transition space-y-4"
            >
              <div className="space-y-3.5">
                {/* Header with Demand Index */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#F0ECE1]">
                  <div>
                    <span className="text-[10px] bg-[#F4F1EA] text-[#5C554B] border border-[#E0DBD1] font-semibold px-2 py-0.5 rounded-md font-serif">
                      {rec.category}
                    </span>
                    <h3 className="text-base font-serif font-bold text-[#1C1C1C] mt-1 leading-snug">
                      {rec.cropName}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-[#8A847A] block font-semibold uppercase">Demand Score</span>
                    <span className="text-lg font-serif font-bold text-[#2D4F38]">
                      {rec.demandIndex}<span className="text-xs font-normal text-[#8A847A]">/100</span>
                    </span>
                  </div>
                </div>

                {/* Key Financial Badges */}
                <div className="grid grid-cols-2 gap-2 bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E8E5DF] text-xs">
                  <div>
                    <span className="text-[10px] text-[#5C554B] font-semibold block">Projected Price</span>
                    <strong className="text-[#2D4F38] font-bold font-mono">{rec.projectedPriceChange}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#5C554B] font-semibold block">Est. Net ROI</span>
                    <strong className="text-[#C2593F] font-bold font-mono">+{rec.expectedRoiPercentage}% Net</strong>
                  </div>
                </div>

                {/* Why Plant Now */}
                <div className="space-y-1">
                  <span className="text-[11px] font-serif font-bold text-[#1C1C1C] uppercase tracking-wider block">
                    Market Deficit Rationale
                  </span>
                  <p className="text-xs text-[#5C554B] leading-relaxed">
                    {rec.whyPlantNow}
                  </p>
                </div>

                {/* Agronomy Specs */}
                <div className="space-y-1.5 pt-1 text-xs border-t border-[#F0ECE1]">
                  <div className="flex items-center justify-between text-[#5C554B]">
                    <span className="flex items-center gap-1 text-[#8A847A]">
                      <Calendar className="w-3.5 h-3.5" />
                      Planting Cycle:
                    </span>
                    <strong className="text-[#1C1C1C] text-[11px]">{rec.idealPlantingCycle}</strong>
                  </div>

                  <div className="flex items-center justify-between text-[#5C554B]">
                    <span className="flex items-center gap-1 text-[#8A847A]">
                      <Droplets className="w-3.5 h-3.5 text-[#2D4F38]" />
                      Water Need:
                    </span>
                    <strong className="text-[#1C1C1C] text-[11px]">{rec.waterRequirement}</strong>
                  </div>

                  <div className="flex items-center justify-between text-[#5C554B]">
                    <span className="text-[#8A847A]">Harvest Window:</span>
                    <strong className="text-[#1C1C1C] text-[11px]">{rec.estimatedHarvest}</strong>
                  </div>
                </div>

                {/* Target Bulk Buyers */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-serif font-bold text-[#1C1C1C] uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[#2D4F38]" />
                    Target Bulk Buyers Waiting to Contract
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {rec.targetBulkBuyers.map((buyer, bIdx) => (
                      <span
                        key={bIdx}
                        className="bg-[#FAF9F6] text-[#4A453E] border border-[#E8E5DF] px-2 py-0.5 rounded text-[10px] font-medium"
                      >
                        {buyer}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Agronomy Tips */}
                <div className="space-y-1 bg-[#FAF9F6] p-2.5 rounded-xl text-[11px] text-[#5C554B] border border-[#E8E5DF]">
                  <span className="font-serif font-bold text-[#1C1C1C] block text-[10px] uppercase">
                    Maximizing Profit & Caliber
                  </span>
                  <ul className="space-y-1 list-disc list-inside">
                    {rec.keyTips.slice(0, 2).map((tip, tIdx) => (
                      <li key={tIdx} className="leading-tight text-[#5C554B]">{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  id={`prelist-btn-${index}`}
                  onClick={() => {
                    if (onPreListCrop) onPreListCrop(rec);
                  }}
                  className="w-full py-2.5 px-3 bg-[#2D4F38] hover:bg-[#1E3727] text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-xs border border-[#3E654B]"
                >
                  <span>Pre-list on KrishiQuant for Forward Off-Take</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-200" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
