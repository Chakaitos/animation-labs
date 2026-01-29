'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'

import { extractColors } from '@/lib/utils/color-extraction'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface UploadStepProps {
  onComplete: (file: File, colors: { primary: string; secondary: string }) => void
  currentFile: File | null
  currentColors: { primary: string; secondary: string } | null
}

export function UploadStep({ onComplete, currentFile, currentColors }: UploadStepProps) {
  const [file, setFile] = useState<File | null>(currentFile)
  const [preview, setPreview] = useState<string | null>(currentFile ? URL.createObjectURL(currentFile) : null)
  const [colors, setColors] = useState<{ primary: string; secondary: string } | null>(currentColors)
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0]
    if (!uploadedFile) return

    setError(null)
    setFile(uploadedFile)

    // Create preview URL
    const objectUrl = URL.createObjectURL(uploadedFile)
    setPreview(objectUrl)

    // Extract colors immediately
    setIsExtracting(true)
    try {
      const extractedColors = await extractColors(uploadedFile)
      setColors(extractedColors)
    } catch (err) {
      console.error('Color extraction failed:', err)
      // Use fallback colors if extraction fails
      setColors({ primary: '#000000', secondary: '#666666' })
    } finally {
      setIsExtracting(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 25 * 1024 * 1024, // 25MB
    multiple: false,
    onDrop,
    onDropRejected: (rejections) => {
      const rejection = rejections[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File is too large. Maximum size is 25MB.')
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload a JPG, PNG, or WebP image.')
      } else {
        setError(rejection.errors[0]?.message || 'Failed to upload file')
      }
    },
  })

  const handleContinue = () => {
    if (file && colors) {
      onComplete(file, colors)
    }
  }

  const handleRemove = () => {
    setFile(null)
    setPreview(null)
    setColors(null)
    setError(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Upload Your Logo</h2>
        <p className="text-muted-foreground">
          Upload your logo in JPG, PNG, or WebP format (max 25MB)
        </p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          error && 'border-destructive'
        )}
      >
        <input {...getInputProps()} />

        {preview ? (
          <div className="space-y-4">
            <div className="relative w-48 h-48 mx-auto">
              <Image
                src={preview}
                alt="Logo preview"
                fill
                className="object-contain rounded"
              />
            </div>
            <div>
              <p className="font-medium">{file?.name}</p>
              <p className="text-sm text-muted-foreground">
                {file && (file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <svg
                className="w-6 h-6 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium">
                {isDragActive ? 'Drop your logo here' : 'Drag & drop your logo here'}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse files
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {fileRejections.length > 0 && !error && (
        <p className="text-sm text-destructive">
          {fileRejections[0].errors[0]?.message}
        </p>
      )}

      {/* Extracting indicator */}
      {isExtracting && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Extracting colors from your logo...
        </p>
      )}

      {/* Color preview */}
      {colors && !isExtracting && (
        <div className="flex gap-6">
          <div>
            <p className="text-sm font-medium mb-2">Primary Color</p>
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded border shadow-sm"
                style={{ backgroundColor: colors.primary }}
              />
              <span className="text-sm font-mono">{colors.primary}</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Secondary Color</p>
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded border shadow-sm"
                style={{ backgroundColor: colors.secondary }}
              />
              <span className="text-sm font-mono">{colors.secondary}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-4">
        {file && (
          <Button type="button" variant="outline" onClick={handleRemove}>
            Remove
          </Button>
        )}
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!file || !colors || isExtracting}
          className="ml-auto"
        >
          {isExtracting ? 'Extracting...' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}
