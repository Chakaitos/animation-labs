import {
  Section,
  Heading,
  Text,
  Button,
  Link,
} from '@react-email/components'
import { EmailLayout } from './_components/EmailLayout'

interface PaymentFailedEmailProps {
  firstName?: string
  planName: string
  amountDue: string
  retryUrl: string
}

export default function PaymentFailedEmail({
  firstName = 'there',
  planName,
  amountDue,
  retryUrl,
}: PaymentFailedEmailProps) {
  return (
    <EmailLayout previewText={`Action Required: Payment failed for your ${planName} subscription`}>
      <Section>
        <Heading className="text-2xl font-bold text-gray-900 mb-4">
          Hey {firstName}, there was a problem with your payment
        </Heading>

        <Text className="text-base text-gray-700 mb-4">
          We tried to charge your payment method for your <strong>{planName}</strong> subscription,
          but the payment didn&apos;t go through.
        </Text>

        <Section className="bg-gray-50 p-4 rounded-lg my-6">
          <Text className="text-sm text-gray-600 mb-2">
            <strong>Amount due:</strong> {amountDue}
          </Text>
          <Text className="text-sm text-gray-600 mb-0">
            <strong>Plan:</strong> {planName}
          </Text>
        </Section>

        <Text className="text-base text-gray-700 mb-4">
          Don&apos;t worry - your credits are still available until your renewal date.
          Update your payment method now to keep your subscription active.
        </Text>

        <Section className="text-center my-6">
          <Button
            href={retryUrl}
            className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold no-underline inline-block"
          >
            Update Payment Method
          </Button>
        </Section>

        <Text className="text-sm text-gray-600 mt-6">
          Questions about your billing? Contact us at{' '}
          <Link href="mailto:support@animationlabs.ai" className="text-blue-600 underline">
            support@animationlabs.ai
          </Link>
        </Text>
      </Section>
    </EmailLayout>
  )
}
