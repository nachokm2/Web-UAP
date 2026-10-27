'use client'

// Cinta de logos de Alianzas Estratégicas en la portada: se desplaza sola (CSS, marquee-scroll)
// y se detiene con el puntero encima, con el foco del teclado adentro o con el botón
// (WCAG 2.2.2). Con "reducir movimiento" no se mueve y el botón no se muestra.

import { useState, type ReactNode } from 'react'

export function CintaAlianzas({ children }: { children: ReactNode }) {
  const [detenida, setDetenida] = useState(false)
  return (
    <>
      <div className="partners-marquee">
        <div className={detenida ? 'partners-track partners-track--detenida' : 'partners-track'}>{children}</div>
      </div>
      <button type="button" className="cinta-control" onClick={() => setDetenida((d) => !d)}>
        {detenida ? 'Reanudar el desplazamiento de los logos' : 'Pausar el desplazamiento de los logos'}
      </button>
    </>
  )
}
