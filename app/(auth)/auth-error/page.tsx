import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AuthErrorPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams
  const error = params.error

  const errorMessages: Record<string, { title: string; description: string }> = {
    'verification-failed': {
      title: 'Verification Failed',
      description: 'The verification link is invalid or has expired. Please request a new one.',
    },
    default: {
      title: 'Authentication Error',
      description: 'Something went wrong. Please try again.',
    },
  }

  const { title, description } = errorMessages[error || 'default'] || errorMessages.default

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-destructive">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button asChild>
            <Link href="/login">Back to Login</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/reset-password">Request New Reset Link</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
