// Script to check which sections each career page has
const CARRERAS = [
    'odontologia', 'optica-y-contactologia', 'fisioterapia', 'fonoaudiologia',
    'psicologia', 'nutricion', 'podologia', 'administracion-de-empresas',
    'ciencias-de-la-educacion', 'derecho', 'trabajo-social', 'marketing-y-publicidad',
    'ingenieria-comercial', 'ingenieria-en-informatica', 'ingenieria-en-tecnologia-de-alimentos',
    'periodismo', 'educacion-parvularia', 'administracion-publica',
    'ciencias-contables', 'contabilidad-y-auditoria', 'contaduria-publica',
    'ingenieria-en-comercio-internacional', 'ingenieria-en-marketing',
];

const SECTIONS = [
    'TÍTULO', 'DURACIÓN', 'SEDE', 'DESCRIPCIÓN', 'OBJETIVO',
    'OBJETIVOS ESPECÍFICOS', 'A QUIÉN VA DIRIGIDO', 'CAMPO LABORAL',
    'PERFIL DE EGRESADO', 'COMPETENCIAS DISCIPLINARIAS', 'COMPETENCIAS PROFESIONALES',
    'COMPETENCIAS GENÉRICAS', 'MISIÓN', 'VISIÓN', 'VALORES DE LA CARRERA',
    'DEFINICIÓN DEL PROFESIONAL', 'PLAN DE ESTUDIOS'
];

async function check(slug) {
    try {
        const resp = await fetch(`https://uap.edu.py/${slug}/`);
        const html = await resp.text();
        const found = SECTIONS.filter(s => html.toUpperCase().includes(s));
        console.log(`${slug}: ${found.length}/${SECTIONS.length} sections: ${found.join(', ')}`);
    } catch(e) {
        console.log(`${slug}: ERROR - ${e.message}`);
    }
}

(async () => {
    for (const slug of CARRERAS) {
        await check(slug);
    }
})();