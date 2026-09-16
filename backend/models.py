from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

class CategoryModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    slug: str
    description: Optional[str] = ""
    image: Optional[str] = ""
    isFeatured: bool = False

class ProductModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    slug: str
    sku: str
    category: str
    subcategory: Optional[str] = ""
    description: str
    shortDescription: str
    price: float
    salePrice: Optional[float] = None
    discountPercentage: Optional[int] = 0
    stockQuantity: int = 0
    lowStockThreshold: int = 5
    images: List[str] = []
    thumbnail: str
    videoUrl: Optional[str] = None
    brand: str = "SHAKIL BAG STORE"
    material: str
    color: List[str] = []
    size: str = "Standard"
    dimensions: Dict[str, Any] = {"length": 40, "width": 25, "height": 55, "unit": "cm"}
    weight: Dict[str, Any] = {"value": 3.0, "unit": "kg"}
    capacity: Optional[Dict[str, Any]] = None
    warranty: str = "3 Years Warranty"
    features: List[str] = []
    specifications: Dict[str, str] = {}
    tags: List[str] = []
    status: str = "ACTIVE"
    rating: float = 5.0
    reviewCount: int = 0
    isFeatured: bool = False
    isBestSeller: bool = False
    isNewArrival: bool = False
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class AddressModel(BaseModel):
    name: str
    phone: str
    street: str
    city: str
    state: str
    pincode: str
    country: str = "India"
    isDefault: bool = False

class UserModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    role: str = "customer"
    addresses: List[AddressModel] = []
    whatsappOptIn: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class OrderItemModel(BaseModel):
    productId: str
    name: str
    sku: str
    price: float
    quantity: int
    image: str
    color: Optional[str] = None

class OrderModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    orderId: str
    customerId: Optional[str] = None
    customerName: str
    customerEmail: str
    customerPhone: str
    items: List[OrderItemModel]
    subtotal: float
    discount: float = 0.0
    couponCode: Optional[str] = None
    shipping: float = 0.0
    tax: float = 0.0
    total: float
    paymentMethod: str = "COD"
    paymentStatus: str = "PENDING"
    paymentId: Optional[str] = None
    orderStatus: str = "PENDING"
    shippingAddress: AddressModel
    billingAddress: Optional[AddressModel] = None
    trackingNumber: Optional[str] = None
    courier: Optional[str] = "Blue Dart Express"
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class AbandonedCartModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    cartId: str
    customerName: str
    phone: str
    email: Optional[str] = None
    items: List[Dict[str, Any]]
    cartTotal: float
    checkoutStage: str = "CART"
    abandonedAt: datetime = Field(default_factory=datetime.utcnow)
    consentStatus: bool = True
    optedOut: bool = False
    completed: bool = False
    orderId: Optional[str] = None
    recoveryStatus: str = "PENDING"
    recovery_60m: Dict[str, Any] = {"status": "SCHEDULED"}
    recovery_3h: Dict[str, Any] = {"status": "SCHEDULED"}
    recovery_6h: Dict[str, Any] = {"status": "SCHEDULED"}
    recovery_12h: Dict[str, Any] = {"status": "SCHEDULED"}
    recovery_24h: Dict[str, Any] = {"status": "SCHEDULED"}
    attemptsCount: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class LeadModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    phone: str
    email: Optional[str] = None
    productName: Optional[str] = None
    requirement: Optional[str] = None
    budget: Optional[str] = None
    source: str = "CHATBOT"
    status: str = "NEW"
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class ReviewModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    productId: str
    productName: Optional[str] = None
    customerName: str
    customerEmail: str
    rating: int
    title: str
    comment: str
    verifiedPurchase: bool = True
    status: str = "APPROVED"
    createdAt: datetime = Field(default_factory=datetime.utcnow)
