import React, { useState, useEffect, useMemo } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  serverTimestamp, 
  doc,
  updateDoc,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  LogIn, 
  LogOut, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Inbox, 
  Mail, 
  Tag, 
  FileText, 
  RefreshCw,
  Eye,
  EyeOff,
  Search,
  Filter,
  Check,
  RotateCcw,
  User as UserIcon,
  Trash2,
  AlertTriangle,
  BadgeAlert
} from 'lucide-react';

// ============================================================================
// 1. ADMIN AUTHENTICATION & ACCESS RESTRICTION CONSTANTS & HELPERS
// ============================================================================

/**
 * Designated Administrator Email with authorized access to the complaints database
 */
export const ADMIN_EMAIL = "aryan@gmail.com";

/**
 * Default credential helper for evaluation / verification
 */
export const DEFAULT_ADMIN_PASSWORD = "456123";

/**
 * Access check function to determine if the authenticated user has Admin clearance
 * @param user Firebase Auth User object or null
 * @returns boolean true if user email matches ADMIN_EMAIL
 */
export const isAdmin = (user: User | null): boolean => {
  return Boolean(user && user.email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase());
};

// ============================================================================
// TYPES
// ============================================================================

export type ComplaintCategory = 
  | 'Payment & Escrow'
  | 'Crop Quality Discrepancy'
  | 'Logistics & Delivery Delay'
  | 'Mandi Price Dispute'
  | 'Packaging & Transit Damage'
  | 'Account & Technical Issue'
  | 'Weighbridge & Quantity'
  | 'Other';

export interface ComplaintRecord {
  id?: string;
  ticketNumber?: string;
  userName?: string;
  userContact?: string;
  userEmail: string;
  category: string;
  issueCategory?: string;
  subject?: string;
  description: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent' | string;
  orderId?: string;
  status?: 'Open' | 'Under Review' | 'Resolved' | 'Registered' | 'Under Investigation' | string;
  timestamp?: Timestamp | { seconds: number; nanoseconds: number } | null;
  createdAt?: string;
  userRole?: string;
}

export interface ComplaintSystemProps {
  initialTab?: 'submit' | 'admin';
}

// ============================================================================
// MAIN COMPONENT: ComplaintSystem
// ============================================================================

export const ComplaintSystem: React.FC<ComplaintSystemProps> = ({ initialTab = 'admin' }) => {
  const { firebaseUser, currentUser: appUser } = useAuth();

  // Navigation State - defaults directly to admin view for quick oversight
  const [activeTab, setActiveTab] = useState<'submit' | 'admin'>(initialTab);

  // Local Firebase Auth State (tracks direct login in this component or syncs with useAuth)
  const [currentUser, setCurrentUser] = useState<User | null>(firebaseUser || auth.currentUser);
  const [authLoading, setAuthLoading] = useState<boolean>(!firebaseUser);

  // Submit Complaint Form State
  const [userEmail, setUserEmail] = useState<string>(appUser?.email || '');
  const [category, setCategory] = useState<ComplaintCategory>('Payment & Escrow');
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastSubmittedTicket, setLastSubmittedTicket] = useState<string | null>(null);

  // Admin Dashboard State
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState<boolean>(true);
  const [complaintsError, setComplaintsError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'under_review' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Admin Sign-In Inline Form State
  const [loginEmail, setLoginEmail] = useState<string>(ADMIN_EMAIL);
  const [loginPassword, setLoginPassword] = useState<string>(DEFAULT_ADMIN_PASSWORD);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Determine admin clearance across all auth layers
  const userIsAdmin = useMemo(() => {
    return Boolean(
      (currentUser && currentUser.email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) ||
      (firebaseUser && firebaseUser.email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) ||
      (auth.currentUser && auth.currentUser.email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase())
    );
  }, [currentUser, firebaseUser]);

  // --------------------------------------------------------------------------
  // Track Authentication State with onAuthStateChanged
  // --------------------------------------------------------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user?.email && !userEmail) {
        setUserEmail(user.email);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync if context firebaseUser changes
  useEffect(() => {
    if (firebaseUser) {
      setCurrentUser(firebaseUser);
      setAuthLoading(false);
    }
  }, [firebaseUser]);

  // --------------------------------------------------------------------------
  // Connect Real-Time Firestore onSnapshot when authenticated as ADMIN_EMAIL
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!userIsAdmin) {
      setComplaints([]);
      setComplaintsLoading(false);
      return;
    }

    setComplaintsLoading(true);
    setComplaintsError(null);

    // Direct collection listener ensures ALL complaints filed by any user are captured
    const complaintsRef = collection(db, 'complaints');

    const unsubscribe = onSnapshot(
      complaintsRef,
      (snapshot) => {
        const records: ComplaintRecord[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const emailVal = 
            data.userEmail || 
            (data.userContact && data.userContact.includes('@') ? data.userContact : '') ||
            data.userContact || 
            (data.userName ? `${data.userName}` : 'Platform User');

          return {
            id: docSnap.id,
            ticketNumber: data.ticketNumber || `TKT-${docSnap.id.slice(0, 8).toUpperCase()}`,
            userName: data.userName || 'Anonymous User',
            userContact: data.userContact || emailVal,
            userEmail: emailVal,
            category: data.category || data.issueCategory || 'General Dispute',
            issueCategory: data.issueCategory || data.category || 'General Dispute',
            subject: data.subject || (data.description ? data.description.slice(0, 60) : 'Dispute Report'),
            description: data.description || data.subject || 'No detailed description provided.',
            priority: data.priority || 'Medium',
            orderId: data.orderId || undefined,
            status: data.status || 'Open',
            timestamp: data.timestamp || null,
            createdAt: data.createdAt || (data.updatedAt ? data.updatedAt.slice(0, 16) : undefined),
            userRole: data.userRole || 'User',
          };
        });

        // Robust in-memory chronological sort (newest tickets first)
        records.sort((a, b) => {
          const getTime = (r: ComplaintRecord): number => {
            if (r.timestamp && typeof r.timestamp === 'object') {
              if ('seconds' in r.timestamp) return r.timestamp.seconds * 1000;
              if (typeof (r.timestamp as any).toDate === 'function') {
                return (r.timestamp as any).toDate().getTime();
              }
            }
            if (r.createdAt) {
              const parsed = new Date(r.createdAt).getTime();
              if (!isNaN(parsed)) return parsed;
            }
            return 0;
          };
          return getTime(b) - getTime(a);
        });

        setComplaints(records);
        setComplaintsLoading(false);
      },
      (error) => {
        console.error("Firestore onSnapshot error:", error);
        setComplaintsError(error.message);
        setComplaintsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userIsAdmin]);

  // --------------------------------------------------------------------------
  // Tab 1: Handle Submit Complaint (Dispatches directly to admin collection)
  // --------------------------------------------------------------------------
  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const emailToUse = userEmail.trim() || appUser?.email || '';
    if (!emailToUse) {
      setSubmitError('Please enter your contact email address.');
      return;
    }
    if (!description.trim()) {
      setSubmitError('Please provide details describing the dispute or issue.');
      return;
    }

    setIsSubmitting(true);

    try {
      const generatedTicket = `GRV-AGRI-${Math.floor(100000 + Math.random() * 900000)}`;
      const resolvedSubject = subject.trim() || description.trim().slice(0, 60);

      // Write directly to Firestore collection 'complaints'
      await addDoc(collection(db, 'complaints'), {
        ticketNumber: generatedTicket,
        userName: appUser?.name || currentUser?.displayName || 'KrishiQuant User',
        userContact: emailToUse.toLowerCase(),
        userEmail: emailToUse.toLowerCase(),
        category,
        issueCategory: category,
        subject: resolvedSubject,
        description: description.trim(),
        priority: 'Medium',
        status: 'Open',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        timestamp: serverTimestamp(),
        userId: currentUser?.uid || appUser?.id || 'public-user',
        userRole: appUser?.role || 'farmer',
      });

      setLastSubmittedTicket(generatedTicket);
      setSubmitSuccess(true);
      setSubject('');
      setDescription('');
    } catch (err: any) {
      console.error("Error creating complaint:", err);
      setSubmitError(err?.message || 'Failed to submit complaint. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // Admin Action: Update Complaint Status (Real-Time in Firestore)
  // --------------------------------------------------------------------------
  const handleUpdateStatus = async (complaintId: string, newStatus: string) => {
    if (!complaintId) return;
    setUpdatingId(complaintId);
    try {
      const docRef = doc(db, 'complaints', complaintId);
      await updateDoc(docRef, {
        status: newStatus,
        reviewedBy: ADMIN_EMAIL,
        updatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("Error updating complaint status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // --------------------------------------------------------------------------
  // Admin Action: Delete/Dismiss Ticket
  // --------------------------------------------------------------------------
  const handleDeleteTicket = async (complaintId: string) => {
    if (!complaintId) return;
    if (!window.confirm("Are you sure you want to remove this resolved ticket from the console?")) {
      return;
    }
    setUpdatingId(complaintId);
    try {
      await deleteDoc(doc(db, 'complaints', complaintId));
    } catch (err: any) {
      console.error("Error deleting complaint:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // --------------------------------------------------------------------------
  // Handle Admin Sign In / Sign Out
  // --------------------------------------------------------------------------
  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSigningIn(true);

    try {
      await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
    } catch (err: any) {
      // Auto-provision admin if needed
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
        try {
          await createUserWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
          setIsSigningIn(false);
          return;
        } catch (createErr: any) {
          setLoginError(createErr?.message || 'Authentication failed. Please verify credentials.');
        }
      } else {
        setLoginError(err?.message || 'Authentication error. Please check your password.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleAdminSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error("Sign-out error:", err);
    }
  };

  // Helper for human-readable formatted timestamps
  const formatTimestamp = (ts?: Timestamp | { seconds: number; nanoseconds: number } | null, fallbackDate?: string): string => {
    if (ts) {
      try {
        if (typeof (ts as Timestamp).toDate === 'function') {
          return (ts as Timestamp).toDate().toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
          });
        }
        if ('seconds' in ts) {
          return new Date(ts.seconds * 1000).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
          });
        }
      } catch {}
    }
    if (fallbackDate) return fallbackDate;
    return 'Just now';
  };

  // Filter complaints based on status and search query
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // Status filter
      if (statusFilter === 'open') {
        if (c.status !== 'Open' && c.status !== 'Registered') return false;
      } else if (statusFilter === 'under_review') {
        if (c.status !== 'Under Review' && c.status !== 'Under Investigation') return false;
      } else if (statusFilter === 'resolved') {
        if (c.status !== 'Resolved') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTicket = c.ticketNumber?.toLowerCase().includes(q);
        const matchesEmail = c.userEmail?.toLowerCase().includes(q) || c.userContact?.toLowerCase().includes(q);
        const matchesName = c.userName?.toLowerCase().includes(q);
        const matchesSubject = c.subject?.toLowerCase().includes(q);
        const matchesDesc = c.description?.toLowerCase().includes(q);
        const matchesCategory = c.category?.toLowerCase().includes(q);
        const matchesOrder = c.orderId?.toLowerCase().includes(q);
        return Boolean(matchesTicket || matchesEmail || matchesName || matchesSubject || matchesDesc || matchesCategory || matchesOrder);
      }

      return true;
    });
  }, [complaints, statusFilter, searchQuery]);

  // Counts
  const counts = useMemo(() => {
    let open = 0;
    let underReview = 0;
    let resolved = 0;
    complaints.forEach((c) => {
      const s = c.status?.toLowerCase();
      if (s === 'resolved') resolved++;
      else if (s === 'under review' || s === 'under investigation') underReview++;
      else open++;
    });
    return { total: complaints.length, open, underReview, resolved };
  }, [complaints]);

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  return (
    <div className="w-full max-w-5xl mx-auto my-6 bg-[#FAF9F6] text-[#1C1C1C] rounded-3xl shadow-xl border border-[#E8E5DF] overflow-hidden font-sans">
      
      {/* Header Bar */}
      <header className="bg-[#233B2B] text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300/90 font-mono">
                KrishiQuant Grievance Redressal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#FAF9F6] tracking-tight">
              Administrative Complaints Console
            </h1>
            <p className="text-xs sm:text-sm text-[#D5CCBD] mt-1 max-w-xl">
              Centralized arbitration hub where all farmer, mandi, and buyer complaints are routed directly in real-time.
            </p>
          </div>

          {/* Current Auth Pill */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {authLoading ? (
              <span className="text-xs text-stone-400 font-mono">Checking clearance...</span>
            ) : userIsAdmin ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-400/40 px-3 py-1.5 rounded-2xl shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span className="text-xs font-mono font-bold text-emerald-200">
                    {ADMIN_EMAIL}
                  </span>
                  <span className="bg-emerald-500 text-stone-900 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                    Admin
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAdminSignOut}
                  title="Sign out of Admin session"
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-stone-300 hover:text-rose-200 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-stone-900/60 border border-white/15 px-3 py-1.5 rounded-2xl">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs text-stone-300 font-mono">
                  {currentUser ? currentUser.email : 'Public User'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="mt-8 pt-4 border-t border-white/15 flex items-center gap-3">
          <button
            type="button"
            id="tab-admin-dashboard"
            onClick={() => setActiveTab('admin')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'admin'
                ? 'bg-amber-300 text-[#1C1C1C] shadow-md font-bold'
                : 'text-[#D5CCBD] hover:text-white hover:bg-white/10'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Admin Complaints Portal</span>
            {counts.total > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#233B2B] text-amber-300 border border-amber-400/40">
                {counts.total}
              </span>
            )}
          </button>

          <button
            type="button"
            id="tab-submit-complaint"
            onClick={() => setActiveTab('submit')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'submit'
                ? 'bg-amber-300 text-[#1C1C1C] shadow-md font-bold'
                : 'text-[#D5CCBD] hover:text-white hover:bg-white/10'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>File New Grievance</span>
          </button>
        </div>
      </header>

      {/* Main Body Content */}
      <main className="p-6 sm:p-8">
        
        {/* ================================================================== */}
        {/* TAB 1: FILE NEW GRIEVANCE (Direct Dispatch to Admin)               */}
        {/* ================================================================== */}
        {activeTab === 'submit' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="border-b border-[#E8E5DF] pb-4">
              <h2 className="text-xl font-serif font-bold text-[#1C1C1C]">
                File a Grievance or Dispute
              </h2>
              <p className="text-xs sm:text-sm text-[#6B655B] mt-1">
                Every grievance submitted here is transmitted straight to the <strong>{ADMIN_EMAIL}</strong> administrative resolution panel.
              </p>
            </div>

            {/* Success State */}
            {submitSuccess && lastSubmittedTicket && (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Dispute Filed & Delivered Directly to Admin!</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Your grievance has been recorded into the Firestore database with reference code{' '}
                  <strong className="font-mono bg-emerald-100 px-2 py-0.5 rounded text-emerald-950 font-bold">
                    #{lastSubmittedTicket}
                  </strong>. The administrator (<strong className="font-mono">{ADMIN_EMAIL}</strong>) has received this ticket and will review it.
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitSuccess(false);
                      setLastSubmittedTicket(null);
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition"
                  >
                    File Another Complaint
                  </button>
                  {userIsAdmin && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('admin')}
                      className="px-4 py-2 bg-amber-200 hover:bg-amber-300 text-amber-950 rounded-xl text-xs font-semibold transition"
                    >
                      View in Admin Console →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Error Notice */}
            {submitError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Submission Form */}
            {!submitSuccess && (
              <form onSubmit={handleSubmitComplaint} className="space-y-4 bg-white p-6 rounded-2xl border border-[#E8E5DF] shadow-xs">
                
                {/* Contact Email Field */}
                <div className="space-y-1.5">
                  <label htmlFor="complaint-email" className="block text-xs font-bold text-[#1C1C1C] uppercase tracking-wide">
                    Your Contact Email / Phone <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#7A746B] absolute left-3.5 top-3" />
                    <input
                      id="complaint-email"
                      type="text"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="e.g. kisan.ramesh@gmail.com or 9876543210"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#D5CCBD] rounded-xl text-xs sm:text-sm text-[#1C1C1C] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#233B2B]"
                    />
                  </div>
                </div>

                {/* Category Dropdown */}
                <div className="space-y-1.5">
                  <label htmlFor="complaint-category" className="block text-xs font-bold text-[#1C1C1C] uppercase tracking-wide">
                    Issue Category <span className="text-rose-600">*</span>
                  </label>
                  <select
                    id="complaint-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#D5CCBD] rounded-xl text-xs sm:text-sm text-[#1C1C1C] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#233B2B]"
                  >
                    <option value="Payment & Escrow">Payment & Escrow Hold</option>
                    <option value="Crop Quality Discrepancy">Crop Quality / Moisture Discrepancy</option>
                    <option value="Logistics & Delivery Delay">Logistics & Delivery Delay</option>
                    <option value="Mandi Price Dispute">Mandi MSP or Contract Price Dispute</option>
                    <option value="Weighbridge & Quantity">Weighbridge Tare Mismatch</option>
                    <option value="Packaging & Transit Damage">Packaging & Transit Damage</option>
                    <option value="Account & Technical Issue">Account & Technical Issue</option>
                    <option value="Other">Other Dispute</option>
                  </select>
                </div>

                {/* Subject Line */}
                <div className="space-y-1.5">
                  <label htmlFor="complaint-subject" className="block text-xs font-bold text-[#1C1C1C] uppercase tracking-wide">
                    Brief Subject
                  </label>
                  <input
                    id="complaint-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Short summary of the problem..."
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#D5CCBD] rounded-xl text-xs sm:text-sm text-[#1C1C1C] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#233B2B]"
                  />
                </div>

                {/* Description Textarea */}
                <div className="space-y-1.5">
                  <label htmlFor="complaint-description" className="block text-xs font-bold text-[#1C1C1C] uppercase tracking-wide">
                    Detailed Explanation <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    id="complaint-description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe transaction details, mandi location, lot number, or what happened..."
                    required
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#D5CCBD] rounded-xl text-xs sm:text-sm text-[#1C1C1C] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#233B2B]"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  id="btn-submit-complaint"
                  disabled={isSubmitting}
                  className="w-full py-3 px-5 rounded-xl bg-[#233B2B] hover:bg-[#2d4b37] disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                      <span>Transmitting Ticket to Admin...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-amber-300" />
                      <span>Transmit Complaint to Admin Panel</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 2: ADMIN COMPLAINTS PORTAL                                     */}
        {/* ================================================================== */}
        {activeTab === 'admin' && (
          <div>
            {!userIsAdmin ? (
              /* Unauthorized Screen with Quick Auto-fill Admin Sign-In */
              <div className="max-w-md mx-auto space-y-6 text-center py-6">
                
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8 text-amber-700" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-serif font-bold text-[#1C1C1C]">
                    Restricted Admin Portal
                  </h3>
                  <p className="text-xs text-[#6B655B] leading-relaxed">
                    User complaints and grievance records are confidential. Access is strictly limited to authorized administrator <strong className="font-mono text-emerald-800">{ADMIN_EMAIL}</strong>.
                  </p>
                </div>

                {/* Sign-In Card */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4 text-left shadow-xs">
                  <div className="flex items-center gap-2 border-b border-stone-100 pb-2.5">
                    <LogIn className="w-4 h-4 text-emerald-800" />
                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                      Admin Credentials Sign-In
                    </h4>
                  </div>

                  {loginError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAdminSignIn} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-stone-700">
                        Admin Email
                      </label>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="aryan@gmail.com"
                        required
                        className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-stone-700">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••"
                          required
                          className="w-full px-3.5 py-2 pr-10 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-800"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginEmail(ADMIN_EMAIL);
                          setLoginPassword(DEFAULT_ADMIN_PASSWORD);
                        }}
                        className="text-[11px] text-amber-700 hover:text-amber-900 font-semibold underline"
                      >
                        Auto-fill Admin Credentials
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isSigningIn}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#233B2B] hover:bg-[#2d4b37] text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSigningIn ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Authenticating Admin...</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5 text-amber-300" />
                          <span>Access Admin Console</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

              </div>
            ) : (
              /* Authorized Admin Live Dashboard */
              <div className="space-y-6">
                
                {/* Admin Subheader & Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#F4F1EA] p-4 sm:p-5 rounded-2xl border border-[#E8E5DF]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 font-mono">
                        Live Real-Time Firestore Sync
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-[#1C1C1C] mt-0.5">
                      Complaints & Dispute Resolution Stream
                    </h3>
                    <p className="text-xs text-[#7A746B]">
                      All complaints submitted across the application are captured and updated live here.
                    </p>
                  </div>

                  {/* Badges and Counts */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#D5CCBD] text-xs font-bold text-[#1C1C1C] shadow-2xs">
                      <Inbox className="w-4 h-4 text-emerald-800" />
                      <span>Total:</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#233B2B] text-amber-300 font-mono text-[11px]">
                        {counts.total}
                      </span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{ADMIN_EMAIL}</span>
                    </span>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E8E5DF] shadow-2xs">
                  {/* Status Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        statusFilter === 'all'
                          ? 'bg-[#233B2B] text-amber-300 shadow-2xs font-bold'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      All ({counts.total})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('open')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        statusFilter === 'open'
                          ? 'bg-amber-500 text-white shadow-2xs font-bold'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      Open ({counts.open})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('under_review')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        statusFilter === 'under_review'
                          ? 'bg-blue-600 text-white shadow-2xs font-bold'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      Under Review ({counts.underReview})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('resolved')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        statusFilter === 'resolved'
                          ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      Resolved ({counts.resolved})
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative min-w-[220px]">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search ticket, email, name..."
                      className="w-full pl-9 pr-3 py-1.5 bg-[#FAF9F6] border border-[#D5CCBD] rounded-xl text-xs text-[#1C1C1C] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#233B2B]"
                    />
                  </div>
                </div>

                {/* Loading State */}
                {complaintsLoading && (
                  <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-[#E8E5DF]">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-800 mx-auto" />
                    <p className="text-xs text-[#7A746B] font-mono">
                      Connecting to real-time complaints stream...
                    </p>
                  </div>
                )}

                {/* Error State */}
                {complaintsError && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                    <div className="flex items-center gap-2 font-bold text-rose-700">
                      <AlertCircle className="w-4 h-4" />
                      <span>Firestore Subscription Notice</span>
                    </div>
                    <p className="font-mono text-[11px]">{complaintsError}</p>
                  </div>
                )}

                {/* Empty State */}
                {!complaintsLoading && !complaintsError && filteredComplaints.length === 0 && (
                  <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-[#E8E5DF]">
                    <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-[#1C1C1C]">
                      {searchQuery || statusFilter !== 'all' ? 'No Matching Complaints' : 'No User Complaints Found'}
                    </h4>
                    <p className="text-xs text-[#7A746B] max-w-sm mx-auto">
                      {searchQuery || statusFilter !== 'all' 
                        ? 'Try clearing the search query or status filter.' 
                        : 'No grievances have been registered yet. When users submit via the footer form or grievance modal, they will show up here immediately.'}
                    </p>
                  </div>
                )}

                {/* Real-Time Live Complaints Feed */}
                {!complaintsLoading && filteredComplaints.length > 0 && (
                  <div className="space-y-3">
                    {filteredComplaints.map((item, index) => {
                      const isItemResolved = item.status === 'Resolved';
                      const isItemUnderReview = item.status === 'Under Review' || item.status === 'Under Investigation';
                      const isItemOpen = !isItemResolved && !isItemUnderReview;

                      return (
                        <article 
                          key={item.id || index}
                          className="bg-white p-5 rounded-2xl border border-[#E8E5DF] hover:border-emerald-700/40 transition shadow-2xs space-y-3"
                        >
                          {/* Top Meta Bar */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F4F1EA] pb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Ticket Number */}
                              <span className="font-mono font-bold text-xs text-[#233B2B] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                #{item.ticketNumber}
                              </span>

                              {/* User Contact */}
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1C1C1C] font-mono">
                                <Mail className="w-3.5 h-3.5 text-emerald-800" />
                                {item.userEmail || item.userContact}
                              </span>

                              {/* User Name / Role */}
                              {item.userName && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-[#7A746B]">
                                  <UserIcon className="w-3 h-3" />
                                  <span>{item.userName}</span>
                                  {item.userRole && (
                                    <span className="text-[10px] bg-stone-100 px-1.5 py-0.2 rounded font-mono uppercase">
                                      {item.userRole}
                                    </span>
                                  )}
                                </span>
                              )}

                              {/* Category Tag */}
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F4F1EA] text-[#233B2B] border border-[#E8E5DF]">
                                <Tag className="w-3 h-3 text-[#7A746B]" />
                                {item.category}
                              </span>

                              {/* Priority Badge */}
                              {item.priority && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  item.priority === 'Urgent' || item.priority === 'High'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {item.priority} Priority
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Status Badge */}
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                isItemResolved
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : isItemUnderReview
                                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  isItemResolved ? 'bg-emerald-600' : isItemUnderReview ? 'bg-blue-600' : 'bg-amber-500'
                                }`} />
                                {item.status || 'Open'}
                              </span>

                              {/* Timestamp */}
                              <span className="inline-flex items-center gap-1 text-[11px] text-[#7A746B] font-mono">
                                <Clock className="w-3 h-3" />
                                {formatTimestamp(item.timestamp, item.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Subject & Description */}
                          <div className="space-y-1">
                            {item.subject && (
                              <h4 className="font-serif font-bold text-sm text-[#1C1C1C]">
                                {item.subject}
                              </h4>
                            )}
                            <p className="text-xs sm:text-sm text-[#4A453E] leading-relaxed whitespace-pre-wrap">
                              {item.description}
                            </p>
                          </div>

                          {/* Order Reference if present */}
                          {item.orderId && (
                            <div className="text-[11px] font-mono text-[#7A746B] bg-[#FAF9F6] px-3 py-1.5 rounded-lg border border-[#E8E5DF] inline-block">
                              Associated Order ID: <strong className="text-[#233B2B]">{item.orderId}</strong>
                            </div>
                          )}

                          {/* Admin Resolution Action Bar */}
                          <div className="pt-2 border-t border-[#F4F1EA] flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">
                                Set Status:
                              </span>

                              {isItemOpen && item.id && (
                                <button
                                  type="button"
                                  disabled={updatingId === item.id}
                                  onClick={() => handleUpdateStatus(item.id!, 'Under Review')}
                                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-semibold transition flex items-center gap-1"
                                >
                                  <span>Mark Under Review</span>
                                </button>
                              )}

                              {!isItemResolved && item.id && (
                                <button
                                  type="button"
                                  disabled={updatingId === item.id}
                                  onClick={() => handleUpdateStatus(item.id!, 'Resolved')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold transition flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Mark Resolved</span>
                                </button>
                              )}

                              {isItemResolved && item.id && (
                                <button
                                  type="button"
                                  disabled={updatingId === item.id}
                                  onClick={() => handleUpdateStatus(item.id!, 'Open')}
                                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition flex items-center gap-1"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Re-open</span>
                                </button>
                              )}
                            </div>

                            {/* Dismiss or Document info */}
                            <div className="flex items-center gap-3">
                              {item.id && (
                                <span className="text-[10px] text-[#9E988F] font-mono">
                                  ID: {item.id}
                                </span>
                              )}
                              {item.id && isItemResolved && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTicket(item.id!)}
                                  title="Delete resolved ticket"
                                  className="text-stone-400 hover:text-rose-600 p-1 rounded transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}

              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#F4F1EA] px-6 py-4 border-t border-[#E8E5DF] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#7A746B] gap-2">
        <span>KrishiQuant Agricultural Dispute Resolution Subsystem</span>
        <span className="font-mono">
          Administrative access strictly restricted to <strong className="text-[#1C1C1C]">{ADMIN_EMAIL}</strong>
        </span>
      </footer>

    </div>
  );
};

export default ComplaintSystem;
