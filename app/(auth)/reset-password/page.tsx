import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-4">
            <Image src="/AL_transparent_compact.png" alt="Animation Labs" width={250} height={66} priority />
          </Link>
          <CardTitle className="text-2xl">Reset your password</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}
