CREATE TABLE "users" (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    role VARCHAR(255) NOT NULL DEFAULT 'BIDDER',
    password TEXT NOT NULL, 
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_details (
    id BIGSERIAL PRIMARY KEY,
    fullname VARCHAR(255),
    user_id BIGINT UNIQUE NOT NULL,
    avatar TEXT,
    address TEXT,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    like_count INTEGER NOT NULL DEFAULT 0,
    dislike_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_token (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    token       VARCHAR(512) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ    NOT NULL
);

CREATE TABLE otp_codes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    email TEXT NOT NULL,
    purpose VARCHAR(50) NOT NULL,  -- VERIFY_EMAIL, RESET_PASSWORD
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_active_otp
ON otp_codes(user_id, email)
WHERE used = false;

-- Seller Request table for upgrade to seller role
CREATE TABLE seller_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reviewed_by BIGINT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_seller_requests_user_id ON seller_requests(user_id);
CREATE INDEX idx_seller_requests_status ON seller_requests(status);
CREATE INDEX idx_seller_requests_created_at ON seller_requests(created_at DESC);
