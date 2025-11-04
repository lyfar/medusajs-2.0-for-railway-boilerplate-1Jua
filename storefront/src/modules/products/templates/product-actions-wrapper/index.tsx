import { getProductsById } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"
import ProductActionsSticker from "@modules/products/components/product-actions-sticker"
import { isStickerProduct } from "@lib/util/sticker-utils"

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

  // Use sticker calculator for sticker products
  if (isStickerProduct(product)) {
    return <ProductActionsSticker product={product} region={region} />
  }

  return <ProductActions product={product} region={region} />
}
