import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
  Hr,
  Text,
} from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'

interface EmailLayoutProps {
  children: React.ReactNode
  previewText: string
}

export function EmailLayout({ children, previewText }: EmailLayoutProps) {
  return (
    <Html>
      <Head>
        <meta name="description" content={previewText} />
      </Head>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto my-8 max-w-xl bg-white p-6 rounded-lg shadow-sm">
            {/* Logo Header */}
            {/* Note: Logo requires absolute URL for email clients. */}
            {/* In local dev (npm run email:dev), external URLs may not load. */}
            {/* Logo will display correctly in sent emails. */}
            <Section className="text-center mb-3">
              <Img
                src="https://animationlabs.ai/logo.svg"
                alt="Animation Labs"
                width="220"
                height="60"
                className="mx-auto"
              />
            </Section>

            <Hr className="border-gray-200 mb-6" />

            {/* Email Content */}
            {children}

            <Hr className="border-gray-200 mt-8 mb-6" />

            {/* Footer */}
            <Section className="text-center">
              <Text className="text-sm text-gray-500 mb-2">
                Animation Labs - Professional logo animations
              </Text>
              <Text className="text-xs text-gray-400">
                &copy; {new Date().getFullYear()} Animation Labs. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
