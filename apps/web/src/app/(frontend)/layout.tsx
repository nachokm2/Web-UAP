import React from 'react'

export const metadata = {
  title: 'Universidad Autónoma del Paraguay',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
