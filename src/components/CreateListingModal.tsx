import React, { useState } from 'react';
import { CropListing, CropCategory, UserProfile, canUserListCrops } from '../types';
import { X, Plus, Tractor, ShieldCheck, UploadCloud, Sparkles, Phone, Ban, AlertTriangle, Sprout } from 'lucide-react';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onAddListing: (listing: CropListing) => void;
  onOpenAuth?: () => void;
  prefillName?: string;
  prefillCategory?: CropCategory;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAddListing,
  onOpenAuth,
  prefillName,
  prefillCategory,
}) => {
  const isFarmer = canUserListCrops(currentUser.role);
  const [cropName, setCropName] = useState(prefillName || '');
  const [category, setCategory] = useState<CropCategory>(prefillCategory || 'Grains');
  const [variety, setVariety] = useState('');
  const [grade, setGrade] = useState<'Grade A (Export)' | 'Grade A (Premium)' | 'Grade B (Commercial)' | 'Grade Organic Certified'>('Grade A (Export)');
  const [totalQuantityTons, setTotalQuantityTons] = useState(50);
  const [minOrderQuantityTons, setMinOrderQuantityTons] = useState(5);
  const [pricePerTon, setPricePerTon] = useState(38500);
  const [moistureContent, setMoistureContent] = useState(11.5);
  const [farmerPhone, setFarmerPhone] = useState(currentUser.phone || '+91 98765 43210');
  const [readyStatus, setReadyStatus] = useState<'Ready for Dispatch' | 'Harvesting in 1-2 Weeks' | 'Pre-Harvest Contract'>('Ready for Dispatch');
  const [harvestDate, setHarvestDate] = useState('2026-09-01');
  const [certificationsText, setCertificationsText] = useState('AGMARK Grade-1, Jaivik Bharat Organic, FSSAI Certified');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canUserListCrops(currentUser.role)) {
      alert('Only signed-in Farmers are authorized to list crops.');
      return;
    }

    const certs = certificationsText
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const newLot: CropListing = {
      id: `lot-${Date.now()}`,
      farmerId: currentUser.id,
      farmerName: currentUser.farmName || currentUser.name,
      farmerPhone: farmerPhone.trim() || currentUser.phone || '+91 98765 43210',
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

  if (!isOpen) return null;

  // Non-farmer restriction view
  if (!isFarmer) {
    return (
      <div id="create-listing-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
        <div 
          id="create-listing-card" 
          className="relative w-full max-w-md bg-[#FAF9F6] rounded-3xl shadow-2xl border border-[#E8E5DF] overflow-hidden p-6 sm:p-7 space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            id="close-create-listing-btn"
            onClick={onClose}
            className="absolute top-5 right-5 text-[#8A847A] hover:text-[#1C1C1C] p-1.5 rounded-full hover:bg-[#EFEBE3] transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center">
            <Ban className="w-6 h-6" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200 mb-1.5">
              <span>Restricted: Farmers Only</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-[#1C1C1C]">
              Crop Listing is Restricted to Farmers
            </h3>
            <p className="text-xs text-[#5C554B] mt-1 leading-relaxed">
              You are signed in as <strong>{currentUser.name}</strong> with the role of{' '}
              <span className="font-bold text-[#1C1C1C] underline">
                {currentUser.role === 'fpo' ? 'FPO Aggregator' : 'Direct Buyer'}
              </span>.
            </p>
          </div>

          <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs space-y-1.5 text-amber-950">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>KrishiQuant Marketplace Rules</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-snug">
              Under platform rules, FPO aggregators and Direct Buyers cannot list individual harvest lots. Only verified Kisan Farmers have harvest listing authorization.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            {onOpenAuth && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="flex-1 py-2.5 px-4 bg-[#233B2B] hover:bg-[#1A2E21] text-amber-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Sprout className="w-3.5 h-3.5" />
                <span>Switch to Farmer Sign In</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-white hover:bg-[#F4F1EA] border border-[#D5CCBD] text-[#4A453E] rounded-xl text-xs font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <span>Kisan Farmer Harvest Listing Portal</span>
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

          {/* Farmer Contact Mobile Number for Offline Communication */}
          <div className="bg-[#FAF9F6] border border-[#D5CCBD] p-3.5 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#2D4F38]" />
              <label htmlFor="listing-farmer-phone" className="block text-[#1C1C1C] font-semibold text-xs font-serif">
                Farmer / FPO Contact Mobile Number (For Direct Offline Trade & Godown Visits) *
              </label>
            </div>
            <input
              type="tel"
              required
              id="listing-farmer-phone"
              value={farmerPhone}
              onChange={(e) => setFarmerPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2 bg-white border border-[#D5CCBD] rounded-lg text-[#1C1C1C] font-mono text-sm focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
            />
            <p className="text-[11px] text-[#7A746B] leading-relaxed">
              Enterprise buyers, millers, and local traders can directly call or WhatsApp this phone number to inspect physical grain samples, visit your farmgate, or discuss offline purchasing.
            </p>
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
