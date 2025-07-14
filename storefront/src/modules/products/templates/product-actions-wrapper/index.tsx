import { getProductsById } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"
import ProductActionsSticker from "@modules/products/components/product-actions-sticker"
import { isStickerVariant } from "@lib/util/sticker-utils"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  id,
  region,
}: {
  id: string
  region: HttpTypes.StoreRegion
}) {
  const [product] = await getProductsById({
    ids: [id],
    regionId: region.id,
  })

  if (!product) {
    return null
  }

  // Check if any variant is a sticker variant
  const hasStickerVariant = product.variants?.some(variant => 
    isStickerVariant(variant.id)
  ) || false

  // Use sticker calculator for sticker products
  if (hasStickerVariant) {
    return <ProductActionsSticker product={product} region={region} />
  }

  return <ProductActions product={product} region={region} />
}
