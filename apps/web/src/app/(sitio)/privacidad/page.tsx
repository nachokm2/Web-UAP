// Política de privacidad (antes pages/privacidad.html). Dirección, teléfono y correo
// salen de la global Configuración.

import type { Metadata } from 'next'

import { Breadcrumb } from '@/components/sitio/Breadcrumb'
import { obtenerConfiguracion } from '@/lib/datos'
import { SITIO, urlAbsoluta } from '@/lib/urls'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de Privacidad de la Universidad Autónoma del Paraguay. Información sobre el tratamiento de datos personales.',
  alternates: { canonical: urlAbsoluta(SITIO.privacidad) },
}

export default async function PaginaPrivacidad() {
  const config = await obtenerConfiguracion()
  const correo = config.email ? <a href={`mailto:${config.email}`}>{config.email}</a> : null

  return (
    <>
      <Breadcrumb items={[{ nombre: 'Inicio', href: SITIO.inicio }, { nombre: 'Privacidad' }]} />
      <main id="main-content">
        <section className="page-hero">
          <div className="container">
            <h1>Política de Privacidad</h1>
            <p className="lead">Información sobre el tratamiento de sus datos personales.</p>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container">
            <div className="privacy-container">
              <span className="last-update">Última actualización: junio de 2026</span>

              <div className="highlight-box">
                <p>
                  La Universidad Autónoma del Paraguay (UAP) se compromete a proteger su privacidad y a tratar sus datos personales de conformidad con la{' '}
                  <strong>Ley N.º 1682/2001 (Ley de Datos Personales de la República del Paraguay)</strong> y sus modificaciones introducidas por la Ley
                  N.º 1969/2002.
                </p>
              </div>

              <h2>1. Responsable del Tratamiento</h2>
              <div className="contact-card">
                <p>
                  <strong>Nombre:</strong> Universidad Autónoma del Paraguay (UAP)
                </p>
                {config.direccion && (
                  <p>
                    <strong>Dirección:</strong> {config.direccion}
                  </p>
                )}
                {config.telefono && (
                  <p>
                    <strong>Teléfono:</strong> {config.telefono}
                  </p>
                )}
                {config.email && (
                  <p>
                    <strong>Correo electrónico:</strong> {config.email}
                  </p>
                )}
              </div>

              <h2>2. Datos Personales que Recopilamos</h2>
              <p>A través de los formularios de contacto e inscripción del sitio web, podemos recopilar los siguientes datos:</p>
              <ul>
                <li>Nombre completo</li>
                <li>Dirección de correo electrónico</li>
                <li>Número de teléfono de contacto</li>
                <li>Carrera o programa de interés</li>
                <li>Consultas o mensajes que usted redacte libremente</li>
              </ul>
              <p>
                No recopilamos datos de categorías especiales (datos de salud, origen étnico, creencias religiosas, datos biométricos) a través de los
                formularios del sitio web.
              </p>

              <h2>3. Finalidad del Tratamiento</h2>
              <p>Sus datos personales son utilizados exclusivamente para:</p>
              <ul>
                <li>Responder a su consulta o solicitud de información académica.</li>
                <li>Gestionar su proceso de inscripción o admisión cuando así lo solicite.</li>
                <li>Contactarle a través del asesor académico correspondiente.</li>
                <li>Enviarle información institucional relacionada con su consulta, si usted lo consiente.</li>
              </ul>

              <h2>4. Base Legal del Tratamiento</h2>
              <p>El tratamiento de sus datos se realiza sobre la base de:</p>
              <ul>
                <li>
                  <strong>Su consentimiento expreso</strong>, otorgado al completar y enviar el formulario y marcar la casilla de aceptación de esta
                  política.
                </li>
                <li>
                  <strong>La ejecución de una relación precontractual</strong> (proceso de admisión), cuando corresponda.
                </li>
              </ul>

              <h2>5. Transferencia Internacional de Datos — Bitrix24</h2>
              <p>
                Los formularios de este sitio web utilizan el servicio <strong>Bitrix24</strong>, una plataforma de gestión de relaciones con clientes
                (CRM) operada por <strong>Bitrix, Inc.</strong>, con servidores ubicados fuera de Paraguay.
              </p>
              <p>
                Al enviar un formulario, sus datos son transmitidos y almacenados en los servidores de Bitrix24. Esta transferencia internacional se
                realiza con las siguientes garantías:
              </p>
              <ul>
                <li>Los datos se transfieren únicamente para gestionar su consulta.</li>
                <li>Bitrix24 aplica medidas técnicas y organizativas de seguridad conforme a estándares internacionales.</li>
                <li>
                  Puede consultar la política de privacidad de Bitrix24 en{' '}
                  <a href="https://www.bitrix24.es/privacy/" target="_blank" rel="noopener noreferrer">
                    bitrix24.es/privacy/
                  </a>
                  .
                </li>
              </ul>

              <h2>6. Plazos de Conservación</h2>
              <table>
                <thead>
                  <tr>
                    <th>Tipo de dato</th>
                    <th>Plazo de conservación</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Consultas de información</td>
                    <td>12 meses desde la última interacción</td>
                  </tr>
                  <tr>
                    <td>Solicitudes de inscripción no concretadas</td>
                    <td>24 meses</td>
                  </tr>
                  <tr>
                    <td>Datos de estudiantes inscritos</td>
                    <td>Durante la relación académica y 5 años posteriores</td>
                  </tr>
                </tbody>
              </table>

              <h2>7. Sus Derechos</h2>
              <p>De conformidad con la Ley N.º 1682/2001, usted tiene derecho a:</p>
              <ul>
                <li>
                  <strong>Acceso:</strong> solicitar información sobre los datos que tenemos sobre usted.
                </li>
                <li>
                  <strong>Rectificación:</strong> corregir datos inexactos o incompletos.
                </li>
                <li>
                  <strong>Cancelación:</strong> solicitar la eliminación de sus datos cuando ya no sean necesarios.
                </li>
                <li>
                  <strong>Oposición:</strong> oponerse al tratamiento de sus datos con fines de comunicación comercial.
                </li>
                <li>
                  <strong>Revocación del consentimiento:</strong> retirar su consentimiento en cualquier momento, sin que ello afecte la licitud del
                  tratamiento anterior.
                </li>
              </ul>
              <p>
                Para ejercer cualquiera de estos derechos, puede contactarnos en: {correo} indicando en el asunto &quot;Ejercicio de derechos ARCO&quot;.
              </p>

              <h2>8. Medidas de Seguridad</h2>
              <p>
                La UAP aplica medidas técnicas y organizativas adecuadas para proteger sus datos personales contra acceso no autorizado, pérdida
                accidental, destrucción o alteración, incluyendo:
              </p>
              <ul>
                <li>Transmisión de datos mediante protocolo HTTPS (cifrado TLS).</li>
                <li>Acceso restringido a los datos a personal autorizado.</li>
                <li>Uso de proveedores de servicios con políticas de seguridad verificadas.</li>
              </ul>

              <h2>9. Cookies y Tecnologías de Seguimiento</h2>
              <p>
                Este sitio web puede utilizar cookies técnicas estrictamente necesarias para su funcionamiento. No utilizamos cookies de seguimiento
                publicitario de terceros. Los formularios de Bitrix24 pueden utilizar cookies propias para garantizar el correcto funcionamiento del
                formulario.
              </p>

              <h2>10. Modificaciones a esta Política</h2>
              <p>
                La UAP se reserva el derecho de actualizar esta Política de Privacidad para adaptarla a cambios legislativos o en nuestras prácticas de
                tratamiento de datos. Cualquier modificación será publicada en esta página con indicación de la fecha de actualización.
              </p>

              <h2>11. Contacto y Reclamaciones</h2>
              <p>Si tiene preguntas sobre esta Política o sobre el tratamiento de sus datos, puede contactarnos en:</p>
              <div className="contact-card">
                {correo && (
                  <p>
                    <strong>Correo:</strong> {correo}
                  </p>
                )}
                <p>
                  <strong>Asunto:</strong> Privacidad de datos — UAP
                </p>
                {config.telefono && (
                  <p>
                    <strong>Teléfono:</strong> {config.telefono}
                  </p>
                )}
              </div>
              <p className="privacidad-nota">
                También tiene derecho a presentar una reclamación ante la autoridad de control competente en materia de protección de datos personales
                de la República del Paraguay.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
