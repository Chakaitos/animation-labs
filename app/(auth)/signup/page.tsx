import { SignupForm } from '@/components/auth/signup-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 sm:p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-4 inline-block">
            <Image
              src="/AL_transparent_compact.png"
              alt="Animation Labs"
              width={250}
              height={66}
              priority
              className="dark:hidden w-[180px] sm:w-[220px] md:w-[250px] h-auto"
            />
            <Image
              src="/AL_dark_mode.png"
              alt="Animation Labs"
              width={250}
              height={66}
              priority
              className="hidden dark:block w-[180px] sm:w-[220px] md:w-[250px] h-auto"
            />
          </Link>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
    </div>
  )
}
