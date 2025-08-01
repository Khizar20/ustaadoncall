from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from typing import Optional

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8")

@app.get("/")
async def root():
    """
    Root endpoint to test if server is running
    """
    return {"message": "Google Maps Proxy Server is running!", "status": "ok"}

@app.get("/api/google-maps/autocomplete")
async def google_maps_autocomplete(
    input: str,
    types: str = "geocode",
    components: Optional[str] = "country:pk"
):
    """
    Proxy for Google Maps Places Autocomplete API
    """
    try:
        url = "https://maps.googleapis.com/maps/api/place/autocomplete/json"
        params = {
            "input": input,
            "types": types,
            "key": GOOGLE_MAPS_API_KEY
        }
        
        if components:
            params["components"] = components
            
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()
            
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/google-maps/place-details")
async def google_maps_place_details(
    place_id: str,
    fields: str = "geometry"
):
    """
    Proxy for Google Maps Place Details API
    """
    try:
        url = "https://maps.googleapis.com/maps/api/place/details/json"
        params = {
            "place_id": place_id,
            "fields": fields,
            "key": GOOGLE_MAPS_API_KEY
        }
            
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()
            
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/google-maps/geocode")
async def google_maps_geocode(
    address: str
):
    """
    Proxy for Google Maps Geocoding API
    """
    try:
        url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {
            "address": address,
            "key": GOOGLE_MAPS_API_KEY
        }
            
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()
            
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 