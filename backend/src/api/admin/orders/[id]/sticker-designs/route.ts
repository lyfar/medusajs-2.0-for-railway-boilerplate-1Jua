import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { IOrderModuleService } from "@medusajs/framework/types"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  const orderService: IOrderModuleService = req.scope.resolve(Modules.ORDER)
  
  try {
    const order = await orderService.retrieveOrder(id, { 
      relations: ["items"] 
    })
    
    // Extract sticker designs from order items
    const stickerDesigns = order.items
      .filter(item => item.metadata?.design_url || item.metadata?.file_key)
      .map(item => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        design_url: item.metadata.design_url || 
          `${process.env.R2_PUBLIC_URL || 'https://pub-4ea6ad9a9dc2413d9be2b77febd7ec0e.r2.dev'}/${item.metadata.file_key}`,
        file_key: item.metadata.file_key
      }))
    
    return res.json({
      order_id: order.id,
      sticker_designs: stickerDesigns
    })
  } catch (error) {
    return res.status(500).json({
      error: "Failed to retrieve sticker designs"
    })
  }
} 