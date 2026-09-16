import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, MessageSquare, Bot, User, CheckCircle2, Phone, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface Message {
  role: 'user' | 'model';
  content: string;
  recommendedProducts?: any[];
  timestamp: string;
}

interface AIChatModalProps {
  onNavigate: (page: string, param?: string) => void;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({ onNavigate }) => {
  const { openChat, setOpenChat, formatPrice } = useStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content:
        'Greetings. I am the Gemini Luxury Concierge for Shakil Bag Store. How may I assist your travel endeavors today? I can guide you on airline cabin dimensions (55cm), polycarbonate impact resistance, TSA combination setup, or recommend the ideal luggage for your journey.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Lead qualification prompt state
  const [showLeadPrompt, setShowLeadPrompt] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadSaved, setLeadSaved] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  if (!openChat) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const newMsg: Message = {
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setLoading(true);

    try {
      // 1. Call Gemini Assistant API
      const history = messages.map((m) => ({ role: m.role, text: m.content }));
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history })
      });
      const data = await res.json();

      const botMsg: Message = {
        role: 'model',
        content: data.text || 'Allow me to verify our catalog for you.',
        recommendedProducts: data.recommendedProducts || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);

      // 2. Buyer intent check
      if (userText.toLowerCase().includes('order') || userText.toLowerCase().includes('buy') || userText.toLowerCase().includes('bulk') || userText.toLowerCase().includes('discount') || userText.toLowerCase().includes('price')) {
        setShowLeadPrompt(true);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: 'Our luggage concierge desk is available directly via WhatsApp (+91-7217876220) or you can browse our curated catalog.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadPhone) return;

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadName,
          phone: leadPhone,
          requirement: 'Inquired through Gemini AI Concierge: ' + (messages[messages.length - 1]?.content || ''),
          source: 'CHATBOT'
        })
      });
      setLeadSaved(true);
      setShowLeadPrompt(false);
    } catch (err) {
      setLeadSaved(true);
      setShowLeadPrompt(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-xl h-[650px] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-950 via-amber-950/40 to-stone-950 p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5 font-serif">
                SHAKIL LUXURY CONCIERGE
                <span className="text-[9px] bg-amber-500/20 text-amber-300 font-sans px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Gemini 3.8
                </span>
              </h3>
              <p className="text-[11px] text-stone-400">Direct knowledge of Shakil Bag Store inventory & standards</p>
            </div>
          </div>
          <button
            onClick={() => setOpenChat(false)}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 text-sm">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'model' && (
                <div className="w-7 h-7 rounded-full bg-amber-950 border border-amber-800/80 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-amber-400" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-amber-600 text-stone-950 font-medium rounded-tr-none'
                    : 'bg-stone-950/80 border border-stone-800 text-stone-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* Recommended Products cards inside bot bubble */}
                {m.recommendedProducts && m.recommendedProducts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-stone-800 space-y-2">
                    <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      Featured Catalog Matches:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {m.recommendedProducts.map((p: any, pIdx: number) => (
                        <div
                          key={pIdx}
                          onClick={() => {
                            setOpenChat(false);
                            onNavigate('product', p.slug);
                          }}
                          className="p-2 bg-stone-900 border border-stone-800 hover:border-amber-500/50 rounded-lg cursor-pointer transition-all flex items-center gap-2"
                        >
                          <img
                            src={p.thumbnail || p.images?.[0]}
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded bg-stone-950"
                          />
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-semibold text-white truncate">{p.name}</h5>
                            <span className="text-xs font-bold text-amber-400">
                              {formatPrice(p.salePrice || p.price)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`text-[9px] mt-1.5 text-right ${
                    m.role === 'user' ? 'text-stone-900' : 'text-stone-500'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-stone-300" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-stone-400 italic">
              <div className="w-7 h-7 rounded-full bg-amber-950 border border-amber-800/80 flex items-center justify-center">
                <Bot className="w-4 h-4 text-amber-400" />
              </div>
              <span>Consulting catalog specifications & stock...</span>
            </div>
          )}

          {/* Lead Prompt Box */}
          {showLeadPrompt && !leadSaved && (
            <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Request a Call or WhatsApp quote from Mohammad Shakil</span>
              </div>
              <form onSubmit={handleSaveLead} className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="bg-stone-950 text-xs text-white px-3 py-1.5 rounded border border-stone-800 focus:outline-none focus:border-amber-400"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone / WhatsApp"
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  className="bg-stone-950 text-xs text-white px-3 py-1.5 rounded border border-stone-800 focus:outline-none focus:border-amber-400"
                />
                <div className="sm:col-span-2 flex justify-end gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setShowLeadPrompt(false)}
                    className="px-2.5 py-1 text-xs text-stone-400 hover:text-stone-200"
                  >
                    Skip
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          )}

          {leadSaved && (
            <div className="p-2 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Thank you. Mohammad Shakil’s team will reach out with personalized luggage assistance.</span>
            </div>
          )}
        </div>

        {/* Quick Suggestions */}
        <div className="px-4 py-2 bg-stone-950/60 border-t border-stone-800/80 flex items-center gap-2 overflow-x-auto text-[11px] text-stone-400">
          <span className="whitespace-nowrap font-medium text-stone-500">Quick:</span>
          <button
            onClick={() => setInput('What are the standard cabin luggage dimensions for airlines?')}
            className="whitespace-nowrap px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-full border border-stone-800"
          >
            Cabin 55cm Rules
          </button>
          <button
            onClick={() => setInput('Show me lightweight 3-piece luggage sets with TSA locks')}
            className="whitespace-nowrap px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-full border border-stone-800"
          >
            3-Piece Sets
          </button>
          <button
            onClick={() => setInput('Do you have replacement trolley wheels and how to install them?')}
            className="whitespace-nowrap px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-full border border-stone-800"
          >
            Replacement Wheels
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-stone-950 border-t border-stone-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything regarding materials, sizes, warranties, or stock..."
            className="flex-1 bg-stone-900 text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-stone-800 focus:outline-none focus:border-amber-400 placeholder-stone-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-600 text-stone-950 rounded-xl font-bold transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
