import React, { useState } from 'react';
import { DeliveryAddress } from '../types';
import { MapPin, X, Building, Phone, Clock, AlertTriangle, Check, ShieldCheck } from 'lucide-react';

interface DeliveryAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAddress: (address: DeliveryAddress) => void;
  initialAddress?: DeliveryAddress | null;
}

const LOCATION_TYPES: DeliveryAddress['locationType'][] = [
  'Processing Plant / Mill',
  'Warehouse / Godown',
  'APMC Mandi Yard',
  'Cold Storage Facility',
  'Commercial Kitchen / Depot',
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi NCR', 'Gujarat', 'Haryana', 
  'Himachal Pradesh', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 
  'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
];

export const DeliveryAddressModal: React.FC<DeliveryAddressModalProps> = ({
  isOpen,
  onClose,
  onSaveAddress,
  initialAddress,
}) => {
  const [label, setLabel] = useState<string>(initialAddress?.label || '');
  const [consigneeName, setConsigneeName] = useState<string>(initialAddress?.consigneeName || '');
  const [companyName, setCompanyName] = useState<string>(initialAddress?.companyName || '');
  const [contactPerson, setContactPerson] = useState<string>(initialAddress?.contactPerson || '');
  const [phoneNumber, setPhoneNumber] = useState<string>(initialAddress?.phoneNumber || '');
  const [secondaryPhone, setSecondaryPhone] = useState<string>(initialAddress?.secondaryPhone || '');
  const [addressLine1, setAddressLine1] = useState<string>(initialAddress?.addressLine1 || '');
  const [addressLine2, setAddressLine2] = useState<string>(initialAddress?.addressLine2 || '');
  const [landmark, setLandmark] = useState<string>(initialAddress?.landmark || '');
  const [city, setCity] = useState<string>(initialAddress?.city || '');
  const [state, setState] = useState<string>(initialAddress?.state || 'Maharashtra');
  const [pincode, setPincode] = useState<string>(initialAddress?.pincode || '');
  const [locationType, setLocationType] = useState<DeliveryAddress['locationType']>(
    initialAddress?.locationType || 'Processing Plant / Mill'
  );
  const [gateTimings, setGateTimings] = useState<string>(
    initialAddress?.gateTimings || '24x7 Inward with Weighbridge Operational'
  );
  const [unloadingRestrictions, setUnloadingRestrictions] = useState<string>(
    initialAddress?.unloadingRestrictions || '16-Wheeler & Multi-Axle Trucks permitted'
  );
  const [isDefault, setIsDefault] = useState<boolean>(initialAddress?.isDefault || false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!consigneeName.trim()) newErrors.consigneeName = 'Consignee / Receiver name is required';
    if (!contactPerson.trim()) newErrors.contactPerson = 'Gate contact person is required';
    if (!phoneNumber.trim() || phoneNumber.length < 10) newErrors.phoneNumber = 'Valid 10-digit phone is required';
    if (!addressLine1.trim()) newErrors.addressLine1 = 'Street address / Industrial area is required';
    if (!city.trim()) newErrors.city = 'City / Mandi district is required';
    if (!pincode.trim() || pincode.length !== 6) newErrors.pincode = 'Valid 6-digit PIN code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePincodeChange = (pin: string) => {
    setPincode(pin);
    // Simple auto-fill helper for demo
    if (pin === '131028') { setCity('Sonepat'); setState('Haryana'); }
    else if (pin === '400703') { setCity('Navi Mumbai'); setState('Maharashtra'); }
    else if (pin === '464001') { setCity('Vidisha'); setState('Madhya Pradesh'); }
    else if (pin === '560066') { setCity('Bengaluru'); setState('Karnataka'); }
    else if (pin === '522001') { setCity('Guntur'); setState('Andhra Pradesh'); }
    else if (pin === '452001') { setCity('Indore'); setState('Madhya Pradesh'); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newAddress: DeliveryAddress = {
      id: initialAddress?.id || `addr-${Date.now()}`,
      label: label.trim() || `${city} ${locationType}`,
      consigneeName,
      companyName: companyName.trim() || undefined,
      contactPerson,
      phoneNumber,
      secondaryPhone: secondaryPhone.trim() || undefined,
      addressLine1,
      addressLine2: addressLine2.trim() || undefined,
      landmark: landmark.trim() || 'Near Industrial Gate',
      city,
      state,
      pincode,
      locationType,
      gateTimings,
      unloadingRestrictions,
      isDefault,
    };

    onSaveAddress(newAddress);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-[#FAF9F6] border border-[#E8E5DF] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-[#1C1C1C]">
        {/* Header */}
        <div className="bg-[#233B2B] text-[#FAF9F6] p-5 sm:p-6 flex items-center justify-between border-b border-[#37523E]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#1B2F22] border border-[#3E5C47] text-amber-200 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white">
                {initialAddress ? 'Edit Delivery Warehouse / Facility' : 'Add New Delivery Address & Godown'}
              </h2>
              <p className="text-xs text-[#D0C8BB]">
                Configure consignee details, gate entry timings, and heavy vehicle unloading permits
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#D0C8BB] hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Facility Type Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#5C554B] uppercase tracking-wider font-serif">
              Facility / Destination Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {LOCATION_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setLocationType(type)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border text-left transition ${
                    locationType === type
                      ? 'bg-[#233B2B] text-amber-200 border-[#233B2B] shadow-xs'
                      : 'bg-white border-[#D5CCBD] text-[#4A453E] hover:bg-[#EFEBE3]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Consignee & Company Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5C554B] mb-1">
                Facility / Address Nickname <span className="text-[#8A847A]">(e.g. Sonepat Silos 1)</span>
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Main Sonepat Processing Silo"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#D5CCBD] rounded-xl text-[#1C1C1C] focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C554B] mb-1">
                Registered Enterprise / Mill Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. ITC Ltd. / Adani Wilmar Agro"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#D5CCBD] rounded-xl text-[#1C1C1C] focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5C554B] mb-1">
                Consignee / Billing Head Name <span className="text-[#C2593F]">*</span>
              </label>
              <input
                type="text"
                value={consigneeName}
                onChange={(e) => setConsigneeName(e.target.value)}
                placeholder="e.g. Vikram Singhania"
                className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-xl text-[#1C1C1C] focus:ring-2 focus:ring-[#2D4F38] focus:outline-none ${
                  errors.consigneeName ? 'border-[#C2593F]' : 'border-[#D5CCBD]'
                }`}
              />
              {errors.consigneeName && (
                <p className="text-[11px] text-[#C2593F] mt-1">{errors.consigneeName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C554B] mb-1">
                On-Site Gate / Weighbridge Contact Person <span className="text-[#C2593F]">*</span>
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Harish Rawat (Inward Yard Incharge)"
                className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-xl text-[#1C1C1C] focus:ring-2 focus:ring-[#2D4F38] focus:outline-none ${
                  errors.contactPerson ? 'border-[#C2593F]' : 'border-[#D5CCBD]'
                }`}
              />
              {errors.contactPerson && (
                <p className="text-[11px] text-[#C2593F] mt-1">{errors.contactPerson}</p>
              )}
            </div>
          </div>

          {/* Phone Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5C554B] mb-1">
                Primary Mobile Number (for Driver & SMS) <span className="text-[#C2593F]">*</span>
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 99201 88312"
                className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-xl text-[#1C1C1C] font-mono focus:ring-2 focus:ring-[#2D4F38] focus:outline-none ${
                  errors.phoneNumber ? 'border-[#C2593F]' : 'border-[#D5CCBD]'
                }`}
              />
              {errors.phoneNumber && (
                <p className="text-[11px] text-[#C2593F] mt-1">{errors.phoneNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C554B] mb-1">
                Secondary / Plant Landline Number (Optional)
              </label>
              <input
                type="tel"
                value={secondaryPhone}
                onChange={(e) => setSecondaryPhone(e.target.value)}
                placeholder="+91 130 2291040"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#D5CCBD] rounded-xl text-[#1C1C1C] font-mono focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
              />
            </div>
          </div>

          {/* Street & Location Address */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#5C554B] mb-1">
                Godown No., Shed / Plot No. & Industrial Area <span className="text-[#C2593F]">*</span>
              </label>
              <input
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="e.g. Gate No. 4, Sonepat Mega Food Park & Rice Milling Terminal"
                className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-xl text-[#1C1C1C] focus:ring-2 focus:ring-[#2D4F38] focus:outline-none ${
                  errors.addressLine1 ? 'border-[#C2593F]' : 'border-[#D5CCBD]'
                }`}
              />
              {errors.addressLine1 && (
                <p className="text-[11px] text-[#C2593F] mt-1">{errors.addressLine1}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C554B] mb-1">
                Sector, Highway Mile / Street Line 2 (Optional)
              </label>
              <input
                type="text"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="e.g. Phase II, Industrial Growth Corridor, NH-44"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#D5CCBD] rounded-xl text-[#1C1C1C] focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5C554B] mb-1">
                  PIN Code <span className="text-[#C2593F]">*</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  placeholder="e.g. 131028"
                  className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-xl text-[#1C1C1C] font-mono focus:ring-2 focus:ring-[#2D4F38] focus:outline-none ${
                    errors.pincode ? 'border-[#C2593F]' : 'border-[#D5CCBD]'
                  }`}
                />
                {errors.pincode && (
                  <p className="text-[11px] text-[#C2593F] mt-1">{errors.pincode}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C554B] mb-1">
                  City / Mandi District <span className="text-[#C2593F]">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Sonepat"
                  className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-xl text-[#1C1C1C] focus:ring-2 focus:ring-[#2D4F38] focus:outline-none ${
                    errors.city ? 'border-[#C2593F]' : 'border-[#D5CCBD]'
                  }`}
                />
                {errors.city && (
                  <p className="text-[11px] text-[#C2593F] mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C554B] mb-1">
                  State <span className="text-[#C2593F]">*</span>
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-white border border-[#D5CCBD] rounded-xl text-[#1C1C1C] focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C554B] mb-1">
                Landmark for Heavy Trucks & Transporters
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Opposite State Warehousing Corporation Yard / Near Toll Plaza 4"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#D5CCBD] rounded-xl text-[#1C1C1C] focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
              />
            </div>
          </div>

          {/* Gate Access Timings & Restrictions */}
          <div className="bg-[#FAF6F0] border border-[#E8DFC8] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#5C3224]">
              <Clock className="w-4 h-4 text-amber-700" />
              <span>Gate Access & Heavy Vehicle Unloading Guidelines</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#5C554B] mb-1">
                  Gate Receiving Hours
                </label>
                <input
                  type="text"
                  value={gateTimings}
                  onChange={(e) => setGateTimings(e.target.value)}
                  placeholder="e.g. 24x7 Inward or 06:00 AM - 09:00 PM"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D5CCBD] rounded-lg text-[#1C1C1C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5C554B] mb-1">
                  Vehicle Entry Restrictions / Unloading Type
                </label>
                <input
                  type="text"
                  value={unloadingRestrictions}
                  onChange={(e) => setUnloadingRestrictions(e.target.value)}
                  placeholder="e.g. 16-Wheeler permitted / Forklift unloading ready"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D5CCBD] rounded-lg text-[#1C1C1C] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Default address checkbox */}
          <label className="flex items-center gap-2 cursor-pointer text-xs text-[#1C1C1C]">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 text-[#2D4F38] rounded border-[#D5CCBD] focus:ring-[#2D4F38]"
            />
            <span className="font-medium">Set as primary default delivery warehouse for all procurements</span>
          </label>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-[#E8E5DF] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#D5CCBD] text-xs font-semibold text-[#5C554B] hover:bg-[#EFEBE3] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#233B2B] hover:bg-[#1B2F22] text-amber-200 font-semibold rounded-xl text-xs transition border border-[#3E5C47] shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save & Use Delivery Address</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
