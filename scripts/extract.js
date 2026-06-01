const fs = require('fs');
const path = require('path');

async function extractCareerInfo(url, outputFile) {
    try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const html = await res.text();

        // Extract brochure URL from raw HTML
        let brochure = '';
        const pdfRegex = /href="([^"]+\.pdf)"/gi;
        let m;
        while ((m = pdfRegex.exec(html)) !== null) {
            const href = m[1];
            if (href.toLowerCase().includes('brochure') || href.toLowerCase().includes('descargar')) {
                brochure = href;
                break;
            }
        }
        // Also search for links containing brochure text
        if (!brochure) {
            const brochureRegex = /<a[^>]+href="([^"]+)"[^>]*>(?:[^<]*brochure[^<]*|[^<]*descargar[^<]*)<\/a>/gi;
            while ((m = brochureRegex.exec(html)) !== null) {
                const href = m[1];
                if (href.includes('.pdf')) {
                    brochure = href;
                    break;
                }
            }
        }
        // Make brochure absolute if relative
        if (brochure && brochure.startsWith('/')) {
            brochure = 'https://uap.edu.py' + brochure;
        }

        // Extract all visible text
        let text = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, ' ')
            .trim();

        // Try to find elementor-inner content if present
        const innerMatch = html.match(/class="elementor-inner"[^>]*>([\s\S]*?)<\/div>/i);
        let elementorText = '';
        if (innerMatch) {
            elementorText = innerMatch[1]
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/\s+/g, ' ')
                .trim();
        }

        // Read existing JSON
        let data = {};
        try {
            const existing = fs.readFileSync(outputFile, 'utf8');
            data = JSON.parse(existing);
        } catch (e) {
            // File doesn't exist or invalid JSON
        }

        // Add full_text and brochure_url
        data.full_text = elementorText || text;
        if (brochure) data.brochure_url = brochure;

        // Write back
        fs.mkdirSync(path.dirname(outputFile), { recursive: true });
        fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf8');

        console.log(`✅ ${url} → ${outputFile} (brochure: ${brochure || 'none'})`);
    } catch (err) {
        console.error(`❌ Error processing ${url}: ${err.message}`);
        process.exit(1);
    }
}

const url = process.argv[2];
const outputFile = process.argv[3];
if (!url || !outputFile) {
    console.error('Usage: node extract.js <url> <output.json>');
    process.exit(1);
}
extractCareerInfo(url, outputFile);
