// Contenido inicial del V Summit Internacional UAP 2026 (antes escrito dentro de
// SummitUap2026.tsx). Se usa de dos maneras:
//  1. Carga inicial del CMS (lib/eventos/sembrar.ts): crea el evento, los expositores y las
//     imágenes la primera vez, para que la página se vea igual antes y después de pasar al CMS.
//  2. Respaldo de la página mientras el evento no exista en el CMS (por ejemplo, recién desplegado).
// Una vez cargado, el contenido se edita en el panel (Eventos) y este archivo ya no manda.

/** Carpeta de /public con las imágenes originales del Summit. */
export const CARPETA_IMAGENES_SUMMIT = '/images/summit-2026'

/** Dirección fija de la landing (carpeta de rutas estática: tiene prioridad sobre /[slug]). */
export const SLUG_SUMMIT = 'summit-internacional-uap2026'

/** Ancla del formulario de inscripción dentro de la página. */
export const ANCLA_INSCRIPCION = 'inscripcion'

export type RedEvento = 'instagram' | 'linkedin' | 'x'

export type ContenidoEvento = {
  slug: string
  nombre: string
  titulo: string
  /** AAAA-MM-DD */
  fechaIso: string
  /** HH:mm (para el marcado de Google Eventos) */
  horaInicio: string
  horaFin: string
  lugar: string
  ciudad: string
  direccion: string
  mapa: string
  hashtag: string
  correo: string
  textoBoton: string
  /** Archivos de CARPETA_IMAGENES_SUMMIT */
  banner: string
  imagenEvento: string
  tituloIntro: string
  parrafos: string[]
  certificacion: string[]
  redes: { red: RedEvento; url: string }[]
  organizador: { nombre: string; logo: string }
  colaboran: { nombre: string; url: string; logo: string }[]
  /** En el orden en que aparecen en "Expositores". */
  expositores: {
    id: string
    nombre: string
    cargo: string
    institucion: string
    pais?: string
    foto: string
    logo: string
  }[]
  programa: { hora: string; titulo: string; rol?: string; nota?: string; personas?: string[] }[]
  comites: { titulo: string; imagen: string; ancho: number; alto: number }[]
}

export const CONTENIDO_SUMMIT: ContenidoEvento = {
  slug: SLUG_SUMMIT,
  nombre: 'V Summit Internacional UAP 2026',
  titulo: 'La nueva era del trabajo y el talento',
  fechaIso: '2026-11-19',
  horaInicio: '08:00',
  horaFin: '13:30',
  lugar: 'Hotel Sheraton Asunción',
  ciudad: 'Asunción',
  direccion: 'Aviadores Del Chaco 2066, Asunción, Paraguay',
  mapa: 'https://maps.google.com/?q=Hotel+Sheraton+Asunción+Aviadores+Del+Chaco+2066+Asunción+Paraguay',
  hashtag: '#SummitParaguay2026',
  correo: 'marketing@uap.edu.py',
  textoBoton: 'Inscríbete para asistir al evento',
  banner: 'banner-escritorio.jpg',
  imagenEvento: 'evento.jpg',
  tituloIntro:
    'Un espacio de análisis, ideas y tendencias globales para quienes lideran hoy las decisiones del mañana.',
  parrafos: [
    'Hablar de la “La nueva era del trabajo y el talento” es reconocer una transformación estructural: las reglas del mercado laboral no están cambiando a futuro, ya han mutado radicalmente en el presente. En esta coyuntura, el trabajo y el talento dejan de ser variables independientes para convertirse en una ecuación indivisible; no existe nueva era del trabajo sin una redefinición profunda del capital humano que la impulsa, ni talento sostenible sin entornos laborales que potencien su máximo valor.',
    'La irrupción acelerada de la Inteligencia Artificial Generativa, la automatización avanzada, los modelos dinámicos de trabajo y la exigencia de upskilling y reskilling continuo han dejado obsoletos los esquemas tradicionales. Hoy asistimos al nacimiento de un nuevo paradigma: la empleabilidad ya no se mide por la formación de origen o el historial del pasado, sino por la agilidad estratégica, la capacidad de desaprender y el aprendizaje permanente hacia adelante.',
    'El V Summit Internacional UAP se posiciona en la vanguardia de esta discusión global, reuniendo los temas clave y las tendencias mundiales que están reconfigurando el panorama productivo internacional. Más que un punto de encuentro es una declaración de principios: un espacio estratégico de alta dirección para que los líderes y tomadores de decisiones dejen de reaccionar ante la coyuntura y comiencen a diseñar, con visión de futuro, el ecosistema donde convergerán el trabajo y el talento del mañana.',
  ],
  certificacion: [
    'Universidad Autónoma del Paraguay',
    'Universidad Autónoma de Chile',
    'Fundación Internacional ORP',
  ],
  redes: [
    { red: 'instagram', url: 'https://www.instagram.com/uap_py' },
    {
      red: 'linkedin',
      url: 'https://www.linkedin.com/company/universidad-aut%C3%B3noma-del-paraguay/',
    },
    { red: 'x', url: 'https://twitter.com/uap_py' },
  ],
  organizador: { nombre: 'Universidad Autónoma del Paraguay', logo: 'logo-uap-color.png' },
  colaboran: [
    {
      nombre: 'Universidad Autónoma de Chile',
      logo: 'logo-universidad-autonoma-chile.png',
      url: 'https://www.uautonoma.cl/',
    },
    { nombre: 'Fundación Internacional ORP', logo: 'logo-orp.jpg', url: 'https://gan.education/' },
    { nombre: 'Global Academic Network', logo: 'logo-gan.jpg', url: 'https://gan.education/' },
  ],
  expositores: [
    {
      id: 'ruffinelli',
      nombre: 'Carlos Ruffinelli',
      cargo: 'Rector',
      institucion: 'Universidad Autónoma del Paraguay',
      pais: 'Paraguay',
      foto: 'carlos-ruffinelli.jpg',
      logo: 'logo-uap.jpg',
    },
    {
      id: 'ribera',
      nombre: 'Dr. Teodoro Ribera',
      cargo: 'Rector',
      institucion: 'Universidad Autónoma de Chile',
      pais: 'Chile',
      foto: 'teodoro-ribera.jpg',
      logo: 'logo-ua.jpg',
    },
    {
      id: 'mondelo',
      nombre: 'Dr. Pedro R. Mondelo',
      cargo: 'Director',
      institucion: 'Fundación Internacional ORP',
      pais: 'España',
      foto: 'pedro-mondelo.jpg',
      logo: 'orp.jpg',
    },
    {
      id: 'villalba',
      nombre: 'Eva Villalba',
      cargo: 'Presidenta Consejo de Administración',
      institucion: 'Cooperativa Universitaria Paraguay',
      foto: 'eva-villalba.jpg',
      logo: 'cooperativa-universitaria-paraguay.jpg',
    },
    {
      id: 'battistotti',
      nombre: 'Mariano Battistotti',
      cargo: 'Regional HR Director',
      institucion: 'SkyTel',
      pais: 'Argentina',
      foto: 'mariano-battistoni.jpg',
      logo: 'skytel.jpg',
    },
    {
      id: 'barahona',
      nombre: 'Esteban Barahona',
      cargo: 'Director Comercial y de Procesos de Postgrado',
      institucion: 'Universidad Autónoma de Chile',
      pais: 'Chile',
      foto: 'esteban-barahona.jpg',
      logo: 'logo-ua.jpg',
    },
    {
      id: 'schmidt',
      nombre: 'Daniel Schmidt Mclachlan',
      cargo: 'Decano de la Facultad de Arquitectura, Construcción y Medio Ambiente',
      institucion: 'Universidad Autónoma de Chile',
      pais: 'Chile',
      foto: 'daniel-schmidt-mclachlan.jpg',
      logo: 'logo-ua.jpg',
    },
  ],
  programa: [
    { hora: '08:00', titulo: 'Café de bienvenida – Acreditación' },
    {
      hora: '09:00',
      titulo: 'Bienvenida – Inauguración',
      personas: ['ruffinelli', 'ribera', 'mondelo'],
    },
    {
      hora: '09:15',
      titulo:
        'Conferencia inaugural: “Cooperativismo, liderazgo y desarrollo del talento en la nueva era del trabajo”',
      personas: ['villalba'],
    },
    {
      hora: '10:00',
      titulo: 'Conferencia inaugural: “El talento del Siglo XXI”',
      personas: ['battistotti'],
    },
    { hora: '10:30', titulo: 'Coffee – Networking' },
    {
      hora: '11:00',
      titulo:
        'Mesa de conversación: “La obsolescencia de las competencias y el nuevo valor del talento”',
      rol: 'Modera',
      personas: ['barahona'],
    },
    {
      hora: '11:30',
      titulo: 'Mesa de conversación: “El nuevo contrato social del Talento”',
      nota: 'Modera: Fundación Internacional ORP',
      rol: 'Panelistas',
      personas: ['schmidt'],
    },
    { hora: '12:00', titulo: 'Conferencia de clausura', personas: ['mondelo'] },
    { hora: '12:30', titulo: 'Ceremonia de clausura' },
    { hora: '12:40', titulo: 'Cóctel' },
  ],
  comites: [
    {
      titulo: 'Comité asesor empresarial ORP',
      imagen: 'logos-comite-empresarial.jpg',
      ancho: 1000,
      alto: 400,
    },
    {
      titulo: 'Comité asesor institucional ORP',
      imagen: 'logos-comite-institucional.jpg',
      ancho: 1000,
      alto: 700,
    },
    { titulo: 'Comité científico', imagen: 'logos-comite-cientifico.jpg', ancho: 1000, alto: 500 },
  ],
}
