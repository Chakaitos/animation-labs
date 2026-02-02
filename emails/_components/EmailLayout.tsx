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
            <Section className="text-center mb-6">
              <Img
                src="https://animatelabs.com/logo.svg"
                alt="AnimateLabs"
                width="150"
                height="40"
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
                AnimateLabs - Professional logo animations
              </Text>
              <Text className="text-xs text-gray-400">
                &copy; {new Date().getFullYear()} AnimateLabs. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
