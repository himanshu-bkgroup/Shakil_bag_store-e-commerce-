import React, { useState } from 'react';
import { ShoppingBag, Heart, User as UserIcon, Search, Menu, X, MessageSquare, PhoneCall, ShieldCheck, Compass } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface NavbarProps {
  onNavigate: (page: string, param?: string) => void;
  currentPage: string;
  onOpenCartDrawer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage, onOpenCartDrawer }) => {
  const { user, cartTotalCount, wishlist, setOpenChat, setOpenAuth } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('shop', `search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-stone-950 text-stone-100 border-b border-stone-800 shadow-md">
      {/* 1. Announcement bar */}
      <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 text-amber-200 text-xs py-2 px-4 border-b border-amber-900/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center font-medium">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>OFFICIAL STORE OF MOHAMMAD SHAKIL • COMPLIMENTARY EXPRESS DELIVERY OVER ₹999</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-stone-300">
            <span className="hidden md:inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> 5-Year Global Warranty
            </span>
            <a
              href="https://wa.me/917217876220?text=Hi%20Shakil%20Bag%20Store%2C%20I%20am%20inquiring%20about%20your%20luxury%20luggage%20collection."
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-300 transition-colors flex items-center gap-1 font-semibold text-emerald-400"
            >
              <PhoneCall className="w-3 h-3" /> WhatsApp: +91-7217876220
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-stone-300 hover:text-white hover:bg-stone-800 focus:outline-none"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Luxury Brand Identity */}
          <div className="flex-shrink-0 flex flex-col items-center lg:items-start cursor-pointer" onClick={() => onNavigate('home')}>
            <span className="text-xl sm:text-2xl font-extrabold tracking-[0.22em] text-white font-serif uppercase">
              SHAKIL
            </span>
            <span className="text-[10px] tracking-[0.35em] text-amber-400 font-sans uppercase font-medium">
              BAG STORE • EST. 2026
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium tracking-wide">
            <button
              onClick={() => onNavigate('home')}
              className={`transition-colors hover:text-amber-300 uppercase text-xs tracking-wider ${
                currentPage === 'home' ? 'text-amber-400 font-semibold' : 'text-stone-300'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className={`transition-colors hover:text-amber-300 uppercase text-xs tracking-wider ${
                currentPage === 'shop' ? 'text-amber-400 font-semibold' : 'text-stone-300'
              }`}
            >
              All Collection
            </button>
            <button
              onClick={() => onNavigate('shop', 'category=cabin-trolley')}
              className="transition-colors hover:text-amber-300 text-stone-300 uppercase text-xs tracking-wider"
            >
              Trolleys
            </button>
            <button
              onClick={() => onNavigate('shop', 'category=backpacks')}
              className="transition-colors hover:text-amber-300 text-stone-300 uppercase text-xs tracking-wider"
            >
              Backpacks
            </button>
            <button
              onClick={() => onNavigate('shop', 'category=luggage-sets')}
              className="transition-colors hover:text-amber-300 text-stone-300 uppercase text-xs tracking-wider"
            >
              Luggage Sets
            </button>
            <button
              onClick={() => onNavigate('shop', 'category=trolley-wheels')}
              className="transition-colors hover:text-amber-300 text-stone-300 uppercase text-xs tracking-wider"
            >
              Wheels & Spares
            </button>
            <button
              onClick={() => onNavigate('track-order')}
              className={`transition-colors hover:text-amber-300 uppercase text-xs tracking-wider flex items-center gap-1.5 ${
                currentPage === 'track-order' ? 'text-amber-400 font-semibold' : 'text-stone-300'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" /> Track Order
            </button>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Search Button */}
            <button
              id="btn-search-toggle"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-stone-300 hover:text-amber-300 hover:bg-stone-800/50 rounded-full transition-colors"
              aria-label="Search store"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* AI Assistant Concierge Button */}
            <button
              id="btn-nav-ai-concierge"
              onClick={() => setOpenChat(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-950/60 border border-amber-800/80 text-amber-200 hover:bg-amber-900/60 transition-all shadow-sm"
              title="Ask Gemini AI Shopping Concierge"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Concierge</span>
            </button>

            {/* Wishlist */}
            <button
              id="btn-nav-wishlist"
              onClick={() => onNavigate('account', 'tab=wishlist')}
              className="p-2 text-stone-300 hover:text-amber-300 hover:bg-stone-800/50 rounded-full relative transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-amber-500 text-stone-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* User Account / Login */}
            {user ? (
              <button
                id="btn-nav-account"
                onClick={() => onNavigate('account')}
                className="p-2 text-stone-300 hover:text-amber-300 hover:bg-stone-800/50 rounded-full flex items-center gap-2 transition-colors"
                title={`Logged in as ${user.name}`}
              >
                <UserIcon className="w-5 h-5" />
                <span className="hidden md:inline text-xs font-medium text-stone-200 truncate max-w-[100px]">
                  {user.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                id="btn-nav-login"
                onClick={() => setOpenAuth(true)}
                className="p-2 text-stone-300 hover:text-amber-300 hover:bg-stone-800/50 rounded-full transition-colors"
                title="Customer Sign In"
              >
                <UserIcon className="w-5 h-5" />
              </button>
            )}

            {/* Shopping Cart */}
            <button
              id="btn-nav-cart"
              onClick={onOpenCartDrawer}
              className="p-2 text-amber-300 hover:text-white bg-amber-950/80 hover:bg-amber-900 border border-amber-700/50 rounded-full relative transition-colors shadow-sm"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              {cartTotalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-stone-950 text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-stone-950 shadow">
                  {cartTotalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Search Overlay */}
      {searchOpen && (
        <div className="bg-stone-900 border-b border-stone-800 px-4 py-3 transition-all">
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center gap-2">
            <Search className="w-5 h-5 text-stone-400" />
            <input
              type="text"
              id="input-nav-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cabin trolleys, leather backpacks, replacement wheels, TSA locks..."
              className="w-full bg-stone-950 text-stone-100 text-sm px-4 py-2 rounded-lg border border-stone-700 focus:outline-none focus:border-amber-400"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="p-2 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-stone-900 border-b border-stone-800 px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-2 text-sm font-medium">
            <button
              onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 rounded hover:bg-stone-800 text-stone-200"
            >
              Home
            </button>
            <button
              onClick={() => { onNavigate('shop'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 rounded hover:bg-stone-800 text-stone-200"
            >
              All Collection
            </button>
            <button
              onClick={() => { onNavigate('shop', 'category=cabin-trolley'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 rounded hover:bg-stone-800 text-stone-200"
            >
              Cabin Trolleys (55cm)
            </button>
            <button
              onClick={() => { onNavigate('shop', 'category=backpacks'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 rounded hover:bg-stone-800 text-stone-200"
            >
              Leather & Daily Backpacks
            </button>
            <button
              onClick={() => { onNavigate('shop', 'category=luggage-sets'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 rounded hover:bg-stone-800 text-stone-200"
            >
              3-Piece Luggage Sets
            </button>
            <button
              onClick={() => { onNavigate('shop', 'category=trolley-wheels'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 rounded hover:bg-stone-800 text-stone-200"
            >
              Replacement Wheels & Hardware
            </button>
            <button
              onClick={() => { onNavigate('track-order'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 rounded hover:bg-stone-800 text-amber-400 font-semibold flex items-center gap-2"
            >
              <Compass className="w-4 h-4" /> Track Existing Order
            </button>
          </div>

          <div className="pt-4 border-t border-stone-800 flex flex-col gap-2">
            <button
              onClick={() => { setOpenChat(true); setMobileMenuOpen(false); }}
              className="w-full py-2.5 px-4 bg-amber-950/80 text-amber-200 border border-amber-800 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold"
            >
              <MessageSquare className="w-4 h-4 text-amber-400" />
              Chat with Gemini AI Concierge
            </button>
            <a
              href="https://wa.me/917217876220"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-4 bg-emerald-950/80 text-emerald-300 border border-emerald-800 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              WhatsApp Mohammad Shakil (+91-7217876220)
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
