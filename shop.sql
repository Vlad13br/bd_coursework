CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    surname VARCHAR(100),
    email VARCHAR(255),
    address VARCHAR(255),
    phone VARCHAR(20),
    password VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE watchers (
    watcher_id SERIAL PRIMARY KEY,
    product_name VARCHAR(255),
    price DECIMAL(10, 2),
    description TEXT,
    material VARCHAR(50),
    rating DECIMAL(3, 2),
    rating_count INT ,
    discount DECIMAL(10, 2),
    brand VARCHAR(50),
    stock INT,
    image_url TEXT 
);

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    order_start TIMESTAMP DEFAULT NOW(),
    order_end TIMESTAMP,
    payment_method VARCHAR(50),
    shipping_status VARCHAR(50) DEFAULT 'pending',
    user_id INT REFERENCES users(user_id)
);

CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(order_id),
    quantity INT,
    price DECIMAL(10, 2),
    watcher_id INT REFERENCES watchers(watcher_id)
);

CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    rating DECIMAL(3, 2),
    review_text TEXT,
    review_date TIMESTAMP DEFAULT NOW(),
    order_item_id INT REFERENCES order_items(order_item_id)
);

CREATE OR REPLACE FUNCTION update_watcher_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE watchers
  SET 
    rating = COALESCE((
      SELECT ROUND(AVG(r.rating), 2)
      FROM reviews r
      JOIN order_items oi ON r.order_item_id = oi.order_item_id
      WHERE oi.watcher_id = (
        SELECT watcher_id
        FROM order_items
        WHERE order_item_id = NEW.order_item_id
      )
    ), 0),
    rating_count = COALESCE((
      SELECT COUNT(r.rating)
      FROM reviews r
      JOIN order_items oi ON r.order_item_id = oi.order_item_id
      WHERE oi.watcher_id = (
        SELECT watcher_id
        FROM order_items
        WHERE order_item_id = NEW.order_item_id
      )
    ), 0)
  WHERE watcher_id = (
    SELECT watcher_id
    FROM order_items
    WHERE order_item_id = NEW.order_item_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_review_insert
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_watcher_rating();

CREATE TRIGGER after_review_update
AFTER UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_watcher_rating();

тестові годинники
INSERT INTO watchers (product_name, price, description, material, rating, rating_count, discount, brand, stock, image_url)
VALUES
('Original Gent', 99.99, 'Стильний годинник із класичним дизайном', 'Пластик', NULL, NULL, 0, 'Swatch', 10, 'https://swatch.ua/media/menu/original_gent_SS20.jpg'),
('New Gent', 149.99, 'Універсальний годинник із сучасним виглядом', 'Пластик', NULL, NULL, 10, 'Swatch', 15, 'https://swatch.ua/media/menu/original_new_gent_SS20.jpg'),
('Original Lady', 89.99, 'Мініатюрний годинник для жінок', 'Пластик', NULL, NULL, 5, 'Swatch', 20, 'https://swatch.ua/media/menu/original_lady_SS20.jpg'),
('Sistem51', 299.99, 'Автоматичний механізм із футуристичним дизайном', 'Нержавіюча сталь', NULL, NULL, 15, 'Swatch', 5, 'https://swatch.ua/media/menu/original_sistem51_FW19-v2_5.jpg'),
('Chrono', 199.99, 'Спортивний годинник із хронографом', 'Силікон', NULL, NULL, 10, 'Swatch', 8, 'https://swatch.ua/media/menu/original_chrono_SS20.jpg'),
('Original Pop', 79.99, 'Яскравий молодіжний дизайн', 'Пластик', NULL, NULL, 0, 'Swatch', 25, 'https://swatch.ua/media/menu/originals_pop-FW18_3.jpg'),
('Big Bold Jelly', 179.99, 'Прозорий дизайн із великим циферблатом', 'Пластик', NULL, NULL, 20, 'Swatch', 12, 'https://swatch.ua/media/menu/originals_big_bold_jelly-FW19_3.jpg'),
('Big Bold Chrono', 249.99, 'Великий годинник із хронографом', 'Нержавіюча сталь', NULL, NULL, 15, 'Swatch', 7, 'https://swatch.ua/media/menu/Big-Bold_Chrono_desktop_3.jpg'),
('Irony Medium', 139.99, 'Елегантний годинник середнього розміру', 'Алюміній', NULL, NULL, 0, 'Swatch', 10, 'https://swatch.ua/media/menu/irony_medium_SS20.jpg'),
('Irony Lady', 129.99, 'Вишуканий жіночий годинник', 'Алюміній', NULL, NULL, 5, 'Swatch', 18, 'https://swatch.ua/media/menu/irony_lady-FW18_4.jpg');

-- Створення користувачів
INSERT INTO users (name, surname, email, address, phone, password, role)
VALUES
('Іван', 'Іванов', 'ivan@example.com', 'вул. Центральна, 1', '0987654321', 'password123', 'user'),
('Марія', 'Петренко', 'maria@example.com', 'вул. Шевченка, 2', '0976543210', 'password123', 'user'),
('Олександр', 'Сидоров', 'alexander@example.com', 'вул. Лесі Українки, 3', '0965432109', 'admin123', 'admin');


