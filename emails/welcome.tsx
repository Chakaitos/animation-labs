import {
  Section,
  Heading,
  Text,
  Button,
} from '@react-email/components'
import { EmailLayout } from './_components/EmailLayout'

interface WelcomeEmailProps {
  firstName?: string
}

export default function WelcomeEmail({
  firstName = 'there',
}: WelcomeEmailProps) {
  return (
    <EmailLayout previewText="Welcome to Animation Labs! Your account is ready.">
      <Section>
        <Heading className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to Animation Labs, {firstName}! 🎬
        </Heading>

        <Text className="text-base text-gray-700 mb-4">
          Your account is all set up and ready to go. You can now create professional
          logo animations that are delivered in just 10-15 minutes.
        </Text>

        <Text className="text-base text-gray-700 mb-4">
          <strong>Getting Started:</strong>
        </Text>

        <Section className="ml-4 mb-4">
          <Text className="text-base text-gray-700 mb-2">
            ✓ Choose your subscription plan or purchase credits
          </Text>
          <Text className="text-base text-gray-700 mb-2">
            ✓ Upload your logo (JPG, PNG, or WebP)
          </Text>
          <Text className="text-base text-gray-700 mb-2">
            ✓ Select duration, quality, and animation style
          </Text>
          <Text className="text-base text-gray-700 mb-2">
            ✓ Get your video delivered via email in minutes
          </Text>
        </Section>

        <Section className="text-center my-6">
          <Button
            href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
            className="bg-black text-white px-8 py-3 rounded-lg font-semibold no-underline inline-block"
          >
            Create Your First Video
          </Button>
        </Section>

        <Text className="text-base text-gray-700 mb-4">
          Each animation costs just 1 credit, with videos priced at $3-5 depending
          on your plan. Perfect for social media, presentations, and marketing materials.
        </Text>

        <Text className="text-sm text-gray-600 mt-6">
          Need help getting started? Just reply to this email - we&apos;re here to assist!
        </Text>
      </Section>
    </EmailLayout>
  )
}
