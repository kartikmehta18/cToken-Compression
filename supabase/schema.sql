-- Create tables for our application

-- Create users table to store wallet addresses
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create tokens table
CREATE TABLE IF NOT EXISTS tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    address TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    description TEXT,
    supply BIGINT NOT NULL,
    is_compressed BOOLEAN DEFAULT false,
    merkle_tree_address TEXT,
    tx_hash TEXT NOT NULL,
    owner_address TEXT NOT NULL REFERENCES users(wallet_address),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create claims table to track token claims
CREATE TABLE IF NOT EXISTS claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token_address TEXT NOT NULL REFERENCES tokens(address),
    claimer_address TEXT NOT NULL REFERENCES users(wallet_address),
    amount BIGINT NOT NULL,
    tx_hash TEXT NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed'))
);

-- Create QR codes table to track generated QR codes
CREATE TABLE IF NOT EXISTS qr_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token_address TEXT NOT NULL REFERENCES tokens(address),
    amount BIGINT NOT NULL,
    receiver_address TEXT REFERENCES users(wallet_address),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_used BOOLEAN DEFAULT false
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_tokens_owner_address ON tokens(owner_address);
CREATE INDEX IF NOT EXISTS idx_claims_token_address ON claims(token_address);
CREATE INDEX IF NOT EXISTS idx_claims_claimer_address ON claims(claimer_address);
CREATE INDEX IF NOT EXISTS idx_qr_codes_token_address ON qr_codes(token_address);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users are viewable by everyone" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can be inserted by anyone" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Tokens are viewable by everyone" ON tokens
    FOR SELECT USING (true);

CREATE POLICY "Tokens can be inserted by anyone" ON tokens
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Claims are viewable by everyone" ON claims
    FOR SELECT USING (true);

CREATE POLICY "Claims can be inserted by anyone" ON claims
    FOR INSERT WITH CHECK (true);

CREATE POLICY "QR codes are viewable by everyone" ON qr_codes
    FOR SELECT USING (true);

CREATE POLICY "QR codes can be inserted by anyone" ON qr_codes
    FOR INSERT WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for tokens table
CREATE TRIGGER update_tokens_updated_at
    BEFORE UPDATE ON tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle user login/registration
CREATE OR REPLACE FUNCTION handle_wallet_login(wallet_address TEXT)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Try to get existing user
    SELECT id INTO user_id FROM users WHERE users.wallet_address = handle_wallet_login.wallet_address;
    
    -- If user doesn't exist, create new user
    IF user_id IS NULL THEN
        INSERT INTO users (wallet_address) 
        VALUES (handle_wallet_login.wallet_address)
        RETURNING id INTO user_id;
    ELSE
        -- Update last login time
        UPDATE users 
        SET last_login_at = timezone('utc'::text, now())
        WHERE id = user_id;
    END IF;
    
    RETURN user_id;
END;
$$ language 'plpgsql'; 