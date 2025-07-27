from fastapi import FastAPI, HTTPException, Path
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv
from typing import List, Optional

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

app = FastAPI()

# CORS middleware for frontend-backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:5173",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class ProviderIn(BaseModel):
    user_id: str
    name: str
    service_category: str
    bio: Optional[str] = ""
    experience: Optional[str] = ""
    location: Optional[str] = ""
    profile_image: Optional[str] = ""
    cnic_front: Optional[str] = None
    cnic_back: Optional[str] = None
    is_verified: Optional[bool] = False
    jobs_pricing: Optional[dict] = None

class ProviderOut(ProviderIn):
    id: str
    rating: Optional[float] = 0
    reviews_count: Optional[int] = 0
    created_at: Optional[str] = None

# Create a provider
@app.post("/providers/", response_model=ProviderOut)
async def create_provider(provider: ProviderIn):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SUPABASE_URL}/rest/v1/providers",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },
            json=provider.dict()
        )
        if response.status_code not in (200, 201):
            raise HTTPException(status_code=500, detail=response.text)
        return response.json()[0]

# Get all providers
@app.get("/providers/", response_model=List[ProviderOut])
async def get_providers():
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/providers",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"
            },
            params={"select": "*"}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=response.text)
        return response.json()

# Get a provider by id
@app.get("/providers/{provider_id}", response_model=ProviderOut)
async def get_provider(provider_id: str = Path(..., description="Provider UUID")):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/providers",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"
            },
            params={"id": f"eq.{provider_id}", "select": "*"}
        )
        if response.status_code != 200 or not response.json():
            raise HTTPException(status_code=404, detail="Provider not found")
        return response.json()[0]

# Update a provider
@app.patch("/providers/{provider_id}", response_model=ProviderOut)
async def update_provider(provider_id: str, provider: ProviderIn):
    async with httpx.AsyncClient() as client:
        response = await client.patch(
            f"{SUPABASE_URL}/rest/v1/providers?id=eq.{provider_id}",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },
            json=provider.dict(exclude_unset=True)
        )
        if response.status_code != 200 or not response.json():
            raise HTTPException(status_code=404, detail="Provider not found or not updated")
        return response.json()[0]

# Delete a provider
@app.delete("/providers/{provider_id}")
async def delete_provider(provider_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.delete(
            f"{SUPABASE_URL}/rest/v1/providers?id=eq.{provider_id}",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                "Prefer": "return=representation"
            }
        )
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="Provider not found or not deleted")
        return {"message": "Provider deleted"} 