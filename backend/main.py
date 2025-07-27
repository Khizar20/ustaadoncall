from fastapi import FastAPI, HTTPException, Path, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import httpx
import os
import secrets
import bcrypt
from datetime import datetime, timedelta
from dotenv import load_dotenv
from typing import List, Optional

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Security
security = HTTPBearer()

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

class PendingRequestIn(BaseModel):
    user_id: str
    first_name: str
    last_name: str
    email: str
    phone: str
    service_category: List[str]
    experience: Optional[str] = ""
    location: Optional[str] = ""
    bio: Optional[str] = ""
    profile_image_url: Optional[str] = ""
    cnic_front_url: Optional[str] = None
    cnic_back_url: Optional[str] = None
    jobs_pricing: Optional[dict] = None

class PendingRequestOut(PendingRequestIn):
    id: str
    status: str = "pending"
    admin_notes: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminSession(BaseModel):
    token: str
    expires_at: str
    admin_id: str

class AdminUser(BaseModel):
    id: str
    username: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    is_active: bool
    last_login: Optional[str] = None

class AdminUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

# Authentication functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def generate_token() -> str:
    return secrets.token_urlsafe(32)

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    print(f"🔍 [AUTH] Validating token: {token[:10]}...")
    
    async with httpx.AsyncClient() as client:
        # Check if token exists and is valid
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/admin_sessions",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"
            },
            params={"token": f"eq.{token}", "select": "*"}
        )
        
        print(f"🔍 [AUTH] Session lookup response status: {response.status_code}")
        print(f"🔍 [AUTH] Session lookup response: {response.text}")
        
        if response.status_code != 200 or not response.json():
            print(f"❌ [AUTH] Invalid or missing session")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        session = response.json()[0]
        print(f"🔍 [AUTH] Found session: {session}")
        
        # Check if token is expired
        expires_at = datetime.fromisoformat(session["expires_at"].replace("Z", "+00:00"))
        current_time = datetime.now(expires_at.tzinfo)
        print(f"🔍 [AUTH] Current time: {current_time}")
        print(f"🔍 [AUTH] Expires at: {expires_at}")
        print(f"🔍 [AUTH] Is expired: {current_time > expires_at}")
        
        if current_time > expires_at:
            print(f"❌ [AUTH] Token expired")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired"
            )
        
        # Update last activity
        print(f"🔍 [AUTH] Updating last activity...")
        activity_response = await client.patch(
            f"{SUPABASE_URL}/rest/v1/admin_sessions?id=eq.{session['id']}",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                "Content-Type": "application/json"
            },
            json={"last_activity": datetime.now().isoformat()}
        )
        
        print(f"🔍 [AUTH] Activity update response: {activity_response.status_code}")
        print(f"✅ [AUTH] Authentication successful for admin_id: {session['admin_id']}")
        
        return session

# Authentication endpoints
@app.post("/admin/login", response_model=AdminSession)
async def admin_login(login_data: AdminLogin):
    async with httpx.AsyncClient() as client:
        # Get admin user
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/admin_users",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"
            },
            params={"username": f"eq.{login_data.username}", "select": "*"}
        )
        
        if response.status_code != 200 or not response.json():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        admin_user = response.json()[0]
        
        # Verify password
        if not verify_password(login_data.password, admin_user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Check if admin is active
        if not admin_user["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated"
            )
        
        # Generate token
        token = generate_token()
        expires_at = datetime.now() + timedelta(minutes=30)
        
        # Create session
        session_data = {
            "admin_id": admin_user["id"],
            "token": token,
            "expires_at": expires_at.isoformat()
        }
        
        session_response = await client.post(
            f"{SUPABASE_URL}/rest/v1/admin_sessions",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },
            json=session_data
        )
        
        if session_response.status_code not in (200, 201):
            raise HTTPException(status_code=500, detail="Failed to create session")
        
        # Update last login
        await client.patch(
            f"{SUPABASE_URL}/rest/v1/admin_users?id=eq.{admin_user['id']}",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                "Content-Type": "application/json"
            },
            json={"last_login": datetime.now().isoformat()}
        )
        
        return AdminSession(
            token=token,
            expires_at=expires_at.isoformat(),
            admin_id=admin_user["id"]
        )

@app.post("/admin/logout")
async def admin_logout(current_admin: dict = Depends(get_current_admin)):
    async with httpx.AsyncClient() as client:
        # Delete session
        response = await client.delete(
            f"{SUPABASE_URL}/rest/v1/admin_sessions?token=eq.{current_admin['token']}",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"
            }
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to logout")
        
        return {"message": "Logged out successfully"}

@app.get("/admin/me", response_model=AdminUser)
async def get_current_admin_info(current_admin: dict = Depends(get_current_admin)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/admin_users",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"
            },
            params={"id": f"eq.{current_admin['admin_id']}", "select": "*"}
        )
        
        if response.status_code != 200 or not response.json():
            raise HTTPException(status_code=404, detail="Admin user not found")
        
        admin_user = response.json()[0]
        return AdminUser(**admin_user)

@app.put("/admin/me", response_model=AdminUser)
async def update_admin_info(admin_update: AdminUpdate, current_admin: dict = Depends(get_current_admin)):
    print(f"🔍 [ADMIN UPDATE] Starting update for admin_id: {current_admin['admin_id']}")
    print(f"🔍 [ADMIN UPDATE] Received data: {admin_update.dict()}")
    
    async with httpx.AsyncClient() as client:
        # Get current admin info
        print(f"🔍 [ADMIN UPDATE] Fetching current admin data...")
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/admin_users",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"
            },
            params={"id": f"eq.{current_admin['admin_id']}", "select": "*"}
        )
        
        print(f"🔍 [ADMIN UPDATE] Get response status: {response.status_code}")
        print(f"🔍 [ADMIN UPDATE] Get response text: {response.text}")
        
        if response.status_code != 200 or not response.json():
            print(f"❌ [ADMIN UPDATE] Failed to get current admin data")
            raise HTTPException(status_code=404, detail="Admin user not found")
        
        current_admin_data = response.json()[0]
        print(f"🔍 [ADMIN UPDATE] Current admin data: {current_admin_data}")
        
        update_data = {}
        
        # Update basic fields
        if admin_update.username is not None:
            update_data["username"] = admin_update.username
            print(f"🔍 [ADMIN UPDATE] Adding username update: {admin_update.username}")
        if admin_update.full_name is not None:
            update_data["full_name"] = admin_update.full_name
            print(f"🔍 [ADMIN UPDATE] Adding full_name update: {admin_update.full_name}")
        if admin_update.email is not None:
            update_data["email"] = admin_update.email
            print(f"🔍 [ADMIN UPDATE] Adding email update: {admin_update.email}")
        
        # Handle password change
        if admin_update.current_password and admin_update.new_password:
            print(f"🔍 [ADMIN UPDATE] Password change requested")
            print(f"🔍 [ADMIN UPDATE] Current password provided: {bool(admin_update.current_password)}")
            print(f"🔍 [ADMIN UPDATE] New password provided: {bool(admin_update.new_password)}")
            
            # Verify current password
            print(f"🔍 [ADMIN UPDATE] Verifying current password...")
            password_valid = verify_password(admin_update.current_password, current_admin_data["password_hash"])
            print(f"🔍 [ADMIN UPDATE] Password verification result: {password_valid}")
            
            if not password_valid:
                print(f"❌ [ADMIN UPDATE] Current password verification failed")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Current password is incorrect"
                )
            
            # Hash new password
            print(f"🔍 [ADMIN UPDATE] Hashing new password...")
            hashed_password = hash_password(admin_update.new_password)
            update_data["password_hash"] = hashed_password
            print(f"🔍 [ADMIN UPDATE] New password hashed successfully")
        
        print(f"🔍 [ADMIN UPDATE] Final update_data: {update_data}")
        
        if not update_data:
            print(f"🔍 [ADMIN UPDATE] No fields to update")
            # Return current admin data if no updates
            return AdminUser(**current_admin_data)
        
        # Update admin user
        print(f"🔍 [ADMIN UPDATE] Sending PATCH request to update admin...")
        update_response = await client.patch(
            f"{SUPABASE_URL}/rest/v1/admin_users?id=eq.{current_admin['admin_id']}",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                "Content-Type": "application/json"
            },
            json=update_data
        )
        
        print(f"🔍 [ADMIN UPDATE] PATCH response status: {update_response.status_code}")
        print(f"🔍 [ADMIN UPDATE] PATCH response text: {update_response.text}")
        
        if update_response.status_code not in [200, 204]:
            print(f"❌ [ADMIN UPDATE] Failed to update admin information")
            raise HTTPException(status_code=500, detail=f"Failed to update admin information: {update_response.text}")
        
        print(f"✅ [ADMIN UPDATE] Admin update successful (status: {update_response.status_code})")
        
        # Return updated admin info
        print(f"🔍 [ADMIN UPDATE] Fetching updated admin data...")
        updated_response = await client.get(
            f"{SUPABASE_URL}/rest/v1/admin_users",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"
            },
            params={"id": f"eq.{current_admin['admin_id']}", "select": "*"}
        )
        
        print(f"🔍 [ADMIN UPDATE] Updated response status: {updated_response.status_code}")
        print(f"🔍 [ADMIN UPDATE] Updated response text: {updated_response.text}")
        
        if updated_response.status_code != 200 or not updated_response.json():
            print(f"❌ [ADMIN UPDATE] Failed to get updated admin data")
            raise HTTPException(status_code=500, detail="Failed to retrieve updated admin information")
        
        updated_admin = updated_response.json()[0]
        print(f"✅ [ADMIN UPDATE] Successfully updated admin information")
        return AdminUser(**updated_admin)

# Create a pending request (new provider application)
@app.post("/pending-requests/", response_model=PendingRequestOut)
async def create_pending_request(request: PendingRequestIn):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SUPABASE_URL}/rest/v1/pending_requests",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },
            json=request.dict()
        )
        if response.status_code not in (200, 201):
            raise HTTPException(status_code=500, detail=response.text)
        return response.json()[0]

# Get all pending requests (for admin panel)
@app.get("/pending-requests/", response_model=List[PendingRequestOut])
async def get_pending_requests(current_admin: dict = Depends(get_current_admin)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/pending_requests",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"
            },
            params={"select": "*", "order": "created_at.desc"}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=response.text)
        return response.json()

# Get a specific pending request
@app.get("/pending-requests/{request_id}", response_model=PendingRequestOut)
async def get_pending_request(request_id: str = Path(..., description="Request UUID"), current_admin: dict = Depends(get_current_admin)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/pending_requests",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"
            },
            params={"id": f"eq.{request_id}", "select": "*"}
        )
        if response.status_code != 200 or not response.json():
            raise HTTPException(status_code=404, detail="Pending request not found")
        return response.json()[0]

# Update pending request status (approve/reject)
@app.patch("/pending-requests/{request_id}", response_model=PendingRequestOut)
async def update_pending_request(request_id: str, status_update: dict, current_admin: dict = Depends(get_current_admin)):
    async with httpx.AsyncClient() as client:
        # First, get the pending request details
        get_response = await client.get(
            f"{SUPABASE_URL}/rest/v1/pending_requests",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"
            },
            params={"id": f"eq.{request_id}", "select": "*"}
        )
        
        if get_response.status_code != 200 or not get_response.json():
            raise HTTPException(status_code=404, detail="Pending request not found")
        
        pending_request = get_response.json()[0]
        new_status = status_update.get("status")
        
        if new_status == "approved":
            # Create provider record
            provider_data = {
                "user_id": pending_request["user_id"],
                "name": f"{pending_request['first_name']} {pending_request['last_name']}",
                "service_category": ",".join(pending_request["service_category"]),
                "bio": pending_request.get("bio", ""),
                "experience": pending_request.get("experience", ""),
                "location": pending_request.get("location", ""),
                "profile_image": pending_request.get("profile_image_url", ""),
                "cnic_front": pending_request.get("cnic_front_url"),
                "cnic_back": pending_request.get("cnic_back_url"),
                "is_verified": True,
                "jobs_pricing": pending_request.get("jobs_pricing", {})
            }
            
            # Insert into providers table
            provider_response = await client.post(
                f"{SUPABASE_URL}/rest/v1/providers",
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },
                json=provider_data
            )
            
            if provider_response.status_code not in (200, 201):
                raise HTTPException(status_code=500, detail="Failed to create provider record")
            
            # Delete the pending request after successful provider creation
            delete_response = await client.delete(
                f"{SUPABASE_URL}/rest/v1/pending_requests?id=eq.{request_id}",
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                    "Prefer": "return=representation"
                }
            )
            
            if delete_response.status_code != 200:
                raise HTTPException(status_code=500, detail="Failed to delete approved request")
            
            # Return the deleted request data
            return pending_request
            
        elif new_status == "rejected":
            # Delete uploaded documents from storage bucket
            documents_to_delete = []
            
            print(f"Original URLs:")
            print(f"Profile: {pending_request.get('profile_image_url')}")
            print(f"CNIC Front: {pending_request.get('cnic_front_url')}")
            print(f"CNIC Back: {pending_request.get('cnic_back_url')}")
            
            if pending_request.get("profile_image_url"):
                # Extract file path from URL - handle profile folder
                profile_url = pending_request["profile_image_url"]
                if "/provider-uploads/" in profile_url:
                    profile_path = profile_url.split("/provider-uploads/")[-1]
                    # Ensure it includes the profile/ folder
                    if not profile_path.startswith("profile/"):
                        profile_path = f"profile/{profile_path}"
                    documents_to_delete.append(profile_path)
                    print(f"Extracted profile path: {profile_path}")
            
            if pending_request.get("cnic_front_url"):
                # Extract file path from URL - handle cnic/front folder
                cnic_front_url = pending_request["cnic_front_url"]
                if "/provider-uploads/" in cnic_front_url:
                    cnic_front_path = cnic_front_url.split("/provider-uploads/")[-1]
                    # Ensure it includes the cnic/front/ folder
                    if not cnic_front_path.startswith("cnic/front/"):
                        cnic_front_path = f"cnic/front/{cnic_front_path}"
                    documents_to_delete.append(cnic_front_path)
                    print(f"Extracted CNIC front path: {cnic_front_path}")
            
            if pending_request.get("cnic_back_url"):
                # Extract file path from URL - handle cnic/back folder
                cnic_back_url = pending_request["cnic_back_url"]
                if "/provider-uploads/" in cnic_back_url:
                    cnic_back_path = cnic_back_url.split("/provider-uploads/")[-1]
                    # Ensure it includes the cnic/back/ folder
                    if not cnic_back_path.startswith("cnic/back/"):
                        cnic_back_path = f"cnic/back/{cnic_back_path}"
                    documents_to_delete.append(cnic_back_path)
                    print(f"Extracted CNIC back path: {cnic_back_path}")
            
            # Delete documents from storage
            print(f"Attempting to delete {len(documents_to_delete)} documents: {documents_to_delete}")
            
            if not documents_to_delete:
                print("No documents to delete - URLs might be empty or malformed")
            
            for document_path in documents_to_delete:
                try:
                    delete_url = f"{SUPABASE_URL}/storage/v1/object/provider-uploads/{document_path}"
                    print(f"Deleting document: {delete_url}")
                    print(f"Document path: {document_path}")
                    
                    storage_response = await client.delete(
                        delete_url,
                        headers={
                            "apikey": SUPABASE_SERVICE_KEY,
                            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"
                        }
                    )
                    
                    print(f"Delete response status: {storage_response.status_code}")
                    print(f"Delete response text: {storage_response.text}")
                    
                    # Don't fail if document doesn't exist or can't be deleted
                    if storage_response.status_code == 200:
                        print(f"✅ Successfully deleted document: {document_path}")
                    elif storage_response.status_code == 204:
                        print(f"✅ Successfully deleted document: {document_path}")
                    elif storage_response.status_code == 404:
                        print(f"⚠️ Document not found (already deleted?): {document_path}")
                    else:
                        print(f"❌ Failed to delete document {document_path}")
                        print(f"Status: {storage_response.status_code}")
                        print(f"Response: {storage_response.text}")
                except Exception as e:
                    print(f"❌ Exception while deleting document {document_path}: {str(e)}")
                    print(f"Exception type: {type(e).__name__}")
            
            # Delete the pending request
            delete_response = await client.delete(
                f"{SUPABASE_URL}/rest/v1/pending_requests?id=eq.{request_id}",
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                    "Prefer": "return=representation"
                }
            )
            
            if delete_response.status_code != 200:
                raise HTTPException(status_code=404, detail="Failed to delete rejected request")
            
            # Return the deleted request data
            return pending_request
            
        else:
            # For other status updates (like under_review), just update the status
            response = await client.patch(
                f"{SUPABASE_URL}/rest/v1/pending_requests?id=eq.{request_id}",
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },
                json=status_update
            )
            
            if response.status_code != 200 or not response.json():
                raise HTTPException(status_code=404, detail="Failed to update pending request status")
            
            return response.json()[0]

# Create a provider (existing endpoint for when admin approves)
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
async def get_providers(current_admin: dict = Depends(get_current_admin)):
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