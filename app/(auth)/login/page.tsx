import { LoginForm } from '@/components/auth/login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'

interface LoginPageProps {
  searchParams: Promise<{ message?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const message = params.message

  const messages: Record<string, string> = {
    'password-updated': 'Your password has been updated. Please sign in.',
    'password-changed': 'Your password has been changed. Please sign in again.',
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-4">
            <Image src="/AL_transparent_compact.png" alt="Animation Labs" width={250} height={66} priority />
          </Link>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Enter your email to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && messages[message] && (
            <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
              {messages[message]}
            </div>
          )}
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
