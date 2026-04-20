-- =====================================================
-- PatiVar - Kedi/Köpek İlan Platformu
-- PostgreSQL Database Schema
-- =====================================================

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE user_status AS ENUM ('active', 'suspended', 'banned');
CREATE TYPE listing_status AS ENUM ('draft', 'active', 'sold', 'expired', 'removed');
CREATE TYPE pet_type AS ENUM ('cat', 'dog');
CREATE TYPE pet_gender AS ENUM ('male', 'female');
CREATE TYPE pet_size AS ENUM ('mini', 'small', 'medium', 'large', 'giant');
CREATE TYPE subscription_plan AS ENUM ('free', 'basic', 'premium', 'business');
CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled');
CREATE TYPE listing_purpose AS ENUM ('sale', 'adoption', 'mating');
CREATE TYPE health_status AS ENUM ('healthy', 'treatment_needed', 'chronic_condition');
CREATE TYPE coat_length AS ENUM ('hairless', 'short', 'medium', 'long');

-- =====================================================
-- USERS TABLE
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    city VARCHAR(100),
    district VARCHAR(100),
    address TEXT,
    status user_status DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(6),
    verification_expires_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);

-- =====================================================
-- SUBSCRIPTIONS TABLE
-- =====================================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan subscription_plan DEFAULT 'free',
    status subscription_status DEFAULT 'active',
    listing_limit INT NOT NULL DEFAULT 1,
    listings_used INT NOT NULL DEFAULT 0,
    featured_listings INT DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0.00,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- =====================================================
-- CAT BREEDS TABLE
-- =====================================================

CREATE TABLE cat_breeds (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    name_tr VARCHAR(100) NOT NULL,
    origin VARCHAR(100),
    description TEXT,
    avg_lifespan VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DOG BREEDS TABLE
-- =====================================================

CREATE TABLE dog_breeds (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    name_tr VARCHAR(100) NOT NULL,
    origin VARCHAR(100),
    size_category pet_size,
    description TEXT,
    avg_lifespan VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- LISTINGS TABLE
-- =====================================================

CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    pet_type pet_type NOT NULL,
    purpose listing_purpose NOT NULL DEFAULT 'sale',
    price DECIMAL(10,2),
    is_price_negotiable BOOLEAN DEFAULT FALSE,
    status listing_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    favorite_count INT DEFAULT 0,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_whatsapp BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_listings_user ON listings(user_id);
CREATE INDEX idx_listings_pet_type ON listings(pet_type);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_city ON listings(city);
CREATE INDEX idx_listings_purpose ON listings(purpose);
CREATE INDEX idx_listings_created ON listings(created_at DESC);
CREATE INDEX idx_listings_price ON listings(price);

-- =====================================================
-- CAT DETAILS TABLE
-- =====================================================

CREATE TABLE cat_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL UNIQUE REFERENCES listings(id) ON DELETE CASCADE,
    breed_id INT REFERENCES cat_breeds(id),
    gender pet_gender NOT NULL,
    age_months INT,
    age_years INT,
    color VARCHAR(100),
    coat_length coat_length,
    eye_color VARCHAR(50),
    weight_kg DECIMAL(5,2),
    is_neutered BOOLEAN DEFAULT FALSE,
    is_vaccinated BOOLEAN DEFAULT FALSE,
    is_microchipped BOOLEAN DEFAULT FALSE,
    is_dewormed BOOLEAN DEFAULT FALSE,
    is_fiv_felv_tested BOOLEAN DEFAULT FALSE,
    fiv_felv_result VARCHAR(50),
    is_litter_trained BOOLEAN DEFAULT FALSE,
    is_indoor BOOLEAN DEFAULT TRUE,
    is_good_with_kids BOOLEAN,
    is_good_with_dogs BOOLEAN,
    is_good_with_cats BOOLEAN,
    health_status health_status DEFAULT 'healthy',
    health_notes TEXT,
    has_pedigree BOOLEAN DEFAULT FALSE,
    pedigree_number VARCHAR(100),
    personality TEXT,
    special_needs TEXT,
    dietary_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cat_details_listing ON cat_details(listing_id);
CREATE INDEX idx_cat_details_breed ON cat_details(breed_id);

-- =====================================================
-- DOG DETAILS TABLE
-- =====================================================

CREATE TABLE dog_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL UNIQUE REFERENCES listings(id) ON DELETE CASCADE,
    breed_id INT REFERENCES dog_breeds(id),
    gender pet_gender NOT NULL,
    age_months INT,
    age_years INT,
    color VARCHAR(100),
    coat_length coat_length,
    size pet_size,
    weight_kg DECIMAL(5,2),
    height_cm INT,
    is_neutered BOOLEAN DEFAULT FALSE,
    is_vaccinated BOOLEAN DEFAULT FALSE,
    is_microchipped BOOLEAN DEFAULT FALSE,
    is_dewormed BOOLEAN DEFAULT FALSE,
    is_rabies_vaccinated BOOLEAN DEFAULT FALSE,
    is_house_trained BOOLEAN DEFAULT FALSE,
    is_leash_trained BOOLEAN DEFAULT FALSE,
    is_crate_trained BOOLEAN DEFAULT FALSE,
    is_good_with_kids BOOLEAN,
    is_good_with_dogs BOOLEAN,
    is_good_with_cats BOOLEAN,
    energy_level INT CHECK (energy_level BETWEEN 1 AND 5),
    barking_level INT CHECK (barking_level BETWEEN 1 AND 5),
    training_level INT CHECK (training_level BETWEEN 1 AND 5),
    health_status health_status DEFAULT 'healthy',
    health_notes TEXT,
    has_pedigree BOOLEAN DEFAULT FALSE,
    pedigree_number VARCHAR(100),
    personality TEXT,
    special_needs TEXT,
    dietary_notes TEXT,
    exercise_needs TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dog_details_listing ON dog_details(listing_id);
CREATE INDEX idx_dog_details_breed ON dog_details(breed_id);
CREATE INDEX idx_dog_details_size ON dog_details(size);

-- =====================================================
-- LISTING IMAGES TABLE
-- =====================================================

CREATE TABLE listing_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_listing_images_listing ON listing_images(listing_id);

-- =====================================================
-- FAVORITES TABLE
-- =====================================================

CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_listing ON favorites(listing_id);

-- =====================================================
-- MESSAGES TABLE
-- =====================================================

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_listing ON messages(listing_id);

-- =====================================================
-- REPORTS TABLE
-- =====================================================

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CONTACT MESSAGES TABLE
-- =====================================================

CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    ip_address INET,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contact_messages_created ON contact_messages(created_at DESC);
CREATE INDEX idx_contact_messages_unread ON contact_messages(is_read) WHERE is_read = FALSE;

-- =====================================================
-- AUDIT LOG TABLE
-- =====================================================

CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    metadata JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);

-- =====================================================
-- SEED DATA - Cat Breeds
-- =====================================================

INSERT INTO cat_breeds (name, name_tr, origin) VALUES
('Persian', 'İran Kedisi (Fars)', 'İran'),
('British Shorthair', 'British Shorthair', 'İngiltere'),
('British Longhair', 'British Longhair', 'İngiltere'),
('Scottish Fold', 'Scottish Fold', 'İskoçya'),
('Scottish Straight', 'Scottish Straight', 'İskoçya'),
('Siamese', 'Siyam Kedisi', 'Tayland'),
('Maine Coon', 'Maine Coon', 'ABD'),
('Ragdoll', 'Ragdoll', 'ABD'),
('Bengal', 'Bengal', 'ABD'),
('Russian Blue', 'Rus Mavisi', 'Rusya'),
('Sphynx', 'Sfenks', 'Kanada'),
('Abyssinian', 'Habeş Kedisi', 'Etiyopya'),
('Norwegian Forest', 'Norveç Orman Kedisi', 'Norveç'),
('Birman', 'Birman', 'Myanmar'),
('Turkish Angora', 'Ankara Kedisi', 'Türkiye'),
('Turkish Van', 'Van Kedisi', 'Türkiye'),
('Exotic Shorthair', 'Exotic Shorthair', 'ABD'),
('Himalayan', 'Himalaya Kedisi', 'ABD'),
('Burmese', 'Burma Kedisi', 'Myanmar'),
('Tonkinese', 'Tonkinese', 'Kanada'),
('Somali', 'Somali', 'ABD'),
('Oriental Shorthair', 'Oriental Shorthair', 'Tayland'),
('Devon Rex', 'Devon Rex', 'İngiltere'),
('Cornish Rex', 'Cornish Rex', 'İngiltere'),
('Chartreux', 'Chartreux (Kartezyen)', 'Fransa'),
('Balinese', 'Bali Kedisi', 'ABD'),
('Savannah', 'Savannah', 'ABD'),
('Munchkin', 'Munchkin', 'ABD'),
('Manx', 'Manx', 'Man Adası'),
('American Shorthair', 'Amerikan Shorthair', 'ABD'),
('American Curl', 'Amerikan Curl', 'ABD'),
('Ragamuffin', 'Ragamuffin', 'ABD'),
('Singapura', 'Singapura', 'Singapur'),
('Selkirk Rex', 'Selkirk Rex', 'ABD'),
('Egyptian Mau', 'Mısır Mau', 'Mısır'),
('Ocicat', 'Ocicat', 'ABD'),
('Snowshoe', 'Snowshoe', 'ABD'),
('Bombay', 'Bombay', 'ABD'),
('Burmilla', 'Burmilla', 'İngiltere'),
('Havana Brown', 'Havana Brown', 'İngiltere'),
('Korat', 'Korat', 'Tayland'),
('LaPerm', 'LaPerm', 'ABD'),
('Nebelung', 'Nebelung', 'ABD'),
('Toyger', 'Toyger', 'ABD'),
('Chinchilla', 'Chinchilla', 'İngiltere'),
('Mixed/Melez', 'Melez', 'Çeşitli');

-- =====================================================
-- SEED DATA - Dog Breeds
-- =====================================================

INSERT INTO dog_breeds (name, name_tr, origin, size_category) VALUES
('Golden Retriever', 'Golden Retriever', 'İngiltere', 'large'),
('Labrador Retriever', 'Labrador Retriever', 'Kanada', 'large'),
('German Shepherd', 'Alman Çoban Köpeği', 'Almanya', 'large'),
('French Bulldog', 'Fransız Bulldog', 'Fransa', 'small'),
('Bulldog', 'Bulldog (İngiliz)', 'İngiltere', 'medium'),
('Poodle (Standard)', 'Kaniş (Standart)', 'Fransa', 'medium'),
('Toy Poodle', 'Toy Kaniş', 'Fransa', 'mini'),
('Miniature Poodle', 'Minyatür Kaniş', 'Fransa', 'small'),
('Beagle', 'Beagle', 'İngiltere', 'medium'),
('Rottweiler', 'Rottweiler', 'Almanya', 'large'),
('Dachshund', 'Dachshund (Sosis)', 'Almanya', 'small'),
('Siberian Husky', 'Sibirya Husky', 'Rusya', 'large'),
('Alaskan Malamute', 'Alaskan Malamute', 'ABD', 'large'),
('Pomeranian', 'Pomeranian', 'Almanya', 'mini'),
('Chihuahua', 'Chihuahua', 'Meksika', 'mini'),
('Shih Tzu', 'Shih Tzu', 'Tibet', 'small'),
('Yorkshire Terrier', 'Yorkshire Terrier', 'İngiltere', 'mini'),
('Maltese', 'Malta Terrier', 'Malta', 'mini'),
('Cocker Spaniel', 'Cocker Spaniel', 'İngiltere', 'medium'),
('Springer Spaniel', 'Springer Spaniel', 'İngiltere', 'medium'),
('Cavalier King Charles', 'Cavalier King Charles', 'İngiltere', 'small'),
('Doberman', 'Doberman', 'Almanya', 'large'),
('Boxer', 'Boxer', 'Almanya', 'large'),
('Great Dane', 'Danua (Great Dane)', 'Almanya', 'giant'),
('Bernese Mountain Dog', 'Bern Dağ Köpeği', 'İsviçre', 'giant'),
('Saint Bernard', 'Saint Bernard', 'İsviçre', 'giant'),
('Border Collie', 'Border Collie', 'İngiltere', 'medium'),
('Australian Shepherd', 'Avustralya Çoban Köpeği', 'ABD', 'medium'),
('Corgi', 'Corgi (Pembroke)', 'Galler', 'small'),
('Jack Russell Terrier', 'Jack Russell Terrier', 'İngiltere', 'small'),
('Bull Terrier', 'Bull Terrier', 'İngiltere', 'medium'),
('Staffordshire Bull Terrier', 'Staffordshire Bull Terrier', 'İngiltere', 'medium'),
('American Bully', 'Amerikan Bully', 'ABD', 'medium'),
('Pit Bull Terrier', 'Pit Bull Terrier', 'ABD', 'medium'),
('Cane Corso', 'Cane Corso', 'İtalya', 'large'),
('Akita Inu', 'Akita Inu', 'Japonya', 'large'),
('Shiba Inu', 'Shiba Inu', 'Japonya', 'small'),
('Shar Pei', 'Shar Pei', 'Çin', 'medium'),
('Chow Chow', 'Chow Chow', 'Çin', 'medium'),
('Samoyed', 'Samoyed', 'Rusya', 'medium'),
('Weimaraner', 'Weimaraner', 'Almanya', 'large'),
('Dalmatian', 'Dalmaçyalı', 'Hırvatistan', 'large'),
('Miniature Schnauzer', 'Minyatür Schnauzer', 'Almanya', 'small'),
('Giant Schnauzer', 'Dev Schnauzer', 'Almanya', 'large'),
('West Highland Terrier', 'West Highland Terrier', 'İskoçya', 'small'),
('Bichon Frise', 'Bichon Frise', 'Fransa', 'small'),
('Havanese', 'Havanese', 'Küba', 'small'),
('Papillon', 'Papillon', 'Fransa', 'mini'),
('Lhasa Apso', 'Lhasa Apso', 'Tibet', 'small'),
('Pekingese', 'Pekinez', 'Çin', 'small'),
('Basenji', 'Basenji', 'Kongo', 'medium'),
('Whippet', 'Whippet', 'İngiltere', 'medium'),
('Greyhound', 'Greyhound', 'İngiltere', 'large'),
('Irish Setter', 'İrlanda Setter', 'İrlanda', 'large'),
('Vizsla', 'Vizsla', 'Macaristan', 'medium'),
('Belgian Malinois', 'Belçika Malinois', 'Belçika', 'large'),
('Newfoundland', 'Newfoundland', 'Kanada', 'giant'),
('Leonberger', 'Leonberger', 'Almanya', 'giant'),
('Kangal', 'Kangal', 'Türkiye', 'giant'),
('Akbaş', 'Akbaş', 'Türkiye', 'giant'),
('Çatalburun', 'Çatalburun', 'Türkiye', 'large'),
('Malaklı', 'Malaklı', 'Türkiye', 'giant'),
('Boz Çoban', 'Boz Çoban Köpeği', 'Türkiye', 'giant'),
('Tazi', 'Tazı', 'Türkiye', 'medium'),
('Mixed/Melez', 'Melez', 'Çeşitli', 'medium');

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cat_details_updated_at BEFORE UPDATE ON cat_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dog_details_updated_at BEFORE UPDATE ON dog_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Create default subscription on user registration
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO subscriptions (user_id, plan, status, listing_limit, listings_used)
    VALUES (NEW.id, 'free', 'active', 1, 0);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_user_created_subscription
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION create_default_subscription();

-- Function: Increment listings_used on listing publish
CREATE OR REPLACE FUNCTION increment_listing_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
        UPDATE subscriptions
        SET listings_used = listings_used + 1
        WHERE user_id = NEW.user_id AND status = 'active';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_listing_published
    AFTER INSERT OR UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION increment_listing_count();

-- =====================================================
-- VIEWS
-- =====================================================

CREATE VIEW active_listings_view AS
SELECT
    l.*,
    u.first_name || ' ' || u.last_name AS owner_name,
    u.avatar_url AS owner_avatar,
    u.city AS owner_city,
    (SELECT image_url FROM listing_images li WHERE li.listing_id = l.id AND li.is_primary = TRUE LIMIT 1) AS primary_image,
    (SELECT COUNT(*) FROM listing_images li WHERE li.listing_id = l.id) AS image_count,
    CASE
        WHEN l.pet_type = 'cat' THEN (SELECT cb.name_tr FROM cat_details cd JOIN cat_breeds cb ON cd.breed_id = cb.id WHERE cd.listing_id = l.id)
        WHEN l.pet_type = 'dog' THEN (SELECT db.name_tr FROM dog_details dd JOIN dog_breeds db ON dd.breed_id = db.id WHERE dd.listing_id = l.id)
    END AS breed_name
FROM listings l
JOIN users u ON l.user_id = u.id
WHERE l.status = 'active';
