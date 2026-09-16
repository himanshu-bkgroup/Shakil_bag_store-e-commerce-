import React, { useState, useEffect } from 'react';
import { Search, Compass, CheckCircle2, Clock, Truck, Package, ShieldCheck, PhoneCall, AlertCircle } from 'lucide-react';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';

interface TrackOrderPageProps {
  initialOrderId?: string;
  onNavigate: (page: string, param?: string) => void;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ initialOrderId = '', onNavigate }) => {
  const { formatPrice } = useStore();
  const [orderId, setOrderId] = useState(initialOrderId);
  const [contact, setContact] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialOrderId) {
      handleTrack(initialOrderId);
    }
  }, [initialOrderId]);

  const handleTrack = async (idToSearch?: string) => {
    const targetId = idToSearch || orderId;
    if (!targetId.trim()) return;

    setError('');
    setLoading(true);

    try {
      let url = `/api/orders/track?orderId=${encodeURIComponent(targetId.trim())}`;
      if (contact.trim()) {
        url += `&contact=${encodeURIComponent(contact.trim())}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No consignment found matching this order reference.');
      }

      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || 'Tracking lookup failed.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'PROCESSING':
        return 2;
      case 'SHIPPED':
        return 3;
      case 'OUT_FOR_DELIVERY':
        return 4;
      case 'DELIVERED':
        return 5;
      default:
        return 1;
    }
  };

  const steps = [
    { label: 'Order Placed', desc: 'Received at Shakil Atelier' },
    { label: 'Confirmed', desc: 'Verified by Mohammad Shakil' },
    { label: 'Quality Tested', desc: 'Hinomoto & TSA inspection' },
    { label: 'Airways Dispatch', desc: 'Handed to Blue Dart' },
    { label: 'Out for Delivery', desc: 'Driver en route to your gate' },
    { label: 'Delivered', desc: 'Safely arrived' }
  ];

  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-bold tracking-[0.2em] text-amber-400 uppercase font-sans">
            Consignment Tracking Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
            Track Your Luggage Shipment
          </h1>
          <p className="text-xs text-stone-400 max-w-md mx-auto">
            Enter your Order Reference (e.g. SB-100291) to view real-time courier status and delivery ETA.
          </p>
        </div>

        {/* Tracking Lookup Box */}
        <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 shadow-xl mb-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTrack();
            }}
            className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
          >
            <div className="sm:col-span-6">
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Order ID / Reference
              </label>
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                placeholder="e.g. SB-100291"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white uppercase placeholder-stone-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Phone or Email (Optional)
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="e.g. 7217876220"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading || !orderId.trim()}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow"
              >
                {loading ? 'Locating...' : 'Track'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Live Order Visualizer */}
        {order && (
          <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  Verified Consignment
                </span>
                <h3 className="text-lg font-bold text-white font-serif">Order #{order.orderId}</h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Placed on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-stone-400 block">Courier & Waybill</span>
                <span className="text-sm font-mono font-bold text-white block">
                  {order.courier || 'Blue Dart Luxury Express'}
                </span>
                <span className="text-xs text-amber-400 font-mono">
                  AWB: {order.trackingNumber || 'PENDING'}
                </span>
              </div>
            </div>

            {/* Visual 6-Stage Timeline */}
            <div>
              <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider mb-6">
                Transit Milestones:
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {steps.map((stepItem, idx) => {
                  const currentIdx = getStepIndex(order.orderStatus);
                  const isDone = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-center transition-colors ${
                        isCurrent
                          ? 'border-amber-500 bg-amber-950/40 text-amber-300 shadow-md'
                          : isDone
                          ? 'border-emerald-800 bg-emerald-950/20 text-emerald-300'
                          : 'border-stone-800 bg-stone-950/50 text-stone-600'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full border border-current flex items-center justify-center mx-auto mb-2 font-bold text-xs">
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <div className="text-xs font-bold truncate">{stepItem.label}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">{stepItem.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Consignment Items */}
            <div className="pt-6 border-t border-stone-800 space-y-3">
              <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                Consigned Baggage:
              </h4>
              <div className="divide-y divide-stone-800 text-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded bg-stone-950" />
                      <div>
                        <div className="font-semibold text-white">{item.name}</div>
                        <div className="text-[10px] text-stone-400">Qty: {item.quantity} • {item.color}</div>
                      </div>
                    </div>
                    <span className="font-bold text-white">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery address & WhatsApp assistance */}
            <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
              <div>
                <span className="font-bold text-white block">Delivery Destination:</span>
                <span>
                  {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </span>
              </div>
              <a
                href={`https://wa.me/917217876220?text=Hi%20Mohammad%20Shakil%2C%20inquiry%20about%20Order%20%23${order.orderId}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-lg flex items-center gap-2 font-semibold flex-shrink-0"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Atelier Desk</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
