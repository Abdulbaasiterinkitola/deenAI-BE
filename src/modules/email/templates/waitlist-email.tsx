import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Link,
  Row,
  Column,
} from '@react-email/components';

interface WaitlistEmailProps {
  name?: string;
  username?: string;
}

export const WaitlistEmail: React.FC<WaitlistEmailProps> = ({
  name,
  username,
}) => {
  const displayName = name || username || 'friend';

  return (
    <Html lang="en">
      <Head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/*[if mso]>
          <style type="text/css">
            body, table, td {
              font-family: Arial, Helvetica, sans-serif !important;
            }
          </style>
        <![endif]*/}
      </Head>
      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#fafafa',
          fontFamily:
            "'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        <Container
          style={{
            backgroundColor: '#fafafa',
            width: '100%',
          }}
        >
          <Section
            style={{
              padding: '40px 20px',
            }}
          >
            {/* Email Content Container */}
            <Section
              style={{
                maxWidth: '600px',
                width: '100%',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e5d4bd',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                margin: '0 auto',
              }}
            >
              {/* Header with Logo */}
              <Section
                style={{
                  padding: '40px 40px 20px 40px',
                  backgroundColor: '#fafafa',
                  borderRadius: '16px 16px 0 0',
                  textAlign: 'center',
                }}
              >
                <Heading
                  style={{
                    margin: 0,
                    color: '#942e00',
                    fontSize: '32px',
                    fontWeight: 700,
                    fontFamily: "'Nunito Sans', Arial, sans-serif",
                    letterSpacing: '-0.5px',
                  }}
                >
                  Deen AI
                </Heading>
              </Section>

              {/* Main Content */}
              <Section
                style={{
                  padding: '40px 40px 30px 40px',
                }}
              >
                {/* Greeting */}
                <Heading
                  style={{
                    margin: '0 0 20px 0',
                    color: '#393025',
                    fontSize: '28px',
                    fontWeight: 700,
                    fontFamily: "'Nunito Sans', Arial, sans-serif",
                    lineHeight: 1.3,
                  }}
                >
                  Welcome to Your Spiritual Journey! 🌙
                </Heading>

                {/* Body Text */}
                <Text
                  style={{
                    margin: '0 0 20px 0',
                    color: '#393025',
                    fontSize: '16px',
                    fontWeight: 500,
                    fontFamily: "'Nunito Sans', Arial, sans-serif",
                    lineHeight: 1.6,
                  }}
                >
                  Assalamu Alaikum {displayName},
                </Text>

                <Text
                  style={{
                    margin: '0 0 20px 0',
                    color: '#393025',
                    fontSize: '16px',
                    fontWeight: 500,
                    fontFamily: "'Nunito Sans', Arial, sans-serif",
                    lineHeight: 1.6,
                  }}
                >
                  Thank you for joining the{' '}
                  <strong style={{ fontWeight: 700, color: '#942e00' }}>
                    Deen AI waitlist
                  </strong>
                  ! We're thrilled to have you as part of our growing community.
                </Text>

                <Text
                  style={{
                    margin: '0 0 20px 0',
                    color: '#393025',
                    fontSize: '16px',
                    fontWeight: 500,
                    fontFamily: "'Nunito Sans', Arial, sans-serif",
                    lineHeight: 1.6,
                  }}
                >
                  Deen AI is designed to bring you closer to your faith through
                  AI-powered guidance rooted in the Quran and Hadith. Whether
                  you're seeking clarity, comfort, or spiritual growth, we're
                  here to support you every step of the way.
                </Text>

                {/* Features Box */}
                <Section
                  style={{
                    margin: '30px 0',
                    backgroundColor: '#fafafa',
                    borderRadius: '12px',
                    border: '1px solid #e5d4bd',
                    padding: '25px',
                  }}
                >
                  <Text
                    style={{
                      margin: '0 0 15px 0',
                      color: '#942e00',
                      fontSize: '18px',
                      fontWeight: 700,
                      fontFamily: "'Nunito Sans', Arial, sans-serif",
                    }}
                  >
                    What to Expect:
                  </Text>

                  <Text
                    style={{
                      margin: '8px 0',
                      color: '#393025',
                      fontSize: '15px',
                      fontWeight: 500,
                      fontFamily: "'Nunito Sans', Arial, sans-serif",
                      lineHeight: 1.6,
                    }}
                  >
                    <span
                      style={{
                        color: '#942e00',
                        fontSize: '16px',
                        marginRight: '8px',
                      }}
                    >
                      ✓
                    </span>
                    AI-powered guidance based on Quran and Hadith
                  </Text>

                  <Text
                    style={{
                      margin: '8px 0',
                      color: '#393025',
                      fontSize: '15px',
                      fontWeight: 500,
                      fontFamily: "'Nunito Sans', Arial, sans-serif",
                      lineHeight: 1.6,
                    }}
                  >
                    <span
                      style={{
                        color: '#942e00',
                        fontSize: '16px',
                        marginRight: '8px',
                      }}
                    >
                      ✓
                    </span>
                    Read and reflect on Quranic verses
                  </Text>

                  <Text
                    style={{
                      margin: '8px 0',
                      color: '#393025',
                      fontSize: '15px',
                      fontWeight: 500,
                      fontFamily: "'Nunito Sans', Arial, sans-serif",
                      lineHeight: 1.6,
                    }}
                  >
                    <span
                      style={{
                        color: '#942e00',
                        fontSize: '16px',
                        marginRight: '8px',
                      }}
                    >
                      ✓
                    </span>
                    Track your spiritual growth with personal reflections
                  </Text>

                  <Text
                    style={{
                      margin: '8px 0',
                      color: '#393025',
                      fontSize: '15px',
                      fontWeight: 500,
                      fontFamily: "'Nunito Sans', Arial, sans-serif",
                      lineHeight: 1.6,
                    }}
                  >
                    <span
                      style={{
                        color: '#942e00',
                        fontSize: '16px',
                        marginRight: '8px',
                      }}
                    >
                      ✓
                    </span>
                    Tasbih counter and prayer time reminders
                  </Text>
                </Section>

                <Text
                  style={{
                    margin: '0 0 20px 0',
                    color: '#393025',
                    fontSize: '16px',
                    fontWeight: 500,
                    fontFamily: "'Nunito Sans', Arial, sans-serif",
                    lineHeight: 1.6,
                  }}
                >
                  We'll keep you updated on our launch date and send you
                  exclusive early access when we're ready. Stay tuned!
                </Text>

                {/* CTA Button */}
                <Section
                  style={{
                    margin: '30px 0',
                    textAlign: 'center',
                  }}
                >
                  <Link
                    href="https://linktr.ee/thedeenai"
                    style={{
                      display: 'inline-block',
                      padding: '16px 32px',
                      fontFamily: "'Nunito Sans', Arial, sans-serif",
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#fafafa',
                      textDecoration: 'none',
                      borderRadius: '10px',
                      backgroundColor: '#942e00',
                    }}
                  >
                    Learn More About Deen AI
                  </Link>
                </Section>

                <Text
                  style={{
                    margin: 0,
                    color: '#393025',
                    fontSize: '16px',
                    fontWeight: 500,
                    fontFamily: "'Nunito Sans', Arial, sans-serif",
                    lineHeight: 1.6,
                  }}
                >
                  JazakAllah Khair for your trust and patience.
                </Text>

                <Text
                  style={{
                    margin: '15px 0 0 0',
                    color: '#393025',
                    fontSize: '16px',
                    fontWeight: 600,
                    fontFamily: "'Nunito Sans', Arial, sans-serif",
                    lineHeight: 1.6,
                  }}
                >
                  With peace,
                  <br />
                  <span style={{ color: '#942e00', fontWeight: 700 }}>
                    The Deen AI Team
                  </span>
                </Text>
              </Section>

              {/* Footer */}
              <Section
                style={{
                  padding: '30px 40px',
                  backgroundColor: '#fafafa',
                  borderRadius: '0 0 16px 16px',
                  borderTop: '1px solid #e5d4bd',
                  textAlign: 'center',
                }}
              >
                <Text
                  style={{
                    margin: '0 0 10px 0',
                    color: '#737373',
                    fontSize: '13px',
                    fontWeight: 500,
                    fontFamily: "'Nunito Sans', Arial, sans-serif",
                    lineHeight: 1.5,
                  }}
                >
                  Questions? We'd love to hear from you.
                </Text>

                <Link
                  href="mailto:buddy.deenai@gmail.com"
                  style={{
                    color: '#942e00',
                    fontSize: '13px',
                    fontWeight: 600,
                    fontFamily: "'Nunito Sans', Arial, sans-serif",
                    textDecoration: 'none',
                    display: 'block',
                    margin: '0 0 20px 0',
                  }}
                >
                  buddy.deenai@gmail.com
                </Link>

                {/* Social Links */}
                <Row
                  style={{ margin: '0 auto 20px auto', width: 'fit-content' }}
                >
                  <Column style={{ padding: '0 10px' }}>
                    <Link
                      href="https://instagram.com/thedeenai"
                      style={{
                        color: '#942e00',
                        textDecoration: 'none',
                        fontSize: '20px',
                      }}
                    >
                      📷
                    </Link>
                  </Column>
                  <Column style={{ padding: '0 10px' }}>
                    <Link
                      href="https://youtube.com/@thedeenai"
                      style={{
                        color: '#942e00',
                        textDecoration: 'none',
                        fontSize: '20px',
                      }}
                    >
                      ▶️
                    </Link>
                  </Column>
                  <Column style={{ padding: '0 10px' }}>
                    <Link
                      href="https://tiktok.com/@thedeenai"
                      style={{
                        color: '#942e00',
                        textDecoration: 'none',
                        fontSize: '20px',
                      }}
                    >
                      🎵
                    </Link>
                  </Column>
                  <Column style={{ padding: '0 10px' }}>
                    <Link
                      href="https://linktr.ee/thedeenai"
                      style={{
                        color: '#942e00',
                        textDecoration: 'none',
                        fontSize: '20px',
                      }}
                    >
                      🔗
                    </Link>
                  </Column>
                </Row>

                <Text
                  style={{
                    margin: 0,
                    color: '#737373',
                    fontSize: '12px',
                    fontWeight: 400,
                    fontFamily: "'Nunito Sans', Arial, sans-serif",
                    lineHeight: 1.5,
                  }}
                >
                  © 2025 Deen AI. All rights reserved.
                </Text>

                <Text
                  style={{
                    margin: '5px 0 0 0',
                    color: '#737373',
                    fontSize: '11px',
                    fontWeight: 400,
                    fontFamily: "'Nunito Sans', Arial, sans-serif",
                    lineHeight: 1.5,
                  }}
                >
                  You're receiving this email because you signed up for the Deen
                  AI waitlist.
                </Text>
              </Section>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WaitlistEmail;
