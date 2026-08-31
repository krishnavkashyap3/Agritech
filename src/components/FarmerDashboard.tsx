import React from 'react';
import { CropListing, BuyOrderRFQ, OrderTransaction, UserProfile } from '../types';
import { 
  Tractor, 
  Package, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Plus,
  Sparkles,
  MapPin
} from 'lucide-react';

interface FarmerDashboardProps {
  currentUser: UserProfile;
  listings: CropListing[];
  rfqs: BuyOrderRFQ[];
  transactions: OrderTransaction[];
  onOpenCreateListing: () => void;
  onSelectTab: (tab: 'marketplace' | 'live-market' | 'buying' | 'advisor' | 'dashboard') => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  currentUser,
  listings,
  rfqs,
  transactions,
  onOpenCreateListing,
  onSelectTab,
}) => {
  const myListings = listings.filter((l) => l.farmerId === currentUser.id || l.farmerName === currentUser.farmName);
  const mySales = transactions.filter((t) => t.sellerId === currentUser.id || t.sellerName === currentUser.farmName);

  const totalTonsListed = myListings.reduce((sum, l) => sum + l.totalQuantityTons, 0);
  const totalTonsAvailable = myListings.reduce((sum, l) => sum + l.availableQuantityTons, 0);
  const totalRevenueEscrow = mySales.reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Profile & KPI Summary */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E5DF] shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#F0ECE1]">
          <div className="flex items-center space-x-3.5">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-2xl object-cover border-2 border-[#2D4F38] shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-serif font-bold text-[#1C1C1C]">{currentUser.farmName || currentUser.name}</h1>
                {currentUser.verified && (
                  <span className="inline-flex items-center gap-1 bg-[#EBF3ED] text-[#233B2B] border border-[#C6DFC9] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-[#2D4F38]" />
                    Verified Kisan / FPO Producer
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7A746B] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#8A847A]" />
                <span>{currentUser.location}</span> • <span>Rep: {currentUser.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              id="farmer-new-listing-btn"
              onClick={onOpenCreateListing}
              className="py-2.5 px-4 bg-[#C2593F] hover:bg-[#A84A33] text-white font-semibold rounded-xl text-xs transition flex items-center gap-2 shadow-xs border border-[#D97259]"
            >
              <Plus className="w-4 h-4 text-amber-100" />
              <span>List New Crop Lot</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('advisor')}
              className="py-2.5 px-4 bg-[#F4F1EA] hover:bg-[#EAE4D8] text-[#5C3224] border border-[#E3DACD] font-semibold rounded-xl text-xs transition flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-[#C2593F]" />
              <span>AI Crop Advisor</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#E8E5DF]">
            <span className="text-xs font-semibold text-[#7A746B] block font-serif">Total Harvest Volume Listed</span>
            <div className="text-2xl font-serif font-bold text-[#1C1C1C] mt-1">
              {totalTonsAvailable} <span className="text-xs font-sans font-normal text-[#8A847A]">/ {totalTonsListed} MT</span>
            </div>
            <span className="text-[11px] text-[#2D4F38] font-semibold mt-0.5 block font-mono">
              {myListings.length} Active commodity lots
            </span>
          </div>

          <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#E8E5DF]">
            <span className="text-xs font-semibold text-[#7A746B] block font-serif">Total Escrow Revenue Secured</span>
            <div className="text-2xl font-serif font-bold text-[#2D4F38] mt-1">
              ₹{totalRevenueEscrow.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-[#7A746B] mt-0.5 block font-mono">
              {mySales.length} Guaranteed trade agreements
            </span>
          </div>

          <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#E8E5DF]">
            <span className="text-xs font-semibold text-[#7A746B] block font-serif">Producer Trust & Rating</span>
            <div className="text-2xl font-serif font-bold text-[#C2593F] mt-1">
              {currentUser.rating} <span className="text-xs font-sans font-normal text-[#8A847A]">/ 5.0</span>
            </div>
            <span className="text-[11px] text-[#7A746B] mt-0.5 block">
              {currentUser.totalDeals} Completed consignments fulfilled
            </span>
          </div>
        </div>
      </div>

      {/* Active Crop Lots */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E5DF] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
          <h2 className="text-base font-serif font-bold text-[#1C1C1C] flex items-center gap-2">
            <Package className="w-5 h-5 text-[#2D4F38]" />
            My Active Crop Consignments & Mandi Stock
          </h2>
          <span className="text-xs text-[#7A746B] font-mono font-medium">{myListings.length} Listed Lots</span>
        </div>

        {myListings.length === 0 ? (
          <div className="text-center py-8 bg-[#FAF9F6] rounded-xl border border-dashed border-[#D5CCBD] space-y-2">
            <p className="text-xs text-[#7A746B]">You have no active crop listings.</p>
            <button
              type="button"
              onClick={onOpenCreateListing}
              className="py-1.5 px-3 bg-[#2D4F38] text-white rounded-lg text-xs font-semibold hover:bg-[#1E3727]"
            >
              List your first harvest
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myListings.map((lot) => (
              <div
                key={lot.id}
                className="flex flex-wrap items-center justify-between p-4 bg-[#FAF9F6] hover:bg-[#F4F1EA] transition rounded-xl border border-[#E8E5DF] gap-3 text-xs"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={lot.imageUrl}
                    alt={lot.cropName}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-lg object-cover border border-[#E8E5DF]"
                  />
                  <div>
                    <h3 className="font-serif font-bold text-[#1C1C1C] text-sm">{lot.cropName}</h3>
                    <p className="text-[#7A746B] text-[11px]">
                      {lot.variety} • Grade: <strong className="text-[#3D3830]">{lot.grade}</strong> • Moist: {lot.moistureContent}%
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <span className="text-[#8A847A] block text-[10px] uppercase">Available</span>
                    <strong className="text-[#1C1C1C] font-mono text-sm">{lot.availableQuantityTons} MT</strong>
                  </div>

                  <div>
                    <span className="text-[#8A847A] block text-[10px] uppercase">Spot Price</span>
                    <strong className="text-[#2D4F38] font-mono text-sm">₹{lot.pricePerTon.toLocaleString('en-IN')}/MT</strong>
                  </div>

                  <div>
                    <span className="text-[#8A847A] block text-[10px] uppercase">Status</span>
                    <span className="bg-[#EBF3ED] text-[#233B2B] border border-[#C6DFC9] font-semibold px-2 py-0.5 rounded text-[10px]">
                      {lot.readyStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Received Orders & Escrow Pipeline */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E5DF] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
          <h2 className="text-base font-serif font-bold text-[#1C1C1C] flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#2D4F38]" />
            Trade Orders & e-NAM Escrow Settlements
          </h2>
          <span className="text-xs text-[#7A746B] font-mono font-medium">{mySales.length} Active Deals</span>
        </div>

        {mySales.length === 0 ? (
          <div className="text-center py-6 bg-[#FAF9F6] rounded-xl text-xs text-[#7A746B]">
            No orders received yet. Bulk buyers browsing the marketplace will place escrow orders directly.
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            {mySales.map((sale) => (
              <div
                key={sale.id}
                className="flex flex-wrap items-center justify-between p-4 bg-[#FAF9F6] rounded-xl border border-[#E8E5DF] gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#1C1C1C]">{sale.id}</span>
                    <span className="bg-[#2D4F38] text-white font-bold px-2 py-0.5 rounded-full text-[10px]">
                      {sale.status}
                    </span>
                  </div>
                  <p className="text-[#5C554B] mt-1">
                    Buyer: <strong className="text-[#1C1C1C]">{sale.buyerName}</strong> • Destination: {sale.destination}
                  </p>
                  <p className="text-[#8A847A] text-[10px] mt-0.5 font-mono">{sale.timestamp}</p>
                </div>

                <div className="text-right">
                  <span className="text-[#8A847A] block text-[10px] uppercase">Total Value</span>
                  <div className="text-base font-serif font-bold text-[#2D4F38]">
                    ₹{sale.totalAmount.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[#7A746B] text-[11px] block font-mono">
                    {sale.quantityTons} MT @ ₹{sale.pricePerTon.toLocaleString('en-IN')}/MT
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Relevant Bulk Buyer RFQs that match farmer's crops */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E5DF] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
          <div>
            <h2 className="text-base font-serif font-bold text-[#1C1C1C] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2D4F38]" />
              Open Bulk Buyer RFQs / Enterprise Procurement Demands
            </h2>
            <p className="text-xs text-[#7A746B] mt-0.5">
              FMCG processors, millers & exporters currently seeking large harvest consignments.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rfqs.map((rfq) => (
            <div
              key={rfq.id}
              className="p-4 bg-[#FAF9F6] rounded-xl border border-[#E8E5DF] space-y-2.5 text-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] bg-[#F4F1EA] text-[#5C554B] border border-[#E0DBD1] px-1.5 py-0.5 rounded font-semibold font-serif">
                      {rfq.category}
                    </span>
                    <h3 className="font-serif font-bold text-[#1C1C1C] text-sm mt-1">{rfq.cropName}</h3>
                    <span className="text-[11px] text-[#7A746B]">{rfq.buyerName}</span>
                  </div>
                  <span className="bg-[#EBF3ED] text-[#233B2B] border border-[#C6DFC9] px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                    {rfq.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#E8E5DF] text-[11px]">
                  <div>
                    <span className="text-[#8A847A]">Target Volume:</span>
                    <strong className="block text-[#1C1C1C] font-mono">{rfq.targetQuantityTons} MT</strong>
                  </div>
                  <div>
                    <span className="text-[#8A847A]">Target Max Bid:</span>
                    <strong className="block text-[#2D4F38] font-mono">₹{rfq.targetPricePerTon.toLocaleString('en-IN')} / MT</strong>
                  </div>
                </div>

                <p className="text-[#5C554B] text-[11px] mt-2 line-clamp-2">
                  {rfq.specifications}
                </p>
              </div>

              <div className="pt-2 border-t border-[#E8E5DF] flex justify-between items-center text-[11px]">
                <span className="text-[#8A847A]">Req. by: {rfq.requiredByDate}</span>
                <span className="font-semibold text-[#2D4F38]">Matches Mandi Supply</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
