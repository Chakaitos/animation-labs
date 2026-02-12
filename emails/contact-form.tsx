import {
  Section,
  Heading,
  Text,
} from '@react-email/components'
import { EmailLayout } from './_components/EmailLayout'

interface ContactFormEmailProps {
  name: string
  email: string
  subject?: string
  message: string
}

export default function ContactFormEmail({
  name,
  email,
  subject,
  message,
}: ContactFormEmailProps) {
  return (
    <EmailLayout previewText={`Contact form submission from ${name}`}>
      <Section>
        <Heading className="text-2xl font-bold text-gray-900 mb-4">
          New Contact Form Submission
        </Heading>

        <Section className="bg-gray-50 p-4 rounded-lg mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            From:
          </Text>
          <Text className="text-base text-gray-900 mb-3">
            {name} ({email})
          </Text>

          {subject && (
            <>
              <Text className="text-sm font-semibold text-gray-700 mb-1">
                Subject:
              </Text>
              <Text className="text-base text-gray-900 mb-3">
                {subject}
              </Text>
            </>
          )}

          <Text className="text-sm font-semibold text-gray-700 mb-1">
            Message:
          </Text>
          <Text className="text-base text-gray-900 whitespace-pre-wrap">
            {message}
          </Text>
        </Section>

        <Text className="text-sm text-gray-600 mt-4">
          Reply to this email to respond directly to {name}.
        </Text>
      </Section>
    </EmailLayout>
  )
}
