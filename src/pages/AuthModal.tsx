import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, CheckSquare, Square, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const AuthModal: React.FC = () => {
  const { openAuth, setOpenAuth, login } = useStore();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!openAuth) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister
      ? { name, email, password, phone, whatsappOptIn }
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let data: any = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        try {
          data = JSON.parse(text);
        } catch {
          if (!res.ok) {
            throw new Error(`Server returned HTTP ${res.status}. Please check Netlify serverless functions or API configuration.`);
          }
        }
      }

      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please verify your credentials.');
        setLoading(false);
        return;
      }

      login(data.token, data.user);
      setOpenAuth(false);
    } catch (err: any) {
      setError(err.message || 'Network error occurred. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminDemoFill = () => {
    setIsRegister(false);
    setEmail('himanshu.bkgroup@gmail.com');
    setPassword('ShakilAdmin@2026!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-stone-200">
        <button
          onClick={() => setOpenAuth(false)}
          className="absolute top-4 right-4 text-stone-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <span className="text-xs font-bold tracking-[0.25em] text-amber-400 font-sans uppercase">
            SHAKIL BAG STORE
          </span>
          <h2 className="text-xl font-bold text-white font-serif mt-1">
            {isRegister ? 'Create Your Account' : 'Customer Sign In'}
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            {isRegister
              ? 'Join Shakil VIP luggage privileges, tracked orders, & 5-year warranty management.'
              : 'Sign in to access your orders, saved addresses, and express checkout.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800/80 rounded-lg text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-400"
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
                placeholder="you@example.com"
                className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                WhatsApp Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-400"
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
                className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* WhatsApp Consent checkbox */}
          {isRegister && (
            <div
              onClick={() => setWhatsappOptIn(!whatsappOptIn)}
              className="flex items-start gap-2 pt-1 cursor-pointer select-none text-xs text-stone-400"
            >
              {whatsappOptIn ? (
                <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-stone-600 flex-shrink-0 mt-0.5" />
              )}
              <span>
                Receive order dispatch alerts, shipment tracking links, and travel care advice on WhatsApp (Recommended)
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-600 text-stone-950 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors mt-2"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="hover:text-amber-400 transition-colors"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
          <button
            onClick={handleAdminDemoFill}
            className="text-[11px] text-stone-500 hover:text-amber-300 underline"
            title="Auto-fill Mohammad Shakil Admin credentials"
          >
            Demo Admin Credentials
          </button>
        </div>
      </div>
    </div>
  );
};
