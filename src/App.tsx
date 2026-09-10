import React, { useState, useEffect } from 'react';
import { UserProfile, CropListing, BuyOrderRFQ, OrderTransaction, AIPlantingRecommendation, UserComplaint } from './types';
import { 
  DEMO_USERS, 
  INITIAL_CROP_LISTINGS, 
  INITIAL_BUY_RFQS, 
  INITIAL_TRANSACTIONS,
  INITIAL_COMPLAINTS
} from './data/mockData';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Marketplace } from './components/Marketplace';
import { BuyingSection } from './components/BuyingSection';
import { AiPlantingAdvisor } from './components/AiPlantingAdvisor';
import { FarmerDashboard } from './components/FarmerDashboard';
import { BuyerDashboard } from './components/BuyerDashboard';
import { LiveMarketSection } from './components/LiveMarketSection';
import { AuthModal } from './components/AuthModal';
import { CheckoutModal } from './components/CheckoutModal';
import { AiNegotiatorModal } from './components/AiNegotiatorModal';
import { CreateListingModal } from './components/CreateListingModal';
import { CreateRfqModal } from './components/CreateRfqModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { ComplaintModal } from './components/ComplaintModal';
import { 
  Sprout, 
  ShieldCheck, 
  Instagram, 
  Linkedin, 
  MessageSquareWarning, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Headphones, 
  FileCheck,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const { 
    currentUser, 
    setCurrentUser, 
    isAuthenticated,
    saveOrderToFirestore, 
    firestoreOrders, 
    firebaseUser,
    saveComplaintToFirestore,
    firestoreComplaints
  } = useAuth();
  const [activeTab, setActiveTab] = useState<'marketplace' | 'live-market' | 'buying' | 'advisor' | 'dashboard'>('marketplace');
  const [marketplaceSearchTerm, setMarketplaceSearchTerm] = useState<string>('');
  const [initialLiveMarketCrop, setInitialLiveMarketCrop] = useState<string>('onion');
  
  // Data state
  const [listings, setListings] = useState<CropListing[]>(INITIAL_CROP_LISTINGS);
  const [rfqs, setRfqs] = useState<BuyOrderRFQ[]>(INITIAL_BUY_RFQS);
  const [transactions, setTransactions] = useState<OrderTransaction[]>(INITIAL_TRANSACTIONS);
  const [complaints, setComplaints] = useState<UserComplaint[]>(INITIAL_COMPLAINTS);

  // Quick footer complaint form state
  const [quickCategory, setQuickCategory] = useState<UserComplaint['issueCategory']>('Payment & Escrow');
  const [quickContact, setQuickContact] = useState<string>('');
  const [quickSubject, setQuickSubject] = useState<string>('');
  const [quickSubmittedTicket, setQuickSubmittedTicket] = useState<UserComplaint | null>(null);
  const [quickSubmitting, setQuickSubmitting] = useState<boolean>(false);

  // Tracking state
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingTxn, setTrackingTxn] = useState<OrderTransaction | null>(null);

  // Complaint Modal state
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [complaintInitialOrderId, setComplaintInitialOrderId] = useState<string>('');

  // Sync firestore orders into state if available
  useEffect(() => {
    if (firestoreOrders.length > 0) {
      setTransactions((prev) => {
        // Merge without duplicates
        const map = new Map<string, OrderTransaction>();
        [...firestoreOrders, ...prev].forEach((item) => map.set(item.id, item));
        return Array.from(map.values());
      });
    }
  }, [firestoreOrders]);

  // Sync firestore complaints into state if available
  useEffect(() => {
    if (firestoreComplaints.length > 0) {
      setComplaints((prev) => {
        const map = new Map<string, UserComplaint>();
        [...firestoreComplaints, ...prev].forEach((item) => map.set(item.id, item));
        return Array.from(map.values());
      });
    }
  }, [firestoreComplaints]);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authPrompt, setAuthPrompt] = useState<string | undefined>(undefined);
  const [pendingAuthAction, setPendingAuthAction] = useState<(() => void) | null>(null);

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutListing, setCheckoutListing] = useState<CropListing | null>(null);
  const [checkoutInitQty, setCheckoutInitQty] = useState<number | undefined>(undefined);
  const [checkoutInitPrice, setCheckoutInitPrice] = useState<number | undefined>(undefined);

  const [negotiatorModalOpen, setNegotiatorModalOpen] = useState(false);
  const [negotiatorListing, setNegotiatorListing] = useState<CropListing | null>(null);

  const [createListingModalOpen, setCreateListingModalOpen] = useState(false);
  const [prefillListingName, setPrefillListingName] = useState<string | undefined>(undefined);
  const [prefillListingCategory, setPrefillListingCategory] = useState<any>(undefined);

  const [createRfqModalOpen, setCreateRfqModalOpen] = useState(false);

  // Handlers
  const handleOpenCheckout = (listing: CropListing, qty?: number, price?: number) => {
    if (!isAuthenticated) {
      setAuthPrompt(`Please sign in or create an account to procure "${listing.cropName}" and execute e-NAM escrow payment.`);
      setPendingAuthAction(() => () => {
        setCheckoutListing(listing);
        setCheckoutInitQty(qty);
        setCheckoutInitPrice(price);
        setCheckoutModalOpen(true);
      });
      setAuthModalOpen(true);
      return;
    }

    setCheckoutListing(listing);
    setCheckoutInitQty(qty);
    setCheckoutInitPrice(price);
    setCheckoutModalOpen(true);
  };

  const handleOpenNegotiator = (listing: CropListing) => {
    setNegotiatorListing(listing);
    setNegotiatorModalOpen(true);
  };

  const handleApplyNegotiatedPrice = (pricePerTon: number, quantityTons: number) => {
    if (negotiatorListing) {
      handleOpenCheckout(negotiatorListing, quantityTons, pricePerTon);
    }
  };

  const handleAddListing = (newLot: CropListing) => {
    setListings((prev) => [newLot, ...prev]);
  };

  const handleAddRfq = (newRfq: BuyOrderRFQ) => {
    setRfqs((prev) => [newRfq, ...prev]);
  };

  const handleCompleteOrder = (transaction: OrderTransaction) => {
    setTransactions((prev) => [transaction, ...prev]);
    // Save to Firestore
    saveOrderToFirestore(transaction);

    // decrease available quantity in listings
    setListings((prev) =>
      prev.map((l) =>
        l.id === transaction.listingId
          ? { ...l, availableQuantityTons: Math.max(0, l.availableQuantityTons - transaction.quantityTons) }
          : l
      )
    );
  };

  const handleBatchOrdersComplete = (newTxns: OrderTransaction[]) => {
    setTransactions((prev) => [...newTxns, ...prev]);
    // Save each to Firestore
    newTxns.forEach((txn) => saveOrderToFirestore(txn));

    // decrease quantities for all purchased lots
    setListings((prev) =>
      prev.map((l) => {
        const matchingTxn = newTxns.find((t) => t.listingId === l.id);
        if (matchingTxn) {
          return {
            ...l,
            availableQuantityTons: Math.max(0, l.availableQuantityTons - matchingTxn.quantityTons),
          };
        }
        return l;
      })
    );
  };

  const handlePreListFromAdvisor = (rec: AIPlantingRecommendation) => {
    setPrefillListingName(rec.cropName);
    setPrefillListingCategory(rec.category);
    setCreateListingModalOpen(true);
  };

  const handleRegisterComplaint = async (complaint: UserComplaint) => {
    setComplaints((prev) => [complaint, ...prev.filter((c) => c.id !== complaint.id)]);
    // Save grievance ticket to Firebase Firestore
    await saveComplaintToFirestore(complaint);
  };

  const handleQuickComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSubject.trim()) return;

    setQuickSubmitting(true);
    const ticketNumber = `GRV-AGRI-${Math.floor(100000 + Math.random() * 900000)}`;
    const newComplaint: UserComplaint = {
      id: `complaint-${Date.now()}`,
      ticketNumber,
      userName: currentUser.name || 'KrishiQuant User',
      userContact: quickContact.trim() || currentUser.phone || currentUser.email || 'Registered User',
      issueCategory: quickCategory,
      subject: quickSubject.trim(),
      description: quickSubject.trim(),
      priority: 'Medium',
      status: 'Registered',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    try {
      await handleRegisterComplaint(newComplaint);
      setQuickSubmittedTicket(newComplaint);
      setQuickSubject('');
      setQuickContact('');
    } catch (err) {
      console.warn('Quick complaint error:', err);
    } finally {
      setQuickSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1C1C] flex flex-col font-sans selection:bg-[#E2D9C8] selection:text-[#233B2B]">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenCreateListing={() => {
          setPrefillListingName(undefined);
          setPrefillListingCategory(undefined);
          setCreateListingModalOpen(true);
        }}
        onOpenCreateRfq={() => setCreateRfqModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'marketplace' && (
          <Marketplace
            listings={listings}
            currentUser={currentUser}
            initialSearchQuery={marketplaceSearchTerm}
            onOpenCheckout={(listing) => handleOpenCheckout(listing)}
            onOpenNegotiator={handleOpenNegotiator}
            onOpenCreateListing={() => {
              setPrefillListingName(undefined);
              setPrefillListingCategory(undefined);
              setCreateListingModalOpen(true);
            }}
            onOpenCreateRfq={() => setCreateRfqModalOpen(true)}
            onNavigateToLiveMarket={(cropId) => {
              if (cropId) setInitialLiveMarketCrop(cropId);
              setActiveTab('live-market');
            }}
          />
        )}

        {activeTab === 'live-market' && (
          <LiveMarketSection
            currentUser={currentUser}
            initialCommodityId={initialLiveMarketCrop}
            onNavigateToMarketplace={(cropName) => {
              setMarketplaceSearchTerm(cropName || '');
              setActiveTab('marketplace');
            }}
            onOpenCreateListing={() => {
              setPrefillListingName(undefined);
              setPrefillListingCategory(undefined);
              setCreateListingModalOpen(true);
            }}
            onOpenCreateRfq={() => setCreateRfqModalOpen(true)}
          />
        )}

        {activeTab === 'buying' && (
          <BuyingSection
            listings={listings}
            currentUser={currentUser}
            onOpenNegotiator={handleOpenNegotiator}
            onOrderComplete={handleBatchOrdersComplete}
            onSwitchToDashboard={() => setActiveTab('dashboard')}
            onRequireAuth={(action, promptMsg) => {
              if (promptMsg) setAuthPrompt(promptMsg);
              if (action) setPendingAuthAction(() => action);
              setAuthModalOpen(true);
            }}
          />
        )}

        {activeTab === 'advisor' && (
          <AiPlantingAdvisor
            currentUser={currentUser}
            onPreListCrop={handlePreListFromAdvisor}
          />
        )}

        {activeTab === 'dashboard' && (
          (!isAuthenticated && !firebaseUser && (!currentUser.id || currentUser.id === '')) ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E8E5DF] shadow-xs text-center max-w-xl mx-auto space-y-5 my-8">
              <div className="w-16 h-16 rounded-2xl bg-[#EBF3ED] text-[#233B2B] flex items-center justify-center mx-auto border border-[#C6DFC9]">
                <ShieldCheck className="w-8 h-8 text-[#2D4F38]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-bold text-[#1C1C1C]">
                  Sign In to Access Your Dashboard
                </h2>
                <p className="text-xs text-[#7A746B] max-w-md mx-auto leading-relaxed">
                  Sign in with your registered email to view your harvest listings, active RFQ demand quotes, consignments, and live APMC escrow settlements.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="w-full sm:w-auto py-2.5 px-6 bg-[#233B2B] hover:bg-[#1B2F22] text-amber-200 font-semibold rounded-xl text-xs transition border border-[#3E5C47] shadow-xs flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Sign In with Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('marketplace')}
                  className="w-full sm:w-auto py-2.5 px-5 bg-[#FAF9F6] hover:bg-[#EFEBE3] text-[#4A453E] font-semibold rounded-xl text-xs transition border border-[#D5CCBD]"
                >
                  Explore Marketplace
                </button>
              </div>
            </div>
          ) : currentUser.role === 'farmer' ? (
            <FarmerDashboard
              currentUser={currentUser}
              listings={listings}
              rfqs={rfqs}
              transactions={transactions}
              onOpenCreateListing={() => {
                setPrefillListingName(undefined);
                setPrefillListingCategory(undefined);
                setCreateListingModalOpen(true);
              }}
              onSelectTab={setActiveTab}
            />
          ) : (
            <BuyerDashboard
              currentUser={currentUser}
              rfqs={rfqs}
              transactions={transactions}
              onOpenCreateRfq={() => setCreateRfqModalOpen(true)}
              onSelectTab={setActiveTab}
            />
          )
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#1C261F] text-[#E5E0D8] border-t border-[#2A3B2E] mt-12 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          {/* Column 1: Brand, Trust & Socials */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#2D4F38] border border-[#3E654B] flex items-center justify-center p-0.5 overflow-hidden shadow-xs">
                <img 
                  src="/krishiquant-logo.jpg" 
                  alt="KrishiQuant Logo" 
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <span className="font-serif font-bold text-stone-100 text-lg tracking-tight">
                Krishi<span className="text-amber-300 font-sans text-xs uppercase px-1.5 py-0.5 rounded bg-[#2A4232] font-semibold">Quant</span>
              </span>
            </div>
            <p className="text-[#A8A196] leading-relaxed text-[11px]">
              Direct farm-to-enterprise agricultural commodity exchange connecting verified Indian farmers and FPOs with bulk corporate buyers and processors through e-NAM escrow protection.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-[#A3D9A5] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Escrow & AGMARK Quality Guaranteed</span>
            </div>

            {/* Social Accounts Section */}
            <div className="pt-2 border-t border-[#2A3B2E]">
              <span className="text-[10px] text-[#A8A196] uppercase tracking-wider font-semibold block mb-2 font-serif">
                Connect With Us
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.instagram.com/krishnav_kashyap?igsi=cDkyMzhyM3JneHc2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#243327] hover:bg-[#E1306C] text-[#D5CEBF] hover:text-white transition duration-200 border border-[#344838] hover:border-[#E1306C] text-[11px] font-medium group shadow-xs"
                  title="Follow Krishnav Kashyap on Instagram"
                >
                  <Instagram className="w-4 h-4 text-pink-400 group-hover:text-white transition-colors" />
                  <span>Instagram</span>
                </a>

                <a
                  href="https://www.linkedin.com/in/krishnav-kashyap-a6a2ba3a0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#243327] hover:bg-[#0A66C2] text-[#D5CEBF] hover:text-white transition duration-200 border border-[#344838] hover:border-[#0A66C2] text-[11px] font-medium group shadow-xs"
                  title="Connect with Krishnav Kashyap on LinkedIn"
                >
                  <Linkedin className="w-4 h-4 text-sky-400 group-hover:text-white transition-colors" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Register Complaint Section (replaces Marketplace Portals) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-stone-200 uppercase tracking-wider text-[11px] text-[#E8DCC4] flex items-center gap-1.5">
                <MessageSquareWarning className="w-3.5 h-3.5 text-amber-300" />
                <span>Register a Complaint</span>
              </h4>
              <span className="text-[9px] bg-[#C2593F] text-white px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                Grievance Desk
              </span>
            </div>

            {quickSubmittedTicket ? (
              <div className="bg-[#243327] border border-[#3D5A43] rounded-xl p-3 space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Complaint Registered!</span>
                  </div>
                  <span className="text-[9px] bg-[#17221A] text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                    Saved to Firestore
                  </span>
                </div>
                <p className="text-[#C5BFB5] text-[10px]">
                  Ref Ticket: <strong className="font-mono text-amber-300">#{quickSubmittedTicket.ticketNumber}</strong>
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setComplaintModalOpen(true);
                    }}
                    className="text-[10px] text-amber-200 hover:underline font-medium"
                  >
                    View Status →
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickSubmittedTicket(null)}
                    className="text-[10px] text-[#8C8477] hover:text-[#D5CEBF] ml-auto"
                  >
                    New Complaint
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleQuickComplaintSubmit} className="space-y-2 bg-[#223025] p-3 rounded-xl border border-[#2F4433]">
                <p className="text-[#A8A196] text-[10px] leading-tight">
                  Facing payment, moisture lab quality, or delivery delay issues? Register here for APMC ombudsman action.
                </p>

                <div>
                  <select
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value as any)}
                    className="w-full px-2 py-1.5 text-[11px] bg-[#17221A] border border-[#3A503F] text-stone-200 rounded-lg focus:outline-none focus:border-amber-300"
                  >
                    <option value="Payment & Escrow">Payment & Escrow Lock</option>
                    <option value="Quality Discrepancy">Quality & Moisture Discrepancy</option>
                    <option value="Delivery & Logistics">Delivery Delay & Logistics</option>
                    <option value="Weighbridge & Quantity">Weighbridge Tare Mismatch</option>
                    <option value="Account & KYC">Account & KYC Issue</option>
                    <option value="Other">Other Grievance</option>
                  </select>
                </div>

                <div>
                  <input
                    type="text"
                    required
                    value={quickContact}
                    onChange={(e) => setQuickContact(e.target.value)}
                    placeholder="Phone or Email ID..."
                    className="w-full px-2 py-1.5 text-[11px] bg-[#17221A] border border-[#3A503F] text-stone-200 placeholder-[#7A746B] rounded-lg focus:outline-none focus:border-amber-300"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    required
                    value={quickSubject}
                    onChange={(e) => setQuickSubject(e.target.value)}
                    placeholder="Brief description of the issue..."
                    className="w-full px-2 py-1.5 text-[11px] bg-[#17221A] border border-[#3A503F] text-stone-200 placeholder-[#7A746B] rounded-lg focus:outline-none focus:border-amber-300"
                  />
                </div>

                <button
                  type="submit"
                  disabled={quickSubmitting}
                  className="w-full py-1.5 px-3 bg-[#2D4F38] hover:bg-[#3D694B] disabled:opacity-50 text-amber-200 hover:text-white font-semibold rounded-lg text-[11px] transition flex items-center justify-center gap-1.5 border border-[#446A4F]"
                >
                  <Send className="w-3 h-3" />
                  <span>{quickSubmitting ? 'Saving to Firestore...' : 'Submit Grievance'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Column 3: Grievance Desk & Resolution SLA (replaces Account Roles & Firebase) */}
          <div className="space-y-2.5">
            <h4 className="font-serif font-bold text-stone-200 uppercase tracking-wider text-[11px] text-[#E8DCC4] flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-emerald-400" />
              <span>Grievance Redressal SLA</span>
            </h4>
            <p className="text-[#A8A196] text-[11px] leading-relaxed">
              Every complaint is reviewed under standard e-NAM APMC arbitration rules with prompt investigation turnaround:
            </p>

            <ul className="space-y-1.5 text-[#B8B1A5] text-[11px]">
              <li className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-amber-300 shrink-0" />
                <span>Payment & Escrow: <strong>Within 6 Hours</strong></span>
              </li>
              <li className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Quality & Lab Dispute: <strong>Within 24 Hours</strong></span>
              </li>
              <li className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-sky-400 shrink-0" />
                <span>Logistics & Weighbridge: <strong>Immediate Gate Action</strong></span>
              </li>
            </ul>

            <div className="pt-2 flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => setComplaintModalOpen(true)}
                className="w-full py-1.5 px-3 bg-[#26372B] hover:bg-[#354D3C] text-stone-100 font-semibold rounded-lg text-[11px] transition flex items-center justify-between border border-[#3A503F]"
              >
                <span>Track Registered Complaints</span>
                <span className="bg-[#1C261F] text-amber-300 px-1.5 py-0.2 rounded text-[10px] font-mono">
                  {complaints.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setComplaintInitialOrderId('');
                  setComplaintModalOpen(true);
                }}
                className="text-left text-[11px] text-amber-300 hover:text-amber-200 font-medium hover:underline flex items-center gap-1"
              >
                <span>Open Full Grievance Portal</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Column 4: Escrow & Governance */}
          <div className="space-y-2.5">
            <h4 className="font-serif font-bold text-stone-200 uppercase tracking-wider text-[11px] text-[#E8DCC4]">
              Escrow & APMC Governance
            </h4>
            <p className="text-[#A8A196] text-[11px] leading-relaxed">
              Every consignment is verified by APMC weighbridge slips, standardized AGMARK lab moisture reports, and secure e-NAM bank escrow settlement stored in Firebase Firestore.
            </p>
            <div className="bg-[#223025] p-2.5 rounded-lg border border-[#2E4233] text-[10px] text-[#A8A196] space-y-1">
              <div className="text-stone-200 font-semibold flex items-center gap-1">
                <FileCheck className="w-3 h-3 text-emerald-400" />
                <span>e-NAM Arbitration Helpline</span>
              </div>
              <p>Toll Free: 1800-AGRI-CARE (1800-2474-2273)</p>
              <p className="text-[9px] text-[#7A746B]">support@krishiquant.in</p>
            </div>
            <div className="pt-1 text-[10px] text-[#7A746B]">
              © {new Date().getFullYear()} KrishiQuant • National e-NAM Gateway
            </div>
          </div>
        </div>

        {/* Footer Bottom Attribution */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 mt-8 border-t border-[#2A3B2E] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#A8A196]">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} KrishiQuant • National e-NAM Agricultural Gateway</span>
          </div>
          <div className="flex items-center gap-2 bg-[#223025] px-4 py-1.5 rounded-xl border border-[#344838] text-stone-200 shadow-xs">
            <span className="text-[#A8A196] text-xs">Developed by</span>
            <span className="font-serif font-bold text-amber-300 text-sm tracking-wider">" Parity Bit "</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {authModalOpen && (
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => {
            setAuthModalOpen(false);
            setAuthPrompt(undefined);
            setPendingAuthAction(null);
          }}
          customPrompt={authPrompt}
          onSuccess={() => {
            if (pendingAuthAction) {
              const action = pendingAuthAction;
              setPendingAuthAction(null);
              action();
            }
          }}
        />
      )}

      {/* Complaint / Grievance Modal */}
      {complaintModalOpen && (
        <ComplaintModal
          isOpen={complaintModalOpen}
          onClose={() => setComplaintModalOpen(false)}
          currentUser={currentUser}
          initialOrderId={complaintInitialOrderId}
          onRegisterComplaint={handleRegisterComplaint}
          complaintsList={complaints}
        />
      )}

      {/* Checkout / Escrow Modal */}
      {checkoutModalOpen && checkoutListing && (
        <CheckoutModal
          isOpen={checkoutModalOpen}
          onClose={() => setCheckoutModalOpen(false)}
          listing={checkoutListing}
          currentUser={currentUser}
          initialQuantityTons={checkoutInitQty}
          initialPricePerTon={checkoutInitPrice}
          onCompleteOrder={handleCompleteOrder}
          onTrackOrder={(txn) => {
            setTrackingTxn(txn);
            setTrackingModalOpen(true);
          }}
        />
      )}

      {/* Order Tracking Modal */}
      {trackingModalOpen && trackingTxn && (
        <OrderTrackingModal
          isOpen={trackingModalOpen}
          onClose={() => setTrackingModalOpen(false)}
          transaction={trackingTxn}
          onUpdateStatus={(txnId, newStatus) => {
            setTransactions((prev) =>
              prev.map((t) => (t.id === txnId ? { ...t, status: newStatus } : t))
            );
          }}
        />
      )}

      {/* AI Negotiator Modal */}
      {negotiatorModalOpen && negotiatorListing && (
        <AiNegotiatorModal
          isOpen={negotiatorModalOpen}
          onClose={() => setNegotiatorModalOpen(false)}
          listing={negotiatorListing}
          onApplyNegotiatedPrice={handleApplyNegotiatedPrice}
        />
      )}

      {/* Farmer Create Listing Modal */}
      {createListingModalOpen && (
        <CreateListingModal
          isOpen={createListingModalOpen}
          onClose={() => setCreateListingModalOpen(false)}
          currentUser={currentUser}
          onAddListing={handleAddListing}
          onOpenAuth={() => setAuthModalOpen(true)}
          prefillName={prefillListingName}
          prefillCategory={prefillListingCategory}
        />
      )}

      {/* Buyer Create RFQ Modal */}
      {createRfqModalOpen && (
        <CreateRfqModal
          isOpen={createRfqModalOpen}
          onClose={() => setCreateRfqModalOpen(false)}
          currentUser={currentUser}
          onAddRfq={handleAddRfq}
        />
      )}
    </div>
  );
}


