-- Payment System Migration
-- Add payment method column to bookings table

-- Add payment_method column to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'cash_on_delivery' 
CHECK (payment_method IN ('cash_on_delivery', 'visa_debit_card', 'easypaisa'));

-- Add payment_method_name column for display purposes
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_method_name VARCHAR(100) DEFAULT 'Cash on Delivery';

-- Update existing bookings to have default payment method
UPDATE bookings 
SET 
    payment_method = 'cash_on_delivery',
    payment_method_name = 'Cash on Delivery'
WHERE payment_method IS NULL;

-- Add index for payment method queries
CREATE INDEX IF NOT EXISTS idx_bookings_payment_method ON bookings(payment_method);

-- Add index for payment status queries
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);

-- Create a view for payment analytics
CREATE OR REPLACE VIEW booking_payment_analytics AS
SELECT 
    payment_method,
    payment_method_name,
    payment_status,
    COUNT(*) as booking_count,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as average_booking_value
FROM bookings
GROUP BY payment_method, payment_method_name, payment_status
ORDER BY payment_method, payment_status;

-- Add comments for documentation
COMMENT ON COLUMN bookings.payment_method IS 'Payment method used for the booking (cash_on_delivery, visa_debit_card, easypaisa)';
COMMENT ON COLUMN bookings.payment_method_name IS 'Human-readable payment method name for display';
COMMENT ON COLUMN bookings.payment_status IS 'Payment status (pending, paid, failed, refunded)';

-- Print success message
DO $$
BEGIN
    RAISE NOTICE 'Payment system migration completed successfully!';
    RAISE NOTICE 'Added payment_method and payment_method_name columns to bookings table';
    RAISE NOTICE 'Created payment analytics view';
    RAISE NOTICE 'Added performance indexes for payment queries';
END $$; 