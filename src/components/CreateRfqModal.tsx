import React, { useState } from 'react';
import { BuyOrderRFQ, CropCategory, UserProfile } from '../types';
import { X, Plus, Building2, ShieldCheck, ArrowRight } from 'lucide-react';

interface CreateRfqModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onAddRfq: (rfq: BuyOrderRFQ) => void;
}

export const CreateRfqModal: React.FC<CreateRfqModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAddRfq,
}) => {
  if (!isOpen) return null;

  const [cropName, setCropName] = useState('');
  const [category, setCategory] = useState<CropCategory>('Grains');
  const [targetQuantityTons, setTargetQuantityTons] = useState(100);
  const [targetPricePerTon, setTargetPricePerTon] = useState(42000);
  const [deliveryLocation, setDeliveryLocation] = useState(currentUser.location || 'APMC Vashi Terminal, Navi Mumbai');
  const [requiredByDate, setRequiredByDate] = useState('2026-09-30');
  const [specifications, setSpecifications] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRfq: BuyOrderRFQ = {
      id: `rfq-${Date.now()}`,
      buyerId: currentUser.id,
      buyerName: currentUser.orgName || currentUser.name,
      buyerType: currentUser.role === 'individual' ? 'individual' : 'organisation',
      cropName: cropName || 'Premium Sharbati Wheat',
      category: category,
      targetQuantityTons: targetQuantityTons,
      targetPricePerTon: targetPricePerTon,
      deliveryLocation: deliveryLocation,
      requiredByDate: requiredByDate,
      specifications: specifications || 'AGMARK Grade-1 standard, maximum 12% moisture, certified electronic weighbridge receipt.',
      status: 'Open',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddRfq(newRfq);
    onClose();
  };

  return (
    <div id="create-rfq-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="create-rfq-card" 
        className="relative w-full max-w-xl bg-[#FAF9F6] rounded-2xl shadow-2xl border border-[#E8E5DF] overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Deep Botanical Forest */}
        <div className="bg-[#233B2B] text-[#FAF9F6] p-5 relative border-b border-[#3A5741]">
          <button
            id="close-create-rfq-btn"
            onClick={onClose}
            className="absolute top-4 right-4 text-[#D0C8BB] hover:text-[#FAF9F6] p-1 rounded-full hover:bg-[#1A2E21] transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2 text-amber-200 text-xs font-semibold uppercase tracking-wider mb-1 font-serif">
            <Building2 className="w-4 h-4 text-amber-300" />
            <span>Bulk Buyer Procurement Tender (RFQ)</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-[#FAF9F6]">
            Post Bulk Crop Demand Order
          </h2>
          <p className="text-[#D0C8BB] text-xs mt-0.5">
            Broadcast your raw ingredient and commodity requirements directly to verified Kisan & FPO networks.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#5C554B] font-semibold mb-1 font-serif">Required Commodity Crop *</label>
              <input
                type="text"
                required
                id="rfq-crop-name"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder="e.g. Sharbati Wheat, Chana Dal, Mustard"
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg text-[#1C1C1C] focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#5C554B] font-semibold mb-1 font-serif">Category *</label>
              <select
                id="rfq-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg text-[#1C1C1C] focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
              >
                <option value="Grains">Grains (Wheat, Rice, Maize)</option>
                <option value="Pulses & Legumes">Pulses & Legumes (Chana, Tur, Moong)</option>
                <option value="Oilseeds">Oilseeds (Mustard, Soybean, Groundnut)</option>
                <option value="Cash Crops">Cash Crops (Cotton, Sugarcane, Jute)</option>
                <option value="Spices">Spices (Turmeric, Cumin, Chilli)</option>
                <option value="Fruits & Veg">Fruits & Veg (Mango, Onion, Potato)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#5C554B] font-semibold mb-1">Target Volume (Metric Tons) *</label>
              <input
                type="number"
                required
                min={1}
                id="rfq-volume"
                value={targetQuantityTons}
                onChange={(e) => setTargetQuantityTons(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none font-bold text-[#1C1C1C]"
              />
            </div>

            <div>
              <label className="block text-[#5C554B] font-semibold mb-1">Target Max Bid Rate (₹ / MT) *</label>
              <input
                type="number"
                required
                min={1}
                id="rfq-price"
                value={targetPricePerTon}
                onChange={(e) => setTargetPricePerTon(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none font-bold text-[#2D4F38]"
              />
              <span className="text-[10px] text-[#7A746B] font-mono block mt-0.5">
                ≈ ₹{Math.round(targetPricePerTon / 10).toLocaleString('en-IN')}/Quintal
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#5C554B] font-semibold mb-1">Delivery APMC Mandi / Processing Hub</label>
              <input
                type="text"
                required
                id="rfq-location"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                placeholder="e.g. Navi Mumbai APMC, Silo Unit Karnal, Indore Hub"
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg text-[#1C1C1C] focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#5C554B] font-semibold mb-1">Required Delivery Deadline</label>
              <input
                type="date"
                required
                id="rfq-deadline"
                value={requiredByDate}
                onChange={(e) => setRequiredByDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg text-[#1C1C1C] focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#5C554B] font-semibold mb-1 font-serif">Quality Specifications & Moisture Limits</label>
            <textarea
              rows={3}
              id="rfq-specs"
              value={specifications}
              onChange={(e) => setSpecifications(e.target.value)}
              placeholder="e.g. AGMARK Grade 1, moisture under 12%, Sortex cleaned, 50kg bag packing or loose bulk hopper."
              className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg text-[#1C1C1C] focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
            />
          </div>

          <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E8E5DF] flex justify-between items-center text-xs">
            <span className="text-[#5C554B] font-serif">Estimated Total Procurement Commitment:</span>
            <strong className="text-[#2D4F38] text-sm font-mono font-bold">
              ₹{(targetQuantityTons * targetPricePerTon).toLocaleString('en-IN')}
            </strong>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              id="submit-rfq-btn"
              className="w-full py-3 px-4 bg-[#C2593F] hover:bg-[#A84A33] text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-xs border border-[#D97259]"
            >
              <Plus className="w-4 h-4 text-amber-100" />
              <span>Broadcast RFQ to Kisan & FPO Network</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
