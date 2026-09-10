import React, { useState, useMemo, useEffect } from 'react';
import { CropListing, CropCategory, UserProfile } from '../types';
import { 
  Search, 
  Filter, 
  Sparkles, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Tractor, 
  Calendar, 
  ArrowUpRight, 
  Droplets, 
  Plus,
  SlidersHorizontal,
  ChevronDown,
  TrendingUp,
  Phone,
  PhoneCall,
  MessageSquare,
  Copy,
  Check
} from 'lucide-react';

interface MarketplaceProps {
  listings: CropListing[];
  currentUser: UserProfile;
  onOpenCheckout: (listing: CropListing) => void;
  onOpenNegotiator: (listing: CropListing) => void;
  onOpenCreateListing: () => void;
  onOpenCreateRfq: () => void;
  onNavigateToLiveMarket?: (cropId?: string) => void;
  initialSearchQuery?: string;
}

const CATEGORIES: ('All' | CropCategory)[] = [
  'All',
  'Oilseeds',
  'Grains',
  'Pulses & Legumes',
  'Fruits & Veg',
  'Cash Crops',
];

export const Marketplace: React.FC<MarketplaceProps> = ({
  listings,
  currentUser,
  onOpenCheckout,
  onOpenNegotiator,
  onOpenCreateListing,
  onOpenCreateRfq,
  onNavigateToLiveMarket,
  initialSearchQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<'All' | CropCategory>('All');
  const [selectedReadyStatus, setSelectedReadyStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'volume_desc' | 'rating_desc'>('volume_desc');
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [organicOnly, setOrganicOnly] = useState<boolean>(false);
  const [copiedPhoneLotId, setCopiedPhoneLotId] = useState<string | null>(null);

  const handleCopyPhone = (lotId: string, phone: string) => {
    navigator.clipboard?.writeText(phone);
    setCopiedPhoneLotId(lotId);
    setTimeout(() => setCopiedPhoneLotId(null), 2000);
  };

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Search query
      const matchesSearch =
        item.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.farmLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.farmerPhone && item.farmerPhone.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

      // Ready status
      const matchesReady = selectedReadyStatus === 'All' || item.readyStatus === selectedReadyStatus;

      // Price
      const matchesPrice = item.pricePerTon <= maxPrice;

      // Organic/Certifications
      const matchesOrganic = !organicOnly || item.certifications.some((c) => c.toLowerCase().includes('organic') || c.toLowerCase().includes('jaivik') || c.toLowerCase().includes('apeda'));

      return matchesSearch && matchesCategory && matchesReady && matchesPrice && matchesOrganic;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.pricePerTon - b.pricePerTon;
      if (sortBy === 'price_desc') return b.pricePerTon - a.pricePerTon;
      if (sortBy === 'rating_desc') return b.farmerRating - a.farmerRating;
      return b.availableQuantityTons - a.availableQuantityTons;
    });
  }, [listings, searchQuery, selectedCategory, selectedReadyStatus, sortBy, maxPrice, organicOnly]);

  return (
    <div className="space-y-6">
      {/* Top Action Bar & Banner - Deep Botanical Forest with Serif Typography */}
      <div className="bg-[#233B2B] text-[#FAF9F6] rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-[#3A5741] shadow-xs">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#1A2E21] text-amber-200 border border-[#3E5F46] px-3.5 py-1 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-serif tracking-wide">Direct Farmgate & FPO-to-Enterprise Bulk Commodity Exchange</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#FAF9F6] tracking-tight">
            Certified Indian Agricultural Harvests & Mandi Lots
          </h1>
          <p className="text-[#D0C8BB] text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
            Direct farmer procurement across Punjab, Maharashtra, MP, Gujarat & Andhra. Backed by APMC certified weighments, AGMARK quality grading, and e-NAM bank escrow settlements.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {currentUser.role === 'farmer' ? (
              <button
                type="button"
                id="header-post-lot-btn"
                onClick={onOpenCreateListing}
                className="py-2.5 px-4 bg-[#C2593F] hover:bg-[#A84A33] text-white font-semibold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-xs border border-[#D97259]"
              >
                <Plus className="w-4 h-4 text-amber-100" />
                <span>List Harvest Lot (फसल दर्ज करें)</span>
              </button>
            ) : (
              <button
                type="button"
                id="header-post-rfq-btn"
                onClick={onOpenCreateRfq}
                className="py-2.5 px-4 bg-[#C2593F] hover:bg-[#A84A33] text-white font-semibold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-xs border border-[#D97259]"
              >
                <Plus className="w-4 h-4 text-amber-100" />
                <span>Post Procurement RFQ / Bulk Demand</span>
              </button>
            )}

            {onNavigateToLiveMarket && (
              <button
                type="button"
                id="header-view-live-market-btn"
                onClick={() => onNavigateToLiveMarket()}
                className="py-2.5 px-4 bg-white/10 hover:bg-white/20 text-amber-200 font-semibold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 border border-white/20"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>View Live Mandi Tickers & AI Trends</span>
              </button>
            )}

            <div className="text-xs text-[#B8B0A2] flex items-center gap-3 pl-1 font-mono">
              <span>🌾 <strong className="text-amber-200">{listings.length}</strong> Verified Farm Lots</span>
              <span>•</span>
              <span>🔒 <strong className="text-amber-200">₹0</strong> Middleman Commission</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E5DF] shadow-xs space-y-4">
        {/* Search and Sort */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#8A847A]" />
            <input
              type="text"
              id="marketplace-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crops (e.g. Basmati Rice, Sharbati Wheat, Chana, Turmeric), State, or FPO..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#FAF9F6] border border-[#E0DBD1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D4F38] text-[#1C1C1C]"
            />
          </div>

          <div className="md:col-span-3">
            <select
              id="marketplace-ready-filter"
              value={selectedReadyStatus}
              onChange={(e) => setSelectedReadyStatus(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-[#FAF9F6] border border-[#E0DBD1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D4F38] text-[#1C1C1C]"
            >
              <option value="All">All Dispatch Statuses</option>
              <option value="Ready for Dispatch">Ready for Immediate Dispatch</option>
              <option value="Harvesting in 1-2 Weeks">Harvesting in 1-2 Weeks</option>
              <option value="Pre-Harvest Contract">Pre-Harvest Contract (Sauda)</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              id="marketplace-sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-[#FAF9F6] border border-[#E0DBD1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D4F38] text-[#1C1C1C]"
            >
              <option value="volume_desc">Sort: Highest Volume (MT)</option>
              <option value="price_asc">Sort: Price (Lowest First)</option>
              <option value="price_desc">Sort: Price (Highest First)</option>
              <option value="rating_desc">Sort: Farmer Rating</option>
            </select>
          </div>
        </div>

        {/* Category Tabs and Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#F0ECE1]">
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                id={`cat-pill-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#233B2B] text-[#FAF9F6] shadow-xs font-bold'
                    : 'bg-[#F4F1EA] hover:bg-[#EAE4D8] text-[#4A453E]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-[#5C554B]">
            <label className="flex items-center gap-1.5 cursor-pointer select-none font-medium">
              <input
                type="checkbox"
                id="organic-filter-checkbox"
                checked={organicOnly}
                onChange={(e) => setOrganicOnly(e.target.checked)}
                className="rounded text-[#2D4F38] focus:ring-[#2D4F38]"
              />
              <span>Jaivik / Organic Certified Only</span>
            </label>

            <span className="text-[#8A847A] font-medium">
              Showing <strong className="text-[#1C1C1C]">{filteredListings.length}</strong> farm lots
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Listings */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E8E5DF] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#F4F1EA] text-[#8A847A] mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-serif font-bold text-[#1C1C1C]">No crop lots matched your filter</h3>
          <p className="text-xs text-[#7A746B] max-w-sm mx-auto">
            Try adjusting your search keywords, price filter, or clear the category selection.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedReadyStatus('All');
              setOrganicOnly(false);
            }}
            className="py-2 px-4 bg-[#233B2B] text-white text-xs font-semibold rounded-lg hover:bg-[#1B2F22] transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredListings.map((listing) => (
            <div
              key={listing.id}
              id={`crop-card-${listing.id}`}
              className="bg-white rounded-2xl border border-[#E8E5DF] hover:border-[#2D4F38]/70 shadow-xs hover:shadow-md transition duration-200 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Image Banner */}
                <div className="relative h-48 w-full bg-[#EFEBE3] overflow-hidden">
                  <img
                    src={listing.imageUrl}
                    alt={listing.cropName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C261F]/80 via-transparent to-black/20" />
                  
                  {/* Ready Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-xs flex items-center gap-1.5 ${
                      listing.readyStatus === 'Ready for Dispatch'
                        ? 'bg-[#2D4F38] text-amber-200 border border-[#40684C]'
                        : 'bg-[#C2593F] text-white border border-[#D97259]'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      {listing.readyStatus}
                    </span>
                  </div>

                  {/* Category Pill */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-[#1C1C1C]/80 backdrop-blur-xs text-[#FAF9F6] border border-white/20 px-2 py-0.5 rounded-md text-[11px] font-medium font-serif">
                      {listing.category}
                    </span>
                  </div>

                  {/* Price overlay at bottom */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <div>
                      <span className="text-[10px] text-[#D8D2C6] uppercase tracking-wider block font-semibold">Mandi / Farmgate Price</span>
                      <div className="text-xl font-serif font-bold text-white drop-shadow-xs">
                        ₹{listing.pricePerTon.toLocaleString('en-IN')} <span className="text-xs font-sans font-normal text-amber-200">/ MT (₹{Math.round(listing.pricePerTon / 10).toLocaleString('en-IN')}/Qtl)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#D8D2C6] block font-semibold">Stock Lot</span>
                      <span className="text-sm font-mono font-bold text-stone-100">
                        {listing.availableQuantityTons} MT
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-serif font-bold text-[#1C1C1C] text-lg leading-snug group-hover:text-[#233B2B] transition">
                      {listing.cropName}
                    </h3>
                    <p className="text-xs text-[#7A746B] font-medium truncate mt-0.5">
                      Variety: {listing.variety}
                    </p>
                  </div>

                  {/* Farmer Credential & Location */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F0ECE1] text-[#4A453E]">
                    <div className="flex items-center gap-1.5 truncate">
                      <Tractor className="w-3.5 h-3.5 text-[#2D4F38] shrink-0" />
                      <span className="font-semibold text-[#1C1C1C] truncate">{listing.farmerName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#C2593F] font-bold shrink-0">
                      <Star className="w-3.5 h-3.5 fill-[#C2593F] text-[#C2593F]" />
                      <span>{listing.farmerRating}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-[#7A746B]">
                    <MapPin className="w-3.5 h-3.5 text-[#8A847A] shrink-0" />
                    <span className="truncate">{listing.farmLocation}</span>
                  </div>

                  {/* Direct Offline Farmer Contact Section */}
                  <div className="bg-[#FAF9F6] border border-[#E3DACD] rounded-xl p-2.5 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#5C554B] uppercase tracking-wider font-semibold font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#2D4F38]" />
                        Direct Farmer Phone (Offline)
                      </span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                        Farmgate Visit OK
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-[#1C1C1C]">
                          {listing.farmerPhone || '+91 98124 56781'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyPhone(listing.id, listing.farmerPhone || '+91 98124 56781');
                          }}
                          className="text-[#7A746B] hover:text-[#1C1C1C] p-1 rounded hover:bg-[#EFEBE3] transition"
                          title="Copy farmer phone number"
                        >
                          {copiedPhoneLotId === listing.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <a
                          href={`tel:${(listing.farmerPhone || '+91 98124 56781').replace(/\s+/g, '')}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#2D4F38] hover:bg-[#1E3727] text-white text-[11px] font-semibold rounded-lg shadow-xs transition"
                          title="Direct Phone Call to Farmer"
                        >
                          <PhoneCall className="w-3 h-3 text-amber-200" />
                          <span>Call</span>
                        </a>

                        <a
                          href={`https://wa.me/${(listing.farmerPhone || '+91 98124 56781').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Namaste, I saw your ${listing.cropName} (${listing.availableQuantityTons} MT) on KrishiQuant and want to connect offline regarding sample checking and purchase.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#1B5E20] border border-[#A5D6A7] text-[11px] font-semibold rounded-lg transition"
                          title="Chat on WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Specifications Pill Grid */}
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E8E5DF]">
                    <div className="flex items-center gap-1 text-[#3D3830]">
                      <span className="text-[#8A847A]">Grade:</span>
                      <strong className="truncate font-semibold">{listing.grade}</strong>
                    </div>
                    <div className="flex items-center gap-1 text-[#3D3830] justify-end">
                      <Droplets className="w-3 h-3 text-[#2D4F38]" />
                      <span>Moist: <strong>{listing.moistureContent}%</strong></span>
                    </div>
                    <div className="flex items-center gap-1 text-[#3D3830]">
                      <span className="text-[#8A847A]">MOQ:</span>
                      <strong className="font-mono">{listing.minOrderQuantityTons} MT</strong>
                    </div>
                    <div className="flex items-center gap-1 text-[#3D3830] justify-end">
                      <Calendar className="w-3 h-3 text-[#8A847A]" />
                      <span className="text-[#7A746B]">{listing.harvestDate}</span>
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="flex flex-wrap gap-1">
                    {listing.certifications.slice(0, 3).map((cert, idx) => (
                      <span
                        key={idx}
                        className="bg-[#EBF3ED] text-[#233B2B] border border-[#C6DFC9] px-2 py-0.5 rounded text-[10px] font-semibold"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-[#5C554B] line-clamp-2 leading-relaxed">
                    {listing.description}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 pt-0 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    id={`negotiate-btn-${listing.id}`}
                    onClick={() => onOpenNegotiator(listing)}
                    className="py-2 px-3 bg-[#F4F1EA] hover:bg-[#EAE4D8] text-[#5C3224] border border-[#E3DACD] font-semibold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                    title="Run AI Mandi Valuation & Negotiation"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#C2593F]" />
                    <span>AI Sauda Check</span>
                  </button>

                  <button
                    type="button"
                    id={`buy-lot-btn-${listing.id}`}
                    onClick={() => onOpenCheckout(listing)}
                    className="py-2 px-3 bg-[#2D4F38] hover:bg-[#1E3727] text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-1 shadow-xs border border-[#3E654B]"
                  >
                    <span>Procure Lot</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-200" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
