-- Add 'proposal' status to booking_status enum for distinguishing offers from confirmed bookings
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'proposal';