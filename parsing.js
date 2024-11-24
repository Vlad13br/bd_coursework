const puppeteer = require('puppeteer');

const url = 'https://swatch.ua/chasy';

async function fetchImages() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        // Відкриваємо сторінку
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Затримка для завантаження контенту
        await page.waitForSelector('img');

        // Парсимо всі зображення
        const images = await page.evaluate(() => {
            // Знаходимо всі <img> на сторінці
            const imgElements = document.querySelectorAll('img');
            const imgUrls = [];
            imgElements.forEach((img) => {
                if (img.src) {
                    imgUrls.push(img.src); // Додаємо src зображення
                }
            });
            return imgUrls.slice(2, 12); // Беремо перші 10 зображень
        });

        console.log('Знайдені зображення:', images); // Виводимо результат
    } catch (error) {
        console.error('Error fetching images:', error);
    } finally {
        await browser.close(); // Закриваємо браузер
    }
}

fetchImages();
