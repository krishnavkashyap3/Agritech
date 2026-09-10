import React, { useState, useEffect } from 'react';
import { 
  CropListing, 
  UserProfile, 
  OrderTransaction, 
  DeliveryAddress, 
  DeliveryLogisticsConfig,
  PaymentChannel 
} from '../types';
import { DEFAULT_SAVED_ADDRESSES } from '../data/mockData';
import { 
  X, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  FileText, 
  ArrowRight, 
  ArrowLeft, 
  Download, 
  Printer, 
  Sparkles, 
  MapPin, 
  Building, 
  Phone, 
  PhoneCall,
  MessageSquare,
  Clock, 
  Calendar, 
  Droplets, 
  Award, 
  Check, 
  Copy, 
  QrCode, 
  CreditCard, 
  Landmark, 
  Wallet, 
  Smartphone, 
  Lock, 
  AlertCircle, 
  Plus, 
  FileCheck, 
  Receipt,
  Share2,
  Tractor
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: CropListing | null;
  currentUser: UserProfile;
  initialQuantityTons?: number;
  initialPricePerTon?: number;
  onCompleteOrder: (transaction: OrderTransaction) => void;
  onTrackOrder?: (transaction: OrderTransaction) => void;
}

const INDIAN_BANKS = [
  { id: 'sbi', name: 'State Bank of India (SBI Corporate)', logo: '🏛️', ifscPrefix: 'SBIN' },
  { id: 'hdfc', name: 'HDFC Bank Corporate NetBanking', logo: '🏦', ifscPrefix: 'HDFC' },
  { id: 'icici', name: 'ICICI Bank Corporate & B2B', logo: '💳', ifscPrefix: 'ICIC' },
  { id: 'axis', name: 'Axis Bank Corporate Direct', logo: '🏢', ifscPrefix: 'UTIB' },
  { id: 'pnb', name: 'Punjab National Bank (PNB e-Mandi)', logo: '🌾', ifscPrefix: 'PUNB' },
  { id: 'bob', name: 'Bank of Baroda Agri-Enterprise', logo: '🪙', ifscPrefix: 'BARB' },
  { id: 'kotak', name: 'Kotak Mahindra Corporate', logo: '🏛️', ifscPrefix: 'KKBK' },
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  listing,
  currentUser,
  initialQuantityTons,
  initialPricePerTon,
  onCompleteOrder,
  onTrackOrder,
}) => {
  // Step state: 1 = Confirm Buying Details, 2 = Address Selection, 3 = Escrow Payment, 4 = Order Confirmed
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Buying Details State
  const [quantity, setQuantity] = useState<number>(
    initialQuantityTons || listing?.minOrderQuantityTons || 10
  );
  const [pricePerTon, setPricePerTon] = useState<number>(
    initialPricePerTon || listing?.pricePerTon || 0
  );
  const [logisticsChoice, setLogisticsChoice] = useState<'agridirect_freight' | 'farmer_delivery' | 'buyer_pickup'>('agridirect_freight');

  // Step 2: Delivery Address & Logistics Configuration
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>(DEFAULT_SAVED_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(DEFAULT_SAVED_ADDRESSES[0].id);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState<boolean>(false);
  const [newAddrLabel, setNewAddrLabel] = useState<string>('');
  const [newConsigneeName, setNewConsigneeName] = useState<string>(currentUser.name || 'Procurement Incharge');
  const [newCompanyName, setNewCompanyName] = useState<string>(currentUser.orgName || 'Enterprise Agro Ltd.');
  const [newContactPerson, setNewContactPerson] = useState<string>('Gate Receiving Officer');
  const [newPhone, setNewPhone] = useState<string>(currentUser.phone || '+91 98765 43210');
  const [newAddressLine1, setNewAddressLine1] = useState<string>('Plot 12, Agro Industrial Park, National Highway 44');
  const [newCity, setNewCity] = useState<string>('Sonepat');
  const [newState, setNewState] = useState<string>('Haryana');
  const [newPincode, setNewPincode] = useState<string>('131028');
  const [newLocationType, setNewLocationType] = useState<DeliveryAddress['locationType']>('Processing Plant / Mill');

  // Delivery Scheduling
  const [preferredDate, setPreferredDate] = useState<string>(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [deliverySlot, setDeliverySlot] = useState<'morning' | 'afternoon' | 'evening' | 'flexible'>('morning');
  const [specialInstructions, setSpecialInstructions] = useState<string>(
    'Gate No. 4 inward. Unload before 11 AM to prevent demurrage. Weighbridge tare slip required.'
  );

  // Step 3: Payment Gateway State
  const [selectedPaymentChannel, setSelectedPaymentChannel] = useState<PaymentChannel>('UPI_QR');
  const [vpaInput, setVpaInput] = useState<string>(
    currentUser.role === 'organisation' ? 'procurement@itcagri.okhdfcbank' : 'buyer@upi'
  );
  const [vpaVerified, setVpaVerified] = useState<boolean>(false);
  const [vpaVerifying, setVpaVerifying] = useState<boolean>(false);
  const [selectedBank, setSelectedBank] = useState<string>('sbi');
  const [corpUserId, setCorpUserId] = useState<string>('CORP-AGRI-88421');
  const [authOtp, setAuthOtp] = useState<string>('749210');
  const [virtualUtr, setVirtualUtr] = useState<string>('SBIN20260831' + Math.floor(100000 + Math.random() * 900000));
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState<string>('4532 8901 4452 9814');
  const [cardExpiry, setCardExpiry] = useState<string>('08/29');
  const [cardCvv, setCardCvv] = useState<string>('481');
  const [cardName, setCardName] = useState<string>(currentUser.name);
  const [timerSeconds, setTimerSeconds] = useState<number>(180);

  // Processing & Confirmation State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStepText, setProcessingStepText] = useState<string>('');
  const [createdTxn, setCreatedTxn] = useState<OrderTransaction | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [eWayBillNumber, setEWayBillNumber] = useState<string>('');

  // Calculations
  const subtotal = quantity * pricePerTon;
  const logisticsRatePerTon = logisticsChoice === 'agridirect_freight' ? 1200 : logisticsChoice === 'farmer_delivery' ? 800 : 0;
  const logisticsFee = quantity * logisticsRatePerTon;
  const escrowInspectionFee = Math.round(subtotal * 0.01); // 1% e-NAM escrow & AGMARK quality inspection guarantee
  const totalAmount = subtotal + logisticsFee + escrowInspectionFee;

  // Selected address object
  const selectedAddress = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];

  // Timer for UPI QR
  useEffect(() => {
    if (currentStep !== 3 || timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentStep, timerSeconds]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddr: DeliveryAddress = {
      id: `addr-${Date.now()}`,
      label: newAddrLabel.trim() || `${newCity} ${newLocationType}`,
      consigneeName: newConsigneeName,
      companyName: newCompanyName,
      contactPerson: newContactPerson,
      phoneNumber: newPhone,
      addressLine1: newAddressLine1,
      landmark: 'Near Industrial Gate',
      city: newCity,
      state: newState,
      pincode: newPincode,
      locationType: newLocationType,
      isDefault: false,
      gateTimings: '24x7 Inward with Weighbridge Operational',
      unloadingRestrictions: 'Heavy Multi-Axle Trucks Permitted',
    };
    setSavedAddresses([newAddr, ...savedAddresses]);
    setSelectedAddressId(newAddr.id);
    setIsAddingNewAddress(false);
  };

  const handleExecutePayment = () => {
    setIsProcessing(true);
    setProcessingStepText('Initiating 256-bit Secure Handshake with Reserve Bank of India Settlement Network...');

    setTimeout(() => {
      setProcessingStepText('Locking Funds into e-NAM KrishiQuant Escrow Trust Vault...');
    }, 900);

    setTimeout(() => {
      setProcessingStepText('Generating AGMARK Digital Transit Certificate & Electronic Waybill...');
    }, 1800);

    setTimeout(() => {
      const generatedTxnId = `TXN-IN-${Math.floor(100000 + Math.random() * 900000)}`;
      const generatedInvoiceNo = `INV/2026-27/AGRI-${Math.floor(100000 + Math.random() * 900000)}`;
      const generatedEwb = `EWB-8849-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      const generatedUtr = virtualUtr || `UTIB20260831${Math.floor(100000 + Math.random() * 900000)}`;

      const newTxn: OrderTransaction = {
        id: generatedTxnId,
        listingId: listing.id,
        cropName: listing.cropName,
        sellerId: listing.farmerId,
        sellerName: listing.farmerName,
        buyerId: currentUser.id,
        buyerName: currentUser.orgName || currentUser.name,
        buyerRole: currentUser.role,
        quantityTons: quantity,
        pricePerTon: pricePerTon,
        totalAmount: totalAmount,
        status: 'Escrow Locked',
        logisticsPartner: logisticsChoice === 'agridirect_freight' ? 'KrishiQuant Intermodal Logistics' : logisticsChoice === 'farmer_delivery' ? 'Farmer Mandi Transport' : 'Buyer Dedicated Fleet',
        destination: `${selectedAddress.addressLine1}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        paymentMethod: selectedPaymentChannel,
        invoiceNumber: generatedInvoiceNo,
        utrReference: generatedUtr,
        eWayBillNumber: generatedEwb,
        trackingNumber: `AGRI-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
        estimatedDeliveryDate: preferredDate,
        currentCheckpoint: `${listing.farmLocation} (Mandi Weighbridge Stage)`,
        deliveryAddress: selectedAddress,
        logisticsConfig: {
          shippingTier: logisticsChoice === 'agridirect_freight' ? 'express_intermodal' : logisticsChoice === 'farmer_delivery' ? 'farmer_direct' : 'buyer_pickup',
          vehicleType: '16_wheeler_multi_axle',
          deliverySlot: deliverySlot,
          preferredDate: preferredDate,
          includeHamaliUnloading: true,
          requireMoistureKitTest: true,
          requireDigitalWeighbridgeSlip: true,
          specialInstructions: specialInstructions,
        },
      };

      setInvoiceNumber(generatedInvoiceNo);
      setEWayBillNumber(generatedEwb);
      setCreatedTxn(newTxn);
      setIsProcessing(false);
      setCurrentStep(4);
      onCompleteOrder(newTxn);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.55 },
        });
      } catch {
        // ignore
      }
    }, 2800);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleDownloadSlip = () => {
    if (!createdTxn) return;
    const content = `=====================================================
KRISHIQUANT COMMODITY EXCHANGE
OFFICIAL e-MANDI TAX INVOICE & TRADE CONTRACT
=====================================================
Invoice No: ${invoiceNumber}
Date & Time: ${createdTxn.timestamp}
e-Way Bill No: ${eWayBillNumber}
Transaction ID: ${createdTxn.id}
Escrow Status: SECURED & LOCKED IN e-NAM DIGITAL VAULT
Payment Channel: ${selectedPaymentChannel}
Bank UTR Ref: ${createdTxn.utrReference}

-----------------------------------------------------
BUYER (CONSIGNEE) DETAILS:
-----------------------------------------------------
Name/Enterprise: ${createdTxn.buyerName}
Consignee Contact: ${selectedAddress.consigneeName} (${selectedAddress.phoneNumber})
Delivery Hub: ${selectedAddress.label}
Address: ${selectedAddress.addressLine1}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}
Receiving Timings: ${selectedAddress.gateTimings}
Scheduled Delivery: ${preferredDate} (${deliverySlot} slot)

-----------------------------------------------------
SELLER (KISAN / FPO PRODUCER) DETAILS:
-----------------------------------------------------
Farmer / FPO: ${listing.farmerName}
Farmer Direct Phone: ${listing.farmerPhone || '+91 98124 56781'}
Mandi Origin: ${listing.farmLocation}
Farmer Rating: ${listing.farmerRating} / 5.0 ⭐
Quality Grade: ${listing.grade}
Moisture Content: ${listing.moistureContent}%
Harvest Date: ${listing.harvestDate}
Certifications: ${listing.certifications.join(', ')}

-----------------------------------------------------
ITEMIZED COMMODITY & ESCROW SETTLEMENT:
-----------------------------------------------------
Commodity: ${listing.cropName} (${listing.variety})
Ordered Volume: ${quantity} Metric Tons (${quantity * 10} Quintals)
Contract Rate: Rs. ${pricePerTon.toLocaleString('en-IN')} / MT (Rs. ${Math.round(pricePerTon / 10).toLocaleString('en-IN')} / Quintal)
Crop Base Total: Rs. ${subtotal.toLocaleString('en-IN')}
Logistics (${createdTxn.logisticsPartner}): Rs. ${logisticsFee.toLocaleString('en-IN')}
e-NAM Escrow & AGMARK Lab Quality Testing Fee (1%): Rs. ${escrowInspectionFee.toLocaleString('en-IN')}
-----------------------------------------------------
TOTAL ESCROW AUTHORIZED: Rs. ${totalAmount.toLocaleString('en-IN')}
-----------------------------------------------------
ESCROW RELEASE CONDITIONS:
1. Automated weighbridge tare & gross validation at delivery gate.
2. Digital AGMARK moisture inspection report <= ${listing.moistureContent}%.
3. Direct NEFT/RTGS fund release to farmer within 2 hours.

KrishiQuant Trust | RBI Escrow Compliance Ref: AGRI-ESC-2026-9042
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KrishiQuant_Invoice_${createdTxn.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const virtualAccount = {
    beneficiaryName: 'KrishiQuant Escrow Trust A/C',
    accountNumber: `AGRI${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    ifsc: 'SBIN0001234',
    bankName: 'State Bank of India (B2B Clearing Division)',
    branch: 'Nariman Point Central Treasury, Mumbai',
  };

  if (!isOpen || !listing) return null;

  return (
    <div id="checkout-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div 
        id="checkout-modal-card" 
        className="relative w-full max-w-3xl bg-[#FAF9F6] rounded-2xl shadow-2xl border border-[#E8E5DF] overflow-hidden my-4 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Botanical Header */}
        <div className="bg-[#233B2B] text-[#FAF9F6] p-4 sm:p-5 relative border-b border-[#3A5741] shrink-0">
          <button
            id="close-checkout-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 text-[#D0C8BB] hover:text-[#FAF9F6] p-1.5 rounded-full hover:bg-[#1A2E21] transition no-print"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2 text-amber-200 text-xs font-semibold uppercase tracking-wider mb-1 font-serif">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>e-NAM & AGMARK Escrow-Guaranteed Procurement</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-[#FAF9F6]">
                {currentStep === 1 && `Confirm Buying Details: ${listing.cropName}`}
                {currentStep === 2 && `Select Delivery Address & Hub`}
                {currentStep === 3 && `Secure Escrow Payment Gateway`}
                {currentStep === 4 && `Order Confirmed & e-Mandi Tax Invoice`}
              </h2>
              <p className="text-[#D0C8BB] text-xs mt-0.5">
                Direct Kisan/FPO-to-Enterprise agreement • 100% Escrow secured until weighbridge validation.
              </p>
            </div>

            {/* Stepper indicator */}
            <div className="no-print hidden sm:flex items-center gap-1.5 bg-[#1A2E21] border border-[#3A5741] px-3 py-1.5 rounded-xl text-xs font-medium">
              <span className={`px-2 py-0.5 rounded-md ${currentStep === 1 ? 'bg-amber-300 text-[#233B2B] font-bold' : currentStep > 1 ? 'text-amber-200' : 'text-[#8A9E8F]'}`}>
                1. Details
              </span>
              <span className="text-[#56735E]">➔</span>
              <span className={`px-2 py-0.5 rounded-md ${currentStep === 2 ? 'bg-amber-300 text-[#233B2B] font-bold' : currentStep > 2 ? 'text-amber-200' : 'text-[#8A9E8F]'}`}>
                2. Address
              </span>
              <span className="text-[#56735E]">➔</span>
              <span className={`px-2 py-0.5 rounded-md ${currentStep === 3 ? 'bg-amber-300 text-[#233B2B] font-bold' : currentStep > 3 ? 'text-amber-200' : 'text-[#8A9E8F]'}`}>
                3. Payment
              </span>
              <span className="text-[#56735E]">➔</span>
              <span className={`px-2 py-0.5 rounded-md ${currentStep === 4 ? 'bg-emerald-400 text-[#233B2B] font-bold' : 'text-[#8A9E8F]'}`}>
                4. Confirmed
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto bg-white">
          
          {/* =========================================================================
              STEP 1: CONFIRM BUYING DETAILS
             ========================================================================= */}
          {currentStep === 1 && (
            <div className="p-4 sm:p-6 space-y-5">
              
              {/* Lot Overview Snapshot */}
              <div className="bg-[#FAF9F6] border border-[#E8E5DF] rounded-2xl p-4 sm:p-5 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E5DF]">
                  <div className="flex items-start gap-3">
                    <img 
                      src={listing.imageUrl} 
                      alt={listing.cropName} 
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-[#D5CCBD] shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className="text-[10px] bg-[#EBF3ED] text-[#233B2B] border border-[#C6DFC9] px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                        {listing.category}
                      </span>
                      <h3 className="font-serif font-bold text-base sm:text-lg text-[#1C1C1C] mt-1">
                        {listing.cropName}
                      </h3>
                      <p className="text-xs text-[#7A746B]">
                        Variety: <span className="font-semibold text-[#1C1C1C]">{listing.variety}</span>
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[#5C554B] mt-1">
                        <Tractor className="w-3.5 h-3.5 text-[#2D4F38]" />
                        <span className="font-medium">{listing.farmerName}</span>
                        <span className="text-[#C2593F] font-bold">★ {listing.farmerRating}</span>
                      </div>

                      {/* Direct Farmer Contact for Offline Interaction */}
                      <div className="flex flex-wrap items-center gap-2 mt-2 pt-1.5 border-t border-[#E8E5DF] text-xs">
                        <span className="text-[11px] text-[#5C554B] flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-[#2D4F38]" />
                          Farmer Phone (Offline):
                        </span>
                        <span className="font-mono font-bold text-[#1C1C1C] text-xs">
                          {listing.farmerPhone || '+91 98124 56781'}
                        </span>
                        <div className="flex items-center gap-1">
                          <a
                            href={`tel:${(listing.farmerPhone || '+91 98124 56781').replace(/\s+/g, '')}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#2D4F38] text-white rounded text-[10px] font-semibold hover:bg-[#1A2E21] transition"
                            title="Call Farmer Directly"
                          >
                            <PhoneCall className="w-2.5 h-2.5 text-amber-200" />
                            <span>Call</span>
                          </a>
                          <a
                            href={`https://wa.me/${(listing.farmerPhone || '+91 98124 56781').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Namaste, I am reviewing your listing ${listing.cropName} on KrishiQuant for direct procurement.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7] rounded text-[10px] font-semibold hover:bg-[#C8E6C9] transition"
                            title="WhatsApp Farmer"
                          >
                            <MessageSquare className="w-2.5 h-2.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-[#E8E5DF] p-3 rounded-xl text-right sm:min-w-[170px]">
                    <span className="text-[10px] text-[#8A847A] uppercase font-mono block">Mandi Listed Rate</span>
                    <div className="text-lg font-serif font-bold text-[#233B2B]">
                      ₹{listing.pricePerTon.toLocaleString('en-IN')} <span className="text-xs font-sans font-normal text-[#7A746B]">/ MT</span>
                    </div>
                    <span className="text-[11px] text-[#7A746B] block">
                      ₹{Math.round(listing.pricePerTon / 10).toLocaleString('en-IN')} / Quintal
                    </span>
                    <span className="text-[10px] text-[#2D4F38] font-semibold block mt-1">
                      Available Stock: {listing.availableQuantityTons} MT
                    </span>
                  </div>
                </div>

                {/* Quality & Specifications Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-[#E8E5DF]">
                    <span className="text-[10px] text-[#8A847A] block font-mono">AGMARK GRADE</span>
                    <strong className="text-[#1C1C1C] font-serif">{listing.grade}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#E8E5DF]">
                    <span className="text-[10px] text-[#8A847A] block font-mono">MOISTURE LAB CERT</span>
                    <strong className="text-[#2D4F38] font-mono">{listing.moistureContent}% (Certified)</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#E8E5DF]">
                    <span className="text-[10px] text-[#8A847A] block font-mono">HARVEST DATE</span>
                    <strong className="text-[#1C1C1C]">{listing.harvestDate}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#E8E5DF]">
                    <span className="text-[10px] text-[#8A847A] block font-mono">ORIGIN MANDI</span>
                    <strong className="text-[#1C1C1C] truncate block" title={listing.farmLocation}>{listing.farmLocation}</strong>
                  </div>
                </div>

                {/* Certifications badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {listing.certifications.map((cert, i) => (
                    <span key={i} className="text-[10px] bg-white border border-[#D5CCBD] text-[#3D3830] px-2 py-0.5 rounded-md flex items-center gap-1 font-medium">
                      <Award className="w-3 h-3 text-[#2D4F38]" />
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              {/* Buying Configuration Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Quantity input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#1C1C1C] font-serif">
                    Procurement Quantity (Metric Tons)
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.max(listing.minOrderQuantityTons, prev - 5))}
                      className="w-10 h-10 bg-[#FAF9F6] border border-[#D5CCBD] hover:bg-[#EAE4D8] rounded-xl font-bold text-base text-[#1C1C1C] transition flex items-center justify-center shrink-0"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      required
                      id="checkout-quantity-input"
                      min={listing.minOrderQuantityTons}
                      max={listing.availableQuantityTons}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(listing.minOrderQuantityTons, Math.min(listing.availableQuantityTons, Number(e.target.value) || 0)))}
                      className="w-full px-3 py-2 text-base font-mono font-bold text-center bg-[#FAF9F6] border border-[#D5CCBD] rounded-xl text-[#1C1C1C] focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.min(listing.availableQuantityTons, prev + 5))}
                      className="w-10 h-10 bg-[#FAF9F6] border border-[#D5CCBD] hover:bg-[#EAE4D8] rounded-xl font-bold text-base text-[#1C1C1C] transition flex items-center justify-center shrink-0"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#7A746B] font-mono pt-0.5">
                    <span>MOQ: <strong>{listing.minOrderQuantityTons} MT</strong></span>
                    <span className="text-[#2D4F38] font-bold">≈ {quantity * 10} Quintals ({quantity * 20} Bags)</span>
                    <span>Max: <strong>{listing.availableQuantityTons} MT</strong></span>
                  </div>
                </div>

                {/* Price Per Ton */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#1C1C1C] font-serif">
                    Contract Rate per Metric Ton (₹)
                  </label>
                  <input
                    type="number"
                    required
                    id="checkout-price-input"
                    value={pricePerTon}
                    onChange={(e) => setPricePerTon(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-base font-mono font-bold bg-[#FAF9F6] border border-[#D5CCBD] rounded-xl text-[#1C1C1C] focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                  />
                  <div className="flex justify-between text-[11px] text-[#7A746B] font-mono pt-0.5">
                    <span>Equivalent Quintal Rate:</span>
                    <strong className="text-[#2D4F38]">₹{Math.round(pricePerTon / 10).toLocaleString('en-IN')}/Qtl</strong>
                  </div>
                </div>
              </div>

              {/* Logistics & Freight Tier Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#1C1C1C] font-serif">
                  Select Logistics & Transit Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setLogisticsChoice('agridirect_freight')}
                    className={`p-3 rounded-xl border text-left transition relative ${
                      logisticsChoice === 'agridirect_freight'
                        ? 'border-[#2D4F38] bg-[#EBF3ED] text-[#1C1C1C] ring-2 ring-[#2D4F38]'
                        : 'border-[#E8E5DF] bg-[#FAF9F6] hover:border-[#D5CCBD]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-serif text-[#233B2B] block">KrishiQuant Freight</strong>
                      <span className="text-[10px] font-mono bg-[#2D4F38] text-white px-1.5 py-0.5 rounded">₹1,200/MT</span>
                    </div>
                    <p className="text-[11px] text-[#5C554B] mt-1 leading-snug">
                      GPS live track, multi-axle trailer, tarpaulin seal & demurrage protection.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogisticsChoice('farmer_delivery')}
                    className={`p-3 rounded-xl border text-left transition relative ${
                      logisticsChoice === 'farmer_delivery'
                        ? 'border-[#2D4F38] bg-[#EBF3ED] text-[#1C1C1C] ring-2 ring-[#2D4F38]'
                        : 'border-[#E8E5DF] bg-[#FAF9F6] hover:border-[#D5CCBD]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-serif text-[#233B2B] block">Farmer Transport</strong>
                      <span className="text-[10px] font-mono bg-[#3E654B] text-white px-1.5 py-0.5 rounded">₹800/MT</span>
                    </div>
                    <p className="text-[11px] text-[#5C554B] mt-1 leading-snug">
                      Dispatched directly by Kisan FPO truck to your receiving godown.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogisticsChoice('buyer_pickup')}
                    className={`p-3 rounded-xl border text-left transition relative ${
                      logisticsChoice === 'buyer_pickup'
                        ? 'border-[#2D4F38] bg-[#EBF3ED] text-[#1C1C1C] ring-2 ring-[#2D4F38]'
                        : 'border-[#E8E5DF] bg-[#FAF9F6] hover:border-[#D5CCBD]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-serif text-[#1C1C1C] block">Buyer Self-Pickup</strong>
                      <span className="text-[10px] font-mono bg-[#8A847A] text-white px-1.5 py-0.5 rounded">₹0/MT</span>
                    </div>
                    <p className="text-[11px] text-[#7A746B] mt-1 leading-snug">
                      Buyer deploys own fleet to farmgate weighbridge directly.
                    </p>
                  </button>
                </div>
              </div>

              {/* Financial Calculation Box */}
              <div className="bg-[#FAF9F6] border border-[#E8E5DF] rounded-2xl p-4 space-y-2 text-xs">
                <span className="font-serif font-bold text-[#1C1C1C] block text-xs uppercase tracking-wider mb-1">
                  Transparent Trade Cost Breakdown
                </span>
                <div className="flex justify-between text-[#5C554B]">
                  <span>Crop Commodity Total ({quantity} MT @ ₹{pricePerTon.toLocaleString('en-IN')}/MT):</span>
                  <span className="font-mono font-semibold text-[#1C1C1C]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#5C554B]">
                  <span>Transit Logistics & Freight ({logisticsChoice === 'buyer_pickup' ? 'Self Pickup' : `₹${logisticsRatePerTon.toLocaleString('en-IN')}/MT`}):</span>
                  <span className="font-mono font-semibold text-[#1C1C1C]">₹{logisticsFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#5C554B]">
                  <span>e-NAM Escrow & AGMARK Lab Quality Inspection Fee (1%):</span>
                  <span className="font-mono font-semibold text-[#1C1C1C]">₹{escrowInspectionFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-[#E8E5DF] pt-2.5 flex justify-between font-bold text-sm sm:text-base text-[#1C1C1C]">
                  <span className="font-serif">Total Escrow Commitment:</span>
                  <span className="text-[#2D4F38] font-mono font-bold text-base sm:text-lg">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 bg-[#FAF9F6] hover:bg-[#EFEBE3] text-[#5C554B] border border-[#D5CCBD] font-semibold rounded-xl text-xs transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  id="confirm-details-next-btn"
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 py-3 px-5 bg-[#2D4F38] hover:bg-[#1E3727] text-white font-semibold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs border border-[#3E654B]"
                >
                  <span>Confirm Buying Details & Select Delivery Address</span>
                  <ArrowRight className="w-4 h-4 text-amber-200" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 2: ADDRESS SELECTION & DELIVERY HUB
             ========================================================================= */}
          {currentStep === 2 && (
            <div className="p-4 sm:p-6 space-y-5">
              
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E5DF]">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#1C1C1C]">
                    Select Delivery Destination & Receiving Facility
                  </h3>
                  <p className="text-xs text-[#7A746B]">
                    Choose the warehouse, processing mill, or APMC terminal where the consignment will be unloaded.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                  className="py-1.5 px-3 bg-[#EBF3ED] hover:bg-[#D7E9DB] text-[#233B2B] border border-[#C6DFC9] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingNewAddress ? 'Select Existing' : 'Add New Address'}</span>
                </button>
              </div>

              {/* Add New Address Form */}
              {isAddingNewAddress ? (
                <form onSubmit={handleAddNewAddress} className="bg-[#FAF9F6] border border-[#C6DFC9] rounded-2xl p-4 sm:p-5 space-y-3.5">
                  <span className="font-serif font-bold text-xs text-[#233B2B] uppercase tracking-wider block">
                    Enter New Enterprise Receiving Location
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#5C554B] mb-1">Location Label (e.g. Sonepat Mill Unit 2)</label>
                      <input
                        type="text"
                        required
                        value={newAddrLabel}
                        onChange={(e) => setNewAddrLabel(e.target.value)}
                        placeholder="e.g., Pune Grain Terminal"
                        className="w-full px-3 py-2 text-xs bg-white border border-[#D5CCBD] rounded-lg focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#5C554B] mb-1">Facility Type</label>
                      <select
                        value={newLocationType}
                        onChange={(e) => setNewLocationType(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#D5CCBD] rounded-lg focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                      >
                        <option value="Processing Plant / Mill">Processing Plant / Mill</option>
                        <option value="Warehouse / Godown">Warehouse / Godown</option>
                        <option value="APMC Mandi Yard">APMC Mandi Yard</option>
                        <option value="Cold Storage Facility">Cold Storage Facility</option>
                        <option value="Commercial Kitchen / Depot">Commercial Kitchen / Depot</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#5C554B] mb-1">Consignee Name</label>
                      <input
                        type="text"
                        required
                        value={newConsigneeName}
                        onChange={(e) => setNewConsigneeName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#D5CCBD] rounded-lg focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#5C554B] mb-1">Receiving Officer Contact Phone</label>
                      <input
                        type="text"
                        required
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#D5CCBD] rounded-lg focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5C554B] mb-1">Street Address / Gate Number</label>
                    <input
                      type="text"
                      required
                      value={newAddressLine1}
                      onChange={(e) => setNewAddressLine1(e.target.value)}
                      placeholder="e.g. Gate No 3, Phase II, Industrial Area"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#D5CCBD] rounded-lg focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#5C554B] mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#D5CCBD] rounded-lg focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#5C554B] mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#D5CCBD] rounded-lg focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#5C554B] mb-1">PIN Code</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={newPincode}
                        onChange={(e) => setNewPincode(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#D5CCBD] rounded-lg font-mono focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(false)}
                      className="py-1.5 px-3 text-xs text-[#5C554B] hover:bg-[#EFEBE3] rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="py-1.5 px-4 bg-[#2D4F38] text-white text-xs font-semibold rounded-lg hover:bg-[#1E3727] transition"
                    >
                      Save & Use This Address
                    </button>
                  </div>
                </form>
              ) : (
                /* Saved Address Cards Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr) => {
                    const isSelected = addr.id === selectedAddressId;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition relative space-y-2 ${
                          isSelected
                            ? 'border-[#2D4F38] bg-[#EBF3ED] ring-2 ring-[#2D4F38]'
                            : 'border-[#E8E5DF] bg-[#FAF9F6] hover:border-[#D5CCBD]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] bg-white border border-[#D5CCBD] text-[#233B2B] px-2 py-0.5 rounded font-mono font-semibold">
                              {addr.locationType}
                            </span>
                            <h4 className="font-serif font-bold text-sm text-[#1C1C1C] mt-1">
                              {addr.label}
                            </h4>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#2D4F38] text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-[#5C554B] leading-relaxed">
                          {addr.addressLine1}, {addr.city}, {addr.state} - <strong className="font-mono">{addr.pincode}</strong>
                        </p>

                        <div className="pt-2 border-t border-[#E8E5DF]/70 text-[11px] text-[#7A746B] space-y-0.5">
                          <div className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-[#2D4F38]" />
                            <span>{addr.companyName || currentUser.orgName || 'KrishiQuant Enterprise'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#2D4F38]" />
                            <span>{addr.consigneeName} ({addr.phoneNumber})</span>
                          </div>
                          {addr.gateTimings && (
                            <div className="flex items-center gap-1 text-[10px] text-[#2D4F38] font-medium">
                              <Clock className="w-3 h-3" />
                              <span>{addr.gateTimings}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Delivery Scheduling & Instructions */}
              <div className="bg-[#FAF9F6] border border-[#E8E5DF] rounded-2xl p-4 space-y-3">
                <span className="font-serif font-bold text-xs text-[#1C1C1C] uppercase tracking-wider block">
                  Delivery Scheduling & Gate Instructions
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5C554B] mb-1">
                      Preferred Inward Delivery Date
                    </label>
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#D5CCBD] rounded-lg font-mono focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5C554B] mb-1">
                      Receiving Time Slot
                    </label>
                    <select
                      value={deliverySlot}
                      onChange={(e) => setDeliverySlot(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#D5CCBD] rounded-lg focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                    >
                      <option value="morning">Morning Inward (06:00 AM - 12:00 PM)</option>
                      <option value="afternoon">Afternoon Inward (12:00 PM - 06:00 PM)</option>
                      <option value="evening">Night Inward (06:00 PM - 12:00 AM)</option>
                      <option value="flexible">24x7 Continuous Inward Unloading</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#5C554B] mb-1">
                    Special Unloading & Tare Weighbridge Instructions
                  </label>
                  <input
                    type="text"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Gate No. 4 inward. Moisture test required prior to hopper discharge."
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D5CCBD] rounded-lg focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                  />
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="py-2.5 px-4 bg-[#FAF9F6] hover:bg-[#EFEBE3] text-[#5C554B] border border-[#D5CCBD] font-semibold rounded-xl text-xs transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Lot Details</span>
                </button>

                <button
                  type="button"
                  id="confirm-address-next-btn"
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 py-3 px-5 bg-[#2D4F38] hover:bg-[#1E3727] text-white font-semibold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs border border-[#3E654B]"
                >
                  <span>Proceed to Escrow Payment (₹{totalAmount.toLocaleString('en-IN')})</span>
                  <ArrowRight className="w-4 h-4 text-amber-200" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 3: SECURE ESCROW PAYMENT GATEWAY
             ========================================================================= */}
          {currentStep === 3 && (
            <div className="p-4 sm:p-6 space-y-5">
              
              {/* Payment Processing Animation */}
              {isProcessing ? (
                <div className="p-8 sm:p-12 text-center space-y-5">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="w-20 h-20 rounded-full border-4 border-[#D5CCBD] border-t-[#2D4F38] animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-[#2D4F38]">
                      <Lock className="w-7 h-7" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-[#1C1C1C]">
                      Executing e-NAM Escrow Lock & Trade Contract
                    </h3>
                    <p className="text-xs sm:text-sm font-mono text-[#2D4F38] font-semibold animate-pulse">
                      {processingStepText}
                    </p>
                    <p className="text-[11px] text-[#7A746B] max-w-sm mx-auto">
                      Please do not refresh or navigate away. 256-bit SSL encrypted connection with Reserve Bank of India clearing network.
                    </p>
                  </div>
                </div>
              ) : (
                /* Payment Gateway Screen */
                <div className="space-y-5">
                  
                  {/* Summary Bar */}
                  <div className="bg-[#FAF9F6] border border-[#E8E5DF] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-[#8A847A] uppercase font-mono block">Commodity Lot & Delivery</span>
                      <strong className="text-sm font-serif text-[#1C1C1C]">{listing.cropName} ({quantity} MT)</strong>
                      <span className="text-xs text-[#7A746B] block">To: {selectedAddress.label}, {selectedAddress.city}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#8A847A] uppercase font-mono block">Total Escrow Amount</span>
                      <div className="text-xl font-serif font-bold text-[#2D4F38] font-mono">
                        ₹{totalAmount.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-[#8A847A]">Incl. 1% AGMARK & Freight</span>
                    </div>
                  </div>

                  {/* Payment Channels Tabs */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    
                    {/* Left Channels List */}
                    <div className="lg:col-span-4 space-y-2">
                      <span className="text-[11px] font-bold text-[#7A746B] uppercase tracking-wider block font-serif">
                        Payment Method
                      </span>

                      {/* UPI QR */}
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentChannel('UPI_QR')}
                        className={`w-full p-3 rounded-xl border text-left text-xs transition flex items-center gap-2.5 ${
                          selectedPaymentChannel === 'UPI_QR'
                            ? 'border-[#2D4F38] bg-[#EBF3ED] text-[#1C1C1C] font-semibold ring-1 ring-[#2D4F38]'
                            : 'border-[#E8E5DF] bg-[#FAF9F6] text-[#5C554B] hover:border-[#D5CCBD]'
                        }`}
                      >
                        <QrCode className="w-4 h-4 text-[#2D4F38] shrink-0" />
                        <div>
                          <div className="font-semibold text-[#1C1C1C]">UPI & Dynamic QR</div>
                          <div className="text-[10px] text-[#7A746B]">Google Pay, PhonePe, BHIM</div>
                        </div>
                      </button>

                      {/* Net Banking */}
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentChannel('NET_BANKING')}
                        className={`w-full p-3 rounded-xl border text-left text-xs transition flex items-center gap-2.5 ${
                          selectedPaymentChannel === 'NET_BANKING'
                            ? 'border-[#2D4F38] bg-[#EBF3ED] text-[#1C1C1C] font-semibold ring-1 ring-[#2D4F38]'
                            : 'border-[#E8E5DF] bg-[#FAF9F6] text-[#5C554B] hover:border-[#D5CCBD]'
                        }`}
                      >
                        <Building className="w-4 h-4 text-[#2D4F38] shrink-0" />
                        <div>
                          <div className="font-semibold text-[#1C1C1C]">Corporate NetBanking</div>
                          <div className="text-[10px] text-[#7A746B]">SBI, HDFC, ICICI, Axis</div>
                        </div>
                      </button>

                      {/* RTGS Virtual Escrow */}
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentChannel('RTGS_NEFT')}
                        className={`w-full p-3 rounded-xl border text-left text-xs transition flex items-center gap-2.5 ${
                          selectedPaymentChannel === 'RTGS_NEFT'
                            ? 'border-[#2D4F38] bg-[#EBF3ED] text-[#1C1C1C] font-semibold ring-1 ring-[#2D4F38]'
                            : 'border-[#E8E5DF] bg-[#FAF9F6] text-[#5C554B] hover:border-[#D5CCBD]'
                        }`}
                      >
                        <Landmark className="w-4 h-4 text-[#2D4F38] shrink-0" />
                        <div>
                          <div className="font-semibold text-[#1C1C1C]">RTGS / NEFT Escrow</div>
                          <div className="text-[10px] text-[#7A746B]">Dedicated Virtual A/C</div>
                        </div>
                      </button>

                      {/* Agri-Credit */}
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentChannel('AGRI_CREDIT')}
                        className={`w-full p-3 rounded-xl border text-left text-xs transition flex items-center gap-2.5 ${
                          selectedPaymentChannel === 'AGRI_CREDIT'
                            ? 'border-[#2D4F38] bg-[#EBF3ED] text-[#1C1C1C] font-semibold ring-1 ring-[#2D4F38]'
                            : 'border-[#E8E5DF] bg-[#FAF9F6] text-[#5C554B] hover:border-[#D5CCBD]'
                        }`}
                      >
                        <Wallet className="w-4 h-4 text-[#2D4F38] shrink-0" />
                        <div>
                          <div className="font-semibold text-[#1C1C1C]">14-Day 0% Agri-Credit</div>
                          <div className="text-[10px] text-[#7A746B]">Pre-approved Buyer Line</div>
                        </div>
                      </button>

                      {/* Corporate Card */}
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentChannel('CARD')}
                        className={`w-full p-3 rounded-xl border text-left text-xs transition flex items-center gap-2.5 ${
                          selectedPaymentChannel === 'CARD'
                            ? 'border-[#2D4F38] bg-[#EBF3ED] text-[#1C1C1C] font-semibold ring-1 ring-[#2D4F38]'
                            : 'border-[#E8E5DF] bg-[#FAF9F6] text-[#5C554B] hover:border-[#D5CCBD]'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-[#2D4F38] shrink-0" />
                        <div>
                          <div className="font-semibold text-[#1C1C1C]">Corporate Card</div>
                          <div className="text-[10px] text-[#7A746B]">RuPay Corporate, Visa B2B</div>
                        </div>
                      </button>
                    </div>

                    {/* Right Channel Content */}
                    <div className="lg:col-span-8 bg-[#FAF9F6] border border-[#E8E5DF] rounded-2xl p-4 sm:p-5">
                      
                      {/* CHANNEL 1: UPI QR */}
                      {selectedPaymentChannel === 'UPI_QR' && (
                        <div className="space-y-4 text-center sm:text-left">
                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            {/* QR Canvas */}
                            <div className="p-3 bg-white border border-[#D5CCBD] rounded-xl shadow-xs shrink-0 text-center">
                              <div className="w-32 h-32 bg-stone-900 rounded-lg flex items-center justify-center p-2">
                                <QrCode className="w-28 h-28 text-white" />
                              </div>
                              <span className="text-[10px] text-[#7A746B] font-mono block mt-1">
                                Scan via any UPI App
                              </span>
                            </div>

                            <div className="space-y-2 text-xs">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-800 text-[11px] font-mono">
                                <Clock className="w-3.5 h-3.5" />
                                <span>QR Session: {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}</span>
                              </div>
                              <h4 className="font-serif font-bold text-sm text-[#1C1C1C]">
                                Instant Mandi UPI Clearing
                              </h4>
                              <p className="text-[#5C554B] text-[11px]">
                                Dynamic QR linked directly to KrishiQuant Escrow Trust (A/C: <strong className="font-mono">krishiquant.escrow@icici</strong>).
                              </p>
                              <div className="flex items-center gap-1.5 bg-white border border-[#D5CCBD] px-2.5 py-1.5 rounded-lg text-xs font-mono text-[#1C1C1C]">
                                <span className="truncate">krishiquant.escrow@icici</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy('krishiquant.escrow@icici', 'vpa')}
                                  className="text-[#2D4F38] hover:text-[#1E3727] font-semibold text-[11px] shrink-0"
                                >
                                  {copiedField === 'vpa' ? 'Copied!' : 'Copy'}
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2">
                            <button
                              type="button"
                              id="upi-pay-btn"
                              onClick={handleExecutePayment}
                              className="w-full py-3 px-4 bg-[#C2593F] hover:bg-[#A84A33] text-white font-semibold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs border border-[#D97259]"
                            >
                              <Sparkles className="w-4 h-4 text-amber-200" />
                              <span>Simulate Instant UPI Approval & Lock Escrow (₹{totalAmount.toLocaleString('en-IN')})</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* CHANNEL 2: NetBanking */}
                      {selectedPaymentChannel === 'NET_BANKING' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#5C554B] mb-1.5 font-serif">
                              Select Corporate Bank
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {INDIAN_BANKS.map((b) => (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => setSelectedBank(b.id)}
                                  className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center gap-2 ${
                                    selectedBank === b.id
                                      ? 'border-[#2D4F38] bg-[#EBF3ED] text-[#1C1C1C] font-semibold ring-1 ring-[#2D4F38]'
                                      : 'border-[#E8E5DF] bg-white text-[#5C554B] hover:border-[#D5CCBD]'
                                  }`}
                                >
                                  <span className="text-base">{b.logo}</span>
                                  <span className="truncate">{b.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-[#5C554B] mb-1">Corporate User ID</label>
                              <input
                                type="text"
                                value={corpUserId}
                                onChange={(e) => setCorpUserId(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-white border border-[#D5CCBD] rounded-lg font-mono focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-[#5C554B] mb-1">Authorization OTP / Token</label>
                              <input
                                type="password"
                                value={authOtp}
                                onChange={(e) => setAuthOtp(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-white border border-[#D5CCBD] rounded-lg font-mono focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            id="netbanking-pay-btn"
                            onClick={handleExecutePayment}
                            className="w-full py-3 px-4 bg-[#C2593F] hover:bg-[#A84A33] text-white font-semibold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs border border-[#D97259]"
                          >
                            <Building className="w-4 h-4 text-amber-200" />
                            <span>Authorize ₹{totalAmount.toLocaleString('en-IN')} via Corporate NetBanking</span>
                          </button>
                        </div>
                      )}

                      {/* CHANNEL 3: RTGS / NEFT */}
                      {selectedPaymentChannel === 'RTGS_NEFT' && (
                        <div className="space-y-3.5">
                          <div className="bg-white border border-[#E8E5DF] rounded-xl p-3.5 space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1 border-b border-[#F0ECE1]">
                              <span className="text-[#7A746B]">Beneficiary Name:</span>
                              <strong className="text-[#1C1C1C]">{virtualAccount.beneficiaryName}</strong>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-[#F0ECE1]">
                              <span className="text-[#7A746B]">Virtual Escrow A/C No:</span>
                              <div className="flex items-center gap-1.5 font-mono font-bold text-[#233B2B]">
                                <span>{virtualAccount.accountNumber}</span>
                                <button type="button" onClick={() => handleCopy(virtualAccount.accountNumber, 'acct')} className="text-xs text-[#2D4F38] hover:underline">
                                  {copiedField === 'acct' ? 'Copied!' : 'Copy'}
                                </button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-[#F0ECE1]">
                              <span className="text-[#7A746B]">IFSC Code:</span>
                              <div className="flex items-center gap-1.5 font-mono font-bold text-[#233B2B]">
                                <span>{virtualAccount.ifsc}</span>
                                <button type="button" onClick={() => handleCopy(virtualAccount.ifsc, 'ifsc')} className="text-xs text-[#2D4F38] hover:underline">
                                  {copiedField === 'ifsc' ? 'Copied!' : 'Copy'}
                                </button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center py-1">
                              <span className="text-[#7A746B]">Bank Branch:</span>
                              <span className="text-[#1C1C1C]">{virtualAccount.bankName}</span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-[#5C554B] mb-1">
                              Bank UTR Reference Number
                            </label>
                            <input
                              type="text"
                              value={virtualUtr}
                              onChange={(e) => setVirtualUtr(e.target.value)}
                              className="w-full px-3 py-2 text-xs bg-white border border-[#D5CCBD] rounded-lg font-mono focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                            />
                          </div>

                          <button
                            type="button"
                            id="rtgs-pay-btn"
                            onClick={handleExecutePayment}
                            className="w-full py-3 px-4 bg-[#C2593F] hover:bg-[#A84A33] text-white font-semibold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs border border-[#D97259]"
                          >
                            <Landmark className="w-4 h-4 text-amber-200" />
                            <span>Confirm RTGS Transfer & Lock Escrow (₹{totalAmount.toLocaleString('en-IN')})</span>
                          </button>
                        </div>
                      )}

                      {/* CHANNEL 4: Agri-Credit */}
                      {selectedPaymentChannel === 'AGRI_CREDIT' && (
                        <div className="space-y-3.5">
                          <div className="bg-white border border-[#C6DFC9] rounded-xl p-3.5 space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-[#5C554B]">Sanctioned Enterprise Credit Line:</span>
                              <strong className="font-mono text-[#1C1C1C]">₹50,00,000</strong>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[#5C554B]">Available Escrow Balance:</span>
                              <strong className="font-mono text-[#2D4F38]">₹42,80,000</strong>
                            </div>
                            <div className="w-full bg-[#E8E5DF] h-2 rounded-full overflow-hidden">
                              <div className="bg-[#2D4F38] h-full" style={{ width: '85%' }}></div>
                            </div>
                            <p className="text-[11px] text-[#5C554B] pt-1">
                              0% Interest for initial 14-day trade cycle. Due on {new Date(Date.now() + 14 * 86400000).toLocaleDateString('en-IN')}.
                            </p>
                          </div>

                          <button
                            type="button"
                            id="credit-pay-btn"
                            onClick={handleExecutePayment}
                            className="w-full py-3 px-4 bg-[#C2593F] hover:bg-[#A84A33] text-white font-semibold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs border border-[#D97259]"
                          >
                            <Wallet className="w-4 h-4 text-amber-200" />
                            <span>Execute with 14-Day 0% Agri-Credit</span>
                          </button>
                        </div>
                      )}

                      {/* CHANNEL 5: Card */}
                      {selectedPaymentChannel === 'CARD' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-[#5C554B] mb-1">Card Number</label>
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className="w-full px-3 py-2 text-xs bg-white border border-[#D5CCBD] rounded-lg font-mono focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-semibold text-[#5C554B] mb-1">Expiry (MM/YY)</label>
                              <input
                                type="text"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-white border border-[#D5CCBD] rounded-lg font-mono focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-[#5C554B] mb-1">CVV</label>
                              <input
                                type="password"
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-white border border-[#D5CCBD] rounded-lg font-mono focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-[#5C554B] mb-1">Cardholder Name</label>
                            <input
                              type="text"
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value)}
                              className="w-full px-3 py-2 text-xs bg-white border border-[#D5CCBD] rounded-lg focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                            />
                          </div>

                          <button
                            type="button"
                            id="card-pay-btn"
                            onClick={handleExecutePayment}
                            className="w-full py-3 px-4 bg-[#C2593F] hover:bg-[#A84A33] text-white font-semibold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs border border-[#D97259]"
                          >
                            <CreditCard className="w-4 h-4 text-amber-200" />
                            <span>Authorize ₹{totalAmount.toLocaleString('en-IN')} via Card</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Trust badge */}
                  <div className="flex items-center gap-2 text-[11px] text-[#5C554B] bg-[#FAF9F6] p-3 rounded-xl border border-[#E8E5DF]">
                    <ShieldCheck className="w-4 h-4 text-[#2D4F38] shrink-0" />
                    <span>
                      100% Protected: Funds remain locked in RBI-compliant escrow trust and will only disburse to the farmer after delivery weighbridge verification & AGMARK quality testing.
                    </span>
                  </div>

                  {/* Navigation back */}
                  <div className="pt-1 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="py-2.5 px-4 bg-[#FAF9F6] hover:bg-[#EFEBE3] text-[#5C554B] border border-[#D5CCBD] font-semibold rounded-xl text-xs transition flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Address Selection</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              STEP 4: ORDER CONFIRMED & PRINTABLE DETAILS / TAX INVOICE
             ========================================================================= */}
          {currentStep === 4 && createdTxn && (
            <div id="printable-invoice-container" className="p-4 sm:p-6 space-y-6">
              
              {/* Confirmed Banner (Hidden in print) */}
              <div className="no-print bg-[#EBF3ED] border border-[#C6DFC9] rounded-2xl p-5 text-center space-y-2.5">
                <div className="w-14 h-14 rounded-full bg-white border border-[#C6DFC9] text-[#2D4F38] mx-auto flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-8 h-8 text-[#2D4F38]" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#233B2B]">
                  Trade Contract Executed & Escrow Locked!
                </h3>
                <p className="text-xs text-[#5C554B] max-w-lg mx-auto leading-relaxed">
                  Your payment of <strong className="text-[#233B2B] font-mono">₹{createdTxn.totalAmount.toLocaleString('en-IN')}</strong> is safely locked in the <strong>e-NAM KrishiQuant Escrow Trust Vault</strong>. The seller (<strong className="text-[#1C1C1C]">{listing.farmerName}</strong>) has been issued a verified loading order.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <span className="bg-white border border-[#C6DFC9] px-3 py-1 rounded-full text-xs font-mono text-[#233B2B] font-bold">
                    Order #{createdTxn.id}
                  </span>
                  <span className="bg-[#2D4F38] text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Invoice #{invoiceNumber}
                  </span>
                </div>
              </div>

              {/* Official Printable Tax Invoice & Waybill */}
              <div className="border border-[#E8E5DF] bg-[#FAF9F6] rounded-2xl p-5 sm:p-6 space-y-5 text-xs text-[#1C1C1C]">
                
                {/* Invoice Header */}
                <div className="flex flex-wrap justify-between items-start pb-4 border-b border-[#E8E5DF] gap-4">
                  <div>
                    <span className="text-xs font-bold text-[#233B2B] uppercase tracking-wider font-serif block">
                      KRISHIQUANT COMMODITY EXCHANGE
                    </span>
                    <h4 className="text-lg font-serif font-bold text-[#1C1C1C]">Official e-Mandi Tax Invoice & Sauda Slip</h4>
                    <div className="text-[11px] text-[#7A746B] mt-1 space-y-0.5">
                      <p>GSTIN: <strong>27AABCA1234F1Z9</strong> • APMC License: <strong>MH-B2B-2026-9042</strong></p>
                      <p>e-Way Bill No: <strong className="font-mono text-[#2D4F38]">{eWayBillNumber}</strong></p>
                    </div>
                  </div>

                  <div className="text-right text-[11px] space-y-0.5">
                    <p className="text-[#7A746B]">Invoice No: <strong className="text-[#1C1C1C] font-mono">{invoiceNumber}</strong></p>
                    <p className="text-[#7A746B]">Date & Time: <strong className="text-[#1C1C1C] font-mono">{createdTxn.timestamp}</strong></p>
                    <p className="text-[#7A746B]">Payment Mode: <strong className="text-[#2D4F38] uppercase font-mono">{selectedPaymentChannel}</strong></p>
                    <p className="text-[#7A746B]">Bank UTR: <strong className="text-[#1C1C1C] font-mono">{createdTxn.utrReference}</strong></p>
                  </div>
                </div>

                {/* Buyer and Seller 2-Column Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-[#E8E5DF]">
                  <div className="bg-white p-3.5 rounded-xl border border-[#E8E5DF] space-y-1">
                    <span className="text-[10px] text-[#8A847A] uppercase font-mono block font-bold">CONSIGNEE / BUYER</span>
                    <strong className="text-sm font-serif text-[#1C1C1C] block">{createdTxn.buyerName}</strong>
                    <p className="text-[#5C554B]">Contact: {selectedAddress.consigneeName} ({selectedAddress.phoneNumber})</p>
                    <p className="text-[#5C554B]">{selectedAddress.addressLine1}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                    <p className="text-[#2D4F38] font-medium text-[10px]">Scheduled: {preferredDate} ({deliverySlot} slot)</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-[#E8E5DF] space-y-1">
                    <span className="text-[10px] text-[#8A847A] uppercase font-mono block font-bold">PRODUCER / SELLER</span>
                    <div className="flex justify-between items-start">
                      <strong className="text-sm font-serif text-[#1C1C1C] block">{listing.farmerName}</strong>
                      <span className="text-[10px] text-[#2D4F38] bg-[#EBF3ED] px-1.5 py-0.5 rounded font-medium">★ {listing.farmerRating} Verified</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-1 pt-0.5 border-t border-[#F0ECE1]">
                      <p className="text-[#1C1C1C] font-mono text-xs flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#2D4F38]" />
                        <span>Direct Phone: <strong>{listing.farmerPhone || '+91 98124 56781'}</strong></span>
                      </p>
                      <div className="no-print flex items-center gap-1">
                        <a
                          href={`tel:${(listing.farmerPhone || '+91 98124 56781').replace(/\s+/g, '')}`}
                          className="px-2 py-0.5 bg-[#2D4F38] text-white rounded text-[10px] font-semibold hover:bg-[#1E3727] transition flex items-center gap-1"
                        >
                          <PhoneCall className="w-2.5 h-2.5 text-amber-200" />
                          <span>Call</span>
                        </a>
                        <a
                          href={`https://wa.me/${(listing.farmerPhone || '+91 98124 56781').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Namaste, Order #${createdTxn.id} has been placed on KrishiQuant for your ${listing.cropName} (${quantity} MT). Let's coordinate dispatch.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7] rounded text-[10px] font-semibold hover:bg-[#C8E6C9] transition flex items-center gap-1"
                        >
                          <MessageSquare className="w-2.5 h-2.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                    <p className="text-[#5C554B]">Farmgate / Mandi Origin: {listing.farmLocation}</p>
                    <p className="text-[#5C554B]">AGMARK Grade: {listing.grade} • Certified Moisture: {listing.moistureContent}%</p>
                  </div>
                </div>

                {/* Itemized Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#D5CCBD] text-[#7A746B]">
                        <th className="py-2 font-serif">Commodity Item Description</th>
                        <th className="py-2 text-right font-serif">Quantity</th>
                        <th className="py-2 text-right font-serif">Contract Rate</th>
                        <th className="py-2 text-right font-serif">Subtotal (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFEBE3]">
                      <tr className="text-[#1C1C1C]">
                        <td className="py-3 font-semibold font-serif">
                          {listing.cropName}
                          <span className="block text-[10px] text-[#7A746B] font-mono font-normal">
                            Variety: {listing.variety} | Grade: {listing.grade} | Certs: {listing.certifications.join(', ')}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono font-semibold">
                          {quantity} MT <span className="text-[10px] text-[#7A746B]">({quantity * 10} Qtl)</span>
                        </td>
                        <td className="py-3 text-right font-mono">
                          ₹{pricePerTon.toLocaleString('en-IN')} / MT
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-[#1C1C1C]">
                          ₹{subtotal.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Cost Breakdown */}
                <div className="border-t border-[#D5CCBD] pt-3 space-y-1.5 text-xs text-[#5C554B]">
                  <div className="flex justify-between">
                    <span>Commodity Base Total:</span>
                    <span className="font-mono text-[#1C1C1C]">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transit Logistics ({createdTxn.logisticsPartner}):</span>
                    <span className="font-mono text-[#1C1C1C]">₹{logisticsFee.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>e-NAM Escrow & AGMARK Lab Quality Inspection (1%):</span>
                    <span className="font-mono text-[#1C1C1C]">₹{escrowInspectionFee.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>APMC Mandi Tax / Agricultural Cess (Exempt under Section 10):</span>
                    <span className="font-mono text-[#2D4F38] font-semibold">₹0 (Exempt)</span>
                  </div>
                  <div className="border-t border-[#D5CCBD] pt-2 flex justify-between font-bold text-sm sm:text-base text-[#1C1C1C]">
                    <span className="font-serif">Total Escrow Amount Authorized:</span>
                    <span className="text-[#2D4F38] font-mono text-base sm:text-lg">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Escrow Release Protocol & Stamps */}
                <div className="bg-white border border-[#E8E5DF] p-3.5 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[10px] uppercase font-mono font-bold text-[#233B2B]">
                    <span>e-NAM DIGITAL ESCROW DISBURSEMENT CONDITIONS</span>
                    <span>RBI TRUST COMPLIANT</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2 bg-[#EBF3ED] rounded-lg border border-[#C6DFC9]">
                      <strong className="text-[#233B2B] block">1. Weighbridge Slip</strong>
                      <span className="text-[#5C554B]">Digital tare & gross weight validated on arrival.</span>
                    </div>
                    <div className="p-2 bg-[#FAF9F6] rounded-lg border border-[#E8E5DF]">
                      <strong className="text-[#1C1C1C] block">2. Moisture AGMARK Test</strong>
                      <span className="text-[#7A746B]">Lab digital meter confirms specs &lt;= {listing.moistureContent}%.</span>
                    </div>
                    <div className="p-2 bg-[#FAF9F6] rounded-lg border border-[#E8E5DF]">
                      <strong className="text-[#1C1C1C] block">3. Direct NEFT Disbursement</strong>
                      <span className="text-[#7A746B]">Funds released to farmer bank account within 2 hours.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions (Print, Download, Track, Return) - Hidden in Print */}
              <div className="no-print flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    id="print-order-invoice-btn"
                    onClick={handlePrintInvoice}
                    className="py-2.5 px-4 bg-[#233B2B] hover:bg-[#1A2E21] text-white font-semibold rounded-xl text-xs transition flex items-center gap-2 border border-[#3A5741] shadow-xs"
                  >
                    <Printer className="w-4 h-4 text-amber-300" />
                    <span>Print Order Confirmed Details</span>
                  </button>

                  <button
                    type="button"
                    id="download-order-slip-btn"
                    onClick={handleDownloadSlip}
                    className="py-2.5 px-4 bg-[#F4F1EA] hover:bg-[#EAE4D7] text-[#1C1C1C] border border-[#D5CCBD] font-semibold rounded-xl text-xs transition flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-[#5C554B]" />
                    <span>Download Slip (.txt)</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  {onTrackOrder && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onTrackOrder(createdTxn);
                      }}
                      className="py-2.5 px-4 bg-[#EBF3ED] hover:bg-[#D7E9DB] text-[#233B2B] border border-[#C6DFC9] font-semibold rounded-xl text-xs transition flex items-center gap-1.5"
                    >
                      <Truck className="w-4 h-4 text-[#2D4F38]" />
                      <span>Track Dispatch</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onClose}
                    className="py-2.5 px-5 bg-[#2D4F38] hover:bg-[#1E3727] text-white font-semibold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs border border-[#3E654B]"
                  >
                    <span>Back to Marketplace</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-200" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
