import React, { useState } from 'react';
import { OrderTransaction } from '../types';
import { 
  X, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  FileText, 
  Phone, 
  Navigation, 
  Building, 
  Calendar, 
  Layers,
  ArrowRight,
  ExternalLink,
  Download,
  Printer,
  Sparkles,
  Share2
} from 'lucide-react';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: OrderTransaction | null;
  onUpdateStatus?: (transactionId: string, newStatus: OrderTransaction['status']) => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onUpdateStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'tracking' | 'invoice' | 'ewaybill'>('tracking');
  const [simulatedCopied, setSimulatedCopied] = useState<boolean>(false);

  if (!isOpen || !transaction) return null;

  const getStepIndex = (status: OrderTransaction['status']) => {
    switch (status) {
      case 'Escrow Locked': return 1;
      case 'Inspection Passed': return 2;
      case 'In Transit': return 3;
      case 'Delivered & Paid': return 4;
      default: return 1;
    }
  };

  const currentStep = getStepIndex(transaction.status);

  const trackingSteps = [
    {
      step: 1,
      title: 'Order Confirmed & Escrow Locked',
      description: 'Payment authorized into 100% Reserve Bank e-NAM Escrow Vault.',
      time: transaction.timestamp,
      location: 'Agritech Bharat Digital Exchange',
      completed: currentStep >= 1,
      current: currentStep === 1,
    },
    {
      step: 2,
      title: 'Farmgate AGMARK & Moisture Inspection Passed',
      description: 'Lot verified at farmgate weighbridge; Moisture certified <12.5%.',
      time: currentStep >= 2 ? 'Same Day + 4 Hrs' : 'Pending inspection team dispatch',
      location: transaction.sellerName,
      completed: currentStep >= 2,
      current: currentStep === 2,
    },
    {
      step: 3,
      title: 'Loaded & In-Transit (e-Way Bill Issued)',
      description: 'Consignment secured under weather-sealed tarpaulin. GPS live tracking active.',
      time: currentStep >= 3 ? 'In Progress • ETA 24-48 Hrs' : 'Awaiting loading bay release',
      location: transaction.currentCheckpoint || 'NH-48 Intermodal Freight Corridor',
      completed: currentStep >= 3,
      current: currentStep === 3,
    },
    {
      step: 4,
      title: 'Delivered at Consignee Godown & Escrow Released',
      description: 'Tare weighbridge slip matched. Funds cleared directly to Kisan account.',
      time: currentStep >= 4 ? 'Delivery Completed' : 'Estimated delivery window',
      location: transaction.destination,
      completed: currentStep >= 4,
      current: currentStep === 4,
    }
  ];

  const handleShareTracking = () => {
    navigator.clipboard?.writeText(`Tracking link for Order #${transaction.id}: https://agritechbharat.in/track/${transaction.id}`);
    setSimulatedCopied(true);
    setTimeout(() => setSimulatedCopied(false), 2500);
  };

  const handleNextStatus = () => {
    if (!onUpdateStatus) return;
    if (transaction.status === 'Escrow Locked') onUpdateStatus(transaction.id, 'Inspection Passed');
    else if (transaction.status === 'Inspection Passed') onUpdateStatus(transaction.id, 'In Transit');
    else if (transaction.status === 'In Transit') onUpdateStatus(transaction.id, 'Delivered & Paid');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-[#FAF9F6] border border-[#E8E5DF] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden text-[#1C1C1C]">
        {/* Header */}
        <div className="bg-[#233B2B] text-[#FAF9F6] p-5 sm:p-6 flex items-center justify-between border-b border-[#37523E]">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-amber-200 text-xs font-semibold uppercase tracking-wider font-serif">
              <Truck className="w-4 h-4 text-amber-300" />
              <span>Consignment Live Tracking & Logistics Portal</span>
            </div>
            <div className="flex items-baseline gap-3">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                Order #{transaction.id}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-md font-mono font-semibold bg-[#1B2F22] text-amber-200 border border-[#3E5C47]">
                {transaction.status}
              </span>
            </div>
            <p className="text-xs text-[#D0C8BB]">
              {transaction.cropName} • {transaction.quantityTons} Metric Tons ({transaction.quantityTons * 10} Quintals)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleShareTracking}
              className="p-2 rounded-lg bg-[#1B2F22] border border-[#3E5C47] text-[#D0C8BB] hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
              title="Share Tracking Link"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{simulatedCopied ? 'Link Copied!' : 'Share'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-[#D0C8BB] hover:text-white p-2 rounded-lg hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Tracking / Invoice / e-Way Bill) */}
        <div className="flex border-b border-[#E8E5DF] bg-white px-6">
          <button
            type="button"
            onClick={() => setActiveTab('tracking')}
            className={`py-3 px-4 text-xs font-bold font-serif border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'tracking'
                ? 'border-[#233B2B] text-[#233B2B]'
                : 'border-transparent text-[#7A746B] hover:text-[#1C1C1C]'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Live Consignment Timeline</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ewaybill')}
            className={`py-3 px-4 text-xs font-bold font-serif border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'ewaybill'
                ? 'border-[#233B2B] text-[#233B2B]'
                : 'border-transparent text-[#7A746B] hover:text-[#1C1C1C]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>APMC e-Way Bill & Gate Pass</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('invoice')}
            className={`py-3 px-4 text-xs font-bold font-serif border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'invoice'
                ? 'border-[#233B2B] text-[#233B2B]'
                : 'border-transparent text-[#7A746B] hover:text-[#1C1C1C]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>GST Tax Invoice & Escrow Vault</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {activeTab === 'tracking' && (
            <div className="space-y-6">
              {/* Delivery ETA & Header Card */}
              <div className="bg-[#EBF3ED] border border-[#C6DFC9] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[11px] font-mono text-[#2D4F38] font-bold uppercase tracking-wider block">
                    Estimated Delivery Window
                  </span>
                  <h3 className="text-lg font-serif font-bold text-[#1C1C1C] mt-0.5">
                    {transaction.status === 'Delivered & Paid'
                      ? 'Consignment Delivered Successfully'
                      : 'Arrival in 24 - 48 Hours • Morning Slot (06:00 AM - 11:00 AM)'}
                  </h3>
                  <p className="text-xs text-[#5C554B] mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#2D4F38]" />
                    <span>Destination: <strong>{transaction.destination}</strong></span>
                  </p>
                </div>

                {onUpdateStatus && transaction.status !== 'Delivered & Paid' && (
                  <button
                    type="button"
                    onClick={handleNextStatus}
                    className="px-3.5 py-2 bg-[#233B2B] hover:bg-[#1B2F22] text-amber-200 rounded-xl text-xs font-semibold transition border border-[#3E5C47] shadow-xs flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Advance Status (Demo Sim)</span>
                  </button>
                )}
              </div>

              {/* Amazon Style Step Progress Bar */}
              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#D5CCBD]">
                {trackingSteps.map((step) => (
                  <div key={step.step} className="relative flex items-start space-x-4 group">
                    {/* Circle icon */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${
                        step.completed
                          ? 'bg-[#233B2B] text-amber-200 ring-4 ring-[#EBF3ED]'
                          : step.current
                          ? 'bg-amber-500 text-white animate-pulse ring-4 ring-amber-100'
                          : 'bg-white border-2 border-[#D5CCBD] text-[#7A746B]'
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        step.step
                      )}
                    </div>

                    {/* Step details */}
                    <div className="flex-1 bg-white border border-[#E8E5DF] rounded-xl p-4 shadow-xs">
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <h4 className="font-serif font-bold text-sm text-[#1C1C1C]">
                          {step.title}
                        </h4>
                        <span className="text-[11px] font-mono text-[#7A746B]">
                          {step.time}
                        </span>
                      </div>
                      <p className="text-xs text-[#5C554B] leading-relaxed">
                        {step.description}
                      </p>
                      <div className="mt-2 pt-2 border-t border-[#F0ECE1] flex items-center justify-between text-[11px] text-[#7A746B]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#2D4F38]" />
                          <span>{step.location}</span>
                        </span>
                        {step.completed && (
                          <span className="text-[#2D4F38] font-semibold text-[10px] uppercase font-mono">
                            Verified on-chain
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Driver & Heavy Vehicle Card */}
              <div className="bg-white border border-[#E8E5DF] rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-[#233B2B] text-amber-200 flex items-center justify-center">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#1C1C1C]">
                        Dedicated Transporter & Vehicle Info
                      </h4>
                      <span className="text-[10px] text-[#7A746B] block">
                        {transaction.logisticsPartner || 'Agritech Bharat Intermodal Fleet'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-[#EBF3ED] text-[#233B2B] px-2.5 py-1 rounded-lg text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Live GPS Active</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-[#FAF9F6] border border-[#E8E5DF] rounded-xl p-3">
                    <span className="text-[10px] text-[#7A746B] block uppercase font-mono">Commercial Vehicle</span>
                    <strong className="text-sm font-mono text-[#1C1C1C] block mt-0.5">
                      {transaction.truckNumber || 'MH 12 QX 9821'}
                    </strong>
                    <span className="text-[10px] text-[#5C554B]">16-Wheeler Multi-Axle Tarpaulin Truck</span>
                  </div>

                  <div className="bg-[#FAF9F6] border border-[#E8E5DF] rounded-xl p-3">
                    <span className="text-[10px] text-[#7A746B] block uppercase font-mono">Assigned Driver</span>
                    <strong className="text-sm font-serif font-bold text-[#1C1C1C] block mt-0.5">
                      {transaction.driverName || 'Gurpreet Singh'}
                    </strong>
                    <span className="text-[10px] text-[#2D4F38] font-semibold">KYC & License Verified</span>
                  </div>

                  <div className="bg-[#FAF9F6] border border-[#E8E5DF] rounded-xl p-3 flex flex-col justify-between">
                    <span className="text-[10px] text-[#7A746B] block uppercase font-mono">Driver Direct Contact</span>
                    <a
                      href={`tel:${transaction.driverPhone || '+919876543210'}`}
                      className="mt-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#233B2B] text-amber-200 rounded-lg text-xs font-semibold hover:bg-[#1B2F22] transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{transaction.driverPhone || '+91 98765 43210'}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Delivery Consignee Address Details */}
              <div className="bg-white border border-[#E8E5DF] rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 font-serif font-bold text-sm text-[#1C1C1C] border-b border-[#E8E5DF] pb-2">
                  <Building className="w-4 h-4 text-[#2D4F38]" />
                  <span>Consignee Godown & Unloading Facility</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#5C554B]">
                  <div>
                    <span className="text-[10px] text-[#7A746B] block uppercase font-mono">Destination Facility</span>
                    <p className="font-semibold text-[#1C1C1C] mt-0.5">{transaction.destination}</p>
                    <p className="text-[11px] text-[#7A746B] mt-1">Inward Gate: <strong>Gate No. 4 (Weighbridge Scale 2)</strong></p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#7A746B] block uppercase font-mono">Consignee Contact & Hours</span>
                    <p className="font-semibold text-[#1C1C1C] mt-0.5">{transaction.buyerName}</p>
                    <p className="text-[11px] text-[#7A746B] mt-1">Gate Hours: <strong>24x7 Inward with Weighbridge</strong></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* APMC e-Way Bill Tab */}
          {activeTab === 'ewaybill' && (
            <div className="bg-white border border-[#D5CCBD] rounded-2xl p-6 space-y-5 font-mono text-xs shadow-xs">
              <div className="flex justify-between items-start border-b border-[#E8E5DF] pb-4">
                <div>
                  <span className="text-[10px] text-[#7A746B] uppercase block">Government of India - GST & e-Way Bill System</span>
                  <h3 className="text-base font-bold text-[#1C1C1C] mt-1 font-serif">
                    e-Way Bill No: {transaction.eWayBillNumber || '8921 0021 9812'}
                  </h3>
                  <p className="text-[11px] text-[#5C554B]">Valid from {transaction.timestamp} to 72 Hours</p>
                </div>
                <div className="text-right">
                  <span className="bg-[#EBF3ED] text-[#233B2B] px-3 py-1 rounded text-[11px] font-bold border border-[#C6DFC9]">
                    PART-A & PART-B VERIFIED
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-[#FAF9F6] p-3.5 rounded-xl border border-[#E8E5DF] space-y-1">
                  <span className="text-[10px] text-[#7A746B] block uppercase">From (Supplier / Kisan FPO):</span>
                  <strong className="block text-[#1C1C1C]">{transaction.sellerName}</strong>
                  <p className="text-[11px] text-[#5C554B]">Dispatch APMC Mandi, State of Origin</p>
                  <p className="text-[10px] text-[#7A746B]">GSTIN/UID: 27AABCP8841L1Z4</p>
                </div>

                <div className="bg-[#FAF9F6] p-3.5 rounded-xl border border-[#E8E5DF] space-y-1">
                  <span className="text-[10px] text-[#7A746B] block uppercase">To (Consignee / Bulk Buyer):</span>
                  <strong className="block text-[#1C1C1C]">{transaction.buyerName}</strong>
                  <p className="text-[11px] text-[#5C554B]">{transaction.destination}</p>
                  <p className="text-[10px] text-[#7A746B]">GSTIN/UID: 06AAACI1681G1Z1</p>
                </div>
              </div>

              <div className="border border-[#E8E5DF] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F4F1EA] text-[#5C554B]">
                    <tr>
                      <th className="p-2.5">HSN Code</th>
                      <th className="p-2.5">Commodity Description</th>
                      <th className="p-2.5">Quantity</th>
                      <th className="p-2.5 text-right">Taxable Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E5DF]">
                    <tr>
                      <td className="p-2.5 font-bold">1006.30</td>
                      <td className="p-2.5">{transaction.cropName} (AGMARK Certified)</td>
                      <td className="p-2.5">{transaction.quantityTons} MT</td>
                      <td className="p-2.5 text-right">₹{transaction.totalAmount.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-[#FAF6F0] border border-[#E8DFC8] rounded-xl p-3 flex justify-between items-center text-xs">
                <span>Transporter: <strong>{transaction.logisticsPartner}</strong></span>
                <span>Vehicle: <strong>{transaction.truckNumber || 'MH 12 QX 9821'}</strong></span>
              </div>
            </div>
          )}

          {/* Invoice Tab */}
          {activeTab === 'invoice' && (
            <div className="bg-white border border-[#D5CCBD] rounded-2xl p-6 space-y-5 text-xs shadow-xs">
              <div className="flex justify-between items-start border-b border-[#E8E5DF] pb-4">
                <div>
                  <span className="text-[10px] text-[#7A746B] uppercase font-mono block">Agritech Bharat Electronic Mandi</span>
                  <h3 className="text-lg font-serif font-bold text-[#1C1C1C] mt-0.5">
                    GST Tax Invoice #{transaction.invoiceNumber || 'INV-2026-8812'}
                  </h3>
                  <p className="text-[11px] text-[#5C554B]">Date of Issue: {transaction.timestamp}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#7A746B] font-mono block">Escrow Settlement</span>
                  <span className="text-base font-serif font-bold text-[#233B2B] font-mono">
                    ₹{transaction.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E8E5DF] rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between">
                  <span>Commodity Lot Value ({transaction.quantityTons} MT @ ₹{transaction.pricePerTon.toLocaleString('en-IN')}/MT):</span>
                  <span className="font-mono text-[#1C1C1C]">₹{(transaction.quantityTons * transaction.pricePerTon).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Intermodal Freight & Logistics:</span>
                  <span className="font-mono text-[#1C1C1C]">₹{(transaction.totalAmount - (transaction.quantityTons * transaction.pricePerTon) - Math.round((transaction.quantityTons * transaction.pricePerTon) * 0.01)).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>1% e-NAM Escrow & AGMARK Lab Inspection Fee:</span>
                  <span className="font-mono text-[#1C1C1C]">₹{Math.round((transaction.quantityTons * transaction.pricePerTon) * 0.01).toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-[#E8E5DF] pt-2 flex justify-between font-bold text-sm text-[#1C1C1C]">
                  <span>Total Amount Deposited in Escrow:</span>
                  <span className="text-[#2D4F38] font-mono">₹{transaction.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-xs text-[#2D4F38] font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Settlement Guarantee: Payment backed by State Bank e-NAM Escrow Account</span>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#F4F1EA] hover:bg-[#EAE4D7] text-[#1C1C1C] rounded-lg text-xs font-semibold border border-[#D5CCBD] flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#FAF9F6] border-t border-[#E8E5DF] p-4 sm:p-5 flex items-center justify-between">
          <div className="text-xs text-[#7A746B] flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#2D4F38]" />
            <span>Updates synced every 15 minutes with national highway toll plazas</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#233B2B] hover:bg-[#1B2F22] text-amber-200 font-semibold rounded-xl text-xs transition border border-[#3E5C47]"
          >
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
};
