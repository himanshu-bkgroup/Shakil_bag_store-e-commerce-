import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const AuthModal: React.FC = () => {
  const { openAuth, setOpenAuth, login } = useStore();
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!openAuth) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegister
        ? { name, email, phone, password, whatsappOptIn }
        : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      login(data.token, data.user);
      setOpenAuth(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => {
    setIsRegister(false);
    setEmail('himanshu.bkgroup@gmail.com');
    setPassword('ShakilAdmin@2026!');
  };

  const fillDemoUser = () => {
    setIsRegister(false);
    setEmail('traveler@shakilbags.com');
    setPassword('Traveler2026!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-stone-100">
        <button
          onClick={() => setOpenAuth(false)}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full bg-stone-950/50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-3 font-serif font-bold text-xl">
            SB
          </div>
          <h3 className="text-xl font-bold text-white font-serif">
            {isRegister ? 'Create Shakil Atelier Account' : 'Welcome to Shakil Bag Store'}
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            {isRegister
              ? 'Join our private clientele to track consignments & warranty.'
              : 'Sign in to access your luggage reservations and live tracking.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mohammad Shakil"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-stone-300 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@shakilbags.com"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">WhatsApp Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 72178 76220"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-stone-300 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {isRegister && (
            <label className="flex items-start gap-2 pt-1 text-xs text-stone-300 cursor-pointer">
              <input
                type="checkbox"
                checked={whatsappOptIn}
                onChange={(e) => setWhatsappOptIn(e.target.checked)}
                className="accent-emerald-500 rounded mt-0.5"
              />
              <span className="text-[11px] leading-snug">
                Receive consignment dispatch, airways tracking, and care updates via WhatsApp (+91-7217876220).
              </span>
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg mt-2"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Credentials Autofill */}
        <div className="mt-4 pt-4 border-t border-stone-800 text-center space-y-2">
          <span className="text-[10px] text-stone-500 block uppercase tracking-wider">Quick Fill Test Logins</span>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={fillAdmin}
              className="px-2.5 py-1 bg-stone-950 hover:bg-stone-800 border border-amber-900/60 text-amber-300 text-[10px] rounded-lg font-semibold"
            >
              Admin (Mohammad Shakil)
            </button>
            <button
              onClick={fillDemoUser}
              className="px-2.5 py-1 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 text-[10px] rounded-lg font-semibold"
            >
              Client Demo
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
          >
            {isRegister
              ? 'Already registered? Sign in to your account'
              : "Don't have an account? Create one now"}
          </button>
        </div>
      </div>
    </div>
  );
};
