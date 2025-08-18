-- Sample data for testing consumer functionality

-- Insert sample coupons
INSERT INTO coupons_store (product_name, product_image, shop_logo, shop_name, points_cost, original_price, discounted_price, expiry_date, category, distance, rating, description) VALUES
('Pizza Margherita', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100', 'Pizza Palace', 50, 299.00, 199.00, '2025-02-15', 'Food', '0.5 km', 4.5, 'Delicious Margherita pizza with fresh mozzarella and basil'),
('Coffee & Pastry', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100', 'Café Central', 30, 150.00, 99.00, '2025-02-10', 'Food', '0.8 km', 4.2, 'Premium coffee with a fresh pastry of your choice'),
('Movie Ticket', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100', 'CineMax', 100, 500.00, 350.00, '2025-02-20', 'Entertainment', '1.2 km', 4.7, 'Watch any movie of your choice'),
('Gym Session', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100', 'FitLife Gym', 75, 400.00, 250.00, '2025-02-25', 'Health', '1.5 km', 4.3, 'Full day access to gym facilities'),
('Book Store Voucher', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=100', 'Readers Corner', 40, 200.00, 150.00, '2025-02-12', 'Lifestyle', '0.9 km', 4.1, 'Get any book of your choice');

-- Insert sample locations
INSERT INTO locations (type, name, address, pincode, latitude, longitude, fill_level, distance, status, rating) VALUES
('bin', 'Smart Bin - Central Park', 'Central Park, Main Street', '380001', 23.0258, 72.5873, 65, '0.3 km', 'active', NULL),
('bin', 'Smart Bin - Mall Entrance', 'City Mall, Shopping District', '380002', 23.0268, 72.5883, 85, '0.7 km', 'active', NULL),
('bin', 'Smart Bin - Metro Station', 'Metro Station, Transport Hub', '380003', 23.0278, 72.5893, 45, '1.1 km', 'active', NULL),
('partner', 'Pizza Palace', '123 Food Street, Downtown', '380001', 23.0288, 72.5903, NULL, '0.5 km', 'active', 4.5),
('partner', 'Café Central', '456 Coffee Lane, Midtown', '380002', 23.0298, 72.5913, NULL, '0.8 km', 'active', 4.2),
('partner', 'CineMax', '789 Entertainment Blvd, Uptown', '380003', 23.0308, 72.5923, NULL, '1.2 km', 'active', 4.7);

-- Insert sample advertisements
INSERT INTO advertisements (title, description, duration, points, advertiser, category, thumbnail, video_url) VALUES
('Eco-Friendly Products', 'Discover our range of sustainable products that help protect the environment', 30, 5, 'GreenLife', 'Lifestyle', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', 'https://example.com/video1.mp4'),
('Healthy Living Tips', 'Learn simple ways to lead a healthier lifestyle', 45, 8, 'HealthFirst', 'Health', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', 'https://example.com/video2.mp4'),
('Local Business Spotlight', 'Support local businesses in your community', 25, 3, 'LocalBiz', 'Business', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400', 'https://example.com/video3.mp4'),
('Recycling Guide', 'Master the art of proper recycling', 35, 6, 'RecycleNow', 'Education', 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400', 'https://example.com/video4.mp4'),
('Sustainable Fashion', 'Explore eco-friendly fashion choices', 40, 7, 'EcoFashion', 'Fashion', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400', 'https://example.com/video5.mp4');
