import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  MapPin, 
  Phone, 
  Building2, 
  Sprout, 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin'
}) => {
  const { 
    signInWithEmail, 
    signUpWithEmail, 
    resetPassword 
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailAlreadyExists, setEmailAlreadyExists] = useState(false);

  // Email/Password Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('farmer');
  const [location, setLocation] = useState('');
  const [orgOrFarmName, setOrgOrFarmName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  // Email / Password Submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setEmailAlreadyExists(false);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        onClose();
      } else if (mode === 'signup') {
        if (!name.trim()) throw new Error('Please enter your full name or legal company name');
        if (!location.trim()) throw new Error('Please specify your agro-mandi hub or delivery city');
        await signUpWithEmail(email, password, name, role, location, orgOrFarmName, phone);
        onClose();
      } else if (mode === 'forgot') {
        if (!email.trim()) throw new Error('Please enter your email address to receive password reset instructions');
        await resetPassword(email);
        setSuccessMessage('Password reset link sent! Check your inbox to reset your password.');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const rawMsg = err.message || '';
      let msg = 'Authentication failed. Please check your credentials and try again.';
      
      if (rawMsg.includes('auth/email-already-in-use')) {
        setEmailAlreadyExists(true);
        msg = `An account with ${email || 'this email'} already exists. Click below to sign in directly.`;
      } else if (rawMsg.includes('auth/invalid-credential') || rawMsg.includes('auth/wrong-password') || rawMsg.includes('auth/user-not-found')) {
        msg = 'Invalid email or password. Please verify your credentials or sign up if new.';
      } else if (rawMsg.includes('auth/weak-password')) {
        msg = 'Password is too weak. Please use at least 6 characters with a combination of letters and numbers.';
      } else if (rawMsg.includes('auth/too-many-requests')) {
        msg = 'Too many failed login attempts. Please reset your password or try again in a few minutes.';
      } else if (rawMsg.includes('auth/invalid-email')) {
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
    setMode('signin');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#FAF9F6] rounded-3xl max-w-md w-full p-5 sm:p-7 border border-[#E8E5DF] shadow-2xl relative space-y-5 my-4">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#7A746B] hover:text-[#1C1C1C] hover:bg-[#EFEBE3] rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge & Brand */}
        <div className="space-y-1.5 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-[#233B2B] border border-[#3E5C47] flex items-center justify-center p-0.5 overflow-hidden shadow-xs mb-1">
            <img 
              src="/agritech-bharat-logo.jpg" 
              alt="Agritech Bharat Logo" 
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-[#233B2B] text-amber-200 text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-[#3E5C47]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Firebase Connected • agritech-4d623</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1C1C]">
            {mode === 'signin' 
              ? 'Sign In to Agritech Bharat' 
              : mode === 'signup' 
              ? 'Create Agritech Bharat Account' 
              : 'Reset Your Password'}
          </h2>
          <p className="text-xs text-[#6B655B]">
            {mode === 'signin' 
              ? 'Access live mandi contracts, your farm listings, and secure escrow orders.'
              : mode === 'signup' 
              ? 'Join Bharat’s transparent direct-trade network for farmers, millers, and buyers.'
              : 'Enter your registered email address to receive password reset instructions.'}
          </p>
        </div>

        {/* Success notification */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <p>{successMessage}</p>
              {mode === 'forgot' && (
                <button
                  type="button"
                  onClick={handleSwitchToSignIn}
                  className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950 block"
                >
                  Proceed to Sign In
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="flex-1">{errorMessage}</span>
            </div>
            
            {emailAlreadyExists && (
              <button
                type="button"
                onClick={handleSwitchToSignIn}
                className="w-full mt-1.5 py-1.5 px-3 bg-[#233B2B] hover:bg-[#1A2E21] text-amber-200 rounded-lg font-bold flex items-center justify-center gap-1.5 transition text-xs"
              >
                <span>Switch to Sign In</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3.5">
          
          {mode === 'signup' && (
            <>
              {/* Role Selection */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#4A453E] block">I am joining as a:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRole('farmer')}
                    className={`p-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 transition ${
                      role === 'farmer' 
                        ? 'bg-[#233B2B] text-amber-200 border-[#233B2B] shadow-xs' 
                        : 'bg-white text-[#4A453E] border-[#E8E5DF] hover:bg-[#F4F1EA]'
                    }`}
                  >
                    <Sprout className="w-3.5 h-3.5" />
                    <span>Farmer / FPO</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('organisation')}
                    className={`p-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 transition ${
                      role === 'organisation' 
                        ? 'bg-[#233B2B] text-amber-200 border-[#233B2B] shadow-xs' 
                        : 'bg-white text-[#4A453E] border-[#E8E5DF] hover:bg-[#F4F1EA]'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Bulk / Mill Corp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('individual')}
                    className={`p-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 transition ${
                      role === 'individual' 
                        ? 'bg-[#233B2B] text-amber-200 border-[#233B2B] shadow-xs' 
                        : 'bg-white text-[#4A453E] border-[#E8E5DF] hover:bg-[#F4F1EA]'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Direct Buyer</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#4A453E] block">Full Legal Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[#8A847A] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rameshwar Patil / ITC Procurement"
                    className="w-full bg-white border border-[#D5CCBD] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1C1C1C] focus:ring-1 focus:ring-[#2D4F38] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Farm / Org Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#4A453E] block">
                  {role === 'farmer' ? 'Farm / FPO Name' : 'Company / Processing Plant Name'}
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-[#8A847A] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={orgOrFarmName}
                    onChange={(e) => setOrgOrFarmName(e.target.value)}
                    placeholder={role === 'farmer' ? 'e.g. Patil Bio-Organics FPO' : 'e.g. Adani Wilmar Solvent Division'}
                    className="w-full bg-white border border-[#D5CCBD] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1C1C1C] focus:ring-1 focus:ring-[#2D4F38] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Mandi Hub / Location & Phone */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#4A453E] block">Mandi / City Hub</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-[#8A847A] absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Indore, MP"
                      className="w-full bg-white border border-[#D5CCBD] rounded-xl pl-7 pr-2 py-2 text-xs text-[#1C1C1C] focus:ring-1 focus:ring-[#2D4F38] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#4A453E] block">Phone / WhatsApp</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-[#8A847A] absolute left-2.5 top-2.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98200 12345"
                      className="w-full bg-white border border-[#D5CCBD] rounded-xl pl-7 pr-2 py-2 text-xs text-[#1C1C1C] focus:ring-1 focus:ring-[#2D4F38] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#4A453E] block">Email Address</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-[#8A847A] absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-white border border-[#D5CCBD] rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-[#1C1C1C] focus:ring-1 focus:ring-[#2D4F38] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Password (for signin & signup) */}
          {mode !== 'forgot' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-[#4A453E] block">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setSuccessMessage(null);
                      setMode('forgot');
                    }}
                    className="text-[10px] font-semibold text-[#2D4F38] hover:underline"
                  >
                    Forgot password?
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
                  placeholder="•••••••• (Min 6 characters)"
                  className="w-full bg-white border border-[#D5CCBD] rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-[#1C1C1C] focus:ring-1 focus:ring-[#2D4F38] focus:outline-hidden"
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
                <span>Processing...</span>
              </span>
            ) : mode === 'signin' ? (
              <span>Sign In to Account</span>
            ) : mode === 'signup' ? (
              <span>Register & Save Profile</span>
            ) : (
              <span>Send Password Reset Link</span>
            )}
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="pt-2.5 border-t border-[#EAE5D9] text-center text-xs text-[#5C554B]">
          {mode === 'signin' ? (
            <p>
              Don't have an Agritech Bharat account?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setMode('signup');
                }}
                className="font-bold text-[#2D4F38] hover:underline"
              >
                Sign Up Now
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
                Sign In
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

