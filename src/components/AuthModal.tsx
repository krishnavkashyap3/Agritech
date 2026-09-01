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
  LogIn
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

  // Email/Password Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('organisation');
  const [location, setLocation] = useState('');
  const [orgOrFarmName, setOrgOrFarmName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
    if (onSuccess) {
      setTimeout(() => {
        onSuccess();
      }, 100);
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
        await signInWithEmail(email, password);
        handleSuccess();
      } else if (mode === 'signup') {
        if (!name.trim()) throw new Error('Please enter your full name or company name');
        if (!location.trim()) throw new Error('Please specify your agro-mandi hub or city');
        await signUpWithEmail(email, password, name, role, location, orgOrFarmName, phone);
        handleSuccess();
      } else if (mode === 'forgot') {
        if (!email.trim()) throw new Error('Please enter your email address to receive password reset instructions');
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
      } else if (code === 'auth/operation-not-allowed' || rawMsg.includes('operation-not-allowed')) {
        msg = 'Email sign-in is initializing with local fallback.';
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

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#FAF9F6] rounded-3xl max-w-md w-full p-5 sm:p-7 border border-[#E8E5DF] shadow-2xl relative space-y-4 my-4 max-h-[92vh] overflow-y-auto">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#7A746B] hover:text-[#1C1C1C] hover:bg-[#EFEBE3] rounded-full transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge & Brand */}
        <div className="space-y-1.5 text-center flex flex-col items-center pt-1">
          <div className="w-12 h-12 rounded-2xl bg-[#233B2B] border border-[#3E5C47] flex items-center justify-center p-0.5 overflow-hidden shadow-xs mb-1">
            <img 
              src="/krishiquant-logo.jpg" 
              alt="KrishiQuant Logo" 
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-[#233B2B] text-amber-200 text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-[#3E5C47]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>KrishiQuant e-NAM Trust Vault</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1C1C]">
            {mode === 'signup' 
              ? 'Create KrishiQuant Account' 
              : mode === 'forgot' 
              ? 'Reset Your Password'
              : 'Sign In to KrishiQuant'}
          </h2>

          {customPrompt ? (
            <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-2.5 text-xs text-amber-900 text-left flex items-start gap-2 mt-1">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950">Sign In Required</p>
                <p className="text-[11px] text-amber-800 leading-snug">{customPrompt}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#6B655B]">
              Sign in with your email to access live mandi contracts, verify GSTIN, and execute escrow orders.
            </p>
          )}
        </div>

        {/* Mode Selector Tabs (Sign In vs Create Account) */}
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
            <span>Sign In with Email</span>
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
                  <span>Create New Account</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Email Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3 pt-1">
          {mode === 'signup' && (
            <>
              {/* Role Selection */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#4A453E] block">I am joining as a:</label>
                <div className="grid grid-cols-3 gap-1.5">
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
                    <span>Enterprise Buyer</span>
                  </button>

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
                <label className="text-[11px] font-semibold text-[#4A453E] block">Full Name / Organization</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[#8A847A] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rajeshwar Patil / ITC Agribusiness"
                    className="w-full bg-white border border-[#D5CCBD] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1C1C1C] focus:ring-1 focus:ring-[#2D4F38] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Mandi Hub / Location */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#4A453E] block">Mandi / City Hub</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-[#8A847A] absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Nashik APMC, Maharashtra / Indore Hub"
                    className="w-full bg-white border border-[#D5CCBD] rounded-xl pl-7 pr-2 py-2 text-xs text-[#1C1C1C] focus:ring-1 focus:ring-[#2D4F38] focus:outline-hidden"
                  />
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
                placeholder="name@company.com"
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
                <span>Processing...</span>
              </span>
            ) : mode === 'signin' ? (
              <span>Sign In with Email</span>
            ) : mode === 'signup' ? (
              <span>Register Account</span>
            ) : (
              <span>Send Password Reset Link</span>
            )}
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="pt-2 border-t border-[#EAE5D9] text-center text-xs text-[#5C554B]">
          {mode === 'signin' ? (
            <p>
              Don't have a KrishiQuant account?{' '}
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
