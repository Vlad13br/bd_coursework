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
                    imgUrls.push(img.src);
                }
            });
            return imgUrls // перші 10 зображень slice(2, 12);
        });

        console.log('Знайдені зображення:', images);
    } catch (error) {
        console.error('Error fetching images:', error);
    } finally {
        await browser.close();
    }
}

fetchImages();