import Link from 'next/link'

import { SITIO } from '@/lib/urls'

export default function NoEncontrada() {
  return (
    <main id="main-content" className="container no-encontrada">
      <h1>No encontramos esta página</h1>
      <p>Puede que la dirección haya cambiado. Estas secciones pueden ayudarte:</p>
      <div className="acciones-hero">
        <Link href={SITIO.carreras} className="btn-outline">Carreras</Link>
        <Link href={SITIO.posgrados} className="btn-outline">Posgrados</Link>
        <Link href={SITIO.noticias} className="btn-outline">Noticias</Link>
        <Link href={SITIO.contacto} className="btn-outline">Contacto</Link>
      </div>
    </main>
  )
}
