// JavaScript to extract ALL section data from a rendered Elementor page
// Run this in the browser console on each career page

(() => {
    const result = {};
    
    // Find all section headers and their content
    const allWidgets = document.querySelectorAll('.elementor-element');
    
    let currentSection = null;
    
    for (const widget of allWidgets) {
        // Check if this widget has a heading
        const heading = widget.querySelector('.elementor-heading-title');
        if (heading) {
            const headingText = heading.textContent.trim().toUpperCase();
            
            // Map to our field names
            const sectionMap = {
                'TÍTULO': 'titulo',
                'DURACIÓN': 'duracion', 
                'SEDE': 'sede',
                'DESCRIPCIÓN': 'descripcion',
                'OBJETIVO': 'objetivo',
                'OBJETIVOS ESPECÍFICOS': 'objetivos_especificos',
                'A QUIÉN VA DIRIGIDO': 'a_quien_va_dirigido',
                'CAMPO LABORAL': 'campo_laboral',
                'PERFIL DE EGRESADO': 'perfil_egresado',
                'COMPETENCIAS DISCIPLINARIAS': 'competencias_disciplinarias',
                'COMPETENCIAS PROFESIONALES': 'competencias_profesionales',
                'COMPETENCIAS GENÉRICAS': 'competencias_genericas',
                'MISIÓN': 'mision',
                'VISIÓN': 'vision',
                'VALORES DE LA CARRERA': 'valores_text',
                'DEFINICIÓN DEL PROFESIONAL': 'definicion_profesional',
            };
            
            let matched = false;
            for (const [key, field] of Object.entries(sectionMap)) {
                if (headingText.startsWith(key) || headingText === key) {
                    currentSection = field;
                    matched = true;
                    break;
                }
            }
            
            if (!matched) {
                currentSection = null;
            }
            continue;
        }
        
        // Check if this widget has text content
        if (currentSection) {
            const textEditor = widget.querySelector('.elementor-widget-text-editor');
            const iconList = widget.querySelector('.elementor-widget-icon-list');
            
            if (textEditor) {
                const text = textEditor.textContent.trim();
                if (text && text.length > 5) {
                    // Remove form noise
                    let cleanText = text;
                    const formIdx = cleanText.indexOf('Completa este formulario');
                    if (formIdx > 0) cleanText = cleanText.substring(0, formIdx).trim();
                    cleanText = cleanText.replace(/Reportar un abuso/g, '').trim();
                    
                    if (cleanText && cleanText.length > 5) {
                        if (['objetivos_especificos', 'competencias_disciplinarias', 
                             'competencias_profesionales', 'competencias_genericas'].includes(currentSection)) {
                            if (!result[currentSection]) result[currentSection] = [];
                            const items = cleanText.split('\n').map(s => s.trim()).filter(s => s.length > 5);
                            result[currentSection] = items;
                        } else if (currentSection === 'valores_text') {
                            // Valores - split by lines, each line is a value
                            if (!result['valores']) result['valores'] = [];
                            const items = cleanText.split('\n').map(s => s.trim()).filter(s => s.length > 5);
                            result['valores'] = items;
                        } else {
                            result[currentSection] = cleanText;
                        }
                    }
                    currentSection = null;
                }
            } else if (iconList) {
                const items = iconList.querySelectorAll('.elementor-icon-list-item');
                const texts = Array.from(items).map(i => i.textContent.trim()).filter(t => t.length > 3);
                if (texts.length > 0) {
                    if (['objetivos_especificos', 'competencias_disciplinarias', 
                         'competencias_profesionales', 'competencias_genericas', 'valores_text'].includes(currentSection)) {
                        const field = currentSection === 'valores_text' ? 'valores' : currentSection;
                        result[field] = texts;
                    } else {
                        result[currentSection] = texts.join('\n');
                    }
                }
                currentSection = null;
            }
        }
    }
    
    // Extract brochure URL
    const links = document.querySelectorAll('a[href]');
    for (const l of links) {
        const href = l.getAttribute('href') || '';
        const text = l.textContent.trim().toLowerCase();
        if ((text.includes('brochure') || text.includes('descargar')) && href.includes('.pdf')) {
            result.brochure_url = href;
            break;
        }
    }
    if (!result.brochure_url) {
        for (const l of links) {
            const href = l.getAttribute('href') || '';
            if (href.toLowerCase().includes('brochure') && href.includes('.pdf')) {
                result.brochure_url = href;
                break;
            }
        }
    }
    
    return result;
})()