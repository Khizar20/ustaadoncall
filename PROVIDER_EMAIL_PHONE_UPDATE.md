# Provider Email and Phone Update

## Issue
The `providers` table is missing `email` and `phone` columns, but the `pending_requests` table has these fields. When a provider application is approved, the email and phone data from `pending_requests` should be transferred to the `providers` table.

## Changes Made

### 1. Database Schema Update
Run this SQL query in Supabase to add the missing columns:

```sql
-- Add email and phone columns to the providers table
ALTER TABLE providers 
ADD COLUMN email VARCHAR,
ADD COLUMN phone VARCHAR;

-- Add comments to describe the columns
COMMENT ON COLUMN providers.email IS 'Provider email address';
COMMENT ON COLUMN providers.phone IS 'Provider phone number';
```

### 2. Backend Updates (backend/main.py)

#### Updated ProviderIn Model
Added `email` and `phone` fields to the `ProviderIn` model:
```python
class ProviderIn(BaseModel):
    user_id: str
    name: str
    service_category: str
    bio: Optional[str] = ""
    experience: Optional[str] = ""
    location: Optional[str] = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    profile_image: Optional[str] = ""
    cnic_front: Optional[str] = None
    cnic_back: Optional[str] = None
    is_verified: Optional[bool] = False
    jobs_pricing: Optional[dict] = None
    email: Optional[str] = None
    phone: Optional[str] = None
```

#### Updated Provider Creation Data
Modified the provider creation data in the approval process to include email and phone:
```python
provider_data = {
    "user_id": user_id,
    "name": f"{pending_request['first_name']} {pending_request['last_name']}",
    "service_category": ",".join(pending_request["service_category"]),
    "bio": pending_request.get("bio", ""),
    "experience": pending_request.get("experience", ""),
    "location": pending_request.get("location", ""),
    "latitude": pending_request.get("latitude"),
    "longitude": pending_request.get("longitude"),
    "profile_image": pending_request.get("profile_image_url", ""),
    "cnic_front": pending_request.get("cnic_front_url"),
    "cnic_back": pending_request.get("cnic_back_url"),
    "is_verified": True,
    "jobs_pricing": pending_request.get("jobs_pricing", {}),
    "rating": 0,
    "reviews_count": 0,
    "email": pending_request.get("email"),
    "phone": pending_request.get("phone")
}
```

### 3. Frontend Updates

#### AdminPanel.tsx
Updated the `Provider` interface to include email and phone fields:
```typescript
interface Provider {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  service_category: string;
  bio: string;
  experience: string;
  location: string;
  profile_image: string;
  cnic_front: string;
  cnic_back: string;
  is_verified: boolean;
  rating: number;
  reviews_count: number;
  jobs_pricing: Record<string, any[]>;
  created_at: string;
}
```

#### ProviderDashboard.tsx
The `ProviderInfo` interface already included email and phone fields, so no changes were needed.

## How the Approval Process Works

1. **Provider Application**: User fills out the form in `BecomeProvider.tsx` which includes email and phone fields
2. **Data Storage**: Application data is stored in `pending_requests` table with email and phone
3. **Admin Review**: Admin reviews the application in `AdminPanel.tsx`
4. **Approval Process**: When approved, the backend:
   - Creates a user profile in the `users` table
   - Transfers data from `pending_requests` to `providers` table (now including email and phone)
   - Sends approval email with login credentials
   - Deletes the pending request

## Testing

1. Run the SQL query to add the columns
2. Submit a new provider application with email and phone
3. Approve the application through the admin panel
4. Verify that the provider record in the `providers` table includes the email and phone fields

## Current Status
- ✅ Backend model updated
- ✅ Provider creation data updated
- ✅ Frontend interfaces updated
- ⏳ Database schema update needed (run SQL query)
- ⏳ Testing needed after schema update 