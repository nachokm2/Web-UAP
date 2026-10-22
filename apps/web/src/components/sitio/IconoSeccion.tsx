// Íconos de las secciones de programa (trazados de Lucide, licencia ISC), uno por tipo de
// contenido. Antes venían del sitio estático y varios no se correspondían con la sección.

const TRAZOS: Record<string, string[]> = {
  // Libro abierto: descripción del programa y secciones de texto.
  texto: ['M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z', 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z'],
  // Diana: objetivo u objetivos generales.
  objetivo: ['M2 12a10 10 0 1 0 20 0a10 10 0 1 0-20 0', 'M6 12a6 6 0 1 0 12 0a6 6 0 1 0-12 0', 'M10 12a2 2 0 1 0 4 0a2 2 0 1 0-4 0'],
  // Maletín: campo laboral.
  campoLaboral: ['M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16', 'M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z'],
  // Birrete: perfil del graduado / de egreso.
  perfil: [
    'M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z',
    'M22 10v6',
    'M6 12.5V16a6 3 0 0 0 12 0v-3.5',
  ],
  // Persona: perfil de ingreso.
  perfilIngreso: ['M8 7a4 4 0 1 0 8 0a4 4 0 1 0-8 0', 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'],
  // Personas: dirigido a.
  dirigidoA: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M5 7a4 4 0 1 0 8 0a4 4 0 1 0-8 0', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  // Lista con tildes: objetivos específicos.
  objetivosEspecificos: ['m3 17 2 2 4-4', 'm3 7 2 2 4-4', 'M13 6h8', 'M13 12h8', 'M13 18h8'],
  // Portapapeles con tilde: requisitos.
  requisitos: [
    'M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z',
    'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2',
    'm9 14 2 2 4-4',
  ],
  // Medalla: certificación.
  certificacion: [
    'M6 8a6 6 0 1 0 12 0a6 6 0 1 0-12 0',
    'm15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526',
  ],
}

export type TipoIcono = keyof typeof TRAZOS

export function IconoSeccion({ tipo }: { tipo: TipoIcono }) {
  return (
    <span className="section-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {TRAZOS[tipo].map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </span>
  )
}
