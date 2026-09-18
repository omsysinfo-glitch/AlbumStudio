-- ============================================================================
-- KARIZMA WEDDING ALBUM MAKER DATABASE SCHEMA (POSTGRESQL)
-- Production relational schema supporting 1,000+ high-res wedding photos,
-- 30-60 double-spread sheets, AI quality metadata, and real-time client comments.
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (Photographers, Designers, Studio Admins, Couples)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'photographer', -- 'photographer', 'designer', 'client', 'admin'
    studio_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. PROJECTS TABLE (Karizma Wedding Albums)
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    bride_name VARCHAR(255) NOT NULL,
    groom_name VARCHAR(255) NOT NULL,
    wedding_date DATE NOT NULL,
    album_size VARCHAR(50) NOT NULL DEFAULT '12x36', -- '12x36', '12x30', '12x24', '10x30', 'custom'
    custom_width_inches NUMERIC(6, 2),
    custom_height_inches NUMERIC(6, 2),
    sheet_count INT NOT NULL DEFAULT 30,
    design_style_id VARCHAR(100) NOT NULL DEFAULT 'style-royal-red-gold',
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'in_review', 'approved', 'exported'
    cover_config JSONB NOT NULL DEFAULT '{}'::jsonb, -- Front, spine, back, velvet/leatherette, gold foil text
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PHOTOS TABLE (High-Resolution Wedding Photos Pool - Supports 1,000+ photos)
CREATE TABLE IF NOT EXISTS photos (
    id VARCHAR(100) PRIMARY KEY,
    project_id VARCHAR(100) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    storage_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    width INT NOT NULL,
    height INT NOT NULL,
    aspect_ratio NUMERIC(6, 4) NOT NULL,
    orientation VARCHAR(20) NOT NULL, -- 'landscape', 'portrait', 'square'
    timestamp TIMESTAMP WITH TIME ZONE,
    ceremony_tag VARCHAR(100) NOT NULL DEFAULT 'Wedding', -- 'Haldi', 'Mehendi', 'Sangeet', 'Wedding', etc.
    quality_score INT NOT NULL DEFAULT 85,
    quality_tier VARCHAR(50) NOT NULL DEFAULT 'Good', -- 'Excellent', 'Good', 'Fair', 'Poor'
    sharpness INT,
    blur_score INT,
    exposure INT,
    brightness INT,
    contrast INT,
    composition_score INT,
    emotional_importance INT,
    face_count INT DEFAULT 0,
    dominant_colors TEXT[] DEFAULT '{}',
    is_duplicate BOOLEAN DEFAULT FALSE,
    duplicate_group_id VARCHAR(100),
    is_ai_generated BOOLEAN DEFAULT FALSE,
    is_ai_edited BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    raw_analysis JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast photo filtering by project, ceremony, and quality
CREATE INDEX IF NOT EXISTS idx_photos_project_id ON photos(project_id);
CREATE INDEX IF NOT EXISTS idx_photos_ceremony ON photos(project_id, ceremony_tag);
CREATE INDEX IF NOT EXISTS idx_photos_quality ON photos(project_id, quality_score DESC);

-- 4. PHOTO FACES TABLE (Detected Faces & Saliency Boxes for Safe Cropping)
CREATE TABLE IF NOT EXISTS photo_faces (
    id VARCHAR(100) PRIMARY KEY,
    photo_id VARCHAR(100) NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    box_x NUMERIC(6, 4) NOT NULL, -- Normalized 0.0 to 1.0
    box_y NUMERIC(6, 4) NOT NULL,
    box_width NUMERIC(6, 4) NOT NULL,
    box_height NUMERIC(6, 4) NOT NULL,
    confidence NUMERIC(4, 3) NOT NULL,
    label VARCHAR(100), -- 'bride', 'groom', 'relative', 'guest'
    smile_confidence NUMERIC(4, 3),
    eyes_closed BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_faces_photo_id ON photo_faces(photo_id);

-- 5. ALBUM SHEETS TABLE (Double-page Spreads, e.g. 12x36" panoramic canvas)
CREATE TABLE IF NOT EXISTS album_sheets (
    id VARCHAR(100) PRIMARY KEY,
    project_id VARCHAR(100) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sheet_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    ceremony_tag VARCHAR(100) NOT NULL DEFAULT 'Wedding',
    template_id VARCHAR(100),
    background JSONB NOT NULL DEFAULT '{"type":"solid","value":"#FAF5EA"}'::jsonb,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, sheet_number)
);

CREATE INDEX IF NOT EXISTS idx_sheets_project_id ON album_sheets(project_id, sheet_number ASC);

-- 6. ALBUM OBJECTS TABLE (Polymorphic canvas elements: photo slots, text, shapes, decorations)
CREATE TABLE IF NOT EXISTS album_objects (
    id VARCHAR(100) PRIMARY KEY,
    sheet_id VARCHAR(100) NOT NULL REFERENCES album_sheets(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'photo', 'text', 'shape', 'decoration'
    name VARCHAR(255) NOT NULL,
    x NUMERIC(6, 4) NOT NULL, -- Normalized 0.0 to 1.0 spread coordinates
    y NUMERIC(6, 4) NOT NULL,
    width NUMERIC(6, 4) NOT NULL,
    height NUMERIC(6, 4) NOT NULL,
    rotation INT DEFAULT 0,
    opacity NUMERIC(4, 3) DEFAULT 1.0,
    z_index INT NOT NULL DEFAULT 1,
    is_locked BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,
    
    -- Photo Specific Fields
    photo_id VARCHAR(100) REFERENCES photos(id) ON DELETE SET NULL,
    crop_pan_x NUMERIC(6, 2) DEFAULT 0,
    crop_pan_y NUMERIC(6, 2) DEFAULT 0,
    zoom NUMERIC(4, 2) DEFAULT 1.0,
    fit_mode VARCHAR(50) DEFAULT 'cover',
    border_width INT DEFAULT 0,
    border_color VARCHAR(50) DEFAULT '#000000',
    border_style VARCHAR(50) DEFAULT 'solid',
    border_radius INT DEFAULT 0,
    shadow_color VARCHAR(50) DEFAULT 'rgba(0,0,0,0.5)',
    shadow_blur INT DEFAULT 0,
    shadow_offset_x INT DEFAULT 0,
    shadow_offset_y INT DEFAULT 0,
    
    -- Text Specific Fields
    text_content TEXT,
    font_family VARCHAR(100),
    font_size INT,
    font_weight VARCHAR(50),
    font_style VARCHAR(50),
    text_color VARCHAR(50),
    text_align VARCHAR(20),
    
    -- Shape & Decoration Fields
    shape_type VARCHAR(50),
    motif_type VARCHAR(100),
    fill_color VARCHAR(50),
    stroke_color VARCHAR(50),
    stroke_width INT DEFAULT 0,
    
    extra_attributes JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_objects_sheet_id ON album_objects(sheet_id, z_index ASC);

-- 7. CLIENT COMMENTS TABLE (Real-time Feedback & Review Thread)
CREATE TABLE IF NOT EXISTS client_comments (
    id VARCHAR(100) PRIMARY KEY,
    sheet_id VARCHAR(100) NOT NULL REFERENCES album_sheets(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_role VARCHAR(50) NOT NULL DEFAULT 'client', -- 'client', 'photographer', 'designer'
    comment_text TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open', -- 'open', 'resolved'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_comments_sheet_id ON client_comments(sheet_id);

-- 8. DUPLICATE GROUPS TABLE (AI Burst & Duplicate Shot Management)
CREATE TABLE IF NOT EXISTS duplicate_groups (
    id VARCHAR(100) PRIMARY KEY,
    project_id VARCHAR(100) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    ceremony_tag VARCHAR(100) NOT NULL,
    similarity_score INT NOT NULL,
    recommended_photo_id VARCHAR(100) REFERENCES photos(id) ON DELETE CASCADE,
    photo_ids TEXT[] NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dup_groups_project ON duplicate_groups(project_id);
