import React, { useState } from 'react';
import { BuyOrderRFQ, OrderTransaction, UserProfile } from '../types';
import { OrderTrackingModal } from './OrderTrackingModal';
import { 
  Building2, 
  Package, 
  DollarSign, 
  Plus, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  Clock,
  Sparkles,
  MapPin,
  Navigation
} from 'lucide-react';

interface BuyerDashboardProps {
  currentUser: UserProfile;
  rfqs: BuyOrderRFQ[];
  transactions: OrderTransaction[];
  onOpenCreateRfq: () => void;
  onSelectTab: (tab: 'marketplace' | 'live-market' | 'buying' | 'advisor' | 'dashboard') => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  currentUser,
  rfqs,
  transactions,
  onOpenCreateRfq,
  onSelectTab,
}) => {
  const [selectedTrackingTxn, setSelectedTrackingTxn] = useState<OrderTransaction | null>(null);

  const myRfqs = rfqs.filter((r) => r.buyerId === currentUser.id || r.buyerName === (currentUser.orgName || currentUser.name));
  const myPurchases = transactions.filter((t) => t.buyerId === currentUser.id || t.buyerName === (currentUser.orgName || currentUser.name));

  const totalProcuredTons = myPurchases.reduce((sum, p) => sum + p.quantityTons, 0);
  const totalEscrowCommitted = myPurchases.reduce((sum, p) => sum + p.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Profile & Enterprise KPI Summary */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E5DF] shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#F0ECE1]">
          <div className="flex items-center space-x-3.5">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-2xl object-cover border-2 border-[#2D4F38] shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-serif font-bold text-[#1C1C1C]">{currentUser.orgName || currentUser.name}</h1>
                {currentUser.verified && (
                  <span className="inline-flex items-center gap-1 bg-[#EBF3ED] text-[#233B2B] border border-[#C6DFC9] text-[10px] font-bold px-2.5 py-0.5 rounded-full font-serif">
                    <ShieldCheck className="w-3 h-3 text-[#2D4F38]" />
                    Verified {currentUser.role === 'fpo' ? 'FPO Aggregator' : currentUser.role === 'individual' ? 'Direct Buyer' : 'Enterprise Bulk Buyer'}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7A746B] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#8A847A]" />
                <span>{currentUser.location}</span> • <span>Representative: {currentUser.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              id="buyer-buy-direct-btn"
              onClick={() => onSelectTab('buying')}
              className="py-2.5 px-4 bg-[#233B2B] hover:bg-[#1B2F22] text-white font-semibold rounded-xl text-xs transition flex items-center gap-2 shadow-xs border border-[#3E5C47]"
            >
              <Package className="w-4 h-4 text-amber-200" />
              <span>Direct Buying & Payment</span>
            </button>
            <button
              type="button"
              id="buyer-new-rfq-btn"
              onClick={onOpenCreateRfq}
              className="py-2.5 px-4 bg-[#C2593F] hover:bg-[#A84A33] text-white font-semibold rounded-xl text-xs transition flex items-center gap-2 shadow-xs border border-[#D97259]"
            >
              <Plus className="w-4 h-4 text-amber-100" />
              <span>Post New RFQ Demand</span>
            </button>
          </div>
        </div>

        {/* Role Permissions Alert Banner */}
        <div className="p-3 bg-[#FAF8F3] border border-[#E8E2D5] rounded-xl flex items-center justify-between text-xs text-[#5C554B]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>
              Signed in as <strong>{currentUser.role === 'fpo' ? 'FPO Aggregator' : 'Direct Buyer'}</strong>. You can procure verified lots, place escrow orders, and submit demand RFQs. Crop lot listing is reserved for Farmers.
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Procurement Mode
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#E8E5DF]">
            <span className="text-xs font-semibold text-[#7A746B] block font-serif">Total Volume Procured</span>
            <div className="text-2xl font-serif font-bold text-[#1C1C1C] mt-1">
              {totalProcuredTons} <span className="text-xs font-sans font-normal text-[#8A847A]">Metric Tons</span>
            </div>
            <span className="text-[11px] text-[#2D4F38] font-semibold mt-0.5 block font-mono">
              Direct from farm origin
            </span>
          </div>

          <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#E8E5DF]">
            <span className="text-xs font-semibold text-[#7A746B] block font-serif">Escrow Capital Allocated</span>
            <div className="text-2xl font-serif font-bold text-[#2D4F38] mt-1">
              ₹{totalEscrowCommitted.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-[#7A746B] mt-0.5 block">
              100% Quality & AGMARK inspection protected
            </span>
          </div>

          <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#E8E5DF]">
            <span className="text-xs font-semibold text-[#7A746B] block font-serif">Active Broadcast RFQs</span>
            <div className="text-2xl font-serif font-bold text-[#C2593F] mt-1">
              {myRfqs.length} <span className="text-xs font-sans font-normal text-[#8A847A]">Tenders</span>
            </div>
            <span className="text-[11px] text-[#7A746B] mt-0.5 block">
              Open to certified Indian farmer network
            </span>
          </div>
        </div>
      </div>

      {/* Active Purchase Contracts & Escrow Tracking */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E5DF] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
          <h2 className="text-base font-serif font-bold text-[#1C1C1C] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2D4F38]" />
            My Active Purchase Contracts & Multi-State Logistics
          </h2>
          <span className="text-xs text-[#7A746B] font-mono font-medium">{myPurchases.length} Active Orders</span>
        </div>

        {myPurchases.length === 0 ? (
          <div className="text-center py-8 bg-[#FAF9F6] rounded-xl border border-dashed border-[#D5CCBD] space-y-2">
            <p className="text-xs text-[#7A746B]">You have no active purchase contracts.</p>
            <button
              type="button"
              onClick={() => onSelectTab('marketplace')}
              className="py-1.5 px-3 bg-[#2D4F38] text-white rounded-lg text-xs font-semibold hover:bg-[#1E3727]"
            >
              Browse and procure farm lots
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myPurchases.map((purchase) => (
              <div
                key={purchase.id}
                className="p-4 bg-[#FAF9F6] hover:bg-[#F4F1EA] transition rounded-xl border border-[#E8E5DF] space-y-2.5 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#1C1C1C] text-sm">{purchase.id}</span>
                    <span className="bg-[#EBF3ED] text-[#233B2B] border border-[#C6DFC9] font-bold px-2 py-0.5 rounded-full text-[10px] font-mono">
                      {purchase.status}
                    </span>
                    {purchase.truckNumber && (
                      <span className="bg-white border border-[#D5CCBD] px-2 py-0.5 rounded text-[10px] font-mono text-[#5C554B]">
                        🚛 {purchase.truckNumber}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-serif font-bold text-[#2D4F38] text-sm font-mono">
                      ₹{purchase.totalAmount.toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedTrackingTxn(purchase)}
                      className="px-3 py-1.5 bg-[#233B2B] hover:bg-[#1B2F22] text-amber-200 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 border border-[#3E5C47]"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Track Consignment</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-[#E8E5DF] text-[11px]">
                  <div>
                    <span className="text-[#8A847A]">Crop Commodity:</span>
                    <strong className="block text-[#1C1C1C] font-serif">{purchase.cropName}</strong>
                    <span className="text-[#5C554B] font-mono">{purchase.quantityTons} MT @ ₹{purchase.pricePerTon.toLocaleString('en-IN')}/MT</span>
                  </div>

                  <div>
                    <span className="text-[#8A847A]">Farmer / FPO Supplier:</span>
                    <strong className="block text-[#1C1C1C]">{purchase.sellerName}</strong>
                  </div>

                  <div>
                    <span className="text-[#8A847A]">Logistics & Fleet:</span>
                    <strong className="block text-[#1C1C1C]">{purchase.logisticsPartner}</strong>
                    <span className="text-[#5C554B] truncate block">Dest: {purchase.destination}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Broadcast RFQs */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E5DF] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
          <div>
            <h2 className="text-base font-serif font-bold text-[#1C1C1C] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#2D4F38]" />
              My Active RFQs / Bulk Demand Broadcasts
            </h2>
            <p className="text-xs text-[#7A746B] mt-0.5">
              Demands visible to farmers & FPOs across the KrishiQuant network.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenCreateRfq}
            className="py-1.5 px-3 bg-[#2D4F38] hover:bg-[#1E3727] text-white rounded-lg text-xs font-semibold flex items-center gap-1 border border-[#3E654B]"
          >
            <Plus className="w-3.5 h-3.5 text-amber-200" />
            <span>New RFQ</span>
          </button>
        </div>

        {myRfqs.length === 0 ? (
          <div className="text-center py-6 bg-[#FAF9F6] rounded-xl text-xs text-[#7A746B]">
            No RFQs posted yet. Broadcast your upcoming seasonal crop procurement requirements.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myRfqs.map((rfq) => (
              <div
                key={rfq.id}
                className="p-4 bg-[#FAF9F6] rounded-xl border border-[#E8E5DF] space-y-2 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] bg-[#F4F1EA] text-[#5C554B] border border-[#E0DBD1] px-1.5 py-0.5 rounded font-semibold font-serif">
                      {rfq.category}
                    </span>
                    <h3 className="font-serif font-bold text-[#1C1C1C] text-sm mt-1">{rfq.cropName}</h3>
                  </div>
                  <span className="bg-[#EBF3ED] text-[#233B2B] border border-[#C6DFC9] px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                    {rfq.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-[#8A847A]">Target Volume:</span>
                    <strong className="block text-[#1C1C1C] font-mono">{rfq.targetQuantityTons} MT</strong>
                  </div>
                  <div>
                    <span className="text-[#8A847A]">Max Bid Rate:</span>
                    <strong className="block text-[#2D4F38] font-mono">₹{rfq.targetPricePerTon.toLocaleString('en-IN')} / MT</strong>
                  </div>
                </div>

                <p className="text-[#5C554B] text-[11px] line-clamp-2">
                  {rfq.specifications}
                </p>

                <div className="pt-2 border-t border-[#E8E5DF] flex justify-between text-[10px] text-[#8A847A]">
                  <span>Req. Delivery: {rfq.requiredByDate}</span>
                  <span>Destination: {rfq.deliveryLocation}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={!!selectedTrackingTxn}
        onClose={() => setSelectedTrackingTxn(null)}
        transaction={selectedTrackingTxn}
      />
    </div>
  );
};
