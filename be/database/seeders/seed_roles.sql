-- Seed Roles if not exists
IF NOT EXISTS (SELECT * FROM roles WHERE code = 'ADMIN')
    INSERT INTO roles (code, name) VALUES ('ADMIN', 'Administrator');

IF NOT EXISTS (SELECT * FROM roles WHERE code = 'STAFF')
    INSERT INTO roles (code, name) VALUES ('STAFF', 'Staff');

IF NOT EXISTS (SELECT * FROM roles WHERE code = 'MEMBER')
    INSERT INTO roles (code, name) VALUES ('MEMBER', 'Member');

IF NOT EXISTS (SELECT * FROM roles WHERE code = 'TRAINER')
    INSERT INTO roles (code, name) VALUES ('TRAINER', 'Trainer');

SELECT 'Roles seeded successfully' as Status;
