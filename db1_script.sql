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
    retry_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
