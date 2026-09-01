import React, { useState } from 'react';
import { CropListing, CropCategory, UserProfile } from '../types';
import { X, Plus, Tractor, ShieldCheck, UploadCloud, Sparkles } from 'lucide-react';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onAddListing: (listing: CropListing) => void;
  prefillName?: string;
  prefillCategory?: CropCategory;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAddListing,
  prefillName,
  prefillCategory,
}) => {
  if (!isOpen) return null;

  const [cropName, setCropName] = useState(prefillName || '');
  const [category, setCategory] = useState<CropCategory>(prefillCategory || 'Grains');
  const [variety, setVariety] = useState('');
  const [grade, setGrade] = useState<'Grade A (Export)' | 'Grade A (Premium)' | 'Grade B (Commercial)' | 'Grade Organic Certified'>('Grade A (Export)');
  const [totalQuantityTons, setTotalQuantityTons] = useState(50);
  const [minOrderQuantityTons, setMinOrderQuantityTons] = useState(5);
  const [pricePerTon, setPricePerTon] = useState(38500);
  const [moistureContent, setMoistureContent] = useState(11.5);
  const [readyStatus, setReadyStatus] = useState<'Ready for Dispatch' | 'Harvesting in 1-2 Weeks' | 'Pre-Harvest Contract'>('Ready for Dispatch');
  const [harvestDate, setHarvestDate] = useState('2026-09-01');
  const [certificationsText, setCertificationsText] = useState('AGMARK Grade-1, Jaivik Bharat Organic, FSSAI Certified');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const certs = certificationsText
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const newLot: CropListing = {
      id: `lot-${Date.now()}`,
      farmerId: currentUser.id,
      farmerName: currentUser.farmName || currentUser.name,
      farmLocation: currentUser.location || 'Karnal, Haryana Mandi District',
      farmerRating: currentUser.rating || 4.9,
      cropName: cropName || 'Premium Sharbati Wheat',
      category: category,
      variety: variety || 'Standard High-Yield Sharbati',
      grade: grade,
      totalQuantityTons: totalQuantityTons,
      availableQuantityTons: totalQuantityTons,
      minOrderQuantityTons: minOrderQuantityTons,
      pricePerTon: pricePerTon,
      harvestDate: harvestDate,
      readyStatus: readyStatus,
      certifications: certs.length > 0 ? certs : ['AGMARK Tested'],
      moistureContent: moistureContent,
      imageUrl: imageUrl,
      description: description || `Fresh harvested lot of ${cropName} directly from ${currentUser.farmName || currentUser.name}. Rigorous laboratory moisture tested and ready for e-NAM transport.`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddListing(newLot);
    onClose();
  };

  return (
    <div id="create-listing-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="create-listing-card" 
        className="relative w-full max-w-2xl bg-[#FAF9F6] rounded-2xl shadow-2xl border border-[#E8E5DF] overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Deep Botanical Forest */}
        <div className="bg-[#233B2B] text-[#FAF9F6] p-5 relative border-b border-[#3A5741]">
          <button
            id="close-create-listing-btn"
            onClick={onClose}
            className="absolute top-4 right-4 text-[#D0C8BB] hover:text-[#FAF9F6] p-1 rounded-full hover:bg-[#1A2E21] transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2 text-amber-200 text-xs font-semibold uppercase tracking-wider mb-1 font-serif">
            <Tractor className="w-4 h-4 text-amber-300" />
            <span>Kisan & FPO Listing Portal</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-[#FAF9F6]">
            List Bulk Harvest Lot for Millers & Enterprise Buyers
          </h2>
          <p className="text-[#D0C8BB] text-xs mt-0.5">
            Post directly to the live KrishiQuant mandi marketplace with e-NAM escrow protection.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs bg-white">
          {/* Crop Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#5C554B] font-semibold mb-1 font-serif">Crop Name & Type *</label>
              <input
                type="text"
                required
                id="listing-crop-name"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder="e.g. Sharbati Wheat, Basmati Rice, Mustard"
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg text-[#1C1C1C] focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#5C554B] font-semibold mb-1 font-serif">Category *</label>
              <select
                id="listing-category"
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

          {/* Variety & Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#5C554B] font-semibold mb-1">Specific Variety / Seed Line</label>
              <input
                type="text"
                id="listing-variety"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="e.g. 1121 Pusa Basmati, C-306 Sharbati"
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg text-[#1C1C1C] focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#5C554B] font-semibold mb-1">AGMARK Quality Grade Standard</label>
              <select
                id="listing-grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg text-[#1C1C1C] focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
              >
                <option value="Grade A (Export)">Grade A (Export Quality)</option>
                <option value="Grade A (Premium)">Grade A (Premium Mandi Lot)</option>
                <option value="Grade Organic Certified">Grade Organic Certified (Jaivik Bharat)</option>
                <option value="Grade B (Commercial)">Grade B (Commercial / Processing)</option>
              </select>
            </div>
          </div>

          {/* Quantity, MOQ, Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[#5C554B] font-semibold mb-1">Available Quantity (MT) *</label>
              <input
                type="number"
                required
                min={1}
                id="listing-total-quantity"
                value={totalQuantityTons}
                onChange={(e) => setTotalQuantityTons(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none font-semibold text-[#1C1C1C]"
              />
            </div>

            <div>
              <label className="block text-[#5C554B] font-semibold mb-1">Min. Order Quantity (MT) *</label>
              <input
                type="number"
                required
                min={1}
                id="listing-moq"
                value={minOrderQuantityTons}
                onChange={(e) => setMinOrderQuantityTons(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none text-[#1C1C1C]"
              />
            </div>

            <div>
              <label className="block text-[#5C554B] font-semibold mb-1">Price per Metric Ton (₹) *</label>
              <input
                type="number"
                required
                min={1}
                id="listing-price"
                value={pricePerTon}
                onChange={(e) => setPricePerTon(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none font-semibold text-[#2D4F38]"
              />
              <span className="text-[10px] text-[#7A746B] font-mono block mt-0.5">
                ≈ ₹{Math.round(pricePerTon / 10).toLocaleString('en-IN')}/Quintal
              </span>
            </div>
          </div>

          {/* Moisture, Ready Status & Harvest Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[#5C554B] font-semibold mb-1">Moisture Level (%)</label>
              <input
                type="number"
                step="0.1"
                id="listing-moisture"
                value={moistureContent}
                onChange={(e) => setMoistureContent(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none text-[#1C1C1C]"
              />
            </div>

            <div>
              <label className="block text-[#5C554B] font-semibold mb-1">Harvest / Readiness Status</label>
              <select
                id="listing-ready-status"
                value={readyStatus}
                onChange={(e) => setReadyStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg text-[#1C1C1C] focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
              >
                <option value="Ready for Dispatch">Ready for Immediate Mandi Dispatch</option>
                <option value="Harvesting in 1-2 Weeks">Harvesting in 1-2 Weeks</option>
                <option value="Pre-Harvest Contract">Pre-Harvest Contract (Sauda)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#5C554B] font-semibold mb-1">Harvest / Available Date</label>
              <input
                type="date"
                id="listing-harvest-date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg text-[#1C1C1C] focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
              />
            </div>
          </div>

          {/* Certifications */}
          <div>
            <label className="block text-[#5C554B] font-semibold mb-1">Certifications (comma separated)</label>
            <input
              type="text"
              id="listing-certs"
              value={certificationsText}
              onChange={(e) => setCertificationsText(e.target.value)}
              placeholder="AGMARK Grade-1, Jaivik Bharat Organic, FSSAI Certified, APEDA Registered"
              className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg text-[#1C1C1C] focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
            />
          </div>

          {/* Image & Description */}
          <div>
            <label className="block text-[#5C554B] font-semibold mb-1 font-serif">Crop Lot Description & Mandi / Godown Notes</label>
            <textarea
              rows={3}
              id="listing-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe godown aeration, grain cleaning/sortex, oil/protein content, or packaging (e.g. 50kg jute gunny bags, HDPE bags, or bulk tipper truck)."
              className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg text-[#1C1C1C] focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
            />
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              id="submit-create-listing-btn"
              className="w-full py-3 px-4 bg-[#C2593F] hover:bg-[#A84A33] text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-xs border border-[#D97259]"
            >
              <Plus className="w-4 h-4 text-amber-100" />
              <span>Publish Harvest Lot to Marketplace</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
