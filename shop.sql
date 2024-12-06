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
    -- Оновлюємо рейтинг, використовуючи середнє значення з таблиці reviews
    -- Якщо середнє значення нема, ставимо 0 за допомогою COALESCE.
    rating = COALESCE((
      SELECT ROUND(AVG(r.rating), 2)
      FROM reviews r
      JOIN order_items oi ON r.order_item_id = oi.order_item_id
      WHERE oi.watcher_id = (  -- Отримуємо watcher_id для відповідного order_item_id
        SELECT watcher_id
        FROM order_items
        WHERE order_item_id = NEW.order_item_id  -- Визначаємо watcher_id для поточного запису
      )
    ), 0),

    -- Оновлюємо кількість відгуків для спостерігача , якщо їх немає ставимо 0
    rating_count = COALESCE((
      SELECT COUNT(r.rating)
      FROM reviews r
      JOIN order_items oi ON r.order_item_id = oi.order_item_id
      WHERE oi.watcher_id = (  -- Отримуємо watcher_id для відповідного order_item_id
        SELECT watcher_id
        FROM order_items
        WHERE order_item_id = NEW.order_item_id  -- Визначаємо watcher_id для поточного запису
      )
    ), 0)

  -- Оновлюємо записи в таблиці watchers для правильного watcher_id
  WHERE watcher_id = (
    SELECT watcher_id
    FROM order_items
    WHERE order_item_id = NEW.order_item_id  -- Використовуємо order_item_id, який міститься у NEW
  );

  -- Повертаємо новий запис після виконання оновлення
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

CREATE TRIGGER trg_CheckEmailBeforeInsert
ON users
INSTEAD OF INSERT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE email = (SELECT email FROM inserted))
    BEGIN
        PRINT 'Email вже існує в базі даних. Вставка скасована.'
    END
    ELSE
    BEGIN
        INSERT INTO users (user_id, username, email, address, phone, password, role, created_at, updated_at)
        SELECT user_id, username, email, address, phone, password, role, created_at, updated_at
        FROM inserted;
    END
END;


INSERT INTO users (name, surname, email, address, phone, password, role)
VALUES
('Іван', 'Іванов', 'ivan@example.com', 'вул. Центральна, 1', '0987654321', 'password123', 'user'),
('Марія', 'Петренко', 'maria@example.com', 'вул. Шевченка, 2', '0976543210', 'password123', 'user'),
('Олександр', 'Сидоров', 'alexander@example.com', 'вул. Лесі Українки, 3', '0965432109', 'admin123', 'admin');


INSERT INTO watchers (product_name, price, description, material, rating, rating_count, discount, brand, stock, image_url) VALUES
('SYXS158', 3200.00, 'Класичний наручний годинник із нержавіючої сталі. Легкий і стильний дизайн.', 'Нержавіюча сталь', 0, 0, 0, 'Swatch', 25, 'https://swatch.ua/media/catalog/product/cache/2/thumbnail/301x217/9df78eab33525d08d6e5fb8d27136e95/s/y/syxs158.jpg'),
('SB07S118', 4500.00, 'Стильний спортивний годинник із кварцовим механізмом. Підходить для активного способу життя.', 'Силікон', 0, 0, 0, 'Swatch', 30, 'https://swatch.ua/media/catalog/product/cache/2/thumbnail/301x217/9df78eab33525d08d6e5fb8d27136e95/s/b/sb07s118.jpg'),
('YVS531', 5400.00, 'Наручний хронограф із розширеними функціями та водонепроникністю до 30 м.', 'Нержавіюча сталь', 0, 0, 0, 'Swatch', 20, 'https://swatch.ua/media/catalog/product/cache/2/thumbnail/301x217/9df78eab33525d08d6e5fb8d27136e95/y/v/yvs531.jpg'),
('YVS532', 5100.00, 'Годинник із чорним циферблатом та ремінцем зі шкіри. Елегантний вибір для офіційного стилю.', 'Шкіра', 0, 0, 0, 'Swatch', 15, 'https://swatch.ua/media/catalog/product/cache/2/thumbnail/301x217/9df78eab33525d08d6e5fb8d27136e95/y/v/yvs532.jpg'),
('YIS434', 6000.00, 'Ексклюзивний механічний годинник для справжніх поціновувачів швейцарської якості.', 'Нержавіюча сталь', 0, 0, 0, 'Swatch', 10, 'https://swatch.ua/media/catalog/product/cache/2/thumbnail/301x217/9df78eab33525d08d6e5fb8d27136e95/y/i/yis434.jpg'),
('SO29Z146', 2900.00, 'Яскравий годинник із пластиковим корпусом. Ідеальний вибір для молоді.', 'Пластик', 0, 0, 0, 'Swatch', 50, 'https://swatch.ua/media/catalog/product/cache/2/thumbnail/301x217/9df78eab33525d08d6e5fb8d27136e95/s/o/so29z146-5300.jpg'),
('SB07S120', 4700.00, 'Сучасний спортивний годинник із зручним силіконовим ремінцем.', 'Силікон', 0, 0, 0, 'Swatch', 40, 'https://swatch.ua/media/catalog/product/cache/2/thumbnail/301x217/9df78eab33525d08d6e5fb8d27136e95/s/b/sb07s120.jpg'),
('SYXB108', 3300.00, 'Годинник із мінімалістичним дизайном для повсякденного використання.', 'Пластик', 0, 0, 0, 'Swatch', 35, 'https://swatch.ua/media/catalog/product/cache/2/thumbnail/301x217/9df78eab33525d08d6e5fb8d27136e95/s/y/syxb108.jpg'),
('ZFCSP129', 2700.00, 'Веселий і яскравий годинник для дитячої аудиторії.', 'Пластик', 0, 0, 0, 'Swatch', 60, 'https://swatch.ua/media/catalog/product/cache/2/thumbnail/301x217/9df78eab33525d08d6e5fb8d27136e95/z/f/zfcsp129.jpg'),
('SO34Z101', 3100.00, 'Модний годинник із великим циферблатом. Підходить для щоденного стилю.', 'Пластик', 0, 0, 0, 'Swatch', 20, 'https://swatch.ua/media/catalog/product/cache/2/thumbnail/301x217/9df78eab33525d08d6e5fb8d27136e95/s/o/so34z101.jpg');
('YVS530', 5200.00, 'Класичний годинник із чорним циферблатом. Елегантний та функціональний.', 'Нержавіюча сталь', 0, 0, 0, 'Swatch', 18, 'https://swatch.ua/media/catalog/product/cache/2/thumbnail/301x217/9df78eab33525d08d6e5fb8d27136e95/y/v/yvs530.jpg'),
('YVM407G', 5800.00, 'Чоловічий годинник із браслетом із нержавіючої сталі. Надійний і стильний.', 'Нержавіюча сталь', 0, 0, 0, 'Swatch', 12, 'https://swatch.ua/media/catalog/product/cache/2/thumbnail/301x217/9df78eab33525d08d6e5fb8d27136e95/y/v/yvm407g.jpg'),
('SO29Z146', 2900.00, 'Яскравий годинник із пластиковим корпусом. Ідеальний вибір для молоді.', 'Пластик', 0, 0, 0, 'Swatch', 50, 'https://swatch.ua/media/catalog/product/cache/2/thumbnail/301x217/9df78eab33525d08d6e5fb8d27136e95/s/o/so29z146-5300.jpg'),
('SB07S120', 4700.00, 'Сучасний спортивний годинник із зручним силіконовим ремінцем.', 'Силікон', 0, 0, 0, 'Swatch', 40, 'https://swatch.ua/media/catalog/product/cache/2/thumbnail/301x217/9df78eab33525d08d6e5fb8d27136e95/s/b/sb07s120.jpg'),
('SYXB108', 3300.00, 'Годинник із мінімалістичним дизайном для повсякденного використання.', 'Пластик', 0, 0, 0, 'Swatch', 35, 'https://swatch.ua/media/catalog/product/cache/2/thumbnail/301x217/9df78eab33525d08d6e5fb8d27136e95/s/y/syxb108.jpg'),
('ZFCSP128', 2800.00, 'Модний дитячий годинник із яскравим дизайном.', 'Пластик', 0, 0, 0, 'Swatch', 40, 'https://swatch.ua/media/catalog/product/cache/2/thumbnail/301x217/9df78eab33525d08d6e5fb8d27136e95/z/f/zfcsp128.jpg'),
('ZFCSP127', 2600.00, 'Веселий дитячий годинник із привабливими кольорами.', 'Пластик', 0, 0, 0, 'Swatch', 45, 'https://swatch.ua/media/catalog/product/cache/2/thumbnail/301x217/9df78eab33525d08d6e5fb8d27136e95/z/f/zfcsp127_1.jpg'),
('SO34Z101', 3100.00, 'Модний годинник із великим циферблатом. Підходить для щоденного стилю.', 'Пластик', 0, 0, 0, 'Swatch', 20, 'https://swatch.ua/media/catalog/product/cache/2/thumbnail/301x217/9df78eab33525d08d6e5fb8d27136e95/s/o/so34z101.jpg'),
('SO34Z102', 3200.00, 'Годинник у нейтральних кольорах для універсального стилю.', 'Пластик', 0, 0, 0, 'Swatch', 25, 'https://swatch.ua/media/catalog/product/cache/2/thumbnail/301x217/9df78eab33525d08d6e5fb8d27136e95/s/o/so34z102.jpg'),
('SO34Z103', 3300.00, 'Сучасний годинник із акцентом на мінімалізм.', 'Пластик', 0, 0, 0, 'Swatch', 28, 'https://swatch.ua/media/catalog/product/cache/2/thumbnail/301x217/9df78eab33525d08d6e5fb8d27136e95/s/o/so34z103.jpg');
('Original Gent', 1909.99, 'Стильний годинник із класичним дизайном', 'Пластик', 0, 0, 0, 'Swatch', 10, 'https://swatch.ua/media/menu/original_gent_SS20.jpg'),
('New Gent', 2409.99, 'Універсальний годинник із сучасним виглядом', 'Пластик', 0, 0, 0, 'Swatch', 15, 'https://swatch.ua/media/menu/original_new_gent_SS20.jpg'),
('Original Lady', 1809.99, 'Мініатюрний годинник для жінок', 'Пластик', 0, 0, 0, 'Swatch', 20, 'https://swatch.ua/media/menu/original_lady_SS20.jpg'),
('Sistem51', 4909.99, 'Автоматичний механізм із футуристичним дизайном', 'Нержавіюча сталь', 0, 0, 0, 'Swatch', 5, 'https://swatch.ua/media/menu/original_sistem51_FW19-v2_5.jpg'),
('Chrono', 3909.99, 'Спортивний годинник із хронографом', 'Силікон', 0, 0, 0, 'Swatch', 8, 'https://swatch.ua/media/menu/original_chrono_SS20.jpg'),
('Original Pop', 1709.99, 'Яскравий молодіжний дизайн', 'Пластик', 0, 0, 0, 'Swatch', 25, 'https://swatch.ua/media/menu/originals_pop-FW18_3.jpg'),
('Big Bold Jelly', 2909.99, 'Прозорий дизайн із великим циферблатом', 'Пластик', 0, 0, 0, 'Swatch', 12, 'https://swatch.ua/media/menu/originals_big_bold_jelly-FW19_3.jpg'),
('Big Bold Chrono', 4409.99, 'Великий годинник із хронографом', 'Нержавіюча сталь', 0, 0, 0, 'Swatch', 7, 'https://swatch.ua/media/menu/Big-Bold_Chrono_desktop_3.jpg'),
('Irony Medium', 3209.99, 'Елегантний годинник середнього розміру', 'Алюміній', 0, 0, 0, 'Swatch', 10, 'https://swatch.ua/media/menu/irony_medium_SS20.jpg'),
('Irony Lady', 3109.99, 'Вишуканий жіночий годинник', 'Алюміній', 0, 0, 0, 'Swatch', 18, 'https://swatch.ua/media/menu/irony_lady-FW18_4.jpg');


select * from reviews;

DO $$
DECLARE
    v_watcher_id INT;
    v_user_id INT;
    v_order_id INT;
    v_order_item_id INT;
    v_rating NUMERIC;
BEGIN
    -- Ітерація по годинниках
    FOR v_watcher_id IN 22..51 LOOP
        -- Ітерація по користувачах
        FOR v_user_id IN 7..16 LOOP
            -- Створення замовлення для користувача
            INSERT INTO orders (user_id, payment_method, shipping_status)
            VALUES (v_user_id, 'credit_card', 'completed')
            RETURNING order_id INTO v_order_id;

            -- Додавання товару до замовлення
            INSERT INTO order_items (order_id, quantity, price, watcher_id)
            VALUES (v_order_id, 1, (SELECT price FROM watchers WHERE watcher_id = v_watcher_id), v_watcher_id)
            RETURNING order_item_id INTO v_order_item_id;

            -- Генерація рейтингу (1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5)
            -- Вибір випадкового рейтингу з можливих значень
            v_rating := (ARRAY[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5])[FLOOR(1 + random() * 9)::INT];

            -- Додавання відгуку
            INSERT INTO reviews (rating, review_text, order_item_id)
            VALUES (
                v_rating,  -- Випадковий рейтинг
                'This is a review for watcher ' || v_watcher_id || ' by user ' || v_user_id || '.', -- Текст відгуку
                v_order_item_id
            );
        END LOOP;
    END LOOP;
END $$;


TRUNCATE TABLE reviews, order_items, orders RESTART IDENTITY CASCADE;