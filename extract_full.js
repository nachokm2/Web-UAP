const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const carreras = [
  { url: 'https://uap.edu.py/ingenieria-en-informatica/', slug: 'ingenieria-en-informatica' },
  { url: 'https://uap.edu.py/ingenieria-en-tecnologia-de-alimentos/', slug: 'ingenieria-en-tecnologia-de-alimentos' },
  { url: 'https://uap.edu.py/periodismo/', slug: 'periodismo' }
];

const dataDir = path.join(__dirname, 'data');

(async () => {
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:18800' });

  for (const carrera of carreras) {
    console.log('\\n=== Procesando:', carrera.slug, '===');
    const page = await browser.newPage();
    try {
      await page.goto(carrera.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await new Promise(r => setTimeout(r, 3000));

      const fullText = await page.evaluate(() => {
        const el = document.querySelector('.elementor-inner') || document.body;
        return el.innerText;
      });

      const brochure = await page.evaluate(() => {
        const links = document.querySelectorAll('a[href]');
        for (const l of links) {
          const href = l.getAttribute('href') || '';
          const text = l.textContent.trim().toLowerCase();
          if ((text.includes('brochure') || text.includes('descargar')) && href.includes('.pdf')) return href;
        }
        for (const l of links) {
          const href = l.getAttribute('href') || '';
          if (href.toLowerCase().includes('brochure') && href.includes('.pdf')) return href;
        }
        return '';
      });

      const tabs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.elementor-tab-desktop-title')).map(t => t.textContent.trim());
      });

      console.log('  Tabs encontrados:', tabs);

      const malla = {};
      for (const tabText of tabs) {
        const tabEls = await page.$$('.elementor-tab-desktop-title');
        for (const tabEl of tabEls) {
          const txt = await page.evaluate(el => el.textContent.trim(), tabEl);
          if (txt === tabText) {
            try {
              await tabEl.click();
            } catch(e) {}
            await new Promise(r => setTimeout(r, 1000));
            const materias = await page.evaluate(() => {
              const activeContent = document.querySelector('.elementor-tab-content.elementor-active');
              if (activeContent) {
                const items = activeContent.querySelectorAll('td, li');
                return Array.from(items).map(i => i.textContent.trim()).filter(t => t && t.length > 3 && !t.startsWith('table') && !t.includes('width:') && !t.includes('border:'));
              }
              return [];
            });
            malla[tabText] = materias;
            break;
          }
        }
      }

      const filePath = path.join(dataDir, `carrera_${carrera.slug}.json`);
      let data = {};
      if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
      data.full_text = fullText;
      data.brochure_url = brochure || data.brochure_url || '';
      if (Object.keys(malla).length > 0) {
        data.malla = malla;
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log('  Guardado:', filePath);
      console.log('  Brochure:', brochure || '(sin cambio)');
      console.log('  Semestres malla:', Object.keys(malla).join(', '));
    } catch (err) {
      console.error('  ERROR en', carrera.slug, ':', err.message);
    } finally {
      try { await page.close(); } catch(e) {}
    }
  }

  await browser.disconnect();
  console.log('\\n=== TERMINADO ===');
})();
