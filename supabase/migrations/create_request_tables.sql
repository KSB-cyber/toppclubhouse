-- Create accommodation_requests table
CREATE TABLE accommodation_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    guest_name TEXT NOT NULL,
    guest_address TEXT NOT NULL,
    check_in_date DATE NOT NULL,
    check_in_time TIME,
    check_out_date DATE NOT NULL,
    check_out_time TIME,
    purpose_of_visit TEXT NOT NULL,
    guests INTEGER NOT NULL DEFAULT 1,
    billing_to TEXT NOT NULL CHECK (billing_to IN ('guest', 'department')),
    room_type_preference TEXT,
    special_requests TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
    assigned_accommodation_id UUID REFERENCES accommodations(id),
    approved_by UUID REFERENCES auth.users(id),
    approval_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create facility_requests table
CREATE TABLE facility_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    facility_type_preference TEXT,
    purpose TEXT,
    attendees INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
    assigned_facility_id UUID REFERENCES facilities(id),
    approved_by UUID REFERENCES auth.users(id),
    approval_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE accommodation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accommodation_requests
CREATE POLICY "Users can view their own accommodation requests" ON accommodation_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own accommodation requests" ON accommodation_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all accommodation requests" ON accommodation_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('superadmin', 'managing_director', 'hr_office', 'club_house_manager')
        )
    );

CREATE POLICY "Admins can update accommodation requests" ON accommodation_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('superadmin', 'managing_director', 'hr_office', 'club_house_manager')
        )
    );

-- RLS Policies for facility_requests
CREATE POLICY "Users can view their own facility requests" ON facility_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own facility requests" ON facility_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all facility requests" ON facility_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('superadmin', 'managing_director', 'hr_office', 'club_house_manager')
        )
    );

CREATE POLICY "Admins can update facility requests" ON facility_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('superadmin', 'managing_director', 'hr_office', 'club_house_manager')
        )
    );

-- Create indexes for better performance
CREATE INDEX idx_accommodation_requests_user_id ON accommodation_requests(user_id);
CREATE INDEX idx_accommodation_requests_status ON accommodation_requests(status);
CREATE INDEX idx_facility_requests_user_id ON facility_requests(user_id);
CREATE INDEX idx_facility_requests_status ON facility_requests(status);