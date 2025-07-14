import { AbstractFileProviderService, MedusaError } from '@medusajs/framework/utils'
import {
  ProviderUploadFileDTO,
  ProviderDeleteFileDTO,
  ProviderFileResultDTO,
  ProviderGetFileDTO,
} from '@medusajs/framework/types'
import { Logger } from '@medusajs/framework/types'
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { ulid } from 'ulid'
import path from 'path'

type InjectedDependencies = {
  logger: Logger
}

export interface CloudflareR2FileProviderOptions {
  endpoint: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  publicUrl?: string
}

class CloudflareR2FileProviderService extends AbstractFileProviderService {
  static identifier = 'cloudflare-r2-file'

  protected readonly logger_: Logger
  protected readonly config_: CloudflareR2FileProviderOptions
  protected readonly client: S3Client
  protected readonly bucket: string
  protected readonly publicUrl?: string

  constructor({ logger }: InjectedDependencies, options: CloudflareR2FileProviderOptions) {
    super()
    this.logger_ = logger
    this.config_ = options

    this.bucket = options.bucket
    this.publicUrl = options.publicUrl

    this.client = new S3Client({
      endpoint: options.endpoint,
      region: 'auto',
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
      },
      forcePathStyle: true, // Required for Cloudflare R2
    })

    this.logger_.info(`Cloudflare R2 service initialized with bucket: ${this.bucket}`)
  }

  static validateOptions(options: Record<string, any>) {
    const required = ['endpoint', 'accessKeyId', 'secretAccessKey', 'bucket']
    for (const field of required) {
      if (!options[field]) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `${field} is required in the provider's options`,
        )
      }
    }
  }

  private buildPublicUrl(key: string): string {
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`
    }

    const endpoint = this.config_.endpoint.replace(/^https?:\/\//, '')
    return `https://${endpoint}/${this.bucket}/${key}`
  }

  async upload(file: ProviderUploadFileDTO): Promise<ProviderFileResultDTO> {
    if (!file?.filename) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'No filename provided')
    }

    const parsed = path.parse(file.filename)
    const fileKey = `${parsed.name}-${ulid()}${parsed.ext}`
    const buffer = Buffer.from(file.content, 'binary')

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: fileKey,
          Body: buffer,
          ContentType: file.mimeType,
          Metadata: {
            originalfilename: file.filename,
          },
        }),
      )

      const url = this.buildPublicUrl(fileKey)
      this.logger_.info(`Uploaded file ${fileKey} to Cloudflare R2 bucket ${this.bucket}`)

      return {
        url,
        key: fileKey,
      }
    } catch (e: any) {
      this.logger_.error(`Failed to upload file to R2: ${e.message}`)
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, e.message)
    }
  }

  async delete(fileData: ProviderDeleteFileDTO): Promise<void> {
    if (!fileData?.fileKey) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'No file key provided')
    }

    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: fileData.fileKey,
        }),
      )
      this.logger_.info(`Deleted file ${fileData.fileKey} from Cloudflare R2 bucket ${this.bucket}`)
    } catch (e: any) {
      // Log and swallow – safe delete
      this.logger_.warn(`Failed to delete file from R2: ${e.message}`)
    }
  }

  async getPresignedDownloadUrl(fileData: ProviderGetFileDTO): Promise<string> {
    if (!fileData?.fileKey) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'No file key provided')
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: fileData.fileKey,
      })
      const url = await getSignedUrl(this.client, command, { expiresIn: 24 * 60 * 60 })
      return url
    } catch (e: any) {
      this.logger_.error(`Failed to generate presigned URL: ${e.message}`)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to generate presigned URL: ${e.message}`,
      )
    }
  }

  async getPresignedUploadUrl(filename: string, mimeType: string): Promise<{ url: string; key: string }> {
    if (!filename) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'No filename provided')
    }

    const parsed = path.parse(filename)
    const fileKey = `${parsed.name}-${ulid()}${parsed.ext}`

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
        ContentType: mimeType,
      })
      const url = await getSignedUrl(this.client, command, { expiresIn: 10 * 60 }) // 10 min
      return { url, key: fileKey }
    } catch (e: any) {
      this.logger_.error(`Failed to generate presigned upload URL: ${e.message}`)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to generate presigned upload URL: ${e.message}`,
      )
    }
  }
}

export default CloudflareR2FileProviderService 