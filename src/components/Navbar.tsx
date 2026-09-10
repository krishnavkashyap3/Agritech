import React, { useState } from 'react';
import { UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Sprout, 
  ShoppingBag, 
  Sparkles, 
  Building2, 
  Tractor, 
  Menu, 
  X, 
  Plus, 
  ChevronDown,
  CreditCard,
  Layers,
  LogIn,
  LogOut,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'marketplace' | 'live-market' | 'buying' | 'advisor' | 'dashboard';
  onSelectTab: (tab: 'marketplace' | 'live-market' | 'buying' | 'advisor' | 'dashboard') => void;
  currentUser: UserProfile;
  onOpenAuthModal: () => void;
  onOpenCreateListing: () => void;
  onOpenCreateRfq: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onOpenAuthModal,
  onOpenCreateListing,
  onOpenCreateRfq,
}) => {
  const { firebaseUser, isAuthenticated, logOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isUserLoggedIn = Boolean((firebaseUser || isAuthenticated) && currentUser.id && currentUser.name);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6] border-b border-[#E8E5DF] shadow-xs">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <button
              type="button"
              id="brand-logo-btn"
              onClick={() => onSelectTab('marketplace')}
              className="flex items-center space-x-3 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#233B2B] border border-[#3E5C47] flex items-center justify-center p-0.5 overflow-hidden shadow-xs group-hover:scale-105 transition-transform duration-200">
                <img 
                  src="/krishiquant-logo.jpg" 
                  alt="KrishiQuant Logo" 
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    // Fallback to sprout icon if image loading fails
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <span className="text-xl font-serif font-extrabold tracking-tight text-[#1C1C1C] group-hover:text-[#233B2B] transition flex items-center gap-1.5">
                  Krishi<span className="text-[#2D4F38]">Quant</span>
                  <span className="text-[10px] bg-[#E8E1D5] text-[#233B2B] font-bold px-1.5 py-0.2 rounded font-sans uppercase tracking-wider border border-[#D5CCBD]">
                    e-NAM
                  </span>
                </span>
                <span className="text-[10px] text-[#7A746B] font-medium block leading-none tracking-wide">
                  Smart Digital Mandi & Farmgate Exchange
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1.5">
              <button
                type="button"
                id="nav-tab-marketplace"
                onClick={() => onSelectTab('marketplace')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'marketplace'
                    ? 'bg-[#233B2B] text-[#FAF9F6] shadow-xs font-bold'
                    : 'text-[#4A453E] hover:text-[#1C1C1C] hover:bg-[#EFEBE3]'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Marketplace</span>
              </button>

              <button
                type="button"
                id="nav-tab-live-market"
                onClick={() => onSelectTab('live-market')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 relative ${
                  activeTab === 'live-market'
                    ? 'bg-[#233B2B] text-[#FAF9F6] shadow-xs font-bold'
                    : 'text-[#4A453E] hover:text-[#1C1C1C] hover:bg-[#EFEBE3]'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Market</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </button>

              <button
                type="button"
                id="nav-tab-buying"
                onClick={() => onSelectTab('buying')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'buying'
                    ? 'bg-[#233B2B] text-[#FAF9F6] shadow-xs font-bold'
                    : 'text-[#4A453E] hover:text-[#1C1C1C] hover:bg-[#EFEBE3]'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-300" />
                <span>Buying & Payment</span>
              </button>

              <button
                type="button"
                id="nav-tab-advisor"
                onClick={() => onSelectTab('advisor')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'advisor'
                    ? 'bg-[#233B2B] text-[#FAF9F6] shadow-xs font-bold'
                    : 'text-[#4A453E] hover:text-[#1C1C1C] hover:bg-[#EFEBE3]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>AI Planting Advisor</span>
              </button>

              <button
                type="button"
                id="nav-tab-dashboard"
                onClick={() => onSelectTab('dashboard')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-[#233B2B] text-[#FAF9F6] shadow-xs font-bold'
                    : 'text-[#4A453E] hover:text-[#1C1C1C] hover:bg-[#EFEBE3]'
                }`}
              >
                {currentUser.role === 'farmer' ? (
                  <Tractor className="w-3.5 h-3.5" />
                ) : (
                  <Building2 className="w-3.5 h-3.5" />
                )}
                <span>My Dashboard</span>
              </button>
            </nav>
          </div>

          {/* Right Action Items: Role Switcher / Profile & CTA */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Quick Action button */}
            {currentUser.role === 'farmer' ? (
              <button
                type="button"
                id="navbar-create-lot-btn"
                onClick={onOpenCreateListing}
                className="py-2 px-3.5 bg-[#2D4F38] hover:bg-[#1F3927] text-[#FAF9F6] font-semibold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs border border-[#3E654B]"
              >
                <Plus className="w-3.5 h-3.5 text-amber-200" />
                <span>List Harvest Lot</span>
              </button>
            ) : (
              <button
                type="button"
                id="navbar-create-rfq-btn"
                onClick={onOpenCreateRfq}
                className="py-2 px-3.5 bg-[#2D4F38] hover:bg-[#1F3927] text-[#FAF9F6] font-semibold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs border border-[#3E654B]"
              >
                <Plus className="w-3.5 h-3.5 text-amber-200" />
                <span>Post Buy Demand (RFQ)</span>
              </button>
            )}

            {/* Profile / Auth Menu */}
            <div className="relative">
              {isUserLoggedIn ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="open-auth-modal-btn"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 pr-3 rounded-xl border border-[#C6DFC9] bg-[#EBF3ED] hover:bg-white transition text-xs group"
                  >
                    <img
                      src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-lg object-cover border border-[#C6DFC9]"
                    />
                    <div className="text-left leading-tight">
                      <div className="font-bold text-[#1C1C1C] truncate max-w-[110px] flex items-center gap-1">
                        <span>{currentUser.name.split(' ')[0]}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      </div>
                      <div className="text-[10px] font-semibold text-[#2D4F38] uppercase tracking-wider">
                        {currentUser.role === 'farmer' ? 'Kisan (Can List)' : currentUser.role === 'fpo' ? 'FPO Aggregator' : currentUser.role === 'organisation' ? 'Enterprise' : 'Direct Buyer'}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#8A847A]" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-[#E8E5DF] p-2 space-y-1 z-50 animate-fadeIn">
                      <div className="px-3 py-2 border-b border-[#F0ECE1] text-[11px] text-[#7A746B]">
                        <p className="font-bold text-[#1C1C1C] truncate">{currentUser.name}</p>
                        <p className="truncate text-[10px]">{currentUser.email}</p>
                        <div className="mt-1 flex items-center gap-1">
                          <span className={`px-1.5 py-0.5 font-mono text-[9px] rounded font-bold ${
                            currentUser.role === 'farmer' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : currentUser.role === 'fpo'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            Role: {currentUser.role === 'farmer' ? 'Farmer (Can List Crops)' : currentUser.role === 'fpo' ? 'FPO (No Crop Listing)' : 'Buyer (No Crop Listing)'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectTab('dashboard');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-[#4A453E] hover:bg-[#F4F1EA] transition"
                      >
                        Trade Dashboard & Orders
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onOpenAuthModal();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-[#4A453E] hover:bg-[#F4F1EA] transition"
                      >
                        Login with Different Account
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          logOut();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center justify-between transition"
                      >
                        <span>Sign Out</span>
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  id="open-auth-modal-btn"
                  onClick={onOpenAuthModal}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-[#233B2B] hover:bg-[#1B2F22] text-amber-200 text-xs font-semibold transition border border-[#3E5C47] shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In with Email</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              type="button"
              id="mobile-auth-trigger"
              onClick={onOpenAuthModal}
              className="p-1.5 px-2.5 rounded-lg border border-[#E0DBD1] text-xs font-bold text-[#1C1C1C] bg-[#F4F1EA] flex items-center gap-1"
            >
              {isUserLoggedIn ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{currentUser.name.split(' ')[0]}</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#4A453E] hover:text-[#1C1C1C] rounded-lg hover:bg-[#EFEBE3]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8E5DF] bg-[#FAF9F6] p-4 space-y-2">
          <button
            type="button"
            onClick={() => { onSelectTab('marketplace'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold ${
              activeTab === 'marketplace' ? 'bg-[#233B2B] text-[#FAF9F6]' : 'text-[#4A453E]'
            }`}
          >
            Marketplace
          </button>
          <button
            type="button"
            onClick={() => { onSelectTab('live-market'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between ${
              activeTab === 'live-market' ? 'bg-[#233B2B] text-[#FAF9F6]' : 'text-[#4A453E]'
            }`}
          >
            <span>Live Market (Mandi & AI)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </button>
          <button
            type="button"
            onClick={() => { onSelectTab('buying'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold ${
              activeTab === 'buying' ? 'bg-[#233B2B] text-[#FAF9F6]' : 'text-[#4A453E]'
            }`}
          >
            Buying & Payment Gateway
          </button>
          <button
            type="button"
            onClick={() => { onSelectTab('advisor'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold ${
              activeTab === 'advisor' ? 'bg-[#233B2B] text-[#FAF9F6]' : 'text-[#4A453E]'
            }`}
          >
            AI Planting Advisor
          </button>
          <button
            type="button"
            onClick={() => { onSelectTab('dashboard'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold ${
              activeTab === 'dashboard' ? 'bg-[#233B2B] text-[#FAF9F6]' : 'text-[#4A453E]'
            }`}
          >
            My Dashboard ({currentUser.role})
          </button>

          <div className="pt-2 border-t border-[#E8E5DF] flex flex-col gap-2">
            {firebaseUser ? (
              <button
                type="button"
                onClick={() => { logOut(); setMobileMenuOpen(false); }}
                className="w-full py-2 bg-rose-100 text-rose-800 rounded-lg text-xs font-bold"
              >
                Sign Out ({currentUser.email})
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { onOpenAuthModal(); setMobileMenuOpen(false); }}
                className="w-full py-2 bg-[#233B2B] text-amber-200 rounded-lg text-xs font-bold"
              >
                Sign In / Sign Up
              </button>
            )}

            {currentUser.role === 'farmer' ? (
              <button
                type="button"
                onClick={() => { onOpenCreateListing(); setMobileMenuOpen(false); }}
                className="w-full py-2 bg-[#2D4F38] text-white rounded-lg text-xs font-semibold"
              >
                + List Harvest Lot
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { onOpenCreateRfq(); setMobileMenuOpen(false); }}
                className="w-full py-2 bg-[#2D4F38] text-white rounded-lg text-xs font-semibold"
              >
                + Post Buy RFQ
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};


