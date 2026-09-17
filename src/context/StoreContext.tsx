import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, User, CartItem, Order, AdminSettings } from '../types';
import { INITIAL_CATEGORIES } from '../data/initialData';

interface StoreContextType {
  user: User | null;
  token: string | null;
  cart: CartItem[];
  cartId: string;
  wishlist: string[];
  categories: Category[];
  settings: AdminSettings;
  login: (token: string, user: User) => void;
  logout: () => void;
  addToCart: (product: Product, quantity?: number, color?: string, size?: string) => boolean;
  updateCartQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  clearWishlist: () => void;
  addAllWishlistToCart: (products: Product[]) => void;
  formatPrice: (amount: number) => string;
  cartSubtotal: number;
  cartTotalCount: number;
  openChat: boolean;
  setOpenChat: (open: boolean) => void;
  openAuth: boolean;
  setOpenAuth: (open: boolean) => void;
  openExitSurvey: boolean;
  setOpenExitSurvey: (open: boolean) => void;
  pendingExitNav: { page: string; param?: string } | null;
  setPendingExitNav: (nav: { page: string; param?: string } | null) => void;
  refreshCategories: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('shakil_token'));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('shakil_user');
    return raw ? JSON.parse(raw) : null;
  });

  const [cartId] = useState<string>(() => {
    const stored = localStorage.getItem('shakil_cart_id');
    if (stored) return stored;
    const generated = 'crt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    localStorage.setItem('shakil_cart_id', generated);
    return generated;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const raw = localStorage.getItem('shakil_cart');
    return raw ? JSON.parse(raw) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const raw = localStorage.getItem('shakil_wishlist');
    return raw ? JSON.parse(raw) : [];
  });

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [settings, setSettings] = useState<AdminSettings>({
    storeName: 'SHAKIL BAG STORE',
    ownerName: 'Mohammad Shakil',
    phone: '+91-7217876220',
    whatsappNumber: '+91-7217876220',
    email: 'himanshu.bkgroup@gmail.com',
    currency: 'INR',
    currencySymbol: '₹',
    abandonedCartEnabled: true,
    stagesEnabled: {
      stage_60m: true,
      stage_3h: true,
      stage_6h: true,
      stage_12h: true,
      stage_24h: true
    },
    aiEnabled: true,
    freeShippingThreshold: 999,
    standardShippingFee: 99
  });

  const [openChat, setOpenChat] = useState(false);
  const [openAuth, setOpenAuth] = useState(false);
  const [openExitSurvey, setOpenExitSurvey] = useState(false);
  const [pendingExitNav, setPendingExitNav] = useState<{ page: string; param?: string } | null>(null);

  // Sync cart to local storage & checkout session endpoint
  useEffect(() => {
    localStorage.setItem('shakil_cart', JSON.stringify(cart));
    if (cart.length > 0) {
      // Background ping to keep abandoned cart session synchronized
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          customerName: user?.name,
          phone: user?.phone,
          email: user?.email,
          items: cart,
          cartTotal: subtotal,
          stage: 'CART',
          whatsappOptIn: user?.whatsappOptIn ?? true
        })
      }).catch(() => {});
    }
  }, [cart, cartId, user]);

  useEffect(() => {
    localStorage.setItem('shakil_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Sync with user's account wishlist when authenticated
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            localStorage.setItem('shakil_user', JSON.stringify(data.user));
            if (Array.isArray(data.user.wishlist) && data.user.wishlist.length > 0) {
              setWishlist((local) => {
                const merged = Array.from(new Set([...data.user.wishlist, ...local]));
                localStorage.setItem('shakil_wishlist', JSON.stringify(merged));
                return merged;
              });
            }
          }
        })
        .catch(() => {});
    }
  }, [token]);

  const refreshCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  useEffect(() => {
    refreshCategories();
    fetch('/api/health')
      .then((r) => r.json())
      .catch(() => {});
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);

    // Merge any local guest wishlist items with user account wishlist
    const localRaw = localStorage.getItem('shakil_wishlist');
    const localList: string[] = localRaw ? JSON.parse(localRaw) : [];
    const serverList: string[] = Array.isArray(newUser.wishlist) ? newUser.wishlist : [];
    const mergedWishlist = Array.from(new Set([...serverList, ...localList]));

    const updatedUser = { ...newUser, wishlist: mergedWishlist };
    setUser(updatedUser);
    setWishlist(mergedWishlist);

    localStorage.setItem('shakil_token', newToken);
    localStorage.setItem('shakil_user', JSON.stringify(updatedUser));
    localStorage.setItem('shakil_wishlist', JSON.stringify(mergedWishlist));

    if (localList.length > 0) {
      fetch('/api/user/wishlist/sync', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newToken}`
        },
        body: JSON.stringify({ localWishlist: mergedWishlist })
      }).catch(() => {});
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('shakil_token');
    localStorage.removeItem('shakil_user');
  };

  const addToCart = (product: Product, quantity = 1, color?: string, size?: string): boolean => {
    if (product.stockQuantity < 1) {
      return false;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product._id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stockQuantity);
        return prev.map((item) =>
          item.productId === product._id ? { ...item, quantity: newQty } : item
        );
      }
      const newItem: CartItem = {
        productId: product._id,
        name: product.name,
        sku: product.sku,
        price: product.salePrice || product.price,
        image: product.thumbnail || product.images[0],
        quantity: Math.min(quantity, product.stockQuantity),
        color: color || product.color[0],
        size: size || product.size
      };
      return [...prev, newItem];
    });

    // Track analytics event
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'ADD_TO_CART', stage: 'CATALOG', data: { productId: product._id, name: product.name } })
    }).catch(() => {});

    return true;
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('shakil_cart');
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const isPresent = prev.includes(productId);
      const updated = isPresent ? prev.filter((id) => id !== productId) : [...prev, productId];
      localStorage.setItem('shakil_wishlist', JSON.stringify(updated));

      // If user is signed in, sync immediately to user account in database
      if (token) {
        fetch('/api/user/wishlist/toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ productId })
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.wishlist && user) {
              const updatedUser = { ...user, wishlist: data.wishlist };
              setUser(updatedUser);
              localStorage.setItem('shakil_user', JSON.stringify(updatedUser));
            }
          })
          .catch(() => {});
      }

      return updated;
    });
  };

  const clearWishlist = () => {
    setWishlist([]);
    localStorage.removeItem('shakil_wishlist');
    if (token) {
      fetch('/api/user/wishlist/sync', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ localWishlist: [] })
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.user && user) {
            setUser(data.user);
            localStorage.setItem('shakil_user', JSON.stringify(data.user));
          }
        })
        .catch(() => {});
    }
  };

  const addAllWishlistToCart = (products: Product[]) => {
    products.forEach((prod) => {
      if (prod.stockQuantity > 0) {
        addToCart(prod, 1);
      }
    });
  };

  const formatPrice = (amount: number): string => {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        user,
        token,
        cart,
        cartId,
        wishlist,
        categories,
        settings,
        login,
        logout,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        clearWishlist,
        addAllWishlistToCart,
        formatPrice,
        cartSubtotal,
        cartTotalCount,
        openChat,
        setOpenChat,
        openAuth,
        setOpenAuth,
        openExitSurvey,
        setOpenExitSurvey,
        pendingExitNav,
        setPendingExitNav,
        refreshCategories
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
