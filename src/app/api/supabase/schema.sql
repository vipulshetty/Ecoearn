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