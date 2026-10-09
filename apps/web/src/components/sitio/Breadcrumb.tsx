import Link from 'next/link'

export type Miga = { nombre: string; href?: string }

/** Migas de pan con microdatos BreadcrumbList (mismo marcado que el sitio estático). */
export function Breadcrumb({ items }: { items: Miga[] }) {
  return (
    <nav aria-label="Ubicación en el sitio" className="breadcrumb-nav">
      <div className="container">
        <ol className="breadcrumb" itemScope itemType="https://schema.org/BreadcrumbList">
          {items.map((m, i) => (
            <li key={`${m.nombre}-${i}`} itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              {m.href ? (
                <Link itemProp="item" href={m.href}>
                  <span itemProp="name">{m.nombre}</span>
                </Link>
              ) : (
                <span itemProp="name" aria-current="page">
                  {m.nombre}
                </span>
              )}
              <meta itemProp="position" content={String(i + 1)} />
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}
