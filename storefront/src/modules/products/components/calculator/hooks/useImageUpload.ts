import { useState, useCallback } from 'react'

export type UploadState = 'idle' | 'uploading' | 'success' | 'error'

interface UploadResult {
  fileKey: string
  publicUrl: string
}

interface UseImageUploadProps {
  onFileUpload?: (fileKey: string, publicUrl: string) => void
  disabled?: boolean
}

interface UseImageUploadReturn {
  uploadState: UploadState
  uploadError: string | null
  uploadSuccess: boolean
  isUploading: boolean
  handleDrop: (acceptedFiles: File[]) => Promise<void>
  uploadFile: (file: File) => Promise<UploadResult | null>
  clearError: () => void
  clearSuccess: () => void
}

export function useImageUpload({ 
  onFileUpload, 
  disabled 
}: UseImageUploadProps): UseImageUploadReturn {
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const isUploading = uploadState === 'uploading'

  const clearError = useCallback(() => {
    setUploadError(null)
    setUploadState('idle')
  }, [])

  const clearSuccess = useCallback(() => {
    setUploadSuccess(false)
    if (uploadState === 'success') {
      setUploadState('idle')
    }
  }, [uploadState])

  /**
   * Uploads file to backend and gets the file key and public URL
   */
  const uploadFile = useCallback(async (file: File): Promise<UploadResult | null> => {
    try {
      setUploadState('uploading')
      setUploadError(null)

      const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      if (publishableKey) {
        headers["x-publishable-api-key"] = publishableKey
      } else {
        console.warn("No publishable API key found. Upload may fail.")
      }

      // First, get the upload URL from the backend
      const uploadUrlResponse = await fetch(
        `${backendUrl}/store/stickers/upload-url`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type,
          }),
        }
      )

      if (!uploadUrlResponse.ok) {
        const errorText = await uploadUrlResponse.text()
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(
            errorData.message || errorData.error || "Failed to get upload URL"
          )
        } catch (e) {
          throw new Error(
            "Failed to get upload URL. The server returned a non-JSON response."
          )
        }
      }

      const { upload_url, file_key } = await uploadUrlResponse.json()

      // Upload the file to the presigned URL
      const uploadResponse = await fetch(upload_url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to storage")
      }

      // Construct the public URL
      const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL
        ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${file_key}`
        : upload_url.split("?")[0] // Remove query params

      const result = { fileKey: file_key, publicUrl }
      
      setUploadState('success')
      setUploadSuccess(true)
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false)
        setUploadState('idle')
      }, 3000)

      return result
    } catch (error) {
      console.error("Upload error:", error)
      const errorMessage = error instanceof Error ? error.message : "Upload failed"
      setUploadError(errorMessage)
      setUploadState('error')
      return null
    }
  }, [])

  /**
   * Handle file drop from react-dropzone
   */
  const handleDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file || disabled) {
      return
    }

    try {
      const uploadResult = await uploadFile(file)
      if (uploadResult && onFileUpload) {
        onFileUpload(uploadResult.fileKey, uploadResult.publicUrl)
      }
    } catch (error) {
      console.error("File drop failed:", error)
      const errorMessage = error instanceof Error ? error.message : "File processing failed"
      setUploadError(errorMessage)
      setUploadState('error')
    }
  }, [uploadFile, onFileUpload, disabled])

  return {
    uploadState,
    uploadError,
    uploadSuccess,
    isUploading,
    handleDrop,
    uploadFile,
    clearError,
    clearSuccess,
  }
} 