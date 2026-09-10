export type UserRole = 'farmer' | 'fpo' | 'organisation' | 'individual';

/**
 * Authorization Rule:
 * Only users signed in as 'farmer' are permitted to list crops and sell harvest lots.
 * FPO aggregators and Direct Buyers (organisation/individual) are NOT permitted to list crops.
 */
export const canUserListCrops = (role?: UserRole | string): boolean => {
  return role === 'farmer';
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  orgName?: string;
  farmName?: string;
  location: string;
  verified: boolean;
  avatarUrl?: string;
  phone?: string;
  rating: number;
  totalDeals: number;
}

export type CropCategory = 'Grains' | 'Pulses & Legumes' | 'Oilseeds' | 'Cash Crops' | 'Fruits & Veg' | 'Spices';

export interface CropListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone?: string; // Contact mobile number for offline calls, WhatsApp, and godown visits
  farmLocation: string;
  farmerRating: number;
  cropName: string;
  category: CropCategory;
  variety: string;
  grade: 'Grade A (Export)' | 'Grade A (Premium)' | 'Grade B (Commercial)' | 'Grade Organic Certified' | 'AGMARK Special';
  totalQuantityTons: number;
  availableQuantityTons: number;
  minOrderQuantityTons: number;
  pricePerTon: number; // in INR (₹ per Metric Ton)
  harvestDate: string; // ISO date or formatted
  readyStatus: 'Ready for Dispatch' | 'Harvesting in 1-2 Weeks' | 'Pre-Harvest Contract';
  certifications: string[];
  moistureContent: number; // e.g. 11.5%
  imageUrl: string;
  description: string;
  createdAt: string;
}

export interface BuyOrderRFQ {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerType: 'organisation' | 'individual';
  cropName: string;
  category: CropCategory;
  targetQuantityTons: number;
  targetPricePerTon: number; // in INR (₹ per Metric Ton)
  deliveryLocation: string;
  requiredByDate: string;
  specifications: string;
  status: 'Open' | 'Partially Matched' | 'Fulfilled';
  createdAt: string;
}

export interface AIPlantingRecommendation {
  cropName: string;
  category: CropCategory;
  demandIndex: number; // 0-100
  projectedPriceChange: string; // e.g. "+24% projected rise"
  expectedRoiPercentage: number; // e.g. 48%
  marketCondition: 'Severe Supply Deficit' | 'Rising Industrial Demand' | 'Export Surge' | 'Moderate Demand';
  whyPlantNow: string;
  riskFactor: 'Low' | 'Moderate' | 'High';
  idealPlantingCycle: string; // e.g. "Kharif Season (Jun - Jul)" or "Rabi Season (Oct - Nov)"
  estimatedHarvest: string; // e.g. "90-110 Days"
  targetBulkBuyers: string[];
  soilSuitability: string[];
  waterRequirement: 'Low (Drought Resilient)' | 'Moderate' | 'High / Irrigated';
  keyTips: string[];
}

export interface CropMarketTrend {
  id: string;
  cropName: string;
  category: CropCategory;
  variety: string;
  currentPricePerTon: number; // in INR (₹/MT)
  mspPerTon: number; // in INR (₹/MT) Govt Minimum Support Price
  lastMonthPricePerTon: number; // in INR
  currentStockTons: number; // in Metric Tons (available warehouses/cold storage/mandi stocks)
  buyerDemandTons: number; // in Metric Tons (active enterprise RFQs + verified mill buy intent)
  deficitTons: number; // buyerDemandTons - currentStockTons
  supplyDemandRatio: number; // currentStockTons / buyerDemandTons
  marketCondition: 'Severe Deficit' | 'High Demand' | 'Balanced' | 'Moderate Surplus' | 'Severe Glut';
  priceTrend: 'Surging' | 'Upward' | 'Stable' | 'Declining';
  projectedNextSeasonMargin: string;
  recommendationVerdict: 'High Priority Planting' | 'Safe Contract Planting' | 'Cautious / Contract-Only' | 'Avoid / Market Glut Risk';
  regionalHubs: string[];
  optimalPlantingSeason: string;
  soilSuitability: string[];
  waterRequirement: 'Low (Drought Resilient)' | 'Moderate' | 'High / Irrigated';
  glutRiskReason?: string;
  growthDriver?: string;
}

export interface MarketGraphAiAnalysis {
  executiveSummary: string;
  chartInsights: {
    topDeficitCrop: string;
    topGlutCrop: string;
    highestPricePremiumCrop: string;
    averageDemandStockRatio: string;
  };
  marketGluts: {
    cropName: string;
    category: CropCategory;
    stockSurplusTons: number;
    riskLevel: 'Severe Glut' | 'Moderate Surplus';
    warningReason: string;
    mitigationStrategy: string;
  }[];
  topPlantingRecommendations: {
    cropName: string;
    category: CropCategory;
    demandIndex: number;
    projectedRoiPercentage: number;
    sowingWindow: string;
    economicRationale: string;
    targetBuyers: string[];
    soilAndWater: string;
  }[];
  strategicAdvice: string[];
  answeredQuery?: string;
  customAnswer?: string;
}

export interface DeliveryAddress {
  id: string;
  label: string;
  consigneeName: string;
  companyName?: string;
  contactPerson: string;
  phoneNumber: string;
  secondaryPhone?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  locationType: 'Warehouse / Godown' | 'Processing Plant / Mill' | 'APMC Mandi Yard' | 'Cold Storage Facility' | 'Commercial Kitchen / Depot';
  isDefault: boolean;
  gateTimings?: string;
  unloadingRestrictions?: string;
}

export interface DeliveryLogisticsConfig {
  shippingTier: 'express_intermodal' | 'standard_consignment' | 'farmer_direct' | 'buyer_pickup';
  vehicleType: '16_wheeler_multi_axle' | '10_wheeler_heavy' | 'eicher_14ft' | 'tractor_trailer';
  deliverySlot: 'morning' | 'afternoon' | 'evening' | 'flexible';
  preferredDate: string;
  includeHamaliUnloading: boolean;
  requireMoistureKitTest: boolean;
  requireDigitalWeighbridgeSlip: boolean;
  specialInstructions: string;
}

export interface ComplianceDetails {
  buyerGstin: string;
  apmcLicenseNo: string;
  eWayBillRequired: boolean;
  transitInsuranceOpted: boolean;
}

export interface OrderTransaction {
  id: string;
  listingId: string;
  cropName: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  buyerRole: UserRole;
  quantityTons: number;
  pricePerTon: number; // in INR
  totalAmount: number; // in INR
  status: 'Escrow Locked' | 'Inspection Passed' | 'In Transit' | 'Delivered & Paid';
  logisticsPartner: string;
  destination: string;
  timestamp: string;
  paymentMethod?: 'UPI_QR' | 'NET_BANKING' | 'RTGS_NEFT' | 'AGRI_CREDIT' | 'CARD';
  invoiceNumber?: string;
  utrReference?: string;
  deliveryAddress?: DeliveryAddress;
  logisticsConfig?: DeliveryLogisticsConfig;
  compliance?: ComplianceDetails;
  trackingNumber?: string;
  driverName?: string;
  driverPhone?: string;
  truckNumber?: string;
  eWayBillNumber?: string;
  estimatedDeliveryDate?: string;
  currentCheckpoint?: string;
  escrowStatus?: string;
}

export interface ProcurementCartItem {
  listing: CropListing;
  quantityTons: number;
  customPricePerTon: number;
  logisticsChoice: 'agridirect_freight' | 'farmer_delivery' | 'buyer_pickup';
}

export type PaymentChannel = 'UPI_QR' | 'NET_BANKING' | 'RTGS_NEFT' | 'AGRI_CREDIT' | 'CARD';

export interface UserComplaint {
  id: string;
  ticketNumber: string;
  userName: string;
  userContact: string;
  issueCategory: 'Payment & Escrow' | 'Quality Discrepancy' | 'Delivery & Logistics' | 'Weighbridge & Quantity' | 'Account & KYC' | 'Other';
  orderId?: string;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Registered' | 'Under Investigation' | 'Resolved';
  createdAt: string;
}

export interface AIDoubtItem {
  id: string;
  question: string;
  timestamp: string;
  source?: 'gemini' | 'dynamic_engine';
  modelUsed?: string;
  answer: string;
  keyTakeaways: string[];
  recommendedPractices: string[];
  marketInsight?: string;
}

