const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PORT = 8085;
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.json': 'application/json'
};

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    let ext = path.extname(filePath);
    let contentType = MIME_TYPES[ext] || 'text/plain';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, async () => {
    try {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.setViewportSize({ width: 1280, height: 900 });

        await page.goto(`http://localhost:${PORT}`);
        await page.waitForSelector('.pokemon-card');

        // Clic en Pikachu (ID 25) o primer pokemon para abrir modal
        await page.click('.pokemon-card');
        await page.waitForSelector('.modal-pokemon-title');

        // Esperar a que se cargue la lista de habilidades y hacer clic en la primera habilidad
        await page.waitForSelector('.ability-tag');
        await page.click('.ability-tag');

        // Esperar a que la descripción en español aparezca
        await page.waitForSelector('.ability-detail-text');

        // Esperar a que carguen los movimientos y hacer clic en la primera fila de movimiento
        await page.waitForSelector('.move-row');
        await page.click('.move-row');

        // Esperar a que se expanda el detalle del movimiento
        await page.waitForSelector('.move-detail-content');

        await page.screenshot({ path: '/home/jules/verification/modal_interactive_spanish.png' });
        console.log('Screenshot guardada exitosamente.');

        await browser.close();
    } catch (e) {
        console.error('Error en test:', e);
    } finally {
        server.close();
    }
});
