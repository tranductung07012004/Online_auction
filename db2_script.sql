CREATE TABLE product (
    id BIGSERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    thumbnail_url TEXT NOT NULL,
    start_price DECIMAL(15, 5) NOT NULL,
    current_price DECIMAL(15, 5),
    top_bidder_id BIGINT,
    seller_id BIGINT NOT NULL,
    buy_now_price DECIMAL(15, 5),
    minimum_bid_step DECIMAL(15, 5) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_at TIMESTAMPTZ NOT NULL,
    auto_extend_enabled BOOLEAN NOT NULL,
    bid_count INTEGER NOT NULL
);

CREATE TABLE wishlist (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE blacklist (
    id BIGSERIAL PRIMARY KEY,
    bidder_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    created_by BIGINT NOT NULL
);

CREATE TABLE auto_bids (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    bidder_id BIGINT NOT NULL,
    max_price DECIMAL(15,5) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    UNIQUE (product_id, bidder_id)
);

CREATE TABLE bid_requests (
    id BIGSERIAL PRIMARY KEY,
    bidder_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_bid_requests_product_bidder UNIQUE (product_id, bidder_id)
);

CREATE TABLE bid_history (
    id BIGSERIAL PRIMARY KEY,
    bidder_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    price DECIMAL(15, 5) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    parent_id INTEGER
);

CREATE TABLE product_descriptions (
    id SERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    content TEXT NOT NULL,
    created_by BIGINT NOT NULL
);

CREATE TABLE product_category (
    id BIGSERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_pictures (
    id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by BIGINT NOT NULL
);

CREATE TABLE user_reviews (
    id BIGSERIAL PRIMARY KEY,
    bidder_id BIGINT,
    seller_id BIGINT,
    status SMALLINT DEFAULT 1,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_reviews (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT,
    user_id BIGINT,
    status SMALLINT DEFAULT 1,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT,
    sender_id BIGINT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE answer (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE questions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT,
    buyer_id BIGINT,
    seller_id BIGINT,
    amount DECIMAL(15,5) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_cancelled BOOLEAN DEFAULT FALSE,
    has_shipping_address BOOLEAN DEFAULT FALSE,
    cancelled_reason TEXT
);

CREATE TABLE order_shippings (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT,
    shipping_address TEXT NOT NULL,
    shipped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivery_status SMALLINT DEFAULT 0
);

CREATE TABLE order_payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT,
    payment_method SMALLINT DEFAULT 0,
    bidder_payment_status SMALLINT DEFAULT 0,
    seller_payment_status SMALLINT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- -- product
-- ALTER TABLE product ADD CONSTRAINT fk_product_top_bidder_id FOREIGN KEY (top_bidder_id) REFERENCES "user"(id);
-- ALTER TABLE product ADD CONSTRAINT fk_product_seller_id FOREIGN KEY (seller_id) REFERENCES "user"(id);

-- -- wishlist
-- ALTER TABLE wishlist ADD CONSTRAINT fk_wishlist_user_id FOREIGN KEY (user_id) REFERENCES "user"(id);
-- ALTER TABLE wishlist ADD CONSTRAINT fk_wishlist_product_id FOREIGN KEY (product_id) REFERENCES product(id);

-- -- blacklist
-- ALTER TABLE blacklist ADD CONSTRAINT fk_blacklist_bidder_id FOREIGN KEY (bidder_id) REFERENCES "user"(id);
-- ALTER TABLE blacklist ADD CONSTRAINT fk_blacklist_product_id FOREIGN KEY (product_id) REFERENCES product(id);

-- -- bid_history
-- ALTER TABLE bid_history ADD CONSTRAINT fk_bid_history_bidder_id FOREIGN KEY (bidder_id) REFERENCES "user"(id);
-- ALTER TABLE bid_history ADD CONSTRAINT fk_bid_history_product_id FOREIGN KEY (product_id) REFERENCES product(id);

-- -- categories (self-referential)
-- ALTER TABLE categories ADD CONSTRAINT fk_categories_parent_id FOREIGN KEY (parent_id) REFERENCES categories(id);

-- -- product_descriptions
-- ALTER TABLE product_descriptions ADD CONSTRAINT fk_product_descriptions_product_id FOREIGN KEY (product_id) REFERENCES product(id);
-- ALTER TABLE product_descriptions ADD CONSTRAINT fk_product_descriptions_created_by FOREIGN KEY (created_by) REFERENCES "user"(id);

-- -- product_category
-- ALTER TABLE product_category ADD CONSTRAINT fk_product_category_category_id FOREIGN KEY (category_id) REFERENCES categories(id);
-- ALTER TABLE product_category ADD CONSTRAINT fk_product_category_product_id FOREIGN KEY (product_id) REFERENCES product(id);

-- -- product_pictures
-- ALTER TABLE product_pictures ADD CONSTRAINT fk_product_pictures_product_id FOREIGN KEY (product_id) REFERENCES product(id);

-- -- system_settings
-- ALTER TABLE system_settings ADD CONSTRAINT fk_system_settings_updated_by FOREIGN KEY (updated_by) REFERENCES "user"(id);

-- -- user_reviews
-- -- Assuming table name users is "user"
-- ALTER TABLE user_reviews ADD CONSTRAINT fk_user_reviews_bidder_id FOREIGN KEY (bidder_id) REFERENCES "user"(id);
-- ALTER TABLE user_reviews ADD CONSTRAINT fk_user_reviews_seller_id FOREIGN KEY (seller_id) REFERENCES "user"(id);

-- -- order_reviews
-- ALTER TABLE order_reviews ADD CONSTRAINT fk_order_reviews_order_id FOREIGN KEY (order_id) REFERENCES orders(id);
-- ALTER TABLE order_reviews ADD CONSTRAINT fk_order_reviews_user_id FOREIGN KEY (user_id) REFERENCES "user"(id);

-- -- request_upgrade_seller
-- ALTER TABLE request_upgrade_seller ADD CONSTRAINT fk_request_upgrade_seller_user_id FOREIGN KEY (user_id) REFERENCES "user"(id);

-- -- chat_messages
-- ALTER TABLE chat_messages ADD CONSTRAINT fk_chat_messages_order_id FOREIGN KEY (order_id) REFERENCES orders(id);
-- ALTER TABLE chat_messages ADD CONSTRAINT fk_chat_messages_sender_id FOREIGN KEY (sender_id) REFERENCES "user"(id);

-- -- answer
-- ALTER TABLE answer ADD CONSTRAINT fk_answer_user_id FOREIGN KEY (user_id) REFERENCES "user"(id);
-- ALTER TABLE answer ADD CONSTRAINT fk_answer_question_id FOREIGN KEY (question_id) REFERENCES questions(id);

-- -- questions
-- ALTER TABLE questions ADD CONSTRAINT fk_questions_user_id FOREIGN KEY (user_id) REFERENCES "user"(id);
-- ALTER TABLE questions ADD CONSTRAINT fk_questions_product_id FOREIGN KEY (product_id) REFERENCES product(id);

-- -- orders
-- -- Assuming products is product, users is "user"
-- ALTER TABLE orders ADD CONSTRAINT fk_orders_product_id FOREIGN KEY (product_id) REFERENCES product(id);
-- ALTER TABLE orders ADD CONSTRAINT fk_orders_buyer_id FOREIGN KEY (buyer_id) REFERENCES "user"(id);
-- ALTER TABLE orders ADD CONSTRAINT fk_orders_seller_id FOREIGN KEY (seller_id) REFERENCES "user"(id);

-- -- order_shippings
-- ALTER TABLE order_shippings ADD CONSTRAINT fk_order_shippings_order_id FOREIGN KEY (order_id) REFERENCES orders(id);

-- -- order_payments
-- ALTER TABLE order_payments ADD CONSTRAINT fk_order_payments_order_id FOREIGN KEY (order_id) REFERENCES orders(id);
