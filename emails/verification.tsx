import {
  Section,
  Heading,
  Text,
  Button,
} from '@react-email/components'
import { EmailLayout } from './_components/EmailLayout'

interface VerificationEmailProps {
  firstName?: string
  verificationUrl: string
}

export default function VerificationEmail({
  firstName = 'there',
  verificationUrl,
}: VerificationEmailProps) {
  return (
    <EmailLayout previewText="Verify your Animation Labs account">
      <Section>
        <Heading className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to Animation Labs, {firstName}!
        </Heading>

        <Text className="text-base text-gray-700 mb-4">
          We're excited to have you on board. Just one more step to get started.
        </Text>

        <Text className="text-base text-gray-700 mb-6">
          Click the button below to verify your email address and activate your account:
        </Text>

        <Section className="text-center my-6">
          <Button
            href={verificationUrl}
            className="bg-black text-white px-8 py-3 rounded-lg font-semibold no-underline inline-block"
          >
            Verify Your Email
          </Button>
        </Section>

        <Text className="text-sm text-gray-600 mt-6">
          If you didn't create an account with Animation Labs, you can safely ignore this email.
        </Text>

        <Text className="text-sm text-gray-500 mt-4">
          This link will expire in 24 hours.
        </Text>
      </Section>
    </EmailLayout>
  )
}
