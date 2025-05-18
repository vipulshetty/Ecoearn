-- Create the function to create users table if it doesn't exist
CREATE OR REPLACE FUNCTION create_users_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the users table exists
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'users'
    ) THEN
        -- Create the users table
        CREATE TABLE public.users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            avatar_url TEXT,
            provider TEXT,
            points INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
        );

        -- Create indexes
        CREATE INDEX users_email_idx ON public.users(email);
        
        -- Enable Row Level Security
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Users can view their own data"
            ON public.users
            FOR SELECT
            USING (auth.uid() = id);

        CREATE POLICY "Users can update their own data"
            ON public.users
            FOR UPDATE
            USING (auth.uid() = id);
    END IF;
END;
$$; 