-- Drop existing tables if they exist
DROP TABLE IF EXISTS pickup_tickets;
DROP TABLE IF EXISTS collectors;
DROP TABLE IF EXISTS waste_submissions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table first (since it's referenced by waste_submissions)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    provider TEXT,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create waste_submissions table
CREATE TABLE waste_submissions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    type TEXT NOT NULL,
    quality TEXT NOT NULL,
    points INTEGER NOT NULL,
    ai_confidence FLOAT NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    pickup_status TEXT DEFAULT 'PENDING',
    pickup_collector_id TEXT,
    pickup_location JSONB,
    CONSTRAINT valid_pickup_status CHECK (pickup_status IN ('PENDING', 'ASSIGNED', 'COMPLETED', 'CANCELLED'))
);

-- Create collectors table
CREATE TABLE collectors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'AVAILABLE',
    current_location JSONB,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT valid_status CHECK (status IN ('AVAILABLE', 'BUSY', 'OFFLINE'))
);

-- Create indexes
CREATE INDEX users_email_idx ON users(email);
CREATE INDEX idx_waste_submissions_user_id ON waste_submissions(user_id);
CREATE INDEX idx_waste_submissions_pickup_status ON waste_submissions(pickup_status);
CREATE INDEX idx_collectors_status ON collectors(status);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collectors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data"
    ON users
    FOR SELECT
    USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data"
    ON users
    FOR UPDATE
    USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view their own submissions"
    ON waste_submissions
    FOR SELECT
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own submissions"
    ON waste_submissions
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Collectors can view assigned submissions"
    ON waste_submissions
    FOR SELECT
    USING (pickup_collector_id = auth.uid()::text);

CREATE POLICY "Collectors can update their assigned submissions"
    ON waste_submissions
    FOR UPDATE
    USING (pickup_collector_id = auth.uid()::text);

-- Update storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('waste-images', 'waste-images', true)
ON CONFLICT DO NOTHING;

-- Create storage policies
CREATE POLICY "Anyone can view waste images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'waste-images');

CREATE POLICY "Authenticated users can upload waste images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'waste-images'
        AND auth.role() = 'authenticated'
    );

-- Create enhanced AI detection table
CREATE TABLE ai_detections (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    image_name TEXT NOT NULL,
    image_size INTEGER NOT NULL,
    waste_type TEXT NOT NULL,
    confidence FLOAT NOT NULL,
    quality TEXT NOT NULL,
    recyclability FLOAT NOT NULL,
    contamination FLOAT NOT NULL,
    points_earned INTEGER NOT NULL,
    model_results JSONB,
    accuracy_improvement FLOAT,
    description TEXT,
    location JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create blockchain rewards table
CREATE TABLE reward_transactions (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    transaction_id TEXT UNIQUE NOT NULL,
    reward_type TEXT NOT NULL,
    specific_type TEXT,
    points_spent INTEGER NOT NULL,
    reward_data JSONB NOT NULL,
    blockchain_tx_hash TEXT,
    status TEXT DEFAULT 'completed',
    redemption_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT valid_reward_type CHECK (reward_type IN ('crypto', 'nft', 'voucher')),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'failed', 'redeemed'))
);

-- Create route optimization table
CREATE TABLE optimized_routes (
    id SERIAL PRIMARY KEY,
    route_id TEXT UNIQUE NOT NULL,
    collector_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    start_location JSONB NOT NULL,
    pickup_locations JSONB NOT NULL,
    optimized_waypoints JSONB NOT NULL,
    vehicle_type TEXT NOT NULL,
    total_distance FLOAT NOT NULL,
    total_duration FLOAT NOT NULL,
    total_fuel_cost FLOAT NOT NULL,
    total_emissions FLOAT NOT NULL,
    estimated_savings JSONB NOT NULL,
    efficiency_score FLOAT NOT NULL,
    status TEXT DEFAULT 'active',
    feedback TEXT,
    actual_metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT valid_vehicle_type CHECK (vehicle_type IN ('truck', 'van', 'bike')),
    CONSTRAINT valid_route_status CHECK (status IN ('active', 'completed', 'cancelled'))
);

-- Create indexes for performance
CREATE INDEX idx_ai_detections_user_email ON ai_detections(user_email);
CREATE INDEX idx_ai_detections_created_at ON ai_detections(created_at);
CREATE INDEX idx_ai_detections_waste_type ON ai_detections(waste_type);

CREATE INDEX idx_reward_transactions_user_email ON reward_transactions(user_email);
CREATE INDEX idx_reward_transactions_created_at ON reward_transactions(created_at);
CREATE INDEX idx_reward_transactions_reward_type ON reward_transactions(reward_type);

CREATE INDEX idx_optimized_routes_user_email ON optimized_routes(user_email);
CREATE INDEX idx_optimized_routes_collector_id ON optimized_routes(collector_id);
CREATE INDEX idx_optimized_routes_created_at ON optimized_routes(created_at);

-- Create function to update collector location
CREATE OR REPLACE FUNCTION update_collector_location(
    collector_id TEXT,
    new_location JSONB
) RETURNS VOID AS $$
BEGIN
    UPDATE collectors
    SET 
        current_location = new_location,
        last_active_at = TIMEZONE('utc'::text, NOW())
    WHERE id = collector_id
    AND auth.uid()::text = collector_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to assign collector
CREATE OR REPLACE FUNCTION assign_collector(
    submission_id INTEGER,
    collector_id TEXT
) RETURNS VOID AS $$
BEGIN
    -- Check if the submission is pending
    IF NOT EXISTS (
        SELECT 1 FROM waste_submissions 
        WHERE id = submission_id 
        AND pickup_status = 'PENDING'
    ) THEN
        RAISE EXCEPTION 'Submission is not pending';
    END IF;

    -- Check if the collector is available
    IF NOT EXISTS (
        SELECT 1 FROM collectors 
        WHERE id = collector_id 
        AND status = 'AVAILABLE'
    ) THEN
        RAISE EXCEPTION 'Collector is not available';
    END IF;

    UPDATE waste_submissions
    SET 
        pickup_status = 'ASSIGNED',
        pickup_collector_id = collector_id
    WHERE id = submission_id;
    
    UPDATE collectors
    SET status = 'BUSY'
    WHERE id = collector_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 