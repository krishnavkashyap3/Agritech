import React, { useState } from 'react';
import { 
  CropListing, 
  UserProfile, 
  OrderTransaction, 
  CropCategory, 
  ProcurementCartItem, 
  DeliveryAddress,
  DeliveryLogisticsConfig,
  ComplianceDetails
} from '../types';
import { DEFAULT_SAVED_ADDRESSES, INITIAL_TRANSACTIONS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { PaymentGateway } from './PaymentGateway';
import { DeliveryAddressModal } from './DeliveryAddressModal';
import { OrderTrackingModal } from './OrderTrackingModal';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  Award, 
  Droplet, 
  Calendar, 
  Clock, 
  Layers,
  ChevronRight,
  Receipt,
  FileCheck,
  Check,
  Building,
  Phone,
  PhoneCall,
  MessageSquare,
  Copy,
  FileText,
  HelpCircle,
  ArrowLeft,
  Navigation,
  ExternalLink,
  Printer,
  Radio
} from 'lucide-react';

interface BuyingSectionProps {
  listings: CropListing[];
  currentUser: UserProfile;
  onOpenNegotiator: (listing: CropListing) => void;
  onOrderComplete: (transactions: OrderTransaction[]) => void;
  onSwitchToDashboard: () => void;
  onRequireAuth?: (action?: () => void, promptMessage?: string) => void;
}

const CATEGORIES: { label: string; value: 'All' | CropCategory }[] = [
  { label: 'All Commodities', value: 'All' },
  { label: 'Grains & Basmati', value: 'Grains' },
  { label: 'Pulses & Chana', value: 'Pulses & Legumes' },
  { label: 'Oilseeds & Mustard', value: 'Oilseeds' },
  { label: 'Spices & Condiments', value: 'Spices' },
  { label: 'Fruits & Cash Crops', value: 'Fruits & Veg' },
];

export const BuyingSection: React.FC<BuyingSectionProps> = ({
  listings,
  currentUser,
  onOpenNegotiator,
  onOrderComplete,
  onSwitchToDashboard,
  onRequireAuth,
}) => {
  const { isAuthenticated } = useAuth();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | CropCategory>('All');
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [maxMoisture, setMaxMoisture] = useState<number>(15);

  // Cart / Procurement Batch State
  const [cartItems, setCartItems] = useState<ProcurementCartItem[]>([]);
  const [isCheckoutActive, setIsCheckoutActive] = useState<boolean>(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Delivery Addresses State (Saved addresses + modal)
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>(DEFAULT_SAVED_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(DEFAULT_SAVED_ADDRESSES[0].id);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null);

  // Logistics & Scheduling configuration
  const [logisticsConfig, setLogisticsConfig] = useState<DeliveryLogisticsConfig>({
    shippingTier: 'express_intermodal',
    vehicleType: '16_wheeler_multi_axle',
    deliverySlot: 'morning',
    preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    includeHamaliUnloading: true,
    requireMoistureKitTest: true,
    requireDigitalWeighbridgeSlip: true,
    specialInstructions: 'Gate No. 4 inward. Unload before 11 AM to prevent demurrage charges.',
  });

  // Compliance Details
  const [compliance, setCompliance] = useState<ComplianceDetails>({
    buyerGstin: currentUser.role === 'organisation' ? '06AAACI1681G1Z1' : '27AAACG9921M1Z5',
    apmcLicenseNo: 'APMC-MANDI-TRD-88210',
    eWayBillRequired: true,
    transitInsuranceOpted: true,
  });

  // Completed Transactions state & Tracking Modal
  const [lastCompletedOrders, setLastCompletedOrders] = useState<OrderTransaction[]>([]);
  const [trackingModalTransaction, setTrackingModalTransaction] = useState<OrderTransaction | null>(null);

  // Local card state
  const [lotQuantities, setLotQuantities] = useState<Record<string, number>>({});
  const [addedToast, setAddedToast] = useState<string | null>(null);
  const [copiedPhoneLotId, setCopiedPhoneLotId] = useState<string | null>(null);

  const handleCopyPhone = (lotId: string, phone: string) => {
    navigator.clipboard?.writeText(phone);
    setCopiedPhoneLotId(lotId);
    setTimeout(() => setCopiedPhoneLotId(null), 2000);
  };

  const selectedAddress = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];

  // Filter listings
  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      item.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.farmLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.farmerPhone && item.farmerPhone.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesGrade = selectedGrade === 'All' || item.grade.includes(selectedGrade);
    const matchesMoisture = item.moistureContent <= maxMoisture;
    const hasAvailableStock = item.availableQuantityTons > 0;
    return matchesSearch && matchesCategory && matchesGrade && matchesMoisture && hasAvailableStock;
  });

  const getQty = (listing: CropListing) => {
    return lotQuantities[listing.id] || listing.minOrderQuantityTons || 5;
  };

  const setQty = (listingId: string, val: number, min: number, max: number) => {
    const clamped = Math.max(min, Math.min(max, val));
    setLotQuantities((prev) => ({ ...prev, [listingId]: clamped }));
  };

  // Cart operations
  const handleAddToCart = (listing: CropListing) => {
    const qty = getQty(listing);

    setCartItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.listing.id === listing.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantityTons: qty,
        };
        return updated;
      }
      return [
        ...prev,
        {
          listing,
          quantityTons: qty,
          customPricePerTon: listing.pricePerTon,
          logisticsChoice: 'agridirect_freight',
        },
      ];
    });

    setAddedToast(`Added ${listing.cropName} (${qty} MT) to Procurement Batch`);
    setTimeout(() => setAddedToast(null), 2500);
  };

  const handleInstantBuy = (listing: CropListing) => {
    const qty = getQty(listing);

    const proceed = () => {
      setCartItems([
        {
          listing,
          quantityTons: qty,
          customPricePerTon: listing.pricePerTon,
          logisticsChoice: 'agridirect_freight',
        },
      ]);
      setIsCheckoutActive(true);
      setCheckoutStep(1);
    };

    if (!isAuthenticated) {
      onRequireAuth?.(proceed, `Please sign in or create an account to procure "${listing.cropName}" and execute e-NAM escrow payment.`);
      return;
    }

    proceed();
  };

  const handleUpdateCartQty = (listingId: string, newQty: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.listing.id === listingId
          ? { ...item, quantityTons: Math.max(item.listing.minOrderQuantityTons, Math.min(item.listing.availableQuantityTons, newQty)) }
          : item
      )
    );
  };

  const handleRemoveFromCart = (listingId: string) => {
    setCartItems((prev) => prev.filter((item) => item.listing.id !== listingId));
  };

  const handleSaveAddress = (address: DeliveryAddress) => {
    setSavedAddresses((prev) => {
      const exists = prev.some((a) => a.id === address.id);
      if (exists) {
        return prev.map((a) => (a.id === address.id ? address : a));
      }
      return [address, ...prev];
    });
    setSelectedAddressId(address.id);
  };

  // Calculations
  const totalCartTons = cartItems.reduce((acc, item) => acc + item.quantityTons, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.quantityTons * item.customPricePerTon), 0);
  
  // Logistics calculations based on tier
  const tierRatePerTon = 
    logisticsConfig.shippingTier === 'express_intermodal' ? 1200 :
    logisticsConfig.shippingTier === 'standard_consignment' ? 800 :
    logisticsConfig.shippingTier === 'farmer_direct' ? 650 : 0;
  
  const baseFreight = totalCartTons * tierRatePerTon;
  const freightDiscount = cartItems.length > 1 ? Math.round(baseFreight * 0.15) : 0;
  const netFreight = Math.max(0, baseFreight - freightDiscount);

  // Add-ons
  const hamaliFee = logisticsConfig.includeHamaliUnloading ? totalCartTons * 120 : 0;
  const moistureKitFee = logisticsConfig.requireMoistureKitTest ? 350 : 0;
  const totalAddonsFee = hamaliFee + moistureKitFee;

  const escrowFee = Math.round(cartSubtotal * 0.01);
  const cartGrandTotal = cartSubtotal + netFreight + totalAddonsFee + escrowFee;

  const fullDestinationAddressString = `${selectedAddress.companyName ? selectedAddress.companyName + ' - ' : ''}${selectedAddress.addressLine1}, ${selectedAddress.addressLine2 ? selectedAddress.addressLine2 + ', ' : ''}${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`;

  const handleCompleteOrders = (txns: OrderTransaction[]) => {
    // Enrich transactions with delivery details
    const enrichedTxns: OrderTransaction[] = txns.map((t) => ({
      ...t,
      deliveryAddress: selectedAddress,
      logisticsConfig: logisticsConfig,
      compliance: compliance,
      driverName: 'Gurpreet Singh',
      driverPhone: '+91 98765 43210',
      truckNumber: 'MH 12 QX 9821',
      eWayBillNumber: `8921 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
      trackingNumber: `AGRI-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
      estimatedDeliveryDate: logisticsConfig.preferredDate,
      currentCheckpoint: 'NH-48 Golden Quadrilateral Intermodal Corridor',
    }));

    setLastCompletedOrders(enrichedTxns);
    onOrderComplete(enrichedTxns);
    setCheckoutStep(5); // Show order confirmed & live tracker screen
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#233B2B] text-amber-200 px-4 py-3 rounded-xl shadow-xl border border-[#3E654B] flex items-center gap-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{addedToast}</span>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative bg-[#233B2B] text-[#FAF9F6] rounded-2xl p-6 sm:p-8 border border-[#37523E] shadow-sm overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center space-x-2 text-amber-200 text-xs font-semibold uppercase tracking-wider font-serif">
            <ShoppingBag className="w-4 h-4 text-amber-300" />
            <span>Direct Farmgate & APMC Mandi Procurement</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-extrabold tracking-tight text-white leading-tight">
            Procure Bulk Commodities with End-to-End Delivery & Escrow
          </h1>
          <p className="text-sm text-[#D0C8BB] leading-relaxed">
            Source standardized crop lots with guaranteed AGMARK quality reports, customize dedicated freight vehicles, schedule mill delivery slots, and execute 100% secure e-NAM bank escrow trade contracts.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[#A8A196]">
            <div className="flex items-center gap-1.5 bg-[#1B2F22] px-3 py-1.5 rounded-lg border border-[#3A5741]">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-white font-medium">Pan-India Delivery to Silos & Godowns</span>
            </div>
            <button
              type="button"
              id="live-gps-tracking-banner-btn"
              onClick={() => setTrackingModalTransaction(lastCompletedOrders[0] || INITIAL_TRANSACTIONS[0])}
              className="flex items-center gap-1.5 bg-[#1B2F22] hover:bg-[#253F2E] px-3 py-1.5 rounded-lg border border-[#3A5741] text-left transition cursor-pointer text-xs group"
            >
              <Radio className="w-4 h-4 text-amber-300 animate-pulse" />
              <span className="text-white font-medium">Live GPS Freight Tracking</span>
              <ArrowRight className="w-3 h-3 text-amber-200 group-hover:translate-x-0.5 transition" />
            </button>
            <div className="flex items-center gap-1.5 bg-[#1B2F22] px-3 py-1.5 rounded-lg border border-[#3A5741]">
              <ShieldCheck className="w-4 h-4 text-amber-200" />
              <span className="text-white font-medium">100% Escrow Vault Settlement</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Step Checkout Experience */}
      {isCheckoutActive ? (
        <div className="space-y-6">
          {/* Breadcrumb & Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E8E5DF]">
            <button
              type="button"
              id="back-to-catalog-btn"
              onClick={() => {
                if (checkoutStep > 1 && checkoutStep < 5) {
                  setCheckoutStep((prev) => (prev - 1) as any);
                } else {
                  setIsCheckoutActive(false);
                }
              }}
              className="text-xs font-bold text-[#2D4F38] hover:text-[#1C1C1C] flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{checkoutStep === 1 ? '← Back to Commodity Catalog' : '← Previous Step'}</span>
            </button>

            {/* Amazon-style Progress Stepper */}
            <div className="flex items-center gap-1.5 sm:gap-3 text-xs">
              <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${checkoutStep === 1 ? 'bg-[#233B2B] text-amber-200' : checkoutStep > 1 ? 'bg-[#EBF3ED] text-[#2D4F38]' : 'text-[#7A746B]'}`}>
                <span>1. Address</span>
              </span>
              <span className="text-[#D5CCBD]">›</span>
              <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${checkoutStep === 2 ? 'bg-[#233B2B] text-amber-200' : checkoutStep > 2 ? 'bg-[#EBF3ED] text-[#2D4F38]' : 'text-[#7A746B]'}`}>
                <span>2. Delivery & Schedule</span>
              </span>
              <span className="text-[#D5CCBD]">›</span>
              <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${checkoutStep === 3 ? 'bg-[#233B2B] text-amber-200' : checkoutStep > 3 ? 'bg-[#EBF3ED] text-[#2D4F38]' : 'text-[#7A746B]'}`}>
                <span>3. Compliance</span>
              </span>
              <span className="text-[#D5CCBD]">›</span>
              <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${checkoutStep === 4 ? 'bg-[#233B2B] text-amber-200' : checkoutStep > 4 ? 'bg-[#EBF3ED] text-[#2D4F38]' : 'text-[#7A746B]'}`}>
                <span>4. Payment</span>
              </span>
              <span className="text-[#D5CCBD]">›</span>
              <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${checkoutStep === 5 ? 'bg-[#233B2B] text-amber-200' : 'text-[#7A746B]'}`}>
                <span>5. Tracking</span>
              </span>
            </div>

            <div className="text-right font-mono text-xs">
              <span className="text-[#7A746B]">Consignment Total: </span>
              <strong className="text-[#233B2B] font-bold">₹{cartGrandTotal.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* STEP 1: Delivery Address & Destination Godown */}
          {checkoutStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 space-y-5 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E5DF] pb-4">
                    <div>
                      <h2 className="font-serif font-bold text-xl text-[#1C1C1C]">
                        Select Consignee Warehouse & Delivery Address
                      </h2>
                      <p className="text-xs text-[#5C554B] mt-0.5">
                        Choose where the freight carrier should unload your consignment
                      </p>
                    </div>

                    <button
                      type="button"
                      id="add-new-address-btn"
                      onClick={() => {
                        setEditingAddress(null);
                        setIsAddressModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-[#F4F1EA] hover:bg-[#EAE4D7] text-[#1C1C1C] rounded-xl text-xs font-semibold border border-[#D5CCBD] flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Godown / Mill Address</span>
                    </button>
                  </div>

                  {/* Saved Address Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-4 rounded-2xl border-2 transition cursor-pointer relative flex flex-col justify-between space-y-3 ${
                            isSelected
                              ? 'border-[#233B2B] bg-[#FAF9F6] shadow-sm'
                              : 'border-[#E8E5DF] bg-white hover:border-[#C6DFC9]'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2D4F38] bg-[#EBF3ED] px-2 py-0.5 rounded">
                                {addr.locationType}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-semibold">
                                  Default
                                </span>
                              )}
                            </div>

                            <h3 className="font-serif font-bold text-sm text-[#1C1C1C] mt-1">
                              {addr.label}
                            </h3>
                            {addr.companyName && (
                              <p className="text-xs font-semibold text-[#5C554B]">{addr.companyName}</p>
                            )}

                            <p className="text-xs text-[#5C554B] leading-relaxed">
                              {addr.addressLine1}, {addr.addressLine2 ? addr.addressLine2 + ', ' : ''}{addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                            </p>
                            <p className="text-[11px] text-[#7A746B]">
                              Landmark: {addr.landmark}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-[#F0ECE1] space-y-1 text-[11px] text-[#5C554B]">
                            <div className="flex items-center justify-between">
                              <span className="text-[#7A746B]">Gate Contact:</span>
                              <strong className="text-[#1C1C1C]">{addr.contactPerson}</strong>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[#7A746B]">Driver Phone:</span>
                              <span className="font-mono text-[#1C1C1C]">{addr.phoneNumber}</span>
                            </div>
                            {addr.gateTimings && (
                              <div className="flex items-center justify-between text-[10px] text-[#7A746B]">
                                <span>Receiving Hours:</span>
                                <span>{addr.gateTimings}</span>
                              </div>
                            )}
                          </div>

                          <div className="pt-2 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingAddress(addr);
                                setIsAddressModalOpen(true);
                              }}
                              className="text-[11px] text-[#2D4F38] hover:underline font-semibold"
                            >
                              Edit Address
                            </button>

                            <button
                              type="button"
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-[#233B2B] text-amber-200'
                                  : 'bg-[#F4F1EA] text-[#5C554B]'
                              }`}
                            >
                              {isSelected ? <Check className="w-3 h-3" /> : null}
                              <span>{isSelected ? 'Delivering Here' : 'Select'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Continue Button */}
                  <div className="pt-4 border-t border-[#E8E5DF] flex justify-end">
                    <button
                      type="button"
                      id="proceed-step2-btn"
                      onClick={() => setCheckoutStep(2)}
                      className="px-6 py-3 bg-[#C2593F] hover:bg-[#A84A33] text-white font-semibold rounded-xl text-xs transition flex items-center gap-2 shadow-xs border border-[#D97259]"
                    >
                      <span>Continue to Logistics & Scheduling</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Summary Column */}
              <div className="lg:col-span-4 space-y-6 sticky top-20">
                <OrderSummaryCard
                  cartItems={cartItems}
                  totalCartTons={totalCartTons}
                  cartSubtotal={cartSubtotal}
                  netFreight={netFreight}
                  totalAddonsFee={totalAddonsFee}
                  escrowFee={escrowFee}
                  cartGrandTotal={cartGrandTotal}
                  selectedAddress={selectedAddress}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Delivery Logistics & Fleet Scheduling */}
          {checkoutStep === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 space-y-6 shadow-xs">
                  <div className="border-b border-[#E8E5DF] pb-4">
                    <h2 className="font-serif font-bold text-xl text-[#1C1C1C]">
                      Freight Fleet Tier & Delivery Scheduling
                    </h2>
                    <p className="text-xs text-[#5C554B] mt-0.5">
                      Configure vehicle type, delivery time slot, and on-site hamali unloading preferences
                    </p>
                  </div>

                  {/* Shipping Tier Cards (Amazon style delivery speed) */}
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-[#5C554B] uppercase tracking-wider font-serif">
                      Select Freight & Transit Speed
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Tier 1: Express Intermodal */}
                      <div
                        onClick={() => setLogisticsConfig({ ...logisticsConfig, shippingTier: 'express_intermodal' })}
                        className={`p-4 rounded-2xl border-2 transition cursor-pointer space-y-2 ${
                          logisticsConfig.shippingTier === 'express_intermodal'
                            ? 'border-[#233B2B] bg-[#FAF9F6]'
                            : 'border-[#E8E5DF] bg-white hover:border-[#C6DFC9]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="bg-[#233B2B] text-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                            ⚡ EXPRESS INTERMODAL
                          </span>
                          <span className="font-mono text-xs font-bold text-[#1C1C1C]">₹1,200/MT</span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-[#1C1C1C]">
                          24 - 48 Hour Guaranteed Mandi Gate Delivery
                        </h4>
                        <p className="text-xs text-[#5C554B] leading-relaxed">
                          Dedicated multi-axle truck with live highway GPS tracking, real-time toll plaza updates, and zero transshipment risk.
                        </p>
                      </div>

                      {/* Tier 2: Standard Consignment */}
                      <div
                        onClick={() => setLogisticsConfig({ ...logisticsConfig, shippingTier: 'standard_consignment' })}
                        className={`p-4 rounded-2xl border-2 transition cursor-pointer space-y-2 ${
                          logisticsConfig.shippingTier === 'standard_consignment'
                            ? 'border-[#233B2B] bg-[#FAF9F6]'
                            : 'border-[#E8E5DF] bg-white hover:border-[#C6DFC9]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="bg-[#EBF3ED] text-[#2D4F38] px-2 py-0.5 rounded text-[10px] font-bold">
                            STANDARD CONSOLIDATED
                          </span>
                          <span className="font-mono text-xs font-bold text-[#1C1C1C]">₹800/MT</span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-[#1C1C1C]">
                          3 - 5 Business Days Delivery
                        </h4>
                        <p className="text-xs text-[#5C554B] leading-relaxed">
                          Consolidated freight for bulk orders with standard tarpaulin covering and verified weighbridge slips.
                        </p>
                      </div>

                      {/* Tier 3: Direct Farmer Dispatch */}
                      <div
                        onClick={() => setLogisticsConfig({ ...logisticsConfig, shippingTier: 'farmer_direct' })}
                        className={`p-4 rounded-2xl border-2 transition cursor-pointer space-y-2 ${
                          logisticsConfig.shippingTier === 'farmer_direct'
                            ? 'border-[#233B2B] bg-[#FAF9F6]'
                            : 'border-[#E8E5DF] bg-white hover:border-[#C6DFC9]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
                            FARMER / FPO LOCAL DISPATCH
                          </span>
                          <span className="font-mono text-xs font-bold text-[#1C1C1C]">₹650/MT</span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-[#1C1C1C]">
                          Farmer Self-Organized Transport
                        </h4>
                        <p className="text-xs text-[#5C554B] leading-relaxed">
                          Producer FPO arranges local tractor-trolley or regional transport directly to your mill gate.
                        </p>
                      </div>

                      {/* Tier 4: Self Pickup */}
                      <div
                        onClick={() => setLogisticsConfig({ ...logisticsConfig, shippingTier: 'buyer_pickup' })}
                        className={`p-4 rounded-2xl border-2 transition cursor-pointer space-y-2 ${
                          logisticsConfig.shippingTier === 'buyer_pickup'
                            ? 'border-[#233B2B] bg-[#FAF9F6]'
                            : 'border-[#E8E5DF] bg-white hover:border-[#C6DFC9]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="bg-[#F4F1EA] text-[#5C554B] px-2 py-0.5 rounded text-[10px] font-bold">
                            BUYER SELF PICKUP (EX-FARM)
                          </span>
                          <span className="font-mono text-xs font-bold text-[#2D4F38]">₹0 Free</span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-[#1C1C1C]">
                          Send Your Own Fleet / Trucks
                        </h4>
                        <p className="text-xs text-[#5C554B] leading-relaxed">
                          Farmer releases stock at farmgate / mandi godown upon e-Pass barcode presentation.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Slot Window */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#5C554B] mb-1 font-serif">
                        Preferred Arrival Date
                      </label>
                      <input
                        type="date"
                        value={logisticsConfig.preferredDate}
                        onChange={(e) => setLogisticsConfig({ ...logisticsConfig, preferredDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#D5CCBD] rounded-xl text-[#1C1C1C] focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5C554B] mb-1 font-serif">
                        Mill Gate Receiving Time Slot
                      </label>
                      <select
                        value={logisticsConfig.deliverySlot}
                        onChange={(e) => setLogisticsConfig({ ...logisticsConfig, deliverySlot: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#D5CCBD] rounded-xl text-[#1C1C1C] focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                      >
                        <option value="morning">Morning Slot (06:00 AM - 11:00 AM) - Fast Weighbridge</option>
                        <option value="afternoon">Afternoon Intake (12:00 PM - 04:00 PM) - Plant Conveyor</option>
                        <option value="evening">Night Commercial Entry (05:00 PM - 10:00 PM)</option>
                        <option value="flexible">24x7 Flexible Inward</option>
                      </select>
                    </div>
                  </div>

                  {/* Vehicle Type */}
                  <div>
                    <label className="block text-xs font-semibold text-[#5C554B] mb-1.5 font-serif">
                      Assigned Heavy Vehicle Class
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      {[
                        { id: '16_wheeler_multi_axle', label: '16-Wheeler Multi-Axle (25-40 MT)', tag: 'Recommended' },
                        { id: '10_wheeler_heavy', label: '10-Wheeler Tipper (15-25 MT)', tag: 'Standard' },
                        { id: 'eicher_14ft', label: '14-ft Eicher Canopy (5-10 MT)', tag: 'City Ramp' },
                      ].map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setLogisticsConfig({ ...logisticsConfig, vehicleType: v.id as any })}
                          className={`p-3 rounded-xl border text-left transition ${
                            logisticsConfig.vehicleType === v.id
                              ? 'bg-[#233B2B] text-amber-200 border-[#233B2B]'
                              : 'bg-white border-[#D5CCBD] text-[#4A453E] hover:bg-[#EFEBE3]'
                          }`}
                        >
                          <div className="font-bold text-xs">{v.label}</div>
                          <span className="text-[10px] opacity-80">{v.tag}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add-ons & Handling Services */}
                  <div className="bg-[#FAF6F0] border border-[#E8DFC8] rounded-2xl p-4 space-y-3 text-xs">
                    <div className="font-serif font-bold text-[#5C3224] flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-amber-700" />
                      <span>Unloading & Quality Verification Add-ons</span>
                    </div>

                    <div className="space-y-2.5">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={logisticsConfig.includeHamaliUnloading}
                          onChange={(e) => setLogisticsConfig({ ...logisticsConfig, includeHamaliUnloading: e.target.checked })}
                          className="mt-0.5 w-4 h-4 text-[#2D4F38] rounded border-[#D5CCBD] focus:ring-[#2D4F38]"
                        />
                        <div>
                          <strong className="text-[#1C1C1C] block">
                            Include On-Site Hamali / Labor Gang Unloading (₹120/MT • Total ₹{hamaliFee.toLocaleString('en-IN')})
                          </strong>
                          <span className="text-[#5C554B] text-[11px]">
                            KrishiQuant coordinates experienced mandi hamalis for manual stacking into your godown.
                          </span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={logisticsConfig.requireMoistureKitTest}
                          onChange={(e) => setLogisticsConfig({ ...logisticsConfig, requireMoistureKitTest: e.target.checked })}
                          className="mt-0.5 w-4 h-4 text-[#2D4F38] rounded border-[#D5CCBD] focus:ring-[#2D4F38]"
                        />
                        <div>
                          <strong className="text-[#1C1C1C] block">
                            On-Arrival Handheld Moisture & Impurity Quality Kit (₹350 flat)
                          </strong>
                          <span className="text-[#5C554B] text-[11px]">
                            Driver carries sealed test meter; test report recorded before hopper discharge.
                          </span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={logisticsConfig.requireDigitalWeighbridgeSlip}
                          onChange={(e) => setLogisticsConfig({ ...logisticsConfig, requireDigitalWeighbridgeSlip: e.target.checked })}
                          className="mt-0.5 w-4 h-4 text-[#2D4F38] rounded border-[#D5CCBD] focus:ring-[#2D4F38]"
                        />
                        <div>
                          <strong className="text-[#1C1C1C] block">
                            Digital Tare & Gross Weighbridge Slip Verification (Mandatory 100% Free)
                          </strong>
                          <span className="text-[#5C554B] text-[11px]">
                            Escrow funds are matched precisely against gross weighbridge minus tare weight slip.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Special Driver Instructions */}
                  <div>
                    <label className="block text-xs font-semibold text-[#5C554B] mb-1 font-serif">
                      Special Gate / Driver Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={logisticsConfig.specialInstructions}
                      onChange={(e) => setLogisticsConfig({ ...logisticsConfig, specialInstructions: e.target.value })}
                      placeholder="e.g. Enter via Gate 4 weighbridge scale; call yard manager upon arrival"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#D5CCBD] rounded-xl text-[#1C1C1C] focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="pt-4 border-t border-[#E8E5DF] flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep(1)}
                      className="px-5 py-2.5 rounded-xl border border-[#D5CCBD] text-xs font-semibold text-[#5C554B] hover:bg-[#EFEBE3] transition"
                    >
                      ← Back to Address
                    </button>
                    <button
                      type="button"
                      id="proceed-step3-btn"
                      onClick={() => setCheckoutStep(3)}
                      className="px-6 py-2.5 bg-[#C2593F] hover:bg-[#A84A33] text-white font-semibold rounded-xl text-xs transition flex items-center gap-2 shadow-xs border border-[#D97259]"
                    >
                      <span>Continue to Mandi & GST Compliance</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Summary Column */}
              <div className="lg:col-span-4 space-y-6 sticky top-20">
                <OrderSummaryCard
                  cartItems={cartItems}
                  totalCartTons={totalCartTons}
                  cartSubtotal={cartSubtotal}
                  netFreight={netFreight}
                  totalAddonsFee={totalAddonsFee}
                  escrowFee={escrowFee}
                  cartGrandTotal={cartGrandTotal}
                  selectedAddress={selectedAddress}
                />
              </div>
            </div>
          )}

          {/* STEP 3: Mandi & GST Regulatory Compliance */}
          {checkoutStep === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 space-y-6 shadow-xs">
                  <div className="border-b border-[#E8E5DF] pb-4">
                    <h2 className="font-serif font-bold text-xl text-[#1C1C1C]">
                      GST & APMC Mandi Regulatory Compliance
                    </h2>
                    <p className="text-xs text-[#5C554B] mt-0.5">
                      Ensure legal tax invoices, e-Way bills, and APMC trade clearance
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#5C554B] mb-1 font-serif">
                        Buyer GSTIN / Tax Identification
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={compliance.buyerGstin}
                          onChange={(e) => setCompliance({ ...compliance, buyerGstin: e.target.value.toUpperCase() })}
                          placeholder="e.g. 06AAACI1681G1Z1"
                          className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#D5CCBD] rounded-xl text-[#1C1C1C] font-mono uppercase focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-[#EBF3ED] text-[#2D4F38] text-[10px] font-bold px-2 py-0.5 rounded border border-[#C6DFC9]">
                          GSTIN Verified
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5C554B] mb-1 font-serif">
                        APMC Mandi License / e-NAM Trader Code
                      </label>
                      <input
                        type="text"
                        value={compliance.apmcLicenseNo}
                        onChange={(e) => setCompliance({ ...compliance, apmcLicenseNo: e.target.value })}
                        placeholder="e.g. APMC-MANDI-TRD-88210"
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#D5CCBD] rounded-xl text-[#1C1C1C] font-mono focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-[#FAF9F6] border border-[#E8E5DF] rounded-2xl p-4 space-y-3 text-xs">
                    <div className="font-serif font-bold text-[#1C1C1C] flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-[#2D4F38]" />
                      <span>Legal Protections Included with this Consignment</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-[#5C554B]">
                      <div className="bg-white p-3 rounded-xl border border-[#E8E5DF] space-y-1">
                        <strong className="text-[#1C1C1C] block">Automatic e-Way Bill Generation</strong>
                        <p>Part-A & Part-B generated synchronously with Transporter GSTIN for toll barrier clearance.</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-[#E8E5DF] space-y-1">
                        <strong className="text-[#1C1C1C] block">100% All-Risk Transit Insurance</strong>
                        <p>Underwritten by AIC / National Insurance covering rain spoilage, collision & spillage.</p>
                      </div>
                    </div>
                  </div>

                  {/* Sign-in Gate Notice if Unauthenticated */}
                  {!isAuthenticated && (
                    <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-amber-950 text-xs sm:text-sm">
                            Buyer Sign-In Required Before Order Placement
                          </h4>
                          <p className="text-[11px] text-amber-800">
                            To comply with e-NAM APMC regulations and release bank escrow tokens, please sign in or register before finalizing this transaction.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRequireAuth?.(() => setCheckoutStep(4), 'Please sign in or create an account to finalize your order & lock escrow payment.')}
                        className="px-4 py-2 bg-[#233B2B] hover:bg-[#1B2F22] text-amber-200 rounded-xl text-xs font-bold transition shadow-xs whitespace-nowrap"
                      >
                        Sign In / Register Now
                      </button>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="pt-4 border-t border-[#E8E5DF] flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep(2)}
                      className="px-5 py-2.5 rounded-xl border border-[#D5CCBD] text-xs font-semibold text-[#5C554B] hover:bg-[#EFEBE3] transition"
                    >
                      ← Back to Logistics
                    </button>
                    <button
                      type="button"
                      id="proceed-step4-btn"
                      onClick={() => {
                        if (!isAuthenticated) {
                          onRequireAuth?.(
                            () => setCheckoutStep(4), 
                            'Please sign in or register before placing orders and executing escrow contracts.'
                          );
                          return;
                        }
                        setCheckoutStep(4);
                      }}
                      className="px-6 py-2.5 bg-[#C2593F] hover:bg-[#A84A33] text-white font-semibold rounded-xl text-xs transition flex items-center gap-2 shadow-xs border border-[#D97259]"
                    >
                      <span>{isAuthenticated ? 'Proceed to Payment Gateway' : 'Sign In to Proceed to Payment'}</span>
                      <CreditCard className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Summary Column */}
              <div className="lg:col-span-4 space-y-6 sticky top-20">
                <OrderSummaryCard
                  cartItems={cartItems}
                  totalCartTons={totalCartTons}
                  cartSubtotal={cartSubtotal}
                  netFreight={netFreight}
                  totalAddonsFee={totalAddonsFee}
                  escrowFee={escrowFee}
                  cartGrandTotal={cartGrandTotal}
                  selectedAddress={selectedAddress}
                />
              </div>
            </div>
          )}

          {/* STEP 4: Secure Escrow Payment Gateway */}
          {checkoutStep === 4 && (
            <div className="space-y-6">
              <PaymentGateway
                items={cartItems}
                currentUser={currentUser}
                destinationAddress={fullDestinationAddressString}
                onPaymentSuccess={handleCompleteOrders}
                onCancel={() => setCheckoutStep(3)}
              />
            </div>
          )}

          {/* STEP 5: Amazon-Style Order Placed & Live Tracking */}
          {checkoutStep === 5 && lastCompletedOrders.length > 0 && (
            <div className="space-y-6">
              {/* Success Banner */}
              <div className="bg-[#EBF3ED] border border-[#C6DFC9] rounded-2xl p-6 sm:p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white border border-[#C6DFC9] text-[#2D4F38] mx-auto flex items-center justify-center shadow-xs animate-bounce">
                  <CheckCircle2 className="w-10 h-10 text-[#2D4F38]" />
                </div>
                <div>
                  <span className="text-xs font-mono text-[#2D4F38] uppercase font-bold tracking-wider">
                    e-NAM Escrow Settlement Confirmed
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1C1C] mt-1">
                    Procurement Order Placed Successfully!
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5C554B] max-w-xl mx-auto mt-2 leading-relaxed">
                    Your payment of <strong>₹{cartGrandTotal.toLocaleString('en-IN')}</strong> is safely locked in the <strong>KrishiQuant Escrow Trust Account</strong>. The seller FPOs and dedicated intermodal carriers have received automated dispatch clearance.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setTrackingModalTransaction(lastCompletedOrders[0])}
                    className="px-5 py-2.5 bg-[#233B2B] hover:bg-[#1B2F22] text-amber-200 rounded-xl text-xs font-semibold transition border border-[#3E5C47] shadow-xs flex items-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Open Live Consignment GPS Map Tracker</span>
                  </button>

                  <button
                    type="button"
                    onClick={onSwitchToDashboard}
                    className="px-5 py-2.5 bg-white hover:bg-[#FAF9F6] text-[#1C1C1C] rounded-xl text-xs font-semibold transition border border-[#D5CCBD] shadow-xs flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4 text-[#2D4F38]" />
                    <span>View in Trade & Escrow Vault Dashboard</span>
                  </button>
                </div>
              </div>

              {/* Order Consignment Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {lastCompletedOrders.map((ord) => (
                  <div key={ord.id} className="bg-white border border-[#E8E5DF] rounded-2xl p-5 space-y-4 shadow-xs">
                    <div className="flex justify-between items-start border-b border-[#E8E5DF] pb-3">
                      <div>
                        <span className="text-[10px] text-[#7A746B] font-mono uppercase block">Order ID</span>
                        <h4 className="font-serif font-bold text-base text-[#1C1C1C]">#{ord.id}</h4>
                        <span className="text-xs text-[#5C554B]">{ord.cropName} ({ord.quantityTons} MT)</span>
                      </div>
                      <span className="px-2.5 py-1 bg-[#EBF3ED] text-[#233B2B] text-xs font-bold rounded-lg border border-[#C6DFC9]">
                        {ord.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-[#5C554B]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#7A746B]">Farmer / FPO:</span>
                        <strong className="text-[#1C1C1C]">{ord.sellerName}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#7A746B]">Dedicated Truck:</span>
                        <span className="font-mono font-bold text-[#1C1C1C]">{ord.truckNumber || 'MH 12 QX 9821'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#7A746B]">Assigned Driver:</span>
                        <span>{ord.driverName || 'Gurpreet Singh'} ({ord.driverPhone || '+91 98765 43210'})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#7A746B]">Destination:</span>
                        <span className="truncate max-w-[200px]">{ord.destination}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E8E5DF] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setTrackingModalTransaction(ord)}
                        className="text-xs text-[#2D4F38] hover:underline font-bold flex items-center gap-1"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Track Live Checkpoints</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="text-xs text-[#7A746B] hover:text-[#1C1C1C] flex items-center gap-1 font-semibold"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Bill</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Start new procurement button */}
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setCartItems([]);
                    setIsCheckoutActive(false);
                    setCheckoutStep(1);
                  }}
                  className="text-xs font-bold text-[#2D4F38] hover:underline"
                >
                  ← Return to Commodity Catalog & Procure More Lots
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Standard Procurement View: Lot Catalog + Floating / Inline Cart Drawer */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Column: Filters and Lot Cards */}
          <div className="lg:col-span-8 space-y-6">
            {/* Search and Category Filter Toolbar */}
            <div className="bg-[#FAF9F6] border border-[#E8E5DF] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A746B]" />
                  <input
                    type="text"
                    id="buying-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search crops, basmati varieties, FPO name, or APMC mandi location..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D5CCBD] rounded-xl text-xs text-[#1C1C1C] placeholder-[#8A847A] focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="px-3 py-2.5 bg-white border border-[#D5CCBD] rounded-xl text-xs text-[#1C1C1C] focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                  >
                    <option value="All">All AGMARK Grades</option>
                    <option value="Export">Export Grade (APEDA)</option>
                    <option value="Premium">Grade A Premium</option>
                    <option value="Organic">Organic Certified (NPOP)</option>
                    <option value="Special">AGMARK Special</option>
                  </select>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
                      selectedCategory === cat.value
                        ? 'bg-[#233B2B] text-white shadow-xs'
                        : 'bg-white border border-[#E8E5DF] text-[#5C554B] hover:bg-[#EFEBE3]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between text-xs text-[#7A746B] px-1">
              <span>Showing <strong>{filteredListings.length}</strong> available agricultural commodity lots</span>
              <span className="font-mono text-[11px]">Direct Farmgate Quotes</span>
            </div>

            {/* Lot Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filteredListings.map((listing) => {
                const currentQty = getQty(listing);
                const isAlreadyInCart = cartItems.some((item) => item.listing.id === listing.id);

                const itemSubtotal = currentQty * listing.pricePerTon;
                const ratePerQuintal = Math.round(listing.pricePerTon / 10);

                return (
                  <div
                    key={listing.id}
                    className="bg-white border border-[#E8E5DF] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                  >
                    {/* Image & Badges */}
                    <div className="relative h-44 bg-[#EFEBE3] overflow-hidden">
                      <img
                        src={listing.imageUrl}
                        alt={listing.cropName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                        <span className="bg-[#233B2B]/90 backdrop-blur-xs text-amber-200 border border-[#3E5C47] text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {listing.grade}
                        </span>
                        <span className="bg-white/90 backdrop-blur-xs text-[#233B2B] font-semibold text-[10px] px-2 py-0.5 rounded-md border border-[#D5CCBD]">
                          Moisture: {listing.moistureContent}%
                        </span>
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 bg-[#FAF9F6]/95 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-[#D5CCBD] text-right shadow-xs">
                        <span className="text-[10px] text-[#7A746B] block leading-none font-mono">Available</span>
                        <span className="text-xs font-mono font-bold text-[#1C1C1C]">
                          {listing.availableQuantityTons} MT
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-1 text-[11px] text-[#7A746B] mb-1">
                          <MapPin className="w-3 h-3 text-[#2D4F38]" />
                          <span className="truncate">{listing.farmLocation}</span>
                        </div>
                        <h3 className="text-base font-serif font-bold text-[#1C1C1C] line-clamp-1 group-hover:text-[#233B2B] transition">
                          {listing.cropName}
                        </h3>
                        <p className="text-xs text-[#5C554B] line-clamp-2 mt-1 leading-relaxed">
                          {listing.description}
                        </p>

                        <div className="mt-2.5 pt-2 border-t border-[#F0ECE1] flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-[#7A746B] block font-mono">PRODUCER / FPO</span>
                            <span className="font-semibold text-[#1C1C1C]">{listing.farmerName}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-[#7A746B] block font-mono">DISPATCH STATUS</span>
                            <span className="text-[#2D4F38] font-medium text-[11px] bg-[#EBF3ED] px-2 py-0.5 rounded">
                              {listing.readyStatus}
                            </span>
                          </div>
                        </div>

                        {/* Direct Offline Contact with Farmer */}
                        <div className="mt-2 bg-[#FAF9F6] border border-[#E3DACD] rounded-xl p-2.5 space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-[#5C554B] uppercase tracking-wider font-semibold font-mono flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#2D4F38]" />
                              Direct Farmer Contact (Offline)
                            </span>
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                              Direct Call OK
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
                                className="inline-flex items-center gap-1 px-2 py-1 bg-[#2D4F38] hover:bg-[#1E3727] text-white text-[10px] font-semibold rounded-lg shadow-xs transition"
                                title="Call Farmer Directly"
                              >
                                <PhoneCall className="w-3 h-3 text-amber-200" />
                                <span>Call</span>
                              </a>

                              <a
                                href={`https://wa.me/${(listing.farmerPhone || '+91 98124 56781').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Namaste, I saw your ${listing.cropName} (${listing.availableQuantityTons} MT) listed on KrishiQuant and want to connect offline regarding inspection and direct dealing.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#1B5E20] border border-[#A5D6A7] text-[10px] font-semibold rounded-lg transition"
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pricing block */}
                      <div className="bg-[#FAF9F6] border border-[#E8E5DF] rounded-xl p-3 space-y-2">
                        <div className="flex justify-between items-baseline">
                          <div>
                            <span className="text-[10px] text-[#7A746B] block font-mono">MANDI RATE</span>
                            <div className="text-lg font-serif font-bold text-[#233B2B] font-mono">
                              ₹{listing.pricePerTon.toLocaleString('en-IN')}
                              <span className="text-xs font-normal text-[#5C554B] font-sans"> / MT</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] font-mono font-semibold text-[#8C4A32]">
                              ₹{ratePerQuintal.toLocaleString('en-IN')}/Qtl
                            </span>
                            <span className="text-[10px] text-[#7A746B] block font-mono">
                              MOQ: {listing.minOrderQuantityTons} MT
                            </span>
                          </div>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center justify-between pt-1 border-t border-[#E8E5DF]">
                          <span className="text-xs font-semibold text-[#5C554B]">Order Quantity:</span>
                          <div className="flex items-center space-x-1.5">
                            <button
                              type="button"
                              onClick={() => setQty(listing.id, currentQty - 5, listing.minOrderQuantityTons, listing.availableQuantityTons)}
                              className="w-7 h-7 bg-white border border-[#D5CCBD] rounded-lg text-xs font-bold text-[#1C1C1C] hover:bg-[#EFEBE3] flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="font-mono text-xs font-bold px-2 text-[#1C1C1C]">
                              {currentQty} MT
                            </span>
                            <button
                              type="button"
                              onClick={() => setQty(listing.id, currentQty + 5, listing.minOrderQuantityTons, listing.availableQuantityTons)}
                              className="w-7 h-7 bg-white border border-[#D5CCBD] rounded-lg text-xs font-bold text-[#1C1C1C] hover:bg-[#EFEBE3] flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Estimated subtotal */}
                        <div className="flex justify-between text-[11px] text-[#5C554B] pt-1">
                          <span>Lot Subtotal:</span>
                          <strong className="text-[#1C1C1C] font-mono">
                            ₹{itemSubtotal.toLocaleString('en-IN')}
                          </strong>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          id={`add-cart-btn-${listing.id}`}
                          onClick={() => handleAddToCart(listing)}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold transition border flex items-center justify-center gap-1.5 ${
                            isAlreadyInCart
                              ? 'bg-[#EBF3ED] text-[#233B2B] border-[#C6DFC9]'
                              : 'bg-[#F4F1EA] hover:bg-[#EAE4D7] text-[#1C1C1C] border-[#D5CCBD]'
                          }`}
                        >
                          {isAlreadyInCart ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#2D4F38]" />
                              <span>In Batch ({currentQty} MT)</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add to Batch</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          id={`instant-buy-btn-${listing.id}`}
                          onClick={() => handleInstantBuy(listing)}
                          className="py-2 px-3 bg-[#C2593F] hover:bg-[#A84A33] text-white font-semibold rounded-xl text-xs transition border border-[#D97259] flex items-center justify-center gap-1 shadow-xs"
                        >
                          <span>Direct Buy</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* AI Negotiator helper link */}
                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => onOpenNegotiator(listing)}
                          className="text-[11px] text-[#2D4F38] hover:underline font-semibold inline-flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>Negotiate Volume Discount with AI</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Procurement Batch / Mandi Cart Summary */}
          <div className="lg:col-span-4 space-y-6 sticky top-20">
            <div className="bg-[#FAF9F6] border border-[#E8E5DF] rounded-2xl p-5 space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-[#233B2B] text-amber-200 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#1C1C1C]">Procurement Batch</h3>
                    <span className="text-[10px] text-[#7A746B] block">
                      {cartItems.length} {cartItems.length === 1 ? 'Commodity' : 'Commodities'} Selected
                    </span>
                  </div>
                </div>

                {cartItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCartItems([])}
                    className="text-[11px] text-[#C2593F] hover:underline font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-8 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#EFEBE3] text-[#7A746B] mx-auto flex items-center justify-center">
                    <Layers className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-[#5C554B]">
                    Your procurement batch is currently empty. Add lots from the catalog or click <strong>Direct Buy</strong> on any commodity card.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cart Items List */}
                  <div className="divide-y divide-[#EFEBE3] max-h-64 overflow-y-auto pr-1">
                    {cartItems.map((item) => (
                      <div key={item.listing.id} className="py-3 space-y-1.5 text-xs">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0 pr-2">
                            <strong className="font-serif font-bold text-[#1C1C1C] block truncate">
                              {item.listing.cropName}
                            </strong>
                            <span className="text-[10px] text-[#7A746B] block">
                              {item.listing.farmerName} • {item.listing.grade}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(item.listing.id)}
                            className="text-[#8A847A] hover:text-[#C2593F] p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center space-x-1.5">
                            <input
                              type="number"
                              min={item.listing.minOrderQuantityTons}
                              max={item.listing.availableQuantityTons}
                              value={item.quantityTons}
                              onChange={(e) => handleUpdateCartQty(item.listing.id, Number(e.target.value))}
                              className="w-16 px-2 py-1 text-xs bg-white border border-[#D5CCBD] rounded font-mono"
                            />
                            <span className="text-[11px] text-[#5C554B] font-mono">MT</span>
                          </div>
                          <div className="text-right">
                            <strong className="font-mono text-[#2D4F38] text-xs">
                              ₹{(item.quantityTons * item.customPricePerTon).toLocaleString('en-IN')}
                            </strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Destination Warehouse quick card */}
                  <div className="pt-2 border-t border-[#E8E5DF] space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-[#5C554B]">
                      <span className="font-serif">Delivery Warehouse:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCheckoutActive(true);
                          setCheckoutStep(1);
                        }}
                        className="text-[11px] text-[#2D4F38] hover:underline"
                      >
                        Change Godown
                      </button>
                    </div>
                    <div className="bg-white border border-[#D5CCBD] rounded-xl p-3 text-xs">
                      <strong className="block text-[#1C1C1C] font-serif">{selectedAddress.label}</strong>
                      <p className="text-[11px] text-[#5C554B] truncate mt-0.5">{selectedAddress.addressLine1}, {selectedAddress.city}</p>
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="bg-white border border-[#E8E5DF] rounded-xl p-3.5 space-y-2 text-xs text-[#5C554B]">
                    <div className="flex justify-between">
                      <span>Total Volume:</span>
                      <strong className="font-mono text-[#1C1C1C]">{totalCartTons} Metric Tons</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Commodity Subtotal:</span>
                      <span className="font-mono text-[#1C1C1C]">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Logistics & Freight:</span>
                      <span className="font-mono text-[#1C1C1C]">₹{netFreight.toLocaleString('en-IN')}</span>
                    </div>
                    {freightDiscount > 0 && (
                      <div className="flex justify-between text-[#2D4F38] font-medium text-[11px]">
                        <span>Multi-Lot Consolidation Discount:</span>
                        <span className="font-mono">-₹{freightDiscount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>e-NAM Escrow & AGMARK Lab (1%):</span>
                      <span className="font-mono text-[#1C1C1C]">₹{escrowFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t border-[#E8E5DF] pt-2 flex justify-between font-bold text-sm text-[#1C1C1C]">
                      <span className="font-serif">Grand Total (Escrow):</span>
                      <span className="text-[#2D4F38] font-mono">₹{cartGrandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <button
                    type="button"
                    id="proceed-checkout-stepper-btn"
                    onClick={() => {
                      if (!isAuthenticated) {
                        onRequireAuth?.(() => {
                          setIsCheckoutActive(true);
                          setCheckoutStep(1);
                        }, 'Please sign in or create an account to start your bulk procurement checkout.');
                        return;
                      }
                      setIsCheckoutActive(true);
                      setCheckoutStep(1);
                    }}
                    className="w-full py-3 px-4 bg-[#C2593F] hover:bg-[#A84A33] text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-xs border border-[#D97259]"
                  >
                    <CreditCard className="w-4 h-4 text-amber-200" />
                    <span>Proceed to Delivery & Checkout (₹{cartGrandTotal.toLocaleString('en-IN')})</span>
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#7A746B]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2D4F38]" />
                    <span>Funds held securely in e-NAM Escrow Trust</span>
                  </div>
                </div>
              )}
            </div>

            {/* Buyer Trust Guarantees */}
            <div className="bg-[#EBF3ED] border border-[#C6DFC9] rounded-2xl p-4 space-y-2.5 text-xs text-[#233B2B]">
              <div className="flex items-center gap-1.5 font-bold font-serif">
                <FileCheck className="w-4 h-4 text-[#2D4F38]" />
                <span>Buyer Protection Mandate</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-[#5C554B]">
                <li>• <strong>Doorstep Weighbridge Sync:</strong> Tare & gross weight verified on your mill scale.</li>
                <li>• <strong>Standardized Quality:</strong> AGMARK Lab moisture test certificate provided before dispatch.</li>
                <li>• <strong>Escrow Settlement:</strong> Farmer paid only upon truck weighbridge clearance at destination.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Address Create / Edit Modal */}
      <DeliveryAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setEditingAddress(null);
        }}
        onSaveAddress={handleSaveAddress}
        initialAddress={editingAddress}
      />

      {/* Interactive Live Tracking Modal */}
      <OrderTrackingModal
        isOpen={!!trackingModalTransaction}
        onClose={() => setTrackingModalTransaction(null)}
        transaction={trackingModalTransaction}
      />
    </div>
  );
};

// Reusable Side Summary Card for Checkout Stepper
interface OrderSummaryCardProps {
  cartItems: ProcurementCartItem[];
  totalCartTons: number;
  cartSubtotal: number;
  netFreight: number;
  totalAddonsFee: number;
  escrowFee: number;
  cartGrandTotal: number;
  selectedAddress: DeliveryAddress;
}

const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  cartItems,
  totalCartTons,
  cartSubtotal,
  netFreight,
  totalAddonsFee,
  escrowFee,
  cartGrandTotal,
  selectedAddress,
}) => {
  return (
    <div className="bg-[#FAF9F6] border border-[#E8E5DF] rounded-2xl p-5 space-y-4 shadow-sm text-xs text-[#1C1C1C]">
      <div className="border-b border-[#E8E5DF] pb-3">
        <h3 className="font-serif font-bold text-base text-[#1C1C1C]">Consignment Summary</h3>
        <span className="text-[10px] text-[#7A746B]">
          {cartItems.length} {cartItems.length === 1 ? 'Commodity Lot' : 'Commodity Lots'} • {totalCartTons} MT Total
        </span>
      </div>

      <div className="divide-y divide-[#EFEBE3] max-h-48 overflow-y-auto">
        {cartItems.map((item) => (
          <div key={item.listing.id} className="py-2 flex justify-between items-baseline">
            <div>
              <span className="font-serif font-semibold text-[#1C1C1C] block truncate max-w-[170px]">
                {item.listing.cropName}
              </span>
              <span className="text-[10px] text-[#7A746B]">{item.quantityTons} MT @ ₹{item.customPricePerTon.toLocaleString('en-IN')}/MT</span>
            </div>
            <span className="font-mono font-bold text-[#1C1C1C]">
              ₹{(item.quantityTons * item.customPricePerTon).toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-[#E8E5DF] space-y-1.5 text-[#5C554B]">
        <div className="flex justify-between">
          <span>Commodity Base Price:</span>
          <span className="font-mono text-[#1C1C1C]">₹{cartSubtotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between">
          <span>Freight & Heavy Transport:</span>
          <span className="font-mono text-[#1C1C1C]">₹{netFreight.toLocaleString('en-IN')}</span>
        </div>
        {totalAddonsFee > 0 && (
          <div className="flex justify-between">
            <span>Hamali Unloading & Quality Kit:</span>
            <span className="font-mono text-[#1C1C1C]">₹{totalAddonsFee.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>1% e-NAM Escrow Vault Fee:</span>
          <span className="font-mono text-[#1C1C1C]">₹{escrowFee.toLocaleString('en-IN')}</span>
        </div>
        <div className="border-t border-[#E8E5DF] pt-2 flex justify-between font-bold text-sm text-[#1C1C1C]">
          <span className="font-serif">Total Consignment Cost:</span>
          <span className="text-[#2D4F38] font-mono">₹{cartGrandTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="bg-white border border-[#E8E5DF] rounded-xl p-3 space-y-1">
        <div className="flex items-center gap-1 text-[11px] font-bold text-[#233B2B] font-serif">
          <MapPin className="w-3.5 h-3.5" />
          <span>Delivering to: {selectedAddress.label}</span>
        </div>
        <p className="text-[10px] text-[#7A746B] leading-tight">
          {selectedAddress.addressLine1}, {selectedAddress.city} ({selectedAddress.pincode})
        </p>
      </div>
    </div>
  );
};
