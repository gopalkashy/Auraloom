ALTER TABLE products ADD COLUMN discount_percentage integer DEFAULT 0;
ALTER TABLE products ADD CONSTRAINT discount_range CHECK (discount_percentage >= 0 AND discount_percentage <= 90);