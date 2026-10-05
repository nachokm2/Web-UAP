// Íconos de las secciones de programa (mismos trazados que el sitio estático).

const TRAZOS: Record<string, string[]> = {
  objetivo: ['M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'],
  campoLaboral: ['M21 13.255A10.008 10.008 0 0112 22c-5.523 0-10-4.477-10-10S6.477 2 12 2a10 10 0 018.744 5.255M16 6l4 0m0 0l0 4m0-4l-4 4'],
  perfil: ['M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5 9-5 9 5-9 5zm0-7v7'],
  dirigidoA: ['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', 'M23 21v-2a4 4 0 00-3-3.87', 'M16 3.13a4 4 0 010 7.75'],
  objetivosEspecificos: [
    'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  ],
  requisitos: ['M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'],
  certificacion: [
    'M12 14l9-5-9-5-9 5 9 5z',
    'M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
    'M21.5 12h-4.5M2.5 12h4.5',
  ],
  texto: ['M4 6h16M4 12h16M4 18h7'],
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
