import { Metadata } from "next"

import { draftMode } from "next/headers"

import "styles/globals.css"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:8000"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="dark">
      <body
        className="dark bg-ui-bg-base dark:bg-black text-ui-fg-base dark:text-white antialiased"
        suppressHydrationWarning={true}
      >
        <main className="relative dark:bg-black">{props.children}</main>
      </body>
    </html>
  )
}
