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
      relations: ["items", "summary", "shipping_address", "customer"] 
    })
    
    // Enhance items with design URLs
    const enhancedItems = order.items.map(item => {
      if (item.metadata?.design_url || item.metadata?.file_key) {
        const designUrl = item.metadata.design_url || 
          `${process.env.R2_PUBLIC_URL || 'https://pub-4ea6ad9a9dc2413d9be2b77febd7ec0e.r2.dev'}/${item.metadata.file_key}`
        
        return {
          ...item,
          // Override thumbnail with custom design
          thumbnail: designUrl,
          custom_design_url: designUrl,
          has_custom_design: true
        }
      }
      return item
    })
    
    return res.json({
      order: {
        ...order,
        items: enhancedItems
      }
    })
  } catch (error) {
    return res.status(500).json({
      error: "Failed to retrieve order with designs"
    })
  }
} 