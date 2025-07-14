"use client"

import React, { useCallback, useState } from "react"
import { getPresignedUploadUrl, uploadFileToPresignedUrl } from "@lib/data/uploads"

interface FileUploadProps {
  onUploadComplete: (fileKey: string, publicUrl: string) => void
  disabled?: boolean
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete, disabled }) => {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    const file = e.target.files[0]

    try {
      setUploading(true)
      setError(null)
      const { upload_url, file_key } = await getPresignedUploadUrl(file.name, file.type)

      await uploadFileToPresignedUrl(upload_url, file)

      const publicURLBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ""
      const publicUrl = publicURLBase ? `${publicURLBase}/${file_key}` : ""
      setPreviewUrl(publicUrl)
      onUploadComplete(file_key, publicUrl)
    } catch (err: any) {
      console.error(err)
      setError("Failed to upload file. Please try again.")
    } finally {
      setUploading(false)
    }
  }, [onUploadComplete])

  return (
    <div className="space-y-2">
      {previewUrl && (
        <div className="w-full border rounded-md p-2 text-sm">
          <p className="truncate">Uploaded: {previewUrl.split("/").pop()}</p>
          {previewUrl.match(/\.(png|jpe?g|svg)$/i) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Preview" className="max-h-40 mt-2" />
          )}
        </div>
      )}

      <input
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,application/pdf"
        onChange={handleFileChange}
        disabled={uploading || disabled}
      />
      {uploading && <p className="text-sm">Uploading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default FileUpload 