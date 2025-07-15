import { Button, Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="h-[75vh] w-full border-b border-ui-border-base relative bg-ui-bg-subtle">
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center small:p-32 gap-6">
        <span>
          <Heading
            level="h1"
            className="text-3xl leading-10 text-ui-fg-base font-normal"
          >
            Create Your Custom Stickers Today!
          </Heading>
          <Heading
            level="h2"
            className="text-3xl leading-10 text-ui-fg-subtle font-normal"
          >
            Go and order your custom sticker with our easy-to-use designer
          </Heading>
        </span>
        <LocalizedClientLink href="/products/sticker">
          <Button variant="primary" size="large">
            Design Your Sticker Now
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default Hero
