import React, { useState, useEffect } from 'react';
import { UserProfile, CropListing, OrderTransaction, PaymentChannel, ProcurementCartItem } from '../types';
import { 
  ShieldCheck, 
  CheckCircle2, 
  QrCode, 
  Building, 
  ArrowRight, 
  Copy, 
  Check, 
  CreditCard, 
  Clock, 
  Lock, 
  AlertCircle, 
  Receipt, 
  Download, 
  Printer, 
  ChevronRight, 
  Landmark, 
  Smartphone, 
  Wallet,
  Sparkles,
  Truck,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentGatewayProps {
  items: ProcurementCartItem[];
  currentUser: UserProfile;
  destinationAddress: string;
  onPaymentSuccess: (transactions: OrderTransaction[]) => void;
  onCancel: () => void;
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

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  items,
  currentUser,
  destinationAddress,
  onPaymentSuccess,
  onCancel,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel>('UPI_QR');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [completedTxns, setCompletedTxns] = useState<OrderTransaction[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');

  // Channel specific states
  const [vpaInput, setVpaInput] = useState<string>(currentUser.role === 'organisation' ? 'procurement@itcagri.okhdfcbank' : 'buyer@upi');
  const [vpaVerified, setVpaVerified] = useState<boolean>(false);
  const [vpaVerifying, setVpaVerifying] = useState<boolean>(false);
  
  const [selectedBank, setSelectedBank] = useState<string>('sbi');
  const [corpUserId, setCorpUserId] = useState<string>('CORP-88421');
  const [authOtp, setAuthOtp] = useState<string>('749210');

  const [virtualUtr, setVirtualUtr] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [cardNumber, setCardNumber] = useState<string>('4532 8901 4452 9814');
  const [cardExpiry, setCardExpiry] = useState<string>('08/29');
  const [cardCvv, setCardCvv] = useState<string>('481');
  const [cardName, setCardName] = useState<string>(currentUser.name);

  // Countdown timer for UPI QR session (3 minutes)
  const [timerSeconds, setTimerSeconds] = useState<number>(180);

  useEffect(() => {
    if (timerSeconds <= 0 || isCompleted) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds, isCompleted]);

  // Calculations
  const totalQuantityTons = items.reduce((acc, item) => acc + item.quantityTons, 0);
  const rawCropSubtotal = items.reduce((acc, item) => acc + (item.quantityTons * item.customPricePerTon), 0);
  
  const totalLogisticsFee = items.reduce((acc, item) => {
    const rate = item.logisticsChoice === 'agridirect_freight' ? 1200 : item.logisticsChoice === 'farmer_delivery' ? 800 : 0;
    return acc + (item.quantityTons * rate);
  }, 0);

  // Multi-lot freight optimization discount
  const bulkFreightDiscount = items.length > 1 ? Math.round(totalLogisticsFee * 0.15) : 0;
  const netLogisticsFee = Math.max(0, totalLogisticsFee - bulkFreightDiscount);

  // 1% AGMARK testing & e-NAM escrow protection guarantee fee
  const escrowInspectionFee = Math.round(rawCropSubtotal * 0.01);
  const grandTotal = rawCropSubtotal + netLogisticsFee + escrowInspectionFee;

  const virtualAccount = {
    beneficiaryName: 'Agritech Bharat Escrow Trust A/C',
    accountNumber: `AGRI${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    ifsc: 'SBIN0001234',
    bankName: 'State Bank of India (B2B Clearing Division)',
    branch: 'Nariman Point Central Treasury, Mumbai',
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleVerifyVpa = () => {
    if (!vpaInput.includes('@')) return;
    setVpaVerifying(true);
    setTimeout(() => {
      setVpaVerifying(false);
      setVpaVerified(true);
    }, 800);
  };

  const executePayment = () => {
    setIsProcessing(true);
    setProcessingStep('Connecting to NPCI & Reserve Bank of India Settlement Gateway...');

    setTimeout(() => {
      setProcessingStep('Authorizing funds into 100% e-NAM Escrow Custody Account...');
      
      setTimeout(() => {
        setProcessingStep('Issuing AGMARK Quality Testing Tokens & APMC e-Way Bill...');

        setTimeout(() => {
          const invNum = `INV-MANDI-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
          setInvoiceNumber(invNum);

          const newTransactions: OrderTransaction[] = items.map((item, idx) => {
            const itemSubtotal = item.quantityTons * item.customPricePerTon;
            const itemLogistics = item.logisticsChoice === 'agridirect_freight' ? item.quantityTons * 1200 : item.logisticsChoice === 'farmer_delivery' ? item.quantityTons * 800 : 0;
            const itemEscrow = Math.round(itemSubtotal * 0.01);
            const itemTotal = itemSubtotal + itemLogistics + itemEscrow;

            return {
              id: `TXN-IN-${Math.floor(100000 + Math.random() * 900000) + idx}`,
              listingId: item.listing.id,
              cropName: item.listing.cropName,
              sellerId: item.listing.farmerId,
              sellerName: item.listing.farmerName,
              buyerId: currentUser.id,
              buyerName: currentUser.orgName || currentUser.name,
              buyerRole: currentUser.role,
              quantityTons: item.quantityTons,
              pricePerTon: item.customPricePerTon,
              totalAmount: itemTotal,
              status: 'Escrow Locked',
              logisticsPartner: item.logisticsChoice === 'agridirect_freight' ? 'Agritech Bharat Intermodal Logistics' : item.logisticsChoice === 'farmer_delivery' ? 'Farmer Mandi Transport' : 'Buyer Dedicated Truck',
              destination: destinationAddress || 'Vashi Mandi Central Processing Hub, Navi Mumbai',
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              paymentMethod: selectedChannel,
              invoiceNumber: invNum,
              utrReference: virtualUtr || `UTR-RBI-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
            };
          });

          setCompletedTxns(newTransactions);
          setIsProcessing(false);
          setIsCompleted(true);
          onPaymentSuccess(newTransactions);

          try {
            confetti({
              particleCount: 100,
              spread: 80,
              origin: { y: 0.5 }
            });
          } catch {
            // ignore
          }
        }, 1200);
      }, 1000);
    }, 900);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-[#FAF9F6] border border-[#E8E5DF] rounded-2xl shadow-xl overflow-hidden text-[#1C1C1C]">
      {/* Top Header */}
      <div className="bg-[#233B2B] text-[#FAF9F6] p-5 sm:p-6 border-b border-[#37523E]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-200 text-xs font-semibold uppercase tracking-wider mb-1 font-serif">
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>e-NAM & Reserve Bank Approved B2B Escrow Gateway</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
              Agritech Bharat Payment Gateway
            </h2>
            <p className="text-[#D0C8BB] text-xs mt-0.5">
              Multi-channel wholesale settlement for agricultural commodities • 100% Escrow Protection
            </p>
          </div>

          <div className="bg-[#1A2E21] border border-[#3E5F46] px-4 py-2.5 rounded-xl text-right">
            <span className="text-[10px] text-[#A8A196] block uppercase tracking-wider font-mono">
              Total Escrow Amount
            </span>
            <div className="text-2xl font-serif font-bold text-amber-200 font-mono">
              ₹{grandTotal.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-[#D0C8BB] block">
              For {totalQuantityTons} MT ({items.length} {items.length === 1 ? 'Lot' : 'Lots'})
            </span>
          </div>
        </div>
      </div>

      {isCompleted ? (
        /* Completed Payment Tax Invoice View */
        <div className="p-6 sm:p-8 space-y-6 bg-white">
          <div className="bg-[#EBF3ED] border border-[#C6DFC9] rounded-2xl p-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-white border border-[#C6DFC9] text-[#2D4F38] mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-[#2D4F38]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#233B2B]">
              Escrow Funds Successfully Locked!
            </h3>
            <p className="text-xs sm:text-sm text-[#5C554B] max-w-xl mx-auto leading-relaxed">
              Your payment of <strong className="text-[#233B2B] font-mono">₹{grandTotal.toLocaleString('en-IN')}</strong> is secured in the <strong>Agritech Bharat Escrow Trust Account</strong>. The seller farmers/FPOs have received verified dispatch instructions.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className="bg-white border border-[#C6DFC9] px-3 py-1 rounded-full text-xs font-mono text-[#233B2B] font-bold">
                Tax Invoice #{invoiceNumber}
              </span>
              <span className="bg-[#2D4F38] text-white px-3 py-1 rounded-full text-xs font-semibold">
                Status: Escrow Locked & e-Way Bill Active
              </span>
            </div>
          </div>

          {/* Printable / Downloadable Mandi Tax Bill */}
          <div className="border border-[#E8E5DF] bg-[#FAF9F6] rounded-2xl p-6 space-y-5">
            <div className="flex flex-wrap justify-between items-start pb-4 border-b border-[#E8E5DF] gap-4">
              <div>
                <span className="text-xs font-bold text-[#233B2B] uppercase tracking-wider font-serif">
                  AGRITECH BHARAT COMMODITY EXCHANGE
                </span>
                <h4 className="text-lg font-serif font-bold text-[#1C1C1C]">e-Mandi Tax Invoice & Sauda Slip</h4>
                <div className="text-xs text-[#7A746B] mt-1 space-y-0.5">
                  <p>GSTIN: 27AABCA1234F1Z9 • APMC Reg: MH-B2B-2026-9042</p>
                  <p>Delivery: {destinationAddress}</p>
                </div>
              </div>

              <div className="text-right text-xs">
                <p className="text-[#7A746B]">Date & Time: <strong className="text-[#1C1C1C] font-mono">{new Date().toLocaleString('en-IN')}</strong></p>
                <p className="text-[#7A746B]">Payment Channel: <strong className="text-[#2D4F38] uppercase font-mono">{selectedChannel.replace('_', ' ')}</strong></p>
                <p className="text-[#7A746B]">Buyer: <strong className="text-[#1C1C1C]">{currentUser.orgName || currentUser.name}</strong></p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#D5CCBD] text-[#7A746B]">
                    <th className="py-2 font-serif">Crop Commodity Lot</th>
                    <th className="py-2 font-serif">Producer FPO / Kisan</th>
                    <th className="py-2 text-right font-serif">Quantity (MT)</th>
                    <th className="py-2 text-right font-serif">Rate (₹/MT)</th>
                    <th className="py-2 text-right font-serif">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEBE3]">
                  {items.map((item, i) => (
                    <tr key={i} className="text-[#1C1C1C]">
                      <td className="py-2.5 font-semibold font-serif">
                        {item.listing.cropName}
                        <span className="block text-[10px] text-[#7A746B] font-mono font-normal">
                          Grade: {item.listing.grade} | Moisture: {item.listing.moistureContent}%
                        </span>
                      </td>
                      <td className="py-2.5 text-[#5C554B]">{item.listing.farmerName}</td>
                      <td className="py-2.5 text-right font-mono font-medium">{item.quantityTons} MT</td>
                      <td className="py-2.5 text-right font-mono">₹{item.customPricePerTon.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 text-right font-mono font-semibold">
                        ₹{(item.quantityTons * item.customPricePerTon).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="border-t border-[#D5CCBD] pt-3 space-y-1.5 text-xs text-[#5C554B]">
              <div className="flex justify-between">
                <span>Commodity Base Total:</span>
                <span className="font-mono text-[#1C1C1C]">₹{rawCropSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Logistics & Freight:</span>
                <span className="font-mono text-[#1C1C1C]">₹{netLogisticsFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>AGMARK Lab Quality Testing & Escrow Fee (1%):</span>
                <span className="font-mono text-[#1C1C1C]">₹{escrowInspectionFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>APMC Mandi Tax / Agricultural Cess (Exempt under Section 10):</span>
                <span className="font-mono text-[#2D4F38] font-semibold">₹0 (Exempt)</span>
              </div>
              <div className="border-t border-[#D5CCBD] pt-2 flex justify-between font-bold text-sm text-[#1C1C1C]">
                <span className="font-serif">Total Escrow Amount Authorized:</span>
                <span className="text-[#2D4F38] font-mono text-base">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Trust milestone timeline */}
            <div className="bg-white border border-[#E8E5DF] p-3.5 rounded-xl space-y-2 text-xs">
              <span className="font-serif font-bold text-[#233B2B] block text-[11px] uppercase tracking-wider">
                Escrow Release Milestones
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2 bg-[#EBF3ED] rounded-lg border border-[#C6DFC9]">
                  <strong className="text-[#233B2B] block">1. Mandi Weighbridge</strong>
                  <span className="text-[#5C554B]">Truck tare & gross weight slip validated electronically.</span>
                </div>
                <div className="p-2 bg-[#FAF9F6] rounded-lg border border-[#E8E5DF]">
                  <strong className="text-[#1C1C1C] block">2. AGMARK Moisture Test</strong>
                  <span className="text-[#7A746B]">Lab digital meter confirms specs within contract cap.</span>
                </div>
                <div className="p-2 bg-[#FAF9F6] rounded-lg border border-[#E8E5DF]">
                  <strong className="text-[#1C1C1C] block">3. Direct Farmer Settlement</strong>
                  <span className="text-[#7A746B]">Funds disbursed to farmer bank account within 2 hours.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="py-2.5 px-4 bg-[#F4F1EA] hover:bg-[#EAE4D7] text-[#1C1C1C] border border-[#D5CCBD] font-semibold rounded-xl text-xs transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-[#5C554B]" />
              <span>Print / Download Mandi Invoice</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="py-2.5 px-6 bg-[#2D4F38] hover:bg-[#1E3727] text-white font-semibold rounded-xl text-xs transition flex items-center gap-2 border border-[#3E654B] shadow-xs"
            >
              <span>Back to Buying & Procurement Portal</span>
              <ArrowRight className="w-4 h-4 text-amber-200" />
            </button>
          </div>
        </div>
      ) : isProcessing ? (
        /* Live Processing Simulator */
        <div className="p-10 sm:p-14 bg-white text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="w-20 h-20 rounded-full border-4 border-[#D5CCBD] border-t-[#2D4F38] animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-[#2D4F38]">
              <Lock className="w-7 h-7" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-serif font-bold text-[#1C1C1C]">
              Securing e-NAM Escrow Authorization
            </h3>
            <p className="text-sm font-mono text-[#2D4F38] font-semibold animate-pulse">
              {processingStep}
            </p>
            <p className="text-xs text-[#7A746B] max-w-sm mx-auto">
              Please do not refresh or close this window. 256-bit SSL encrypted connection with Reserve Bank of India clearing network.
            </p>
          </div>
        </div>
      ) : (
        /* Interactive Payment Gateway Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E8E5DF] bg-white">
          {/* Left Column: Payment Channels Tabs */}
          <div className="lg:col-span-4 p-4 sm:p-5 bg-[#FAF9F6] space-y-2">
            <span className="text-[11px] font-bold text-[#7A746B] uppercase tracking-wider block mb-2 font-serif">
              Select Payment Method
            </span>

            {/* UPI & QR */}
            <button
              type="button"
              id="pay-tab-upi"
              onClick={() => setSelectedChannel('UPI_QR')}
              className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 ${
                selectedChannel === 'UPI_QR'
                  ? 'bg-white border-[#2D4F38] shadow-xs ring-1 ring-[#2D4F38]'
                  : 'bg-white/60 border-[#E8E5DF] hover:bg-white text-[#5C554B]'
              }`}
            >
              <div className={`p-2 rounded-lg ${selectedChannel === 'UPI_QR' ? 'bg-[#2D4F38] text-amber-200' : 'bg-[#EFEBE3] text-[#5C554B]'}`}>
                <QrCode className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-xs text-[#1C1C1C]">UPI & Mandi QR</span>
                  <span className="text-[10px] bg-[#EBF3ED] text-[#2D4F38] px-1.5 py-0.5 rounded font-bold">Fastest</span>
                </div>
                <p className="text-[11px] text-[#7A746B] mt-0.5 truncate">
                  BHIM, PhonePe, Google Pay, Paytm
                </p>
              </div>
            </button>

            {/* Corporate NetBanking */}
            <button
              type="button"
              id="pay-tab-netbanking"
              onClick={() => setSelectedChannel('NET_BANKING')}
              className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 ${
                selectedChannel === 'NET_BANKING'
                  ? 'bg-white border-[#2D4F38] shadow-xs ring-1 ring-[#2D4F38]'
                  : 'bg-white/60 border-[#E8E5DF] hover:bg-white text-[#5C554B]'
              }`}
            >
              <div className={`p-2 rounded-lg ${selectedChannel === 'NET_BANKING' ? 'bg-[#2D4F38] text-amber-200' : 'bg-[#EFEBE3] text-[#5C554B]'}`}>
                <Building className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-xs text-[#1C1C1C]">Corporate NetBanking</span>
                </div>
                <p className="text-[11px] text-[#7A746B] mt-0.5 truncate">
                  SBI, HDFC, ICICI, Axis, PNB
                </p>
              </div>
            </button>

            {/* RTGS / NEFT Virtual Escrow Account */}
            <button
              type="button"
              id="pay-tab-rtgs"
              onClick={() => setSelectedChannel('RTGS_NEFT')}
              className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 ${
                selectedChannel === 'RTGS_NEFT'
                  ? 'bg-white border-[#2D4F38] shadow-xs ring-1 ring-[#2D4F38]'
                  : 'bg-white/60 border-[#E8E5DF] hover:bg-white text-[#5C554B]'
              }`}
            >
              <div className={`p-2 rounded-lg ${selectedChannel === 'RTGS_NEFT' ? 'bg-[#2D4F38] text-amber-200' : 'bg-[#EFEBE3] text-[#5C554B]'}`}>
                <Landmark className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-xs text-[#1C1C1C]">RTGS / NEFT Escrow</span>
                  <span className="text-[10px] bg-[#FAF1D6] text-[#8C4A32] px-1.5 py-0.5 rounded font-bold">&gt; ₹1 Lakh</span>
                </div>
                <p className="text-[11px] text-[#7A746B] mt-0.5 truncate">
                  Designated e-NAM Virtual Account
                </p>
              </div>
            </button>

            {/* 30-Day Ag-Credit Line */}
            <button
              type="button"
              id="pay-tab-agri-credit"
              onClick={() => setSelectedChannel('AGRI_CREDIT')}
              className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 ${
                selectedChannel === 'AGRI_CREDIT'
                  ? 'bg-white border-[#2D4F38] shadow-xs ring-1 ring-[#2D4F38]'
                  : 'bg-white/60 border-[#E8E5DF] hover:bg-white text-[#5C554B]'
              }`}
            >
              <div className={`p-2 rounded-lg ${selectedChannel === 'AGRI_CREDIT' ? 'bg-[#2D4F38] text-amber-200' : 'bg-[#EFEBE3] text-[#5C554B]'}`}>
                <Wallet className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-xs text-[#1C1C1C]">e-NAM Agri-Credit</span>
                  <span className="text-[10px] bg-[#E8E1D5] text-[#233B2B] px-1.5 py-0.5 rounded font-bold">14-Day 0%</span>
                </div>
                <p className="text-[11px] text-[#7A746B] mt-0.5 truncate">
                  Enterprise revolving credit line
                </p>
              </div>
            </button>

            {/* Cards */}
            <button
              type="button"
              id="pay-tab-cards"
              onClick={() => setSelectedChannel('CARD')}
              className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 ${
                selectedChannel === 'CARD'
                  ? 'bg-white border-[#2D4F38] shadow-xs ring-1 ring-[#2D4F38]'
                  : 'bg-white/60 border-[#E8E5DF] hover:bg-white text-[#5C554B]'
              }`}
            >
              <div className={`p-2 rounded-lg ${selectedChannel === 'CARD' ? 'bg-[#2D4F38] text-amber-200' : 'bg-[#EFEBE3] text-[#5C554B]'}`}>
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-xs text-[#1C1C1C]">Corporate Cards</span>
                </div>
                <p className="text-[11px] text-[#7A746B] mt-0.5 truncate">
                  RuPay Corporate, Visa, Mastercard
                </p>
              </div>
            </button>

            {/* Security assurance */}
            <div className="pt-3 border-t border-[#E8E5DF] text-[11px] text-[#7A746B] space-y-1">
              <div className="flex items-center gap-1 text-[#2D4F38] font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>256-Bit Bank Grade Security</span>
              </div>
              <p>Certified by e-NAM & National Payments Corporation of India (NPCI).</p>
            </div>
          </div>

          {/* Right Column: Active Channel Form & Action */}
          <div className="lg:col-span-8 p-5 sm:p-7 space-y-6">
            {/* CHANNEL 1: UPI & QR */}
            {selectedChannel === 'UPI_QR' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8E5DF] pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#1C1C1C]">
                      Scan Mandi QR or Enter UPI VPA ID
                    </h3>
                    <p className="text-xs text-[#7A746B]">
                      Zero-fee instant settlement with immediate escrow locking.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#C2593F] font-mono font-bold bg-[#FAF1D6] px-2.5 py-1 rounded-lg border border-[#E2D4B7]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Session Expires: {formatTimer(timerSeconds)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  {/* Dynamic QR Code */}
                  <div className="sm:col-span-5 bg-[#FAF9F6] p-4 rounded-2xl border border-[#D5CCBD] text-center space-y-3">
                    <div className="bg-white p-3 rounded-xl border border-[#E8E5DF] inline-block shadow-xs">
                      {/* Stylized QR Code SVG */}
                      <svg className="w-36 h-36 mx-auto" viewBox="0 0 100 100" fill="currentColor">
                        {/* Corner squares */}
                        <rect x="5" y="5" width="28" height="28" rx="4" fill="#233B2B" />
                        <rect x="10" y="10" width="18" height="18" rx="2" fill="white" />
                        <rect x="14" y="14" width="10" height="10" rx="1" fill="#233B2B" />

                        <rect x="67" y="5" width="28" height="28" rx="4" fill="#233B2B" />
                        <rect x="72" y="10" width="18" height="18" rx="2" fill="white" />
                        <rect x="76" y="14" width="10" height="10" rx="1" fill="#233B2B" />

                        <rect x="5" y="67" width="28" height="28" rx="4" fill="#233B2B" />
                        <rect x="10" y="72" width="18" height="18" rx="2" fill="white" />
                        <rect x="14" y="76" width="10" height="10" rx="1" fill="#233B2B" />

                        {/* Pixel pattern */}
                        <rect x="38" y="8" width="8" height="8" rx="1" fill="#233B2B" />
                        <rect x="50" y="8" width="8" height="8" rx="1" fill="#C2593F" />
                        <rect x="38" y="20" width="8" height="8" rx="1" fill="#233B2B" />
                        <rect x="50" y="20" width="8" height="8" rx="1" fill="#233B2B" />

                        <rect x="8" y="38" width="8" height="8" rx="1" fill="#233B2B" />
                        <rect x="20" y="38" width="8" height="8" rx="1" fill="#C2593F" />
                        <rect x="8" y="50" width="8" height="8" rx="1" fill="#233B2B" />
                        <rect x="20" y="50" width="8" height="8" rx="1" fill="#233B2B" />

                        <rect x="38" y="38" width="24" height="24" rx="2" fill="#233B2B" />
                        <rect x="42" y="42" width="16" height="16" rx="1" fill="#FAF9F6" />
                        <circle cx="50" cy="50" r="4" fill="#C2593F" />

                        <rect x="67" y="38" width="8" height="8" rx="1" fill="#233B2B" />
                        <rect x="79" y="38" width="8" height="8" rx="1" fill="#233B2B" />
                        <rect x="67" y="50" width="8" height="8" rx="1" fill="#C2593F" />
                        <rect x="79" y="50" width="8" height="8" rx="1" fill="#233B2B" />

                        <rect x="38" y="67" width="8" height="8" rx="1" fill="#233B2B" />
                        <rect x="50" y="67" width="8" height="8" rx="1" fill="#233B2B" />
                        <rect x="38" y="79" width="8" height="8" rx="1" fill="#C2593F" />
                        <rect x="50" y="79" width="8" height="8" rx="1" fill="#233B2B" />

                        <rect x="67" y="67" width="12" height="12" rx="2" fill="#233B2B" />
                        <rect x="83" y="67" width="8" height="8" rx="1" fill="#233B2B" />
                        <rect x="67" y="83" width="8" height="8" rx="1" fill="#233B2B" />
                        <rect x="79" y="79" width="12" height="12" rx="2" fill="#233B2B" />
                      </svg>
                    </div>
                    <div className="text-[11px] font-mono font-semibold text-[#2D4F38]">
                      UPI ID: agritech.escrow@icici
                    </div>
                    <p className="text-[10px] text-[#7A746B]">
                      Scan using Google Pay, PhonePe, BHIM or Paytm
                    </p>
                  </div>

                  {/* VPA Input */}
                  <div className="sm:col-span-7 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#5C554B] mb-1 font-serif">
                        Or Enter Verified Corporate / Kisan VPA
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="upi-vpa-input"
                          value={vpaInput}
                          onChange={(e) => { setVpaInput(e.target.value); setVpaVerified(false); }}
                          placeholder="e.g. mobile@upi or org@bank"
                          className="flex-1 px-3 py-2 text-sm bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                        />
                        <button
                          type="button"
                          id="verify-vpa-btn"
                          onClick={handleVerifyVpa}
                          disabled={vpaVerifying || vpaVerified}
                          className="px-3.5 py-2 bg-[#F4F1EA] hover:bg-[#EAE4D7] border border-[#D5CCBD] text-xs font-semibold rounded-lg text-[#1C1C1C] transition disabled:opacity-50"
                        >
                          {vpaVerifying ? 'Verifying...' : vpaVerified ? '✓ Verified' : 'Verify'}
                        </button>
                      </div>
                      {vpaVerified && (
                        <div className="flex items-center gap-1.5 text-xs text-[#2D4F38] mt-1.5 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Linked Account: {currentUser.orgName || currentUser.name} (NPCI Verified)</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E8E5DF] text-xs space-y-1">
                      <span className="font-semibold text-[#1C1C1C] block">UPI Instant Simulation Note:</span>
                      <p className="text-[#5C554B]">
                        Clicking the button below will immediately trigger the simulated UPI escrow authorization prompt.
                      </p>
                    </div>

                    <button
                      type="button"
                      id="upi-pay-btn"
                      onClick={executePayment}
                      className="w-full py-3 px-4 bg-[#C2593F] hover:bg-[#A84A33] text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-xs border border-[#D97259]"
                    >
                      <Smartphone className="w-4 h-4 text-amber-200" />
                      <span>Pay ₹{grandTotal.toLocaleString('en-IN')} via UPI Escrow</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CHANNEL 2: Corporate NetBanking */}
            {selectedChannel === 'NET_BANKING' && (
              <div className="space-y-5">
                <div className="border-b border-[#E8E5DF] pb-3">
                  <h3 className="font-serif font-bold text-base text-[#1C1C1C]">
                    Corporate & Institutional NetBanking
                  </h3>
                  <p className="text-xs text-[#7A746B]">
                    Direct bank clearing with multi-signatory / corporate maker-checker authorization.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C554B] mb-2 font-serif">
                    Select Your Bank
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {INDIAN_BANKS.map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setSelectedBank(bank.id)}
                        className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                          selectedBank === bank.id
                            ? 'border-[#2D4F38] bg-[#EBF3ED] ring-1 ring-[#2D4F38] font-semibold text-[#1C1C1C]'
                            : 'border-[#E8E5DF] bg-[#FAF9F6] hover:bg-white text-[#5C554B]'
                        }`}
                      >
                        <span className="text-xl">{bank.logo}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium truncate">{bank.name}</div>
                          <div className="text-[10px] text-[#7A746B] font-mono">{bank.ifscPrefix} Gateway</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#5C554B] mb-1 font-serif">
                      Corporate Customer ID / User ID
                    </label>
                    <input
                      type="text"
                      value={corpUserId}
                      onChange={(e) => setCorpUserId(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5C554B] mb-1 font-serif">
                      Signatory Transaction OTP
                    </label>
                    <input
                      type="password"
                      value={authOtp}
                      onChange={(e) => setAuthOtp(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  id="netbanking-pay-btn"
                  onClick={executePayment}
                  className="w-full py-3 px-4 bg-[#C2593F] hover:bg-[#A84A33] text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-xs border border-[#D97259]"
                >
                  <Building className="w-4 h-4 text-amber-200" />
                  <span>Authorize ₹{grandTotal.toLocaleString('en-IN')} via NetBanking</span>
                </button>
              </div>
            )}

            {/* CHANNEL 3: RTGS / NEFT Virtual Escrow Account */}
            {selectedChannel === 'RTGS_NEFT' && (
              <div className="space-y-5">
                <div className="border-b border-[#E8E5DF] pb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base text-[#1C1C1C]">
                      e-NAM Designated Virtual Escrow Account
                    </h3>
                    <span className="text-[10px] bg-[#FAF1D6] text-[#8C4A32] font-bold px-2 py-0.5 rounded border border-[#E2D4B7]">
                      For Wholesale Transfers
                    </span>
                  </div>
                  <p className="text-xs text-[#7A746B] mt-0.5">
                    Transfer directly via your corporate treasury or RTGS window. System auto-reconciles within 60 seconds.
                  </p>
                </div>

                <div className="bg-[#FAF9F6] border border-[#D5CCBD] rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center py-1.5 border-b border-[#E8E5DF]">
                    <div>
                      <span className="text-[10px] text-[#7A746B] uppercase font-mono block">Beneficiary Name</span>
                      <strong className="text-xs text-[#1C1C1C]">{virtualAccount.beneficiaryName}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(virtualAccount.beneficiaryName, 'ben')}
                      className="p-1.5 text-xs text-[#2D4F38] hover:bg-white rounded-lg border border-[#D5CCBD] flex items-center gap-1"
                    >
                      {copiedField === 'ben' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'ben' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-[#E8E5DF]">
                    <div>
                      <span className="text-[10px] text-[#7A746B] uppercase font-mono block">Virtual Escrow Account No.</span>
                      <strong className="text-xs text-[#1C1C1C] font-mono">{virtualAccount.accountNumber}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(virtualAccount.accountNumber, 'acc')}
                      className="p-1.5 text-xs text-[#2D4F38] hover:bg-white rounded-lg border border-[#D5CCBD] flex items-center gap-1"
                    >
                      {copiedField === 'acc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'acc' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-[#E8E5DF]">
                    <div>
                      <span className="text-[10px] text-[#7A746B] uppercase font-mono block">IFSC Code</span>
                      <strong className="text-xs text-[#1C1C1C] font-mono">{virtualAccount.ifsc}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(virtualAccount.ifsc, 'ifsc')}
                      className="p-1.5 text-xs text-[#2D4F38] hover:bg-white rounded-lg border border-[#D5CCBD] flex items-center gap-1"
                    >
                      {copiedField === 'ifsc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'ifsc' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="flex justify-between items-center py-1.5">
                    <div>
                      <span className="text-[10px] text-[#7A746B] uppercase font-mono block">Bank & Branch</span>
                      <strong className="text-xs text-[#1C1C1C]">{virtualAccount.bankName}</strong>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C554B] mb-1 font-serif">
                    Enter Bank UTR / Transaction Reference (Optional for Instant Auto-Match)
                  </label>
                  <input
                    type="text"
                    id="rtgs-utr-input"
                    value={virtualUtr}
                    onChange={(e) => setVirtualUtr(e.target.value)}
                    placeholder="e.g. SBIN202608309874102"
                    className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  id="rtgs-pay-btn"
                  onClick={executePayment}
                  className="w-full py-3 px-4 bg-[#C2593F] hover:bg-[#A84A33] text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-xs border border-[#D97259]"
                >
                  <Landmark className="w-4 h-4 text-amber-200" />
                  <span>Confirm RTGS Transfer & Lock Escrow (₹{grandTotal.toLocaleString('en-IN')})</span>
                </button>
              </div>
            )}

            {/* CHANNEL 4: Agri-Credit Line */}
            {selectedChannel === 'AGRI_CREDIT' && (
              <div className="space-y-5">
                <div className="border-b border-[#E8E5DF] pb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base text-[#1C1C1C]">
                      e-NAM Verified Agri-Credit Line
                    </h3>
                    <span className="text-[10px] bg-[#E8E1D5] text-[#233B2B] font-bold px-2 py-0.5 rounded border border-[#D5CCBD]">
                      0% Interest for 14 Days
                    </span>
                  </div>
                  <p className="text-xs text-[#7A746B] mt-0.5">
                    Utilize your pre-approved institutional credit facility for grain and spice procurement.
                  </p>
                </div>

                <div className="bg-[#FAF9F6] border border-[#C6DFC9] rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#5C554B]">Sanctioned Enterprise Limit:</span>
                    <strong className="text-xs font-mono text-[#1C1C1C]">₹50,00,000</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#5C554B]">Available Balance:</span>
                    <strong className="text-xs font-mono text-[#2D4F38]">₹42,80,000</strong>
                  </div>
                  <div className="w-full bg-[#E8E5DF] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#2D4F38] h-full" style={{ width: '85%' }}></div>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-[#7A746B]">
                    <span>Current Order Amount:</span>
                    <span className="font-mono font-bold text-[#C2593F]">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="p-3 bg-[#EBF3ED] border border-[#C6DFC9] rounded-xl text-xs text-[#233B2B] space-y-1">
                  <strong>Repayment Schedule:</strong>
                  <p className="text-[11px] text-[#5C554B]">
                    Full invoice amount of ₹{grandTotal.toLocaleString('en-IN')} due on {new Date(Date.now() + 14 * 86400000).toLocaleDateString('en-IN')}. Zero interest charged during the initial 14-day escrow window.
                  </p>
                </div>

                <button
                  type="button"
                  id="credit-pay-btn"
                  onClick={executePayment}
                  className="w-full py-3 px-4 bg-[#C2593F] hover:bg-[#A84A33] text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-xs border border-[#D97259]"
                >
                  <Wallet className="w-4 h-4 text-amber-200" />
                  <span>Execute with 14-Day 0% Agri-Credit</span>
                </button>
              </div>
            )}

            {/* CHANNEL 5: Corporate Cards */}
            {selectedChannel === 'CARD' && (
              <div className="space-y-5">
                <div className="border-b border-[#E8E5DF] pb-3">
                  <h3 className="font-serif font-bold text-base text-[#1C1C1C]">
                    Corporate Debit / Commercial Credit Card
                  </h3>
                  <p className="text-xs text-[#7A746B]">
                    RuPay Corporate, Visa Commercial, Mastercard B2B.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#5C554B] mb-1 font-serif">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="card-num-input"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#5C554B] mb-1 font-serif">
                        Valid Thru (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#5C554B] mb-1 font-serif">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5C554B] mb-1 font-serif">
                      Cardholder / Authorized Signatory Name
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#D5CCBD] rounded-lg focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  id="card-pay-btn"
                  onClick={executePayment}
                  className="w-full py-3 px-4 bg-[#C2593F] hover:bg-[#A84A33] text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-xs border border-[#D97259]"
                >
                  <CreditCard className="w-4 h-4 text-amber-200" />
                  <span>Authorize ₹{grandTotal.toLocaleString('en-IN')} via Card</span>
                </button>
              </div>
            )}

            {/* Bottom Back Button */}
            <div className="pt-2 flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={onCancel}
                className="text-[#7A746B] hover:text-[#1C1C1C] flex items-center gap-1 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Modify Procurement Items</span>
              </button>
              <span className="text-[#8A847A] text-[11px]">
                Secured by Agritech Bharat Escrow Trust
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
