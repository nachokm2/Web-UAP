import type { ComponentProps } from 'react'

import type { FormularioPostulacion } from '@/payload-types'
import { SITIO } from '@/lib/urls'

import { Breadcrumb } from './Breadcrumb'
import { FormularioBitrix } from './FormularioBitrix'

/** Página de un formulario por asesor o campaña: el título y su formulario de Bitrix24, como en WordPress. */
export function PaginaFormulario({
  formulario: f,
  contacto,
}: {
  formulario: FormularioPostulacion
  contacto: ComponentProps<typeof FormularioBitrix>['contacto']
}) {
  return (
    <>
      <Breadcrumb items={[{ nombre: 'Inicio', href: SITIO.inicio }, { nombre: 'Inscripción', href: SITIO.inscripcion }, { nombre: f.titulo }]} />
      <main id="main-content" className="page">
        <div className="page-hero">
          <div className="container">
            <h1>{f.titulo}</h1>
          </div>
        </div>
        <div className="container formulario-asesor">
          {/* Sin campaña: la atribución la da el propio formulario de Bitrix24, como en WordPress. */}
          <FormularioBitrix formulario={f.bitrixFormulario} loaderUrl={f.bitrixLoaderUrl} contacto={contacto} />
        </div>
      </main>
    </>
  )
}
