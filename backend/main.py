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
    user_id: Optional[str] = None  # Made optional since backend will create user
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

class PendingRequestOutWithEmail(PendingRequestOut):
    email_data: Optional[dict] = None

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
    try:
        print(f"=== PENDING REQUEST CREATION START ===")
        print(f"Request data: {request.dict()}")
        print(f"SUPABASE_URL: {SUPABASE_URL}")
        print(f"SUPABASE_SERVICE_KEY: {SUPABASE_SERVICE_KEY[:20]}..." if SUPABASE_SERVICE_KEY else "NOT SET")
        
        async with httpx.AsyncClient() as client:
            # Check if user already exists in Supabase Auth
            print(f"Checking if user exists with email: {request.email}")
            
            # Try to get existing user
            print(f"Making request to: {SUPABASE_URL}/auth/v1/admin/users")
            print(f"With params: filter=email.eq.{request.email}")
            
            existing_user_response = await client.get(
                f"{SUPABASE_URL}/auth/v1/admin/users",
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"
                },
                params={"filter": f"email.eq.{request.email}"}
            )
            
            print(f"Existing user response status: {existing_user_response.status_code}")
            print(f"Existing user response headers: {existing_user_response.headers}")
            print(f"Existing user response text: {existing_user_response.text}")
            
            user_id = None
            
            if existing_user_response.status_code == 200:
                response_data = existing_user_response.json()
                print(f"Response data: {response_data}")
                
                # Handle the correct response structure: {"users":[],"aud":"authenticated"}
                existing_users = response_data.get("users", [])
                print(f"Existing users: {existing_users}")
                print(f"Existing users type: {type(existing_users)}")
                print(f"Existing users length: {len(existing_users)}")
                
                if existing_users and len(existing_users) > 0:
                    # User already exists
                    user_id = existing_users[0]["id"]
                    print(f"✅ User already exists in Supabase Auth with ID: {user_id}")
                else:
                    # User doesn't exist, try to create new user
                    print(f"User not found in query, attempting to create new user...")
                    
                    import secrets
                    import string
                    temp_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
                    
                    user_data = {
                        "email": request.email,
                        "password": temp_password,
                        "email_confirm": True
                    }
                    
                    print(f"Creating new Supabase user with email: {request.email}")
                    
                    # Create user in Supabase Auth
                    auth_response = await client.post(
                        f"{SUPABASE_URL}/auth/v1/admin/users",
                        headers={
                            "apikey": SUPABASE_SERVICE_KEY,
                            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                            "Content-Type": "application/json"
                        },
                        json=user_data
                    )
                    
                    print(f"Auth response status: {auth_response.status_code}")
                    print(f"Auth response: {auth_response.text}")
                    
                    if auth_response.status_code == 422 and "email_exists" in auth_response.text:
                        # User already exists but wasn't found by query
                        print(f"User exists but wasn't found by query, using email to get user ID...")
                        
                        # Since the user exists, we can use the email to get their ID
                        # We'll use a different query approach
                        try:
                            # Try to get user by email with a different query
                            user_query_response = await client.get(
                                f"{SUPABASE_URL}/auth/v1/admin/users",
                                headers={
                                    "apikey": SUPABASE_SERVICE_KEY,
                                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"
                                },
                                params={"email": request.email}
                            )
                            
                            print(f"User query response: {user_query_response.text}")
                            
                            if user_query_response.status_code == 200:
                                user_data = user_query_response.json()
                                if user_data.get("users") and len(user_data["users"]) > 0:
                                    user_id = user_data["users"][0]["id"]
                                    print(f"✅ Found existing user with ID: {user_id}")
                                else:
                                    # If we still can't find the user, we'll need to handle this case
                                    print(f"⚠️ User exists but can't be found by query, proceeding with new user creation...")
                                    # For now, we'll skip this user and create a new one
                                    user_id = None
                            else:
                                print(f"⚠️ Failed to query user, proceeding with new user creation...")
                                user_id = None
                                
                        except Exception as e:
                            print(f"Error in user query: {str(e)}")
                            user_id = None
                    
                    elif auth_response.status_code not in (200, 201):
                        print(f"ERROR: Failed to create Supabase user")
                        print(f"Error response: {auth_response.text}")
                        raise HTTPException(status_code=500, detail=f"Failed to create user account: {auth_response.text}")
                    else:
                        auth_user = auth_response.json()
                        user_id = auth_user["id"]
                        print(f"✅ Created new Supabase user with ID: {user_id}")
            else:
                print(f"ERROR: Failed to check existing user")
                print(f"Error response: {existing_user_response.text}")
                # Fallback: try to create user anyway
                print(f"Falling back to create new user...")
                
                import secrets
                import string
                temp_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
                
                user_data = {
                    "email": request.email,
                    "password": temp_password,
                    "email_confirm": True
                }
                
                print(f"Creating new Supabase user with email: {request.email}")
                
                # Create user in Supabase Auth
                auth_response = await client.post(
                    f"{SUPABASE_URL}/auth/v1/admin/users",
                    headers={
                        "apikey": SUPABASE_SERVICE_KEY,
                        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                        "Content-Type": "application/json"
                    },
                    json=user_data
                )
                
                print(f"Auth response status: {auth_response.status_code}")
                print(f"Auth response: {auth_response.text}")
                
                if auth_response.status_code not in (200, 201):
                    print(f"ERROR: Failed to create Supabase user")
                    print(f"Error response: {auth_response.text}")
                    raise HTTPException(status_code=500, detail=f"Failed to create user account: {auth_response.text}")
                
                auth_user = auth_response.json()
                user_id = auth_user["id"]
                print(f"✅ Created new Supabase user with ID: {user_id}")
            
            if not user_id:
                print(f"⚠️ Could not get or create user ID, proceeding without user_id for now...")
                # We'll proceed without user_id and let the admin handle it later
                user_id = None
            
            # Now create the pending request with the real user_id
            request_data = request.dict()
            request_data["user_id"] = user_id
            print(f"Request data to send: {request_data}")
            
            # Make the request to Supabase
            response = await client.post(
                f"{SUPABASE_URL}/rest/v1/pending_requests",
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },
                json=request_data
            )
            
            print(f"Response status: {response.status_code}")
            print(f"Response headers: {response.headers}")
            print(f"Response text: {response.text}")
            
            if response.status_code not in (200, 201):
                print(f"ERROR: Supabase returned status {response.status_code}")
                print(f"Error response: {response.text}")
                raise HTTPException(status_code=500, detail=f"Supabase error: {response.text}")
            
            result = response.json()[0]
            print(f"Successfully created pending request: {result}")
            print(f"=== PENDING REQUEST CREATION END ===")
            return result
            
    except Exception as e:
        print(f"EXCEPTION in create_pending_request: {str(e)}")
        print(f"Exception type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

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
@app.patch("/pending-requests/{request_id}", response_model=PendingRequestOutWithEmail)
async def update_pending_request(request_id: str, status_update: dict, current_admin: dict = Depends(get_current_admin)):
    try:
        print(f"=== APPROVAL PROCESS START ===")
        print(f"Request ID: {request_id}")
        print(f"Status Update: {status_update}")
        print(f"Admin: {current_admin}")
        
        async with httpx.AsyncClient() as client:
            # First, get the pending request details
            print(f"Fetching pending request details...")
            get_response = await client.get(
                f"{SUPABASE_URL}/rest/v1/pending_requests",
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"
                },
                params={"id": f"eq.{request_id}", "select": "*"}
            )
            
            print(f"Get response status: {get_response.status_code}")
            print(f"Get response: {get_response.text}")
            
            if get_response.status_code != 200 or not get_response.json():
                print(f"ERROR: Pending request not found")
                raise HTTPException(status_code=404, detail="Pending request not found")
            
            pending_request = get_response.json()[0]
            print(f"Found pending request: {pending_request}")
            
            new_status = status_update.get("status")
            print(f"New status: {new_status}")
        
            if new_status == "approved":
                print(f"Processing approval for request...")
                
                # Generate one-time password
                import secrets
                import string
                one_time_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
                print(f"Generated password: {one_time_password}")
                
                # Use existing user_id from pending request instead of creating new user
                user_id = pending_request["user_id"]
                print(f"Using existing user ID: {user_id}")
                
                # Update the existing user's password
                user_data = {
                    "password": one_time_password
                }
                
                print(f"Updating user password for user ID: {user_id}")
                
                # Update user password in Supabase Auth
                auth_response = await client.put(
                    f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}",
                    headers={
                        "apikey": SUPABASE_SERVICE_KEY,
                        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                        "Content-Type": "application/json"
                    },
                    json=user_data
                )
                
                print(f"Auth response status: {auth_response.status_code}")
                print(f"Auth response: {auth_response.text}")
                
                if auth_response.status_code not in (200, 201):
                    print(f"ERROR: Failed to update user password")
                    raise HTTPException(status_code=500, detail="Failed to update user password")
                
                print(f"Successfully updated password for user ID: {user_id}")
                
                # Check if user profile exists in users table, create if not
                print(f"Checking if user profile exists in users table...")
                user_profile_response = await client.get(
                    f"{SUPABASE_URL}/rest/v1/users",
                    headers={
                        "apikey": SUPABASE_SERVICE_KEY,
                        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"
                    },
                    params={"id": f"eq.{user_id}", "select": "*"}
                )
                
                if user_profile_response.status_code == 200:
                    existing_user = user_profile_response.json()
                    if not existing_user:
                        # Create user profile in users table
                        print(f"Creating user profile in users table...")
                        user_profile_data = {
                            "id": user_id,
                            "email": pending_request["email"],
                            "name": f"{pending_request['first_name']} {pending_request['last_name']}",
                            "phone": pending_request["phone"],
                            "address": pending_request.get("location", ""),
                            "addresses": [{"label": "Home", "address": pending_request.get("location", ""), "is_default": True}],
                            "preferences": {"notifications": True, "sms_notifications": False},
                            "created_at": datetime.now().isoformat()
                        }
                        
                        user_insert_response = await client.post(
                            f"{SUPABASE_URL}/rest/v1/users",
                            headers={
                                "apikey": SUPABASE_SERVICE_KEY,
                                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                                "Content-Type": "application/json",
                                "Prefer": "return=representation"
                            },
                            json=user_profile_data
                        )
                        
                        if user_insert_response.status_code in (200, 201):
                            print(f"✅ Created user profile in users table")
                        else:
                            print(f"⚠️ Failed to create user profile: {user_insert_response.text}")
                    else:
                        print(f"✅ User profile already exists in users table")
                
                # Create provider record
                provider_data = {
                    "user_id": user_id,
                    "name": f"{pending_request['first_name']} {pending_request['last_name']}",
                    "service_category": ",".join(pending_request["service_category"]),
                    "bio": pending_request.get("bio", ""),
                    "experience": pending_request.get("experience", ""),
                    "location": pending_request.get("location", ""),
                    "profile_image": pending_request.get("profile_image_url", ""),
                    "cnic_front": pending_request.get("cnic_front_url"),
                    "cnic_back": pending_request.get("cnic_back_url"),
                    "is_verified": True,
                    "jobs_pricing": pending_request.get("jobs_pricing", {}),
                    "rating": 0,
                    "reviews_count": 0
                }
                
                print(f"Creating provider with data: {provider_data}")
                
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
                
                print(f"Provider response status: {provider_response.status_code}")
                print(f"Provider response: {provider_response.text}")
                
                if provider_response.status_code not in (200, 201):
                    print(f"ERROR: Failed to create provider record")
                    raise HTTPException(status_code=500, detail="Failed to create provider record")
                
                # Send approval email with credentials
                email_data = {
                    "provider_name": f"{pending_request['first_name']} {pending_request['last_name']}",
                    "provider_email": pending_request["email"],
                    "one_time_password": one_time_password,
                    "login_url": "http://localhost:8080/provider-login",
                    "service_category": ",".join(pending_request["service_category"])
                }
                
                print(f"Email data prepared: {email_data}")
                
                # Call email service (this will be handled by frontend)
                # For now, we'll return the email data to be sent from frontend
                pending_request["email_data"] = email_data
                
                # Delete the pending request after successful provider creation
                print(f"Deleting pending request...")
                delete_response = await client.delete(
                    f"{SUPABASE_URL}/rest/v1/pending_requests?id=eq.{request_id}",
                    headers={
                        "apikey": SUPABASE_SERVICE_KEY,
                        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                        "Prefer": "return=representation"
                    }
                )
                
                print(f"Delete response status: {delete_response.status_code}")
                print(f"Delete response: {delete_response.text}")
                
                if delete_response.status_code != 200:
                    print(f"ERROR: Failed to delete approved request")
                    raise HTTPException(status_code=500, detail="Failed to delete approved request")
                
                print(f"=== APPROVAL PROCESS SUCCESSFUL ===")
                # Create response with email data
                response_data = {
                    **pending_request,
                    "email_data": email_data
                }
                print(f"Returning response with email_data: {response_data}")
                return response_data
                
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
            
    except Exception as e:
        print(f"EXCEPTION in update_pending_request: {str(e)}")
        print(f"Exception type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

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