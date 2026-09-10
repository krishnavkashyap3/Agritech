import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  MapPin, 
  Building2, 
  Sprout, 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight, 
  LogIn,
  Check,
  Ban,
  Phone,
  Tractor
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  customPrompt?: string;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  customPrompt,
  onSuccess,
}) => {
  const { 
    signInWithEmail, 
    signInAsDemoRole,
    signUpWithEmail, 
    resetPassword,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(
    initialMode === 'signup' ? 'signup' : 'signin'
  );
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailAlreadyExists, setEmailAlreadyExists] = useState(false);
  const [invalidCredentialsError, setInvalidCredentialsError] = useState(false);

  // Selected Role for Sign In or Sign Up
  // Roles: 'farmer' (Only role that can list crops), 'fpo' (cannot list crops), 'individual' (direct buyer - cannot list crops)
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [orgOrFarmName, setOrgOrFarmName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSuccess = () => {
    onClose();
    if (onSuccess) {
      setTimeout(() => {
        onSuccess();
      }, 100);
    }
  };

  const handleQuickDemoLogin = (roleToLogin: UserRole) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      signInAsDemoRole(roleToLogin);
      handleSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  // Email / Password Submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setEmailAlreadyExists(false);
    setInvalidCredentialsError(false);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password, selectedRole);
        handleSuccess();
      } else if (mode === 'signup') {
        if (!name.trim()) throw new Error('Please enter your full name or registered entity name');
        if (!location.trim()) throw new Error('Please specify your agro-mandi hub or location');
        await signUpWithEmail(email, password, name, selectedRole, location, orgOrFarmName, phone);
        handleSuccess();
      } else if (mode === 'forgot') {
        if (!email.trim()) throw new Error('Please enter your email address to receive reset instructions');
        await resetPassword(email);
        setSuccessMessage('Password reset link sent! Check your inbox to reset your password.');
      }
    } catch (err: any) {
      const rawMsg = err.message || '';
      const code = err.code || '';
      let msg = 'Authentication failed. Please check your credentials and try again.';
      
      if (code === 'auth/email-already-in-use' || rawMsg.includes('auth/email-already-in-use')) {
        setEmailAlreadyExists(true);
        msg = `An account with ${email || 'this email'} already exists. Click below to sign in directly.`;
      } else if (code === 'auth/invalid-credential' || rawMsg.includes('auth/invalid-credential') || code === 'auth/wrong-password' || rawMsg.includes('auth/wrong-password') || code === 'auth/user-not-found' || rawMsg.includes('auth/user-not-found')) {
        setInvalidCredentialsError(true);
        msg = 'Invalid email or password. If you are new to KrishiQuant, click "Create Account" below to register.';
      } else if (code === 'auth/weak-password' || rawMsg.includes('auth/weak-password')) {
        msg = 'Password is too weak. Please use at least 6 characters.';
      } else if (code === 'auth/too-many-requests' || rawMsg.includes('auth/too-many-requests')) {
        msg = 'Too many failed login attempts. Please reset your password or try again later.';
      } else if (code === 'auth/invalid-email' || rawMsg.includes('auth/invalid-email')) {
        msg = 'Please enter a valid email address.';
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToSignIn = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setEmailAlreadyExists(false);
    setInvalidCredentialsError(false);
    setMode('signin');
  };

  const handleSwitchToSignUp = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setEmailAlreadyExists(false);
    setInvalidCredentialsError(false);
    setMode('signup');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#FAF9F6] rounded-3xl max-w-lg w-full p-5 sm:p-7 border border-[#E8E5DF] shadow-2xl relative space-y-4 my-4 max-h-[94vh] overflow-y-auto">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#7A746B] hover:text-[#1C1C1C] hover:bg-[#EFEBE3] rounded-full transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge & Brand */}
        <div className="space-y-1 text-center flex flex-col items-center pt-1">
          <div className="w-12 h-12 rounded-2xl bg-[#233B2B] border border-[#3E5C47] flex items-center justify-center p-0.5 overflow-hidden shadow-xs mb-1">
            <img 
              src="/krishiquant-logo.jpg" 
              alt="KrishiQuant Logo" 
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-[#233B2B] text-amber-200 text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-[#3E5C47]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>KrishiQuant e-NAM Verified Access</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1C1C]">
            {mode === 'signup' 
              ? 'Register New Account' 
              : mode === 'forgot' 
              ? 'Reset Your Password'
              : 'Sign In to KrishiQuant'}
          </h2>

          {customPrompt ? (
            <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-2.5 text-xs text-amber-900 text-left flex items-start gap-2 mt-1 w-full">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950">Authentication Required</p>
                <p className="text-[11px] text-amber-800 leading-snug">{customPrompt}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#6B655B] max-w-sm">
              Sign in to manage agricultural harvests, participate in price discovery, and trade through escrow contracts.
            </p>
          )}
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-1 bg-[#EAE5D9] p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={handleSwitchToSignIn}
            className={`py-2 px-3 rounded-lg transition flex items-center justify-center gap-1.5 text-xs ${
              mode === 'signin' 
                ? 'bg-white text-[#1C1C1C] shadow-xs font-bold' 
                : 'text-[#5C554B] hover:text-[#1C1C1C]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={handleSwitchToSignUp}
            className={`py-2 px-3 rounded-lg transition flex items-center justify-center gap-1.5 text-xs ${
              mode === 'signup' 
                ? 'bg-white text-[#1C1C1C] shadow-xs font-bold' 
                : 'text-[#5C554B] hover:text-[#1C1C1C]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Success notification */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-900 p-3 rounded-2xl text-xs space-y-2.5 shadow-xs">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="flex-1 text-[11px] leading-relaxed">{errorMessage}</span>
            </div>
            
            {emailAlreadyExists && (
              <button
                type="button"
                onClick={handleSwitchToSignIn}
                className="w-full py-1.5 px-3 bg-[#233B2B] hover:bg-[#1A2E21] text-amber-200 rounded-xl font-bold flex items-center justify-center gap-1.5 transition text-xs shadow-xs"
              >
                <span>Switch to Sign In</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}

            {invalidCredentialsError && (
              <div className="space-y-1.5 pt-1 border-t border-rose-200">
                <button
                  type="button"
                  onClick={handleSwitchToSignUp}
                  className="w-full py-1.5 px-2 bg-white hover:bg-rose-100/50 border border-rose-300 text-rose-950 rounded-xl font-bold flex items-center justify-center gap-1 transition text-[11px]"
                >
                  <User className="w-3 h-3 text-rose-700" />
                  <span>Register a New Account</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ROLE SELECTION SECTION: Explicit Distinction between Farmer vs FPO vs Direct Buyer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#1C1C1C]">
              {mode === 'signup' ? 'Select Account Role:' : 'Choose Login Profile Role:'}
            </label>
            <span className="text-[10px] text-[#7A746B]">Crop Listing Authorization</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Farmer Role */}
            <button
              type="button"
              onClick={() => setSelectedRole('farmer')}
              className={`p-2.5 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                selectedRole === 'farmer'
                  ? 'bg-[#EBF3ED] border-[#2D4F38] shadow-sm ring-1 ring-[#2D4F38]'
                  : 'bg-white border-[#E8E5DF] hover:bg-[#F9F7F2]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    selectedRole === 'farmer' ? 'bg-[#233B2B] text-amber-200' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    <Sprout className="w-4 h-4" />
                  </div>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <Check className="w-2.5 h-2.5" /> Can List
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#1C1C1C] leading-tight">Farmer (Kisan)</h4>
                <p className="text-[10px] text-[#6B655B] mt-0.5 leading-snug">Cultivator & grower</p>
              </div>
            </button>

            {/* FPO Role */}
            <button
              type="button"
              onClick={() => setSelectedRole('fpo')}
              className={`p-2.5 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                selectedRole === 'fpo'
                  ? 'bg-[#F7F2EA] border-[#8C6B3D] shadow-sm ring-1 ring-[#8C6B3D]'
                  : 'bg-white border-[#E8E5DF] hover:bg-[#F9F7F2]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    selectedRole === 'fpo' ? 'bg-[#8C6B3D] text-white' : 'bg-amber-100 text-amber-800'
                  }`}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <Ban className="w-2.5 h-2.5" /> No Listing
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#1C1C1C] leading-tight">FPO Producer</h4>
                <p className="text-[10px] text-[#6B655B] mt-0.5 leading-snug">Aggregator & co-op</p>
              </div>
            </button>

            {/* Direct Buyer Role */}
            <button
              type="button"
              onClick={() => setSelectedRole('individual')}
              className={`p-2.5 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                selectedRole === 'individual'
                  ? 'bg-[#EEF2F6] border-[#3B5B7D] shadow-sm ring-1 ring-[#3B5B7D]'
                  : 'bg-white border-[#E8E5DF] hover:bg-[#F9F7F2]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    selectedRole === 'individual' ? 'bg-[#3B5B7D] text-white' : 'bg-blue-100 text-blue-800'
                  }`}>
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <Ban className="w-2.5 h-2.5" /> No Listing
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#1C1C1C] leading-tight">Direct Buyer</h4>
                <p className="text-[10px] text-[#6B655B] mt-0.5 leading-snug">Miller & enterprise</p>
              </div>
            </button>
          </div>

          {/* Dynamic Role Authorization Guideline Badge */}
          <div className={`p-2.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2 ${
            selectedRole === 'farmer'
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : selectedRole === 'fpo'
              ? 'bg-amber-50/80 border-amber-200 text-amber-950'
              : 'bg-blue-50/80 border-blue-200 text-blue-950'
          }`}>
            {selectedRole === 'farmer' ? (
              <>
                <Sprout className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-900 block">Kisan Farmer Access: Exclusive Crop Listing</span>
                  <span className="text-[11px] text-emerald-800">
                    As a signed-in <strong>Farmer</strong>, you can create and list crop lots, set harvest pricing, and accept escrow contracts.
                  </span>
                </div>
              </>
            ) : selectedRole === 'fpo' ? (
              <>
                <Building2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-900 block">FPO Access: Aggregator & Procurement Only</span>
                  <span className="text-[11px] text-amber-800">
                    FPOs <strong>cannot list individual crops</strong>. You can aggregate bulk demand, post procurement RFQs, and purchase lots.
                  </span>
                </div>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-blue-900 block">Direct Buyer Access: Buy & RFQ Mode Only</span>
                  <span className="text-[11px] text-blue-800">
                    Direct Buyers <strong>cannot list crops</strong>. You can browse mandi harvests, post buy RFQs, and buy lots through escrow.
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick 1-Click Fast Sign-In Shortcut Cards for Immediate Verification */}
        {mode === 'signin' && (
          <div className="bg-[#F3EFE6] border border-[#E5DECF] rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#5C554B]">
              <span className="font-bold text-[#1C1C1C]">Instant 1-Click Role Sign In:</span>
              <span className="text-[10px]">Test permissions easily</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('farmer')}
                className="py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs transition"
              >
                <Sprout className="w-3 h-3 text-amber-200" />
                <span>As Farmer</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('fpo')}
                className="py-1.5 px-2 bg-[#8C6B3D] hover:bg-[#785930] text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs transition"
              >
                <Building2 className="w-3 h-3 text-amber-200" />
                <span>As FPO</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('individual')}
                className="py-1.5 px-2 bg-[#3B5B7D] hover:bg-[#2F4A66] text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs transition"
              >
                <ShoppingBag className="w-3 h-3 text-amber-200" />
                <span>As Buyer</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Email/Password Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3 pt-1">
          {mode === 'signup' && (
            <>
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#4A453E] block">
                  {selectedRole === 'farmer' ? 'Farmer Full Name (किसान का नाम)' : selectedRole === 'fpo' ? 'FPO Secretary / Admin Name' : 'Authorized Buyer Name'}
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[#8A847A] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={selectedRole === 'farmer' ? 'e.g. Rajeshwar Patil' : selectedRole === 'fpo' ? 'e.g. Rameshwar Shinde' : 'e.g. Vikram Singhania'}
                    className="w-full bg-white border border-[#D5CCBD] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1C1C1C] focus:ring-1 focus:ring-[#2D4F38] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Farm Name or Organization Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#4A453E] block">
                  {selectedRole === 'farmer' ? 'Farm / Godown Name (खेत / गोदाम)' : selectedRole === 'fpo' ? 'FPO Producer Company Name' : 'Company / Mill Name'}
                </label>
                <div className="relative">
                  {selectedRole === 'farmer' ? (
                    <Tractor className="w-3.5 h-3.5 text-[#8A847A] absolute left-3 top-2.5" />
                  ) : (
                    <Building2 className="w-3.5 h-3.5 text-[#8A847A] absolute left-3 top-2.5" />
                  )}
                  <input
                    type="text"
                    value={orgOrFarmName}
                    onChange={(e) => setOrgOrFarmName(e.target.value)}
                    placeholder={selectedRole === 'farmer' ? 'e.g. Patil Organic Farms & Orchards' : selectedRole === 'fpo' ? 'e.g. Sahyadri Farmers Agro Producer Co.' : 'e.g. ITC Agro-Business Division'}
                    className="w-full bg-white border border-[#D5CCBD] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1C1C1C] focus:ring-1 focus:ring-[#2D4F38] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Mandi Hub / Location */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#4A453E] block">Mandi Yard / City Hub</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-[#8A847A] absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Nashik APMC Yard, Maharashtra"
                    className="w-full bg-white border border-[#D5CCBD] rounded-xl pl-7 pr-2 py-2 text-xs text-[#1C1C1C] focus:ring-1 focus:ring-[#2D4F38] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Contact Phone */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#4A453E] block">Mobile Number (For Mandi Escrow & Calls)</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#8A847A] absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98231 44521"
                    className="w-full bg-white border border-[#D5CCBD] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1C1C1C] focus:ring-1 focus:ring-[#2D4F38] focus:outline-hidden"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#4A453E] block">Email Address</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-[#8A847A] absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={selectedRole === 'farmer' ? 'farmer@kisan.in' : selectedRole === 'fpo' ? 'procurement@fpo.org' : 'buyer@company.com'}
                className="w-full bg-white border border-[#D5CCBD] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1C1C1C] focus:ring-1 focus:ring-[#2D4F38] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Password */}
          {mode !== 'forgot' && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-semibold text-[#4A453E]">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[10px] text-[#2D4F38] hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-[#8A847A] absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#D5CCBD] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1C1C1C] focus:ring-1 focus:ring-[#2D4F38] focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#233B2B] hover:bg-[#1A2E21] text-amber-200 rounded-xl text-xs sm:text-sm font-semibold transition border border-[#3E5C47] shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-amber-200 border-t-transparent rounded-full animate-spin" />
                <span>Authorizing {selectedRole}...</span>
              </span>
            ) : mode === 'signin' ? (
              <span>
                Sign In as {selectedRole === 'farmer' ? 'Farmer' : selectedRole === 'fpo' ? 'FPO Aggregator' : 'Direct Buyer'}
              </span>
            ) : mode === 'signup' ? (
              <span>
                Register as {selectedRole === 'farmer' ? 'Farmer' : selectedRole === 'fpo' ? 'FPO Aggregator' : 'Direct Buyer'}
              </span>
            ) : (
              <span>Send Password Reset Link</span>
            )}
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="pt-2 border-t border-[#EAE5D9] text-center text-xs text-[#5C554B]">
          {mode === 'signin' ? (
            <p>
              New to KrishiQuant?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setMode('signup');
                }}
                className="font-bold text-[#2D4F38] hover:underline"
              >
                Create an Account
              </button>
            </p>
          ) : mode === 'signup' ? (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={handleSwitchToSignIn}
                className="font-bold text-[#2D4F38] hover:underline"
              >
                Sign In to Existing Account
              </button>
            </p>
          ) : (
            <p>
              Remember your password?{' '}
              <button
                type="button"
                onClick={handleSwitchToSignIn}
                className="font-bold text-[#2D4F38] hover:underline"
              >
                Back to Sign In
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
