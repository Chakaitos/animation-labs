'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { videoSchema, videoFormDefaults, type VideoFormValues } from '@/lib/validations/video-schema'
import { createVideo, type CreateVideoResult } from '@/lib/actions/video'
import { Form } from '@/components/ui/form'

import { StepIndicator } from './StepIndicator'
import { UploadStep } from './UploadStep'
import { DetailsStep } from './DetailsStep'
import { StyleStep } from './StyleStep'
import { ReviewStep } from './ReviewStep'

export function CreateVideoForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Multi-step state
  const [step, setStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)

  // React Hook Form
  const form = useForm<VideoFormValues>({
    resolver: zodResolver(videoSchema),
    defaultValues: videoFormDefaults,
  })

  // Handle file upload
  const handleUploadComplete = useCallback((uploadedFile: File) => {
    setFile(uploadedFile)
    setStep(2)
  }, [])

  // Navigation helpers
  const nextStep = useCallback(() => setStep((s) => Math.min(s + 1, 4)), [])
  const prevStep = useCallback(() => setStep((s) => Math.max(s - 1, 1)), [])

  // Form submission
  const handleSubmit = useCallback(async (values: VideoFormValues) => {
    if (!file) {
      toast.error('Please upload a logo first')
      setStep(1)
      return
    }

    startTransition(async () => {
      // Build FormData for Server Action
      const formData = new FormData()
      formData.append('logo', file)
      formData.append('brandName', values.brandName)
      formData.append('duration', values.duration)
      formData.append('quality', values.quality)
      formData.append('style', values.style)
      formData.append('creativeDirection', values.creativeDirection || '')

      const result: CreateVideoResult = await createVideo(formData)

      if (result.error) {
        // Handle field-specific errors
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, message]) => {
            if (field === 'logo') {
              toast.error(message)
              setStep(1)
            } else {
              form.setError(field as keyof VideoFormValues, { message })
            }
          })
        } else {
          toast.error(result.error)
        }
        return
      }

      if (result.success) {
        toast.success('Video creation started! Check your dashboard for updates.')
        router.push('/dashboard')
      }
    })
  }, [file, form, router])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <StepIndicator currentStep={step} />

        {step === 1 && (
          <UploadStep
            onComplete={handleUploadComplete}
            currentFile={file}
          />
        )}

        {step === 2 && (
          <DetailsStep
            form={form}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {step === 3 && (
          <StyleStep
            form={form}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {step === 4 && (
          <ReviewStep
            form={form}
            file={file}
            onBack={prevStep}
            isSubmitting={isPending}
          />
        )}
      </form>
    </Form>
  )
}
