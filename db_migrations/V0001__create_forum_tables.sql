-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    reputation INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    is_admin BOOLEAN DEFAULT FALSE,
    is_moderator BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create topics table
CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    author_id INTEGER REFERENCES users(id),
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    views INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER REFERENCES topics(id),
    author_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id),
    filename VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_topics_category ON topics(category_id);
CREATE INDEX IF NOT EXISTS idx_topics_author ON topics(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_topic ON posts(topic_id);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_attachments_post ON attachments(post_id);

-- Insert default categories
INSERT INTO categories (name, description, icon, display_order) VALUES
('Объявления', 'Важные новости и объявления администрации', 'Megaphone', 1),
('Обсуждения', 'Общие обсуждения и беседы', 'MessagesSquare', 2),
('Помощь новичкам', 'Вопросы и ответы для новых участников', 'HelpCircle', 3),
('Техническая поддержка', 'Помощь с техническими вопросами', 'Wrench', 4)
ON CONFLICT DO NOTHING;

-- Insert demo admin user (password: admin123)
INSERT INTO users (username, email, password_hash, reputation, post_count, is_admin, is_moderator) VALUES
('admin', 'admin@forum.local', '$2b$10$demo.hash.placeholder', 5000, 1250, TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- Insert demo users
INSERT INTO users (username, email, password_hash, reputation, post_count, is_moderator) VALUES
('Алексей', 'alexey@forum.local', '$2b$10$demo.hash.placeholder', 1250, 342, TRUE),
('Мария', 'maria@forum.local', '$2b$10$demo.hash.placeholder', 890, 156, FALSE),
('Дмитрий', 'dmitry@forum.local', '$2b$10$demo.hash.placeholder', 2100, 678, FALSE),
('Елена', 'elena@forum.local', '$2b$10$demo.hash.placeholder', 450, 89, FALSE)
ON CONFLICT DO NOTHING;

-- Insert demo topics
INSERT INTO topics (title, category_id, author_id, is_pinned, views, reply_count) VALUES
('Добро пожаловать на форум! Правила общения', 1, 1, TRUE, 1203, 24),
('Как правильно задавать вопросы на форуме', 3, 4, FALSE, 5432, 156),
('Обсуждение новых функций платформы', 2, 3, FALSE, 2341, 89),
('Решение проблем с авторизацией', 4, 2, FALSE, 456, 12)
ON CONFLICT DO NOTHING;

-- Insert demo posts
INSERT INTO posts (topic_id, author_id, content) VALUES
(1, 1, 'Добро пожаловать на наш форум! Здесь вы найдете ответы на свои вопросы и сможете пообщаться с единомышленниками. Пожалуйста, соблюдайте правила сообщества и будьте вежливы друг к другу.'),
(1, 3, 'Спасибо за теплый прием! Рад присоединиться к сообществу.'),
(2, 4, 'В этой теме мы обсудим, как правильно формулировать вопросы, чтобы получить максимально полезные ответы от сообщества.'),
(3, 3, 'Предлагаю обсудить новые возможности платформы. Какие функции вы хотели бы видеть?'),
(4, 2, 'Если у вас возникли проблемы с авторизацией, опишите ситуацию подробно, и мы постараемся помочь.')
ON CONFLICT DO NOTHING;