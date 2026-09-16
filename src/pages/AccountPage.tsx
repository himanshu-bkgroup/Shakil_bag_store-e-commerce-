import React, { useState, useEffect } from 'react';
import {
  Package,
  Heart,
  User as UserIcon,
  LogOut,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ShoppingBag,
  Trash2,
  Share2,
  ExternalLink,
  ArrowRight,
  Cloud,
  Sparkles
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order, Product } from '../types';

interface AccountPageProps {
  initialTab?: string;
  onNavigate: (page: string, param?: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ initialTab = 'orders', onNavigate }) => {
  const {
    user,
    token,
    logout,
    wishlist,
    toggleWishlist,
    clearWishlist,
    addAllWishlistToCart,
    addToCart,
    formatPrice,
    setOpenAuth
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'settings'>(
    (initialTab as any) || (user ? 'orders' : 'wishlist')
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [addedAllSuccess, setAddedAllSuccess] = useState(false);
  const [movedProductId, setMovedProductId] = useState<string | null>(null);

  // Settings update state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [whatsappOptIn, setWhatsappOptIn] = useState(user?.whatsappOptIn ?? true);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Sync activeTab when initialTab prop changes
  useEffect(() => {
    if (initialTab && ['orders', 'wishlist', 'settings'].includes(initialTab)) {
      setActiveTab(initialTab as any);
    }
  }, [initialTab]);

  // Load orders for authenticated users
  useEffect(() => {
    if (!user || !token) return;

    setLoadingOrders(true);
    fetch('/api/orders', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoadingOrders(false));
  }, [user, token]);

  // Load wishlist product objects whenever wishlist ID array changes
  useEffect(() => {
    if (wishlist.length > 0) {
      fetch('/api/products')
        .then((r) => r.json())
        .then((data) => {
          if (data.products) {
            setWishlistProducts(data.products.filter((p: Product) => wishlist.includes(p._id)));
          }
        })
        .catch(() => {});
    } else {
      setWishlistProducts([]);
    }
  }, [wishlist]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone, whatsappOptIn })
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAllToCart = () => {
    addAllWishlistToCart(wishlistProducts);
    setAddedAllSuccess(true);
    setTimeout(() => setAddedAllSuccess(false), 3000);
  };

  const handleMoveToCart = (product: Product) => {
    addToCart(product, 1);
    setMovedProductId(product._id);
    setTimeout(() => setMovedProductId(null), 2000);
  };

  const handleShareWishlistWhatsApp = () => {
    if (wishlistProducts.length === 0) return;
    const origin = window.location.origin;
    const itemsText = wishlistProducts
      .map((p, idx) => `${idx + 1}. *${p.name}* - ${formatPrice(p.salePrice || p.price)}\n${origin}/product/${p.slug}`)
      .join('\n\n');

    const msg = encodeURIComponent(
      `*My Shakil Luggage Wishlist*\nHere are the luxury bags I'm eyeing from Mohammad Shakil:\n\n${itemsText}\n\nCheck out Shakil Bag Store: ${origin}`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Profile Summary / Guest Status */}
        {user ? (
          <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-400 text-2xl font-serif font-bold">
                {user.name.charAt(0)}
              </div>
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  Shakil VIP Client
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-white font-serif">{user.name}</h1>
                <p className="text-xs text-stone-400">{user.email} • +{user.phone || 'No phone set'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user.role === 'admin' && (
                <button
                  id="btn-account-admin"
                  onClick={() => onNavigate('admin')}
                  className="px-4 py-2 bg-amber-500 text-stone-950 text-xs font-bold uppercase tracking-wider rounded-xl shadow"
                >
                  Store Admin
                </button>
              )}
              <button
                id="btn-account-logout"
                onClick={logout}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-stone-900 via-stone-900/90 to-amber-950/40 border border-stone-800 rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-400">
                <UserIcon className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  Guest Session
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-white font-serif">Customer Account Portal</h1>
                <p className="text-xs text-stone-400 mt-0.5">
                  Sign in to permanently store and synchronize your wishlist, orders, and addresses.
                </p>
              </div>
            </div>

            <button
              id="btn-account-guest-signin"
              onClick={() => setOpenAuth(true)}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider rounded-xl shadow transition-all"
            >
              Sign In / Register
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-800 mb-8 space-x-6 text-xs font-semibold overflow-x-auto">
          <button
            id="tab-btn-orders"
            onClick={() => setActiveTab('orders')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Consignments ({orders.length})</span>
          </button>

          <button
            id="tab-btn-wishlist"
            onClick={() => setActiveTab('wishlist')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'wishlist'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>My Wishlist ({wishlist.length})</span>
          </button>

          <button
            id="tab-btn-settings"
            onClick={() => setActiveTab('settings')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profile & Preferences</span>
          </button>
        </div>

        {/* TAB 1: ORDERS */}
        {activeTab === 'orders' && (
          <div>
            {!user ? (
              <div className="text-center py-16 bg-stone-900/40 border border-stone-800 rounded-2xl p-8 space-y-4">
                <Package className="w-12 h-12 text-stone-600 mx-auto" />
                <h4 className="text-base font-bold text-white font-serif">Sign in to View Order Consignments</h4>
                <p className="text-xs text-stone-400 max-w-md mx-auto leading-relaxed">
                  Log in with your Shakil account to track live airway dispatches, download GST invoices, and review order histories.
                </p>
                <button
                  onClick={() => setOpenAuth(true)}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                >
                  Sign In Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {loadingOrders ? (
                  <div className="text-center py-12 text-stone-500 text-xs">Loading consignments...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16 bg-stone-900/40 border border-stone-800 rounded-2xl p-8 space-y-3">
                    <Package className="w-10 h-10 text-stone-600 mx-auto" />
                    <h4 className="text-sm font-bold text-white">No Consignments Placed Yet</h4>
                    <p className="text-xs text-stone-400 max-w-sm mx-auto">
                      Browse our travel collection to reserve your first handcrafted piece.
                    </p>
                    <button
                      onClick={() => onNavigate('shop')}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow"
                    >
                      Explore Collection
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.orderId}
                        className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800/80 pb-4">
                          <div>
                            <span className="text-[10px] text-stone-500 uppercase tracking-wider block">Order ID</span>
                            <span className="font-mono font-bold text-amber-400 text-sm">{order.orderId}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                order.status === 'DELIVERED'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : order.status === 'SHIPPED'
                                  ? 'bg-sky-950 text-sky-400 border border-sky-800'
                                  : 'bg-amber-950 text-amber-400 border border-amber-800'
                              }`}
                            >
                              {order.status}
                            </span>
                            <button
                              onClick={() => onNavigate('track-order', `orderId=${order.orderId}`)}
                              className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded-lg flex items-center gap-1"
                            >
                              <span>Track</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Items preview */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 bg-stone-950/40 p-2.5 rounded-xl border border-stone-800/60">
                              <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-stone-900" />
                              <div className="overflow-hidden">
                                <h5 className="text-xs font-semibold text-white truncate">{item.name}</h5>
                                <span className="text-[11px] text-stone-400">Qty: {item.quantity} • {formatPrice(item.price)}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center text-xs pt-2 border-t border-stone-800/60">
                          <span className="text-stone-400">Tracking: <strong className="text-white font-mono">{order.trackingNumber}</strong> ({order.courier})</span>
                          <span className="text-amber-400 font-bold text-sm">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DEDICATED MY WISHLIST TAB */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            {/* Wishlist Status & Storage Banner */}
            <div className="bg-stone-900/70 border border-stone-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  user ? 'bg-emerald-950 border border-emerald-800 text-emerald-400' : 'bg-amber-950 border border-amber-800 text-amber-400'
                }`}>
                  {user ? <Cloud className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      {user ? 'Cloud-Synced to Shakil Account' : 'Guest Local Wishlist'}
                    </h3>
                    {user && (
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Saved in Account</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {user
                      ? `Permanently associated with ${user.email}. Synchronized across all your desktop & mobile sessions.`
                      : `${wishlist.length} item(s) saved in this browser. Sign in or register to preserve these favorites permanently in your user account.`}
                  </p>
                </div>
              </div>

              {!user && (
                <button
                  id="btn-wishlist-sync-signin"
                  onClick={() => setOpenAuth(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap shadow"
                >
                  Sign In to Sync
                </button>
              )}
            </div>

            {/* Quick Action Bar if items exist */}
            {wishlistProducts.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-950/60 border border-stone-800/80 rounded-2xl p-4">
                <div className="text-xs text-stone-300">
                  <span>Showing <strong>{wishlistProducts.length}</strong> luxury luggage {wishlistProducts.length > 1 ? 'pieces' : 'piece'} in your collection</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    id="btn-wishlist-add-all"
                    onClick={handleAddAllToCart}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow flex items-center gap-2"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{addedAllSuccess ? 'All Added to Cart ✓' : 'Add All to Cart'}</span>
                  </button>

                  <button
                    id="btn-wishlist-share-wa"
                    onClick={handleShareWishlistWhatsApp}
                    className="px-3.5 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-300 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                    title="Share your wishlist on WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Share on WhatsApp</span>
                  </button>

                  <button
                    id="btn-wishlist-clear"
                    onClick={clearWishlist}
                    className="px-3 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-rose-400 text-xs rounded-xl transition-colors flex items-center gap-1.5"
                    title="Clear entire wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {wishlistProducts.length === 0 ? (
              <div className="text-center py-16 bg-stone-900/40 border border-stone-800 rounded-3xl p-8 sm:p-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto text-rose-500/60">
                  <Heart className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-white font-serif">Your Wishlist is Empty</h4>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto mt-1 leading-relaxed">
                    Click the Heart icon on any cabin trolley, executive backpack, or luxury luggage set to save it for your next trip.
                  </p>
                </div>
                <button
                  id="btn-wishlist-explore"
                  onClick={() => onNavigate('shop')}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              /* Wishlist Products Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistProducts.map((prod) => {
                  const inStock = prod.stockQuantity > 0;
                  const isMoved = movedProductId === prod._id;

                  return (
                    <div
                      key={prod._id}
                      className="bg-stone-900/70 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-4 transition-all duration-200 group relative"
                    >
                      {/* Top Thumbnail & Badges */}
                      <div
                        onClick={() => onNavigate('product', prod.slug)}
                        className="relative aspect-square w-full bg-stone-950 rounded-xl overflow-hidden cursor-pointer"
                      >
                        <img
                          src={prod.thumbnail || prod.images[0]}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Discount Badge */}
                        {prod.salePrice && prod.discountPercentage ? (
                          <div className="absolute top-2.5 left-2.5 bg-amber-500 text-stone-950 text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
                            {prod.discountPercentage}% OFF
                          </div>
                        ) : null}

                        {/* In-Stock Indicator */}
                        <div className="absolute bottom-2.5 left-2.5">
                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded backdrop-blur-md ${
                              inStock
                                ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-800/80'
                                : 'bg-rose-950/90 text-rose-300 border border-rose-800/80'
                            }`}
                          >
                            {inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>

                        {/* Remove from Wishlist icon */}
                        <button
                          id={`btn-wishlist-remove-${prod._id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(prod._id);
                          }}
                          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-stone-900/80 hover:bg-rose-900/80 text-rose-400 hover:text-white backdrop-blur-md transition-colors shadow"
                          title="Remove from wishlist"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-amber-400/90 uppercase font-semibold tracking-wider block">
                          {prod.category}
                        </span>
                        <h4
                          onClick={() => onNavigate('product', prod.slug)}
                          className="text-xs font-bold text-white line-clamp-1 hover:text-amber-400 cursor-pointer transition-colors"
                        >
                          {prod.name}
                        </h4>

                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="text-sm font-bold text-amber-400">
                            {formatPrice(prod.salePrice || prod.price)}
                          </span>
                          {prod.salePrice && prod.salePrice < prod.price && (
                            <span className="text-xs text-stone-500 line-through">
                              {formatPrice(prod.price)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-2 border-t border-stone-800/70">
                        <button
                          id={`btn-wishlist-move-${prod._id}`}
                          onClick={() => handleMoveToCart(prod)}
                          disabled={!inStock}
                          className={`flex-1 py-2.5 px-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow ${
                            isMoved
                              ? 'bg-emerald-500 text-stone-950'
                              : 'bg-amber-500 hover:bg-amber-400 text-stone-950 disabled:bg-stone-800 disabled:text-stone-600'
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{isMoved ? 'Added ✓' : 'Move to Cart'}</span>
                        </button>

                        <button
                          id={`btn-wishlist-view-${prod._id}`}
                          onClick={() => onNavigate('product', prod.slug)}
                          className="p-2.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white rounded-xl transition-colors"
                          title="View Product Page"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SETTINGS & WHATSAPP CONSENT */}
        {activeTab === 'settings' && (
          <div>
            {!user ? (
              <div className="text-center py-16 bg-stone-900/40 border border-stone-800 rounded-2xl p-8 space-y-4">
                <UserIcon className="w-12 h-12 text-stone-600 mx-auto" />
                <h4 className="text-base font-bold text-white font-serif">Sign in to Manage Account Settings</h4>
                <p className="text-xs text-stone-400 max-w-md mx-auto leading-relaxed">
                  Log in to configure your personal profile, shipping addresses, and WhatsApp dispatch alert preferences.
                </p>
                <button
                  onClick={() => setOpenAuth(true)}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                >
                  Sign In Now
                </button>
              </div>
            ) : (
              <div className="max-w-xl bg-stone-900/60 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-6">
                <h3 className="text-base font-bold text-white font-serif">
                  Personal Information & Communication Preferences
                </h3>

                {settingsSaved && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Profile & communication preferences successfully saved.</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 text-xs text-stone-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">WhatsApp Mobile Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 72178 76220"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Explicit WhatsApp Consent Preference */}
                  <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={whatsappOptIn}
                        onChange={(e) => setWhatsappOptIn(e.target.checked)}
                        className="accent-emerald-500 rounded mt-0.5"
                      />
                      <div>
                        <span className="font-bold text-white block">
                          WhatsApp Dispatch & Order Recovery Notifications
                        </span>
                        <span className="text-stone-400 text-[11px] leading-relaxed block mt-0.5">
                          Receive tracking links, airway consignment updates, and cart assistance directly from Shakil Bag Store via WhatsApp (+91-7217876220). You can opt out at any time by unchecking this or replying "STOP".
                        </span>
                      </div>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase rounded-xl transition-colors shadow"
                  >
                    Save Preferences
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
