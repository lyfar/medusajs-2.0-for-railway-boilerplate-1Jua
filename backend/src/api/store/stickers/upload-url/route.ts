import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import {
  R2_ENDPOINT,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
  R2_PUBLIC_URL,
} from '../../../../lib/constants'
import CloudflareR2FileProviderService from '../../../../modules/cloudflare-r2-file/service'

type UploadUrlRequest = {
  filename: string
  mimeType: string
}

export async function POST(req: MedusaRequest<UploadUrlRequest>, res: MedusaResponse) {
  const { filename, mimeType } = req.body

  if (!filename || !mimeType) {
    return res.status(400).json({
      error: 'filename and mimeType are required',
    })
  }

  if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    return res.status(500).json({
      error: 'Cloudflare R2 is not configured on the server',
    })
  }

  const logger = req.scope.resolve('logger')

  const provider = new CloudflareR2FileProviderService(
    { logger },
    {
      endpoint: R2_ENDPOINT,
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
      bucket: R2_BUCKET || 'stickers',
      publicUrl: R2_PUBLIC_URL,
    },
  )

  try {
    const { url, key } = await provider.getPresignedUploadUrl(filename, mimeType)
    return res.json({ upload_url: url, file_key: key })
  } catch (e: any) {
    logger.error(`Failed generating presigned upload URL: ${e.message}`)
    return res.status(500).json({ error: `Failed generating upload URL: ${e.message}` })
  }
} 