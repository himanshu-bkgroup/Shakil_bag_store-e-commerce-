import fs from 'fs';
import path from 'path';
import { MongoClient, Db } from 'mongodb';
import bcrypt from 'bcryptjs';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SETTINGS } from './initialData';
import { Product, Category, User, Order, Cart, AbandonedCart, Lead, Enquiry, Review, Coupon, AdminSettings, ExitSurvey } from '../src/types';

function getDataPaths() {
  const isServerless = Boolean(
    process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT
  );

  if (isServerless) {
    return {
      dir: '/tmp',
      file: path.join('/tmp', 'shakil_db.json')
    };
  }

  const localDir = path.join(process.cwd(), 'data');
  return {
    dir: localDir,
    file: path.join(localDir, 'db.json')
  };
}

const { dir: DATA_DIR, file: DB_FILE } = getDataPaths();

export interface DBState {
  users: User[];
  products: Product[];
  categories: Category[];
  orders: Order[];
  carts: Cart[];
  abandoned_carts: AbandonedCart[];
  leads: Lead[];
  enquiries: Enquiry[];
  reviews: Review[];
  coupons: Coupon[];
  settings: AdminSettings;
  exit_surveys: ExitSurvey[];
  analytics_events: Array<{ type: string; stage?: string; data?: any; timestamp: string }>;
  notifications: Array<{ _id: string; title: string; message: string; type: string; read: boolean; createdAt: string; link?: string }>;
}

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let useMongoDB = false;
let dbInitPromise: Promise<void> | null = null;

// Initial seed data definitions
const salt = bcrypt.genSaltSync(10);
const adminPasswordHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'ShakilAdmin@2026!', salt);

const initialAdmin: User = {
  _id: 'usr-admin-1',
  name: process.env.ADMIN_NAME || 'Mohammad Shakil',
  email: process.env.ADMIN_EMAIL || 'himanshu.bkgroup@gmail.com',
  phone: process.env.ADMIN_PHONE || '+917217876220',
  role: 'admin',
  addresses: [
    {
      name: 'Mohammad Shakil',
      phone: '+917217876220',
      street: 'Main Market, Bag Emporium Road',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110006',
      country: 'India',
      isDefault: true
    }
  ],
  whatsappOptIn: true,
  wishlist: [],
  createdAt: new Date().toISOString()
};

const initialCoupons: Coupon[] = [
  {
    _id: 'cpn-1',
    code: 'SHAKIL10',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderValue: 1999,
    maxDiscount: 1000,
    expiryDate: new Date(Date.now() + 90 * 86400000).toISOString(),
    usedCount: 0,
    active: true
  },
  {
    _id: 'cpn-2',
    code: 'FIRST500',
    discountType: 'FIXED',
    discountValue: 500,
    minOrderValue: 4000,
    expiryDate: new Date(Date.now() + 60 * 86400000).toISOString(),
    usedCount: 0,
    active: true
  },
  {
    _id: 'cpn-3',
    code: 'SHAKIL500',
    discountType: 'FIXED',
    discountValue: 500,
    minOrderValue: 1499,
    expiryDate: new Date(Date.now() + 90 * 86400000).toISOString(),
    usedCount: 0,
    active: true
  }
];

const initialReviews: Review[] = [
  {
    _id: 'rev-1',
    productId: 'prod-1',
    productName: 'AeroShield Elite Cabin Hard Trolley (55cm)',
    customerName: 'Aman Verma',
    customerEmail: 'aman.v@example.com',
    rating: 5,
    title: 'Exceptional build quality for international flights',
    comment: 'Traveled through Dubai and London. The Japanese spinner wheels glide like butter on carpet and terminal tiles. Truly luxury tier.',
    verifiedPurchase: true,
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    _id: 'rev-2',
    productId: 'prod-4',
    productName: 'Executive Nomad Full-Grain Leather Laptop Backpack (24L)',
    customerName: 'Rohan Mehta',
    customerEmail: 'rohan.m@example.com',
    rating: 5,
    title: 'Rich leather scent and immaculate stitching',
    comment: 'Fits my 16 inch MacBook Pro securely with its velvet sleeve. Love the luggage pass-through strap for airport trolley carry.',
    verifiedPurchase: true,
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString()
  }
];

function loadLocalDB(): DBState {
  const initialState: DBState = {
    users: [initialAdmin],
    products: INITIAL_PRODUCTS,
    categories: INITIAL_CATEGORIES,
    orders: [],
    carts: [],
    abandoned_carts: [],
    leads: [],
    enquiries: [],
    reviews: initialReviews,
    coupons: initialCoupons,
    settings: INITIAL_SETTINGS,
    exit_surveys: [],
    analytics_events: [],
    notifications: [
      {
        _id: 'notif-1',
        title: 'System Initialized',
        message: 'Shakil Bag Store full-stack e-commerce engine started with 20 categories and catalogue.',
        type: 'SYSTEM',
        read: false,
        createdAt: new Date().toISOString()
      }
    ]
  };

  try {
    const projectDbFile = path.join(process.cwd(), 'data', 'db.json');
    const candidateFile = fs.existsSync(DB_FILE) ? DB_FILE : (fs.existsSync(projectDbFile) ? projectDbFile : null);

    if (candidateFile) {
      const raw = fs.readFileSync(candidateFile, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Notice: Could not read db.json from filesystem, using initial products state:', e);
  }

  // Attempt to write initial state if directory is writable (catch and ignore if read-only)
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(initialState, null, 2), 'utf-8');
  } catch (e) {
    // Read-only filesystem is completely safe - in-memory initialState is used
  }

  return initialState;
}

let localDB: DBState = loadLocalDB();

function saveLocalDB() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(localDB, null, 2), 'utf-8');
  } catch (e) {
    // Ignore write errors in read-only serverless environments
  }
}

export async function initDatabase(): Promise<void> {
  if (useMongoDB && mongoDb) return;
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = (async () => {
    const mongoUrl = process.env.MONGO_URL;
    const dbName = process.env.DB_NAME || 'shakil_bag_store';

    if (mongoUrl && mongoUrl.startsWith('mongodb')) {
      try {
        console.log(`Connecting to MongoDB at ${mongoUrl.split('@')[1] || 'cluster'}...`);
        mongoClient = new MongoClient(mongoUrl, { serverSelectionTimeoutMS: 4000 });
        await mongoClient.connect();
        mongoDb = mongoClient.db(dbName);
        useMongoDB = true;
        console.log('MongoDB successfully connected and active!');

        // Ensure indexes
        await mongoDb.collection('products').createIndex({ slug: 1 }, { unique: true });
        await mongoDb.collection('products').createIndex({ sku: 1 }, { unique: true });
        await mongoDb.collection('products').createIndex({ category: 1 });
        await mongoDb.collection('users').createIndex({ email: 1 }, { unique: true });
        await mongoDb.collection('orders').createIndex({ orderId: 1 }, { unique: true });
        await mongoDb.collection('abandoned_carts').createIndex({ cartId: 1 });

        // Seed initial collections if newly connected or empty
        const existingUserCount = await mongoDb.collection('users').countDocuments();
        if (existingUserCount === 0) {
          console.log('Seeding initial admin user into MongoDB...');
          await mongoDb.collection('users').insertOne(initialAdmin as any);
        } else {
          const adminFound = await mongoDb.collection('users').findOne({ role: 'admin' });
          if (!adminFound) {
            await mongoDb.collection('users').insertOne(initialAdmin as any);
          }
        }

        const existingProdCount = await mongoDb.collection('products').countDocuments();
        if (existingProdCount === 0) {
          console.log('Seeding initial products into MongoDB...');
          const productsToSeed = (localDB.products && localDB.products.length > 0) ? localDB.products : INITIAL_PRODUCTS;
          await mongoDb.collection('products').insertMany(productsToSeed as any[]);
        }

        const existingCatCount = await mongoDb.collection('categories').countDocuments();
        if (existingCatCount === 0) {
          console.log('Seeding initial categories into MongoDB...');
          const categoriesToSeed = (localDB.categories && localDB.categories.length > 0) ? localDB.categories : INITIAL_CATEGORIES;
          await mongoDb.collection('categories').insertMany(categoriesToSeed as any[]);
        }

        const existingSettings = await mongoDb.collection<any>('settings').findOne({ _id: 'admin-settings' });
        if (!existingSettings) {
          await mongoDb.collection<any>('settings').insertOne({ _id: 'admin-settings', ...(localDB.settings || INITIAL_SETTINGS) } as any);
        }

        const existingCoupons = await mongoDb.collection<any>('coupons').countDocuments();
        if (existingCoupons === 0) {
          await mongoDb.collection<any>('coupons').insertMany(initialCoupons as any[]);
        }

        const existingReviews = await mongoDb.collection<any>('reviews').countDocuments();
        if (existingReviews === 0) {
          await mongoDb.collection<any>('reviews').insertMany(initialReviews as any[]);
        }

        console.log('MongoDB initialization and collection verification complete.');
        return;
      } catch (err) {
        console.warn('MongoDB connection failed, falling back to persistent JSON engine:', err);
        useMongoDB = false;
      }
    } else {
      console.log('No external MONGO_URL specified. Running with persistent JSON document engine (data/db.json).');
    }
  })();

  return dbInitPromise;
}

// Generic CRUD helpers that seamlessly interface with MongoDB or Local DB
export const db = {
  isMongoDB: () => useMongoDB,

  // Products
  async getProducts(filter: (p: Product) => boolean = () => true): Promise<Product[]> {
    if (useMongoDB && mongoDb) {
      const docs = await mongoDb.collection('products').find({ status: { $ne: 'ARCHIVED' } }).toArray();
      return (docs as any[]).filter(filter);
    }
    return localDB.products.filter((p) => p.status !== 'ARCHIVED').filter(filter);
  },

  async getAllAdminProducts(): Promise<Product[]> {
    if (useMongoDB && mongoDb) {
      return (await mongoDb.collection('products').find({}).toArray()) as any;
    }
    return localDB.products;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (useMongoDB && mongoDb) {
      return (await mongoDb.collection('products').findOne({ slug })) as any;
    }
    return localDB.products.find((p) => p.slug === slug && p.status !== 'ARCHIVED') || null;
  },

  async getProductById(id: string): Promise<Product | null> {
    if (useMongoDB && mongoDb) {
      return (await mongoDb.collection<any>('products').findOne({ _id: id })) as any;
    }
    return localDB.products.find((p) => p._id === id) || null;
  },

  async saveProduct(product: Product): Promise<Product> {
    if (useMongoDB && mongoDb) {
      await mongoDb.collection<any>('products').updateOne({ _id: product._id }, { $set: product }, { upsert: true });
      return product;
    }
    const idx = localDB.products.findIndex((p) => p._id === product._id);
    if (idx >= 0) {
      localDB.products[idx] = product;
    } else {
      localDB.products.push(product);
    }
    saveLocalDB();
    return product;
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (useMongoDB && mongoDb) {
      await mongoDb.collection<any>('products').updateOne({ _id: id }, { $set: { status: 'ARCHIVED' } });
      return true;
    }
    const product = localDB.products.find((p) => p._id === id);
    if (product) {
      product.status = 'ARCHIVED';
      saveLocalDB();
      return true;
    }
    return false;
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    if (useMongoDB && mongoDb) {
      return (await mongoDb.collection<any>('categories').find({}).toArray()) as any;
    }
    return localDB.categories;
  },

  async saveCategory(cat: Category): Promise<Category> {
    if (useMongoDB && mongoDb) {
      await mongoDb.collection<any>('categories').updateOne({ _id: cat._id }, { $set: cat }, { upsert: true });
      return cat;
    }
    const idx = localDB.categories.findIndex((c) => c._id === cat._id || c.slug === cat.slug);
    if (idx >= 0) {
      localDB.categories[idx] = cat;
    } else {
      localDB.categories.push(cat);
    }
    saveLocalDB();
    return cat;
  },

  // Users
  async getUserByEmail(email: string): Promise<User | null> {
    if (useMongoDB && mongoDb) {
      return (await mongoDb.collection<any>('users').findOne({ email: email.toLowerCase() })) as any;
    }
    return localDB.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async getUserById(id: string): Promise<User | null> {
    if (useMongoDB && mongoDb) {
      return (await mongoDb.collection<any>('users').findOne({ _id: id })) as any;
    }
    return localDB.users.find((u) => u._id === id) || null;
  },

  async getAllCustomers(): Promise<User[]> {
    if (useMongoDB && mongoDb) {
      return (await mongoDb.collection<any>('users').find({ role: 'customer' }).toArray()) as any;
    }
    return localDB.users.filter((u) => u.role === 'customer');
  },

  async saveUser(user: User): Promise<User> {
    if (useMongoDB && mongoDb) {
      await mongoDb.collection<any>('users').updateOne({ _id: user._id }, { $set: user }, { upsert: true });
      return user;
    }
    const idx = localDB.users.findIndex((u) => u._id === user._id);
    if (idx >= 0) {
      localDB.users[idx] = user;
    } else {
      localDB.users.push(user);
    }
    saveLocalDB();
    return user;
  },

  // Orders
  async getOrders(filter: (o: Order) => boolean = () => true): Promise<Order[]> {
    if (useMongoDB && mongoDb) {
      const docs = await mongoDb.collection<any>('orders').find({}).sort({ createdAt: -1 }).toArray();
      return (docs as any[]).filter(filter);
    }
    return localDB.orders.filter(filter);
  },

  async getOrderByIdOrOrderId(idOrOrderId: string): Promise<Order | null> {
    if (useMongoDB && mongoDb) {
      return (await mongoDb.collection<any>('orders').findOne({
        $or: [{ _id: idOrOrderId }, { orderId: idOrOrderId }]
      })) as any;
    }
    return localDB.orders.find((o) => o._id === idOrOrderId || o.orderId === idOrOrderId) || null;
  },

  async saveOrder(order: Order): Promise<Order> {
    if (useMongoDB && mongoDb) {
      await mongoDb.collection<any>('orders').updateOne({ _id: order._id }, { $set: order }, { upsert: true });
    } else {
      const idx = localDB.orders.findIndex((o) => o._id === order._id);
      if (idx >= 0) {
        localDB.orders[idx] = order;
      } else {
        localDB.orders.unshift(order);
      }
      saveLocalDB();
    }
    return order;
  },

  // Abandoned Carts
  async getAbandonedCarts(): Promise<AbandonedCart[]> {
    if (useMongoDB && mongoDb) {
      return (await mongoDb.collection<any>('abandoned_carts').find({}).sort({ abandonedAt: -1 }).toArray()) as any;
    }
    return localDB.abandoned_carts;
  },

  async getAbandonedCartByCartId(cartId: string): Promise<AbandonedCart | null> {
    if (useMongoDB && mongoDb) {
      return (await mongoDb.collection<any>('abandoned_carts').findOne({ cartId })) as any;
    }
    return localDB.abandoned_carts.find((a) => a.cartId === cartId) || null;
  },

  async saveAbandonedCart(cart: AbandonedCart): Promise<AbandonedCart> {
    if (useMongoDB && mongoDb) {
      await mongoDb.collection<any>('abandoned_carts').updateOne({ _id: cart._id }, { $set: cart }, { upsert: true });
    } else {
      const idx = localDB.abandoned_carts.findIndex((a) => a._id === cart._id || a.cartId === cart.cartId);
      if (idx >= 0) {
        localDB.abandoned_carts[idx] = cart;
      } else {
        localDB.abandoned_carts.unshift(cart);
      }
      saveLocalDB();
    }
    return cart;
  },

  // Leads & Enquiries
  async getLeads(): Promise<Lead[]> {
    if (useMongoDB && mongoDb) {
      return (await mongoDb.collection<any>('leads').find({}).sort({ createdAt: -1 }).toArray()) as any;
    }
    return localDB.leads;
  },

  async saveLead(lead: Lead): Promise<Lead> {
    if (useMongoDB && mongoDb) {
      await mongoDb.collection<any>('leads').updateOne({ _id: lead._id }, { $set: lead }, { upsert: true });
    } else {
      localDB.leads.unshift(lead);
      saveLocalDB();
    }
    return lead;
  },

  async getEnquiries(): Promise<Enquiry[]> {
    if (useMongoDB && mongoDb) {
      return (await mongoDb.collection<any>('enquiries').find({}).sort({ createdAt: -1 }).toArray()) as any;
    }
    return localDB.enquiries;
  },

  async saveEnquiry(enquiry: Enquiry): Promise<Enquiry> {
    if (useMongoDB && mongoDb) {
      await mongoDb.collection<any>('enquiries').updateOne({ _id: enquiry._id }, { $set: enquiry }, { upsert: true });
    } else {
      localDB.enquiries.unshift(enquiry);
      saveLocalDB();
    }
    return enquiry;
  },

  // Reviews
  async getReviews(productId?: string): Promise<Review[]> {
    if (useMongoDB && mongoDb) {
      const query = productId ? { productId } : {};
      return (await mongoDb.collection<any>('reviews').find(query).toArray()) as any;
    }
    if (productId) {
      return localDB.reviews.filter((r) => r.productId === productId && r.status === 'APPROVED');
    }
    return localDB.reviews;
  },

  async saveReview(review: Review): Promise<Review> {
    if (useMongoDB && mongoDb) {
      await mongoDb.collection<any>('reviews').updateOne({ _id: review._id }, { $set: review }, { upsert: true });
    } else {
      const idx = localDB.reviews.findIndex((r) => r._id === review._id);
      if (idx >= 0) {
        localDB.reviews[idx] = review;
      } else {
        localDB.reviews.unshift(review);
      }
      saveLocalDB();
    }
    return review;
  },

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    if (useMongoDB && mongoDb) {
      return (await mongoDb.collection<any>('coupons').find({}).toArray()) as any;
    }
    return localDB.coupons;
  },

  async saveCoupon(coupon: Coupon): Promise<Coupon> {
    if (useMongoDB && mongoDb) {
      await mongoDb.collection<any>('coupons').updateOne({ _id: coupon._id }, { $set: coupon }, { upsert: true });
    } else {
      const idx = localDB.coupons.findIndex((c) => c._id === coupon._id || c.code === coupon.code);
      if (idx >= 0) {
        localDB.coupons[idx] = coupon;
      } else {
        localDB.coupons.push(coupon);
      }
      saveLocalDB();
    }
    return coupon;
  },

  // Exit surveys & analytics
  async saveExitSurvey(survey: ExitSurvey): Promise<ExitSurvey> {
    if (useMongoDB && mongoDb) {
      await mongoDb.collection<any>('exit_surveys').insertOne(survey as any);
    } else {
      localDB.exit_surveys.unshift(survey);
      saveLocalDB();
    }
    return survey;
  },

  async getExitSurveys(): Promise<ExitSurvey[]> {
    if (useMongoDB && mongoDb) {
      return (await mongoDb.collection<any>('exit_surveys').find({}).toArray()) as any;
    }
    return localDB.exit_surveys;
  },

  async logAnalyticsEvent(type: string, stage?: string, data?: any): Promise<void> {
    const event = { type, stage, data, timestamp: new Date().toISOString() };
    if (useMongoDB && mongoDb) {
      await mongoDb.collection<any>('analytics_events').insertOne(event as any);
    } else {
      localDB.analytics_events.push(event);
      if (localDB.analytics_events.length > 2000) {
        localDB.analytics_events = localDB.analytics_events.slice(-1000);
      }
      saveLocalDB();
    }
  },

  async getAnalyticsEvents(): Promise<any[]> {
    if (useMongoDB && mongoDb) {
      return (await mongoDb.collection<any>('analytics_events').find({}).toArray()) as any;
    }
    return localDB.analytics_events;
  },

  // Notifications
  async addNotification(title: string, message: string, type: string, link?: string): Promise<void> {
    const notif = {
      _id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
      link
    };
    if (useMongoDB && mongoDb) {
      await mongoDb.collection<any>('notifications').insertOne(notif as any);
    } else {
      localDB.notifications.unshift(notif);
      saveLocalDB();
    }
  },

  async getNotifications(): Promise<any[]> {
    if (useMongoDB && mongoDb) {
      return (await mongoDb.collection<any>('notifications').find({}).sort({ createdAt: -1 }).limit(50).toArray()) as any;
    }
    return localDB.notifications;
  },

  async markNotificationRead(id: string): Promise<void> {
    if (useMongoDB && mongoDb) {
      await mongoDb.collection<any>('notifications').updateOne({ _id: id }, { $set: { read: true } });
    } else {
      const n = localDB.notifications.find((item) => item._id === id);
      if (n) n.read = true;
      saveLocalDB();
    }
  },

  // Settings
  async getSettings(): Promise<AdminSettings> {
    if (useMongoDB && mongoDb) {
      const doc = await mongoDb.collection<any>('settings').findOne({ _id: 'admin-settings' });
      if (doc) return doc as any;
    }
    return localDB.settings;
  },

  async saveSettings(settings: AdminSettings): Promise<AdminSettings> {
    if (useMongoDB && mongoDb) {
      await mongoDb.collection<any>('settings').updateOne({ _id: 'admin-settings' }, { $set: settings }, { upsert: true });
    } else {
      localDB.settings = settings;
      saveLocalDB();
    }
    return settings;
  }
};
