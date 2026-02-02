import {
  Section,
  Heading,
  Text,
  Button,
  Img,
} from '@react-email/components'
import { EmailLayout } from './_components/EmailLayout'

interface VideoReadyEmailProps {
  firstName?: string
  brandName?: string
  videoUrl: string
  thumbnailUrl?: string
}

export default function VideoReadyEmail({
  firstName = 'there',
  brandName = 'Your Brand',
  videoUrl,
  thumbnailUrl,
}: VideoReadyEmailProps) {
  const createdDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <EmailLayout previewText={`Your ${brandName} logo animation is ready!`}>
      <Section>
        <Heading className="text-2xl font-bold text-gray-900 mb-4">
          Hey there, {firstName}!
        </Heading>

        <Text className="text-base text-gray-700 mb-4">
          Your <strong>{brandName}</strong> logo animation is ready to download.
        </Text>

        {thumbnailUrl && (
          <Section className="my-6">
            <Img
              src={thumbnailUrl}
              alt={`${brandName} video thumbnail`}
              width="560"
              className="w-full rounded-lg"
            />
          </Section>
        )}

        <Section className="text-center my-6">
          <Button
            href={videoUrl}
            className="bg-black text-white px-8 py-3 rounded-lg font-semibold no-underline inline-block"
          >
            Download Your Video
          </Button>
        </Section>

        <Text className="text-sm text-gray-500 mt-6">
          Video created: {createdDate}
        </Text>

        <Text className="text-sm text-gray-600 mt-4">
          Questions? Just reply to this email - we&apos;re here to help!
        </Text>
      </Section>
    </EmailLayout>
  )
}
