USE GymManagement;
GO

-- 1. Seed Roles
INSERT INTO roles (code, name) VALUES 
('ADMIN', 'Administrator'),
('MANAGER', 'Branch Manager'),
('PT', 'Personal Trainer'),
('MEMBER', 'Gym Member');
GO

-- 2. Seed Initial Admin User (Password: Admin@123)
-- Note: In a real app, password should be hashed. This is for initial setup.
-- You MUST update this with a Bcrypt hash before production.
-- Use this hash for 'Admin@123': $2a$10$YourHashedPasswordHere (Placeholder)
INSERT INTO users (full_name, email, phone, password_hash, status, created_at)
VALUES (
    'System Administrator', 
    'admin@gymnexus.com', 
    '0909000000', 
    '$2b$10$I.cY8JAbRgssZj/ewBd.5eQxDsbbV.cMkEHWjAtv8FzX8DtMRwXHoq', -- Password: Admin@123
    'active',
    GETDATE()
);
GO

-- 3. Assign Admin Role
DECLARE @AdminUserId BIGINT;
SELECT @AdminUserId = user_id FROM users WHERE email = 'admin@gymnexus.com';

DECLARE @AdminRoleId INT;
SELECT @AdminRoleId = role_id FROM roles WHERE code = 'ADMIN';

INSERT INTO user_roles (user_id, role_id) VALUES (@AdminUserId, @AdminRoleId);
GO

-- 4. Seed Membership Packages
INSERT INTO membership_packages (code, name, description, duration_days, price, benefits) VALUES
('BASIC_1M', 'Basic Monthly', 'Access to gym equipment, 1 branch', 30, 500000, 'Gym access'),
('PREMIUM_1M', 'Premium Monthly', 'Access to all branches, Sauna', 30, 800000, 'All branches, Sauna, Towel'),
('BASIC_6M', 'Basic 6 Months', 'Access to gym equipment, 1 branch', 180, 2500000, 'Gym access'),
('VIP_1Y', 'VIP Year', 'All Access + 12 PT Sessions', 365, 10000000, 'All privileges');
GO

-- 5. Seed Branches
INSERT INTO branches (name, address, phone, is_active) VALUES
('GymNexus Central', '123 Main St, District 1, HCMC', '0281234567', 1),
('GymNexus District 7', '456 Nguyen Van Linh, District 7, HCMC', '0287654321', 1);
GO
