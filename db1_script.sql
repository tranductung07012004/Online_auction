CREATE TABLE "users" (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    role VARCHAR(255) NOT NULL DEFAULT 'BIDDER',
    password TEXT NOT NULL, 
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_details (
    id BIGSERIAL PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL,
    avatar TEXT NOT NULL,
    address TEXT NOT NULL,
    verified BOOLEAN NOT NULL,
    "like" INTEGER NOT NULL,
    dislike INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_token (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    token       VARCHAR(512) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ    NOT NULL
);
