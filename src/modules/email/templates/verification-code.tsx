// src/components/emails/EmailVerification.tsx
import React from 'react';

interface EmailVerificationProps {
  name: string;
  otp: string;
  expiryMinutes?: number;
  supportEmail?: string;
  verificationUrl?: string;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  name,
  otp,
  expiryMinutes = 10,
  supportEmail = 'security@deenai.com',
  verificationUrl = '#',
}) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Email Confirmation - Deen AI</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          backgroundColor: '#f5f3f1',
        }}
      >
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: '#f5f3f1', padding: '40px 20px' }}>
          <tbody>
            <tr>
              <td align="center">
                {/* Main Container */}
                <table
                  width="600"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{ maxWidth: '600px', backgroundColor: '#fafafa', borderRadius: '16px', overflow: 'hidden' }}
                >
                  <tbody>
                    <tr>
                      <td style={{ padding: '40px' }}>
                        {/* Logo */}
                        <table width="100%" cellPadding={0} cellSpacing={0}>
                          <tbody>
                            <tr>
                              <td align="center" style={{ paddingBottom: '30px' }}>
                                <img
                                  src="https://res.cloudinary.com/djbkecpu7/image/upload/v1763639598/logo_2_bvfhp5.png"
                                  alt="Deen AI Logo"
                                  width={180}
                                  style={{ display: 'block', border: 0, outline: 'none', textDecoration: 'none' }}
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Inner White Card */}
                        <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: '#ffffff', borderRadius: '20px' }}>
                          <tbody>
                            <tr>
                              <td style={{ padding: '30px' }}>
                                {/* Illustration */}
                                <table width="100%" cellPadding={0} cellSpacing={0}>
                                  <tbody>
                                    <tr>
                                      <td style={{ paddingBottom: '20px', textAlign: 'center' }}>
                                        <img
                                          src="https://res.cloudinary.com/djbkecpu7/image/upload/v1763639129/otp_oj7pge.png"
                                          alt="Email Confirmation"
                                          width={120}
                                          style={{ display: 'block', border: 0, outline: 'none', textDecoration: 'none' }}
                                        />
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>

                                {/* Heading */}
                                <h1 style={{ margin: '0 0 16px', fontSize: '32px', fontWeight: 600, color: '#333333', lineHeight: 1.2 }}>
                                  Complete registration
                                </h1>

                                {/* Subtitle */}
                                <p style={{ margin: '0 0 24px', fontSize: '15px', lineHeight: 1.6, color: '#6b6b6b' }}>
                                  Your Deen AI Email Verification Code
                                </p>

                                {/* Greeting */}
                                <p style={{ margin: '0 0 16px', fontSize: '15px', lineHeight: 1.6, color: '#333333' }}>
                                  Hi <span style={{ fontWeight: 600 }}>{name},</span>
                                </p>

                                {/* Body Text */}
                                <p style={{ margin: '0 0 24px', fontSize: '15px', lineHeight: 1.6, color: '#6b6b6b' }}>
                                  Thank you for signing up with Deen AI. To complete your registration, we just need to confirm that this is your email address.
                                </p>

                                {/* Code Section */}
                                <h3 style={{ margin: '32px 0 16px', fontSize: '16px', fontWeight: 600, color: '#9a4a00' }}>
                                  Your Email Verification Code:
                                </h3>

                                <table width="100%" cellPadding={0} cellSpacing={0}>
                                  <tbody>
                                    <tr>
                                      <td
                                        align="center"
                                        style={{ backgroundColor: '#f8f8f8', borderRadius: '12px', padding: '32px 24px' }}
                                      >
                                        <div
                                          style={{
                                            fontSize: '56px',
                                            fontWeight: 700,
                                            color: '#9a4a00',
                                            letterSpacing: '0.15em',
                                            fontFamily: "'Courier New', monospace",
                                          }}
                                        >
                                          {otp}
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>

                             

                                <table width="100%" cellPadding={0} cellSpacing={0}>
                                  <tbody>
                                    <tr>
                                      <td align="left">
                                        <a
                                          href={verificationUrl}
                                          style={{
                                            display: 'inline-block',
                                            backgroundColor: '#9a4a00',
                                            color: '#ffffff',
                                            fontWeight: 600,
                                            fontSize: '16px',
                                            padding: '14px 48px',
                                            borderRadius: '8px',
                                            textDecoration: 'none',
                                          }}
                                        >
                                          Confirm your email
                                        </a>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>

                                {/* Security Notice */}
                                <p style={{ margin: '24px 0', fontSize: '14px', lineHeight: 1.6, color: '#6b6b6b' }}>
                                  If you didn't create an account with Deen AI, please ignore this message.
                                </p>

                                {/* Expiry */}
                                <p style={{ margin: '0 0 24px', fontSize: '14px', lineHeight: 1.6, color: '#6b6b6b' }}>
                                  This code will expire in{' '}
                                  <span style={{ color: '#9a4a00', fontWeight: 600 }}>{expiryMinutes} minutes</span>.
                                </p>

                                {/* Signature */}
                                <p style={{ margin: '24px 0 0', fontSize: '15px', color: '#6b6b6b' }}>
                                  — The Deen AI Team
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Footer */}
                        <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #e7e7e7' }}>
                          <tbody>
                            <tr>
                              <td align="center">
                                {/* Footer Logo */}
                                <img
                                  src="https://res.cloudinary.com/djbkecpu7/image/upload/v1763639598/logo_2_bvfhp5.png"
                                  alt="Deen AI"
                                  width={140}
                                  style={{ display: 'block', margin: '0 auto 20px', border: 0, outline: 'none', textDecoration: 'none' }}
                                />

                                {/* Social Icons */}
                                <table cellPadding={0} cellSpacing={0} style={{ margin: '0 auto 20px' }}>
                                  <tbody>
                                    <tr>
                                      <td style={{ padding: '0 8px' }}>
                                        <a href="https://x.com/thedeenai" target="_blank" rel="noopener noreferrer">
                                          <img
                                            src="https://img.icons8.com/ios-filled/50/9a4a00/twitterx--v1.png"
                                            alt="X"
                                            width={24}
                                            height={24}
                                            style={{ display: 'block', border: 0, outline: 'none', textDecoration: 'none' }}
                                          />
                                        </a>
                                      </td>
                                      <td style={{ padding: '0 8px' }}>
                                        <a href="https://instagram.com/thedeenai" target="_blank" rel="noopener noreferrer">
                                          <img
                                            src="https://img.icons8.com/ios-filled/50/9a4a00/instagram-new.png"
                                            alt="Instagram"
                                            width={24}
                                            height={24}
                                            style={{ display: 'block', border: 0, outline: 'none', textDecoration: 'none' }}
                                          />
                                        </a>
                                      </td>
                                      <td style={{ padding: '0 8px' }}>
                                        <a href="https://youtube.com/@the.deenai" target="_blank" rel="noopener noreferrer">
                                          <img
                                            src="https://img.icons8.com/ios-filled/50/9a4a00/youtube-play.png"
                                            alt="YouTube"
                                            width={24}
                                            height={24}
                                            style={{ display: 'block', border: 0, outline: 'none', textDecoration: 'none' }}
                                          />
                                        </a>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>

                                {/* Copyright */}
                                <p style={{ margin: '0 0 15px', fontSize: '12px', color: '#999999' }}>All rights reserved © 2025</p>

                                {/* Footer Links */}
                                <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#6b6b6b' }}>
                                  <a href="#" style={{ color: '#6b6b6b', textDecoration: 'none' }}>Privacy Policy</a>
                                </p>

                                {/* App Store Badges */}
                                <table cellPadding={0} cellSpacing={0} style={{ margin: '0 auto' }}>
                                  <tbody>
                                    <tr>
                                      <td style={{ padding: '0 8px' }}>
                                        <a href="#" target="_blank">
                                          <img
                                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/512px-Google_Play_Store_badge_EN.svg.png"
                                            alt="Get it on Google Play"
                                            height={40}
                                            style={{ display: 'block', border: 0, outline: 'none', textDecoration: 'none' }}
                                          />
                                        </a>
                                      </td>
                                      <td style={{ padding: '0 8px' }}>
                                        <a href="#" target="_blank">
                                          <img
                                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/512px-Download_on_the_App_Store_Badge.svg.png"
                                            alt="Download on the App Store"
                                            height={40}
                                            style={{ display: 'block', border: 0, outline: 'none', textDecoration: 'none' }}
                                          />
                                        </a>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>

                              </td>
                            </tr>
                          </tbody>
                        </table>

                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
};

export default EmailVerification;
