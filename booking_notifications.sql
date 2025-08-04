-- Booking Notifications Table
-- This table will store notifications for booking status changes

CREATE TABLE IF NOT EXISTS booking_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('booking_confirmed', 'booking_rejected', 'booking_completed', 'booking_cancelled')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_booking_notifications_user_id ON booking_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_notifications_provider_id ON booking_notifications(provider_id);
CREATE INDEX IF NOT EXISTS idx_booking_notifications_booking_id ON booking_notifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_notifications_is_read ON booking_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_booking_notifications_created_at ON booking_notifications(created_at);

-- Row Level Security
ALTER TABLE booking_notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications" ON booking_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Providers can view notifications for their bookings" ON booking_notifications
  FOR SELECT USING (auth.uid() = provider_id);

-- Function to create booking notification
CREATE OR REPLACE FUNCTION create_booking_notification(
  p_user_id UUID,
  p_provider_id UUID,
  p_booking_id UUID,
  p_notification_type TEXT,
  p_title TEXT,
  p_message TEXT
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO booking_notifications (
    user_id,
    provider_id,
    booking_id,
    notification_type,
    title,
    message
  ) VALUES (
    p_user_id,
    p_provider_id,
    p_booking_id,
    p_notification_type,
    p_title,
    p_message
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql; 