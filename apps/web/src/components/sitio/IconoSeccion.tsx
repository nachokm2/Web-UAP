// Íconos de las secciones de programa, uno por tipo de contenido: PNG de
// public/images/iconos-programa/, pintados de blanco puro para la insignia azul.
// Nombre de archivo = clave del tipo (kebab-case), para rastrear código y assets.

const ICONOS = {
  // Libro abierto: descripción del programa y secciones de texto.
  texto: 'texto',
  // Diana: objetivo u objetivos generales.
  objetivo: 'objetivo',
  // Maletín: campo laboral.
  campoLaboral: 'campo-laboral',
  // Birrete: perfil del graduado / de egreso.
  perfil: 'perfil',
  // Persona con birrete: perfil de ingreso.
  perfilIngreso: 'perfil-ingreso',
  // Personas: dirigido a.
  dirigidoA: 'dirigido-a',
  // Lista con tildes: objetivos específicos.
  objetivosEspecificos: 'objetivos-especificos',
  // Portapapeles con tilde: requisitos.
  requisitos: 'requisitos',
  // Medalla: certificación.
  certificacion: 'certificacion',
} as const

export type TipoIcono = keyof typeof ICONOS

export function IconoSeccion({ tipo }: { tipo: TipoIcono }) {
  return (
    <span className="section-icon" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- recurso estático chico, igual que iconos-carreras */}
      <img src={`/images/iconos-programa/${ICONOS[tipo]}.png`} alt="" width={18} height={18} loading="lazy" />
    </span>
  )
}
