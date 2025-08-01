-- =====================================================
-- LIVE REQUEST BIDDING SYSTEM - DATABASE SCHEMA
-- =====================================================

-- 1. Live service requests table
CREATE TABLE IF NOT EXISTS live_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_category TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_description TEXT NOT NULL,
  urgency_level TEXT NOT NULL CHECK (urgency_level IN ('low', 'medium', 'high', 'urgent')),
  preferred_location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  budget_range_min DECIMAL(10,2),
  budget_range_max DECIMAL(10,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'bidding_closed', 'assigned', 'completed', 'cancelled')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Provider bids on live requests
CREATE TABLE IF NOT EXISTS request_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES live_requests(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  bid_amount DECIMAL(10,2) NOT NULL,
  estimated_time TEXT NOT NULL, -- "2-3 hours", "same day", "next day", etc.
  message TEXT, -- provider's pitch/description
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one bid per provider per request
  UNIQUE(request_id, provider_id)
);

-- 3. Real-time notifications for providers
CREATE TABLE IF NOT EXISTS provider_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  request_id UUID REFERENCES live_requests(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('new_request', 'bid_accepted', 'bid_rejected', 'request_cancelled', 'request_completed')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User notifications for request updates
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id UUID REFERENCES live_requests(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('new_bid', 'bid_accepted', 'request_expired', 'provider_assigned')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Live requests indexes
CREATE INDEX IF NOT EXISTS idx_live_requests_user_id ON live_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_live_requests_status ON live_requests(status);
CREATE INDEX IF NOT EXISTS idx_live_requests_service_category ON live_requests(service_category);
CREATE INDEX IF NOT EXISTS idx_live_requests_location ON live_requests(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_live_requests_created_at ON live_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_live_requests_expires_at ON live_requests(expires_at);

-- Request bids indexes
CREATE INDEX IF NOT EXISTS idx_request_bids_request_id ON request_bids(request_id);
CREATE INDEX IF NOT EXISTS idx_request_bids_provider_id ON request_bids(provider_id);
CREATE INDEX IF NOT EXISTS idx_request_bids_status ON request_bids(status);
CREATE INDEX IF NOT EXISTS idx_request_bids_created_at ON request_bids(created_at);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_provider_notifications_provider_id ON provider_notifications(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_notifications_is_read ON provider_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);

-- =====================================================
-- FUNCTIONS FOR DISTANCE CALCULATION
-- =====================================================

-- Function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DOUBLE PRECISION,
    lon1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lon2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
BEGIN
    RETURN (
        6371 * acos(
            cos(radians(lat1)) * 
            cos(radians(lat2)) * 
            cos(radians(lon2) - radians(lon1)) + 
            sin(radians(lat1)) * 
            sin(radians(lat2))
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Function to find nearby live requests
CREATE OR REPLACE FUNCTION get_nearby_live_requests(
    user_lat DOUBLE PRECISION,
    user_lon DOUBLE PRECISION,
    radius_km DOUBLE PRECISION DEFAULT 10.0,
    service_category_filter TEXT DEFAULT NULL
) RETURNS TABLE(
    id UUID,
    user_id UUID,
    service_category TEXT,
    job_title TEXT,
    job_description TEXT,
    urgency_level TEXT,
    preferred_location TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    budget_range_min DECIMAL,
    budget_range_max DECIMAL,
    status TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    distance DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lr.id,
        lr.user_id,
        lr.service_category,
        lr.job_title,
        lr.job_description,
        lr.urgency_level,
        lr.preferred_location,
        lr.latitude,
        lr.longitude,
        lr.budget_range_min,
        lr.budget_range_max,
        lr.status,
        lr.expires_at,
        lr.created_at,
        calculate_distance(user_lat, user_lon, lr.latitude, lr.longitude) as distance
    FROM live_requests lr
    WHERE 
        lr.status = 'active' 
        AND lr.latitude IS NOT NULL 
        AND lr.longitude IS NOT NULL
        AND calculate_distance(user_lat, user_lon, lr.latitude, lr.longitude) <= radius_km
        AND (service_category_filter IS NULL OR lr.service_category = service_category_filter)
        AND (lr.expires_at IS NULL OR lr.expires_at > NOW())
    ORDER BY 
        CASE lr.urgency_level
            WHEN 'urgent' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
        END,
        distance ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables
CREATE TRIGGER update_live_requests_updated_at 
    BEFORE UPDATE ON live_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_request_bids_updated_at 
    BEFORE UPDATE ON request_bids 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE live_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Live requests policies
CREATE POLICY "Users can view their own requests" ON live_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own requests" ON live_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests" ON live_requests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Providers can view active requests" ON live_requests
    FOR SELECT USING (status = 'active');

-- Request bids policies
CREATE POLICY "Users can view bids on their requests" ON request_bids
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM live_requests 
            WHERE id = request_bids.request_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Providers can view their own bids" ON request_bids
    FOR SELECT USING (provider_id = auth.uid());

CREATE POLICY "Providers can insert their own bids" ON request_bids
    FOR INSERT WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Providers can update their own bids" ON request_bids
    FOR UPDATE USING (provider_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON user_notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Providers can view their own notifications" ON provider_notifications
    FOR SELECT USING (provider_id = auth.uid());

-- =====================================================
-- SAMPLE DATA FOR TESTING (OPTIONAL)
-- =====================================================

-- Insert sample live requests (uncomment to test)
/*
INSERT INTO live_requests (
    user_id,
    service_category,
    job_title,
    job_description,
    urgency_level,
    preferred_location,
    latitude,
    longitude,
    budget_range_min,
    budget_range_max,
    expires_at
) VALUES 
(
    'your-user-id-here',
    'plumbing',
    'Urgent Pipe Leak Repair',
    'Water pipe is leaking in kitchen, need immediate repair',
    'urgent',
    'Karachi, Pakistan',
    24.8607,
    67.0011,
    500.00,
    1500.00,
    NOW() + INTERVAL '2 hours'
),
(
    'your-user-id-here',
    'electrical',
    'Switch Installation',
    'Need new electrical switches installed in living room',
    'medium',
    'Lahore, Pakistan',
    31.5204,
    74.3587,
    300.00,
    800.00,
    NOW() + INTERVAL '24 hours'
);
*/

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for request details with bid count
CREATE OR REPLACE VIEW live_requests_with_bid_count AS
SELECT 
    lr.*,
    COUNT(rb.id) as bid_count,
    MIN(rb.bid_amount) as lowest_bid,
    MAX(rb.bid_amount) as highest_bid
FROM live_requests lr
LEFT JOIN request_bids rb ON lr.id = rb.request_id AND rb.status = 'pending'
GROUP BY lr.id;

-- View for provider dashboard with their bids
CREATE OR REPLACE VIEW provider_bids_summary AS
SELECT 
    rb.id as bid_id,
    rb.request_id,
    rb.bid_amount,
    rb.estimated_time,
    rb.status as bid_status,
    rb.created_at as bid_created_at,
    lr.job_title,
    lr.job_description,
    lr.urgency_level,
    lr.budget_range_min,
    lr.budget_range_max,
    lr.status as request_status,
    lr.created_at as request_created_at
FROM request_bids rb
JOIN live_requests lr ON rb.request_id = lr.id
WHERE rb.provider_id = auth.uid();

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- This schema creates a complete live request bidding system
-- with proper indexing, security policies, and helper functions
-- You can now implement the frontend components to use these tables 