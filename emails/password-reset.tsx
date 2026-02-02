import {
  Section,
  Heading,
  Text,
  Button,
} from '@react-email/components'
import { EmailLayout } from './_components/EmailLayout'

interface PasswordResetEmailProps {
  firstName?: string
  resetUrl: string
}

export default function PasswordResetEmail({
  firstName = 'there',
  resetUrl,
}: PasswordResetEmailProps) {
  return (
    <EmailLayout previewText="Reset your Animation Labs password">
      <Section>
        <Heading className="text-2xl font-bold text-gray-900 mb-4">
          Reset your password, {firstName}
        </Heading>

        <Text className="text-base text-gray-700 mb-4">
          We received a request to reset the password for your Animation Labs account.
        </Text>

        <Text className="text-base text-gray-700 mb-6">
          Click the button below to choose a new password:
        </Text>

        <Section className="text-center my-6">
          <Button
            href={resetUrl}
            className="bg-black text-white px-8 py-3 rounded-lg font-semibold no-underline inline-block"
          >
            Reset Password
          </Button>
        </Section>

        <Text className="text-sm text-gray-600 mt-6">
          If you didn't request a password reset, you can safely ignore this email.
          Your password will remain unchanged.
        </Text>

        <Text className="text-sm text-gray-500 mt-4">
          This link will expire in 1 hour for security reasons.
        </Text>
      </Section>
    </EmailLayout>
  )
}
