// Íconos de las secciones de programa, uno por tipo de contenido. Perfil del Graduado,
// Perfil de Ingreso y Certificación son trazos de Lucide (licencia ISC, sin reemplazo
// provisto todavía); el resto son PNG en public/images/iconos-programa/, pintados de
// blanco puro a partir del original para calzar con el trazo blanco de los de Lucide.

const TRAZOS: Record<string, string[]> = {
  // Birrete: perfil del graduado / de egreso.
  perfil: [
    'M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z',
    'M22 10v6',
    'M6 12.5V16a6 3 0 0 0 12 0v-3.5',
  ],
  // Persona: perfil de ingreso.
  perfilIngreso: ['M8 7a4 4 0 1 0 8 0a4 4 0 1 0-8 0', 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'],
  // Medalla: certificación.
  certificacion: [
    'M6 8a6 6 0 1 0 12 0a6 6 0 1 0-12 0',
    'm15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526',
  ],
}

// Nombre de archivo = clave TipoIcono (kebab-case) para que código y assets sean trazables.
const IMAGENES: Record<string, string> = {
  // Libro abierto: descripción del programa y secciones de texto.
  texto: '/images/iconos-programa/texto.png',
  // Diana: objetivo u objetivos generales.
  objetivo: '/images/iconos-programa/objetivo.png',
  // Maletín: campo laboral.
  campoLaboral: '/images/iconos-programa/campo-laboral.png',
  // Personas: dirigido a.
  dirigidoA: '/images/iconos-programa/dirigido-a.png',
  // Lista con tildes: objetivos específicos.
  objetivosEspecificos: '/images/iconos-programa/objetivos-especificos.png',
  // Portapapeles con tilde: requisitos.
  requisitos: '/images/iconos-programa/requisitos.png',
}

export type TipoIcono = keyof typeof TRAZOS | keyof typeof IMAGENES

export function IconoSeccion({ tipo }: { tipo: TipoIcono }) {
  const imagen = IMAGENES[tipo]
  return (
    <span className="section-icon" aria-hidden="true">
      {imagen ? (
        // eslint-disable-next-line @next/next/no-img-element -- recurso estático chico, igual que iconos-carreras
        <img src={imagen} alt="" width={18} height={18} loading="lazy" />
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {TRAZOS[tipo].map((d) => (
            <path key={d} d={d} />
          ))}
        </svg>
      )}
    </span>
  )
}
