export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  subcategory?: string;
  description: string;
  shortDescription: string;
  price: number;
  salePrice?: number;
  discountPercentage?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  images: string[];
  thumbnail: string;
  videoUrl?: string;
  brand: string;
  material: string;
  color: string[];
  size: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  weight: {
    value: number;
    unit: string;
  };
  capacity?: {
    value: number;
    unit: string;
  };
  warranty: string;
  features: string[];
  specifications: Record<string, string>;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  searchKeywords?: string[];
  status: 'ACTIVE' | 'DRAFT' | 'OUT_OF_STOCK' | 'ARCHIVED';
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  itemCount?: number;
  isFeatured?: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  addresses: Address[];
  whatsappOptIn?: boolean;
  wishlist?: string[];
  createdAt: string;
  lastActivity?: string;
}

export interface Address {
  _id?: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
}

export interface CartItem {
  productId: string;
  product?: Product;
  name: string;
  sku: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;
}

export interface Cart {
  _id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  tax: number;
  total: number;
  whatsappOptIn?: boolean;
  phone?: string;
  email?: string;
  customerName?: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
  color?: string;
}

export interface Order {
  _id: string;
  orderId: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: 'UPI' | 'CARDS' | 'NET_BANKING' | 'WALLETS' | 'COD';
  paymentStatus: 'PENDING' | 'AUTHORIZED' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  paymentId?: string;
  orderStatus:
    | 'PENDING'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'PACKED'
    | 'SHIPPED'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'RETURN_REQUESTED'
    | 'RETURNED'
    | 'REFUNDED';
  shippingAddress: Address;
  billingAddress?: Address;
  trackingNumber?: string;
  courier?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AbandonedCart {
  _id: string;
  cartId: string;
  customerId?: string;
  customerName: string;
  phone: string;
  email?: string;
  items: CartItem[];
  cartTotal: number;
  checkoutStage: 'CART' | 'DETAILS' | 'SHIPPING' | 'DELIVERY' | 'PAYMENT';
  abandonedAt: string;
  lastActivityAt: string;
  consentStatus: boolean;
  optedOut: boolean;
  completed: boolean;
  orderId?: string;
  recoveryStatus: 'PENDING' | 'IN_PROGRESS' | 'RECOVERED' | 'CANCELLED' | 'EXPIRED';
  recovery_60m: {
    eligibleAt: string;
    sentAt?: string;
    status: 'SCHEDULED' | 'SENT' | 'FAILED' | 'SKIPPED';
    message?: string;
  };
  recovery_3h: {
    eligibleAt: string;
    sentAt?: string;
    status: 'SCHEDULED' | 'SENT' | 'FAILED' | 'SKIPPED';
    message?: string;
  };
  recovery_6h: {
    eligibleAt: string;
    sentAt?: string;
    status: 'SCHEDULED' | 'SENT' | 'FAILED' | 'SKIPPED';
    message?: string;
  };
  recovery_12h: {
    eligibleAt: string;
    sentAt?: string;
    status: 'SCHEDULED' | 'SENT' | 'FAILED' | 'SKIPPED';
    message?: string;
  };
  recovery_24h: {
    eligibleAt: string;
    sentAt?: string;
    status: 'SCHEDULED' | 'SENT' | 'FAILED' | 'SKIPPED';
    message?: string;
  };
  lastMessageAt?: string;
  attemptsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  productName?: string;
  productId?: string;
  requirement?: string;
  budget?: string;
  categoryType?: string;
  source: 'CHATBOT' | 'PRODUCT_PAGE' | 'BULK_ENQUIRY' | 'WHATSAPP' | 'CONTACT_FORM' | 'PERSONAL_SHOPPING' | 'NEWSLETTER' | string;
  status: 'NEW' | 'QUALIFIED' | 'CONTACTED' | 'CONVERTED' | 'LOST';
  notes?: string;
  createdAt: string;
}

export interface Enquiry {
  _id: string;
  name: string;
  phone: string;
  email: string;
  type: 'GENERAL' | 'PRODUCT' | 'BULK_ORDER' | 'BUSINESS' | 'CONTACT';
  subject?: string;
  message: string;
  productName?: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
}

export interface Review {
  _id: string;
  productId: string;
  productName?: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
  categoryRestrictions?: string[];
}

export interface ExitSurvey {
  _id: string;
  reason: string;
  details?: string;
  cartTotal?: number;
  stage?: string;
  createdAt: string;
}

export interface AdminSettings {
  storeName: string;
  ownerName: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  currency: string;
  currencySymbol: string;
  abandonedCartEnabled: boolean;
  stagesEnabled: {
    stage_60m: boolean;
    stage_3h: boolean;
    stage_6h: boolean;
    stage_12h: boolean;
    stage_24h: boolean;
  };
  aiEnabled: boolean;
  freeShippingThreshold: number;
  standardShippingFee: number;
}
