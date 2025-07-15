import { Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"

const Help = () => {
  return (
    <div className="mt-6">
      <Heading className="text-base-semi text-white">Need help?</Heading>
      <div className="text-base-regular my-2">
        <ul className="gap-y-2 flex flex-col">
          <li>
            <LocalizedClientLink href="/contact" className="text-blue-400 hover:text-blue-300">Contact</LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink href="/contact" className="text-blue-400 hover:text-blue-300">
              Returns & Exchanges
            </LocalizedClientLink>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Help
