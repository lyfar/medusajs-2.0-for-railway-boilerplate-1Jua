import { sdk } from "@lib/config"

export interface PresignedUploadResponse {
  upload_url: string
  file_key: string
}

export const getPresignedUploadUrl = async (
  filename: string,
  mimeType: string,
): Promise<PresignedUploadResponse> => {
  const res = await sdk.client.fetch<PresignedUploadResponse>(
    "/store/stickers/upload-url",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        filename,
        mimeType,
      },
    },
  )
  return res
}

export const uploadFileToPresignedUrl = async (
  uploadUrl: string,
  file: File,
): Promise<void> => {
  await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  })
} 