from fastapi import FastAPI, HTTPException, Depends, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import List, Optional
import uvicorn

from .config import settings
from .database import connect_to_mongo, close_mongo_connection, get_database
from .models import ProductModel, CategoryModel, OrderModel, LeadModel, ReviewModel, AbandonedCartModel

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(
    title="SHAKIL BAG STORE - FastAPI Backend",
    description="Full-stack enterprise e-commerce API for Shakil Bag Store by Mohammad Shakil.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "brand": "SHAKIL BAG STORE",
        "owner": "Mohammad Shakil",
        "phone": settings.CONTACT_PHONE,
        "email": settings.CONTACT_EMAIL
    }

@app.get("/api/categories")
async def get_categories():
    db = get_database()
    if db is None:
        return {"categories": []}
    cursor = db.categories.find({})
    categories = await cursor.to_list(length=100)
    for c in categories:
        c["_id"] = str(c.get("_id", ""))
    return {"categories": categories}

@app.get("/api/products")
async def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    minPrice: Optional[float] = None,
    maxPrice: Optional[float] = None,
    sort: Optional[str] = None
):
    db = get_database()
    if db is None:
        return {"products": [], "total": 0}

    query = {"status": {"$ne": "ARCHIVED"}}
    if category and category != "all":
        query["category"] = category
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"sku": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}}
        ]
    if minPrice is not None or maxPrice is not None:
        price_query = {}
        if minPrice is not None:
            price_query["$gte"] = minPrice
        if maxPrice is not None:
            price_query["$lte"] = maxPrice
        query["price"] = price_query

    cursor = db.products.find(query)
    products = await cursor.to_list(length=200)
    for p in products:
        p["_id"] = str(p.get("_id", ""))

    return {"products": products, "total": len(products)}

@app.get("/api/products/{slug}")
async def get_product(slug: str):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=404, detail="Database not available")
    product = await db.products.find_one({"slug": slug, "status": {"$ne": "ARCHIVED"}})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product["_id"] = str(product.get("_id", ""))

    # Related products
    related_cursor = db.products.find({"category": product["category"], "slug": {"$ne": slug}}).limit(4)
    related = await related_cursor.to_list(length=4)
    for r in related:
        r["_id"] = str(r.get("_id", ""))

    return {"product": product, "related": related}

@app.post("/api/orders")
async def create_order(order_data: OrderModel):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database unavailable")
    
    order_dict = order_data.dict()
    res = await db.orders.insert_one(order_dict)
    order_dict["_id"] = str(res.inserted_id)

    # Cancel abandoned cart recovery if exists
    await db.abandoned_carts.update_one(
        {"phone": order_data.customerPhone, "completed": False},
        {"$set": {"completed": True, "recoveryStatus": "RECOVERED", "orderId": order_data.orderId}}
    )

    return {"order": order_dict}

@app.get("/api/orders/track")
async def track_order(orderId: str, contact: Optional[str] = None):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=404, detail="Database not available")
    order = await db.orders.find_one({"orderId": orderId})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order["_id"] = str(order.get("_id", ""))
    return {"order": order}

@app.post("/api/leads")
async def capture_lead(lead_data: LeadModel):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database unavailable")
    lead_dict = lead_data.dict()
    res = await db.leads.insert_one(lead_dict)
    lead_dict["_id"] = str(res.inserted_id)
    return {"lead": lead_dict}

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
