import { Metadata } from "next"

import { draftMode } from "next/headers"

import "styles/globals.css"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:8000"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  other: {
    // Content Security Policy to allow Stripe
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://m.stripe.network blob:",
      "style-src 'self' 'unsafe-inline' https://js.stripe.com",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' https://api.stripe.com https://r.stripe.com https://m.stripe.com https://m.stripe.network https://q.stripe.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "font-src 'self' data:",
      "media-src 'self' blob: data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'"
    ].join('; ')
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isEnabled } = draftMode()

  return (
    <html lang="en" data-mode={isEnabled ? "draft" : "published"}>
      <head>
        {/* Additional CSP meta tag for Stripe compatibility */}
        <meta 
          httpEquiv="Content-Security-Policy" 
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://m.stripe.network blob:; style-src 'self' 'unsafe-inline' https://js.stripe.com; img-src 'self' data: blob: https: http:; connect-src 'self' https://api.stripe.com https://r.stripe.com https://m.stripe.com https://m.stripe.network https://q.stripe.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com; font-src 'self' data:; media-src 'self' blob: data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"
        />
      </head>
      <body>
        <main className="relative">{children}</main>
      </body>
    </html>
  )
}
