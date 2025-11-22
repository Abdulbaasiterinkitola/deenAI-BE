import React from "react";

interface PasswordResetSuccessEmailProps {
  name: string;
  supportEmail?: string;
}

const imgStyle = {
  display: "block",
  border: 0,
  outline: "none",
  textDecoration: "none",
  ["-ms-interpolation-mode" as any]: "bicubic",
};

const PasswordResetSuccessEmail: React.FC<PasswordResetSuccessEmailProps> = ({
  name,
  supportEmail = "security@deenai.com",
}) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Password Reset Successful - Deen AI</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          backgroundColor: "#f5f3f1",
        }}
      >
        <table
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ backgroundColor: "#f5f3f1", padding: "40px 20px" }}
        >
          <tr>
            <td align="center">
              <table
                width="600"
                cellPadding={0}
                cellSpacing={0}
                style={{
                  maxWidth: "600px",
                  backgroundColor: "#fafafa",
                  borderRadius: "16px",
                  overflow: "hidden",
                }}
              >
                <tr>
                  <td style={{ padding: "40px" }}>
                    {/* Logo */}
                    <table width="100%" cellPadding={0} cellSpacing={0}>
                      <tr>
                        <td align="center" style={{ paddingBottom: "30px" }}>
                          <img
                            src="https://res.cloudinary.com/djbkecpu7/image/upload/v1763639598/logo_2_bvfhp5.png"
                            alt="Deen AI Logo"
                            width={180}
                            style={imgStyle}
                          />
                        </td>
                      </tr>
                    </table>

                    {/* Inner White Card */}
                    <table
                      width="100%"
                      cellPadding={0}
                      cellSpacing={0}
                      style={{ backgroundColor: "#ffffff", borderRadius: "20px" }}
                    >
                      <tr>
                        <td style={{ padding: "30px" }}>
                          {/* Illustration */}
                          <table width="100%" cellPadding={0} cellSpacing={0}>
                            <tr>
                              <td style={{ paddingBottom: "20px" }}>
                                <img
                                  src="https://res.cloudinary.com/djbkecpu7/image/upload/v1763639371/hello_bfbbz2.png"
                                  alt="Password Reset Success"
                                  width={120}
                                  style={imgStyle}
                                />
                              </td>
                            </tr>
                          </table>

                          {/* Main Heading */}
                          <h1
                            style={{
                              margin: "0 0 16px",
                              fontSize: "32px",
                              fontWeight: 600,
                              color: "#333333",
                              lineHeight: 1.2,
                            }}
                          >
                            Password Reset Successful
                          </h1>

                          {/* Subtitle */}
                          <p
                            style={{
                              margin: "0 0 24px",
                              fontSize: "15px",
                              lineHeight: 1.6,
                              color: "#6b6b6b",
                            }}
                          >
                            Your Deen AI Password Has Been Changed
                          </p>

                          {/* Greeting */}
                          <p
                            style={{
                              margin: "0 0 16px",
                              fontSize: "15px",
                              lineHeight: 1.6,
                              color: "#333333",
                            }}
                          >
                            Hi <span style={{ fontWeight: 600 }}>{name},</span>
                          </p>

                          {/* Body Text */}
                          <p
                            style={{
                              margin: "0 0 24px",
                              fontSize: "15px",
                              lineHeight: 1.6,
                              color: "#6b6b6b",
                            }}
                          >
                            This is a confirmation that your password for your Deen AI account has been
                            successfully reset. You can now log in to your account with your new password.
                          </p>

                          <p
                            style={{
                              margin: "0 0 24px",
                              fontSize: "15px",
                              lineHeight: 1.6,
                              color: "#6b6b6b",
                            }}
                          >
                            If you made this change, no further action is required. You can
                            continue using Deen AI with your new password.
                          </p>

                          {/* Security Notice */}
                          <table width="100%" cellPadding={0} cellSpacing={0} style={{ margin: "32px 0" }}>
                            <tr>
                              <td>
                                <h3
                                  style={{
                                    margin: "0 0 16px",
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    color: "#9a4a00",
                                  }}
                                >
                                  Didn't reset your password?
                                </h3>
                                <p
                                  style={{
                                    margin: "0 0 16px",
                                    fontSize: "15px",
                                    lineHeight: 1.6,
                                    color: "#6b6b6b",
                                  }}
                                >
                                  If you didn't make this change, your account may have been compromised.
                                  Please contact our support team immediately at{" "}
                                  <a
                                    href={`mailto:${supportEmail}`}
                                    style={{ color: "#9a4a00", textDecoration: "none" }}
                                  >
                                    {supportEmail}
                                  </a>
                                </p>
                              </td>
                            </tr>
                          </table>

                          {/* Thank You */}
                          <p
                            style={{
                              margin: "0 0 24px",
                              fontSize: "15px",
                              lineHeight: 1.6,
                              color: "#6b6b6b",
                            }}
                          >
                            Thank you for keeping your account secure.
                          </p>

                          {/* Signature */}
                          <p
                            style={{
                              margin: "24px 0 0",
                              fontSize: "15px",
                              color: "#6b6b6b",
                            }}
                          >
                            — The Deen AI Team
                          </p>
                        </td>
                      </tr>
                    </table>

                    {/* Footer */}
                    <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginTop: "40px", paddingTop: "30px", borderTop: "1px solid #e7e7e7" }}>
                      <tr>
                        <td align="center">
                          <img
                            src="https://res.cloudinary.com/djbkecpu7/image/upload/v1763639598/logo_2_bvfhp5.png"
                            alt="Deen AI"
                            width={140}
                            style={imgStyle}
                          />

                          <table cellPadding={0} cellSpacing={0} style={{ margin: "0 auto 20px" }}>
                            <tr>
                              <td style={{ padding: "0 8px" }}>
                                <a href="https://x.com/thedeenai" target="_blank" style={{ display: "block" }}>
                                  <img
                                    src="https://img.icons8.com/ios-filled/50/9a4a00/twitterx--v1.png"
                                    alt="X"
                                    width={24}
                                    height={24}
                                    style={imgStyle}
                                  />
                                </a>
                              </td>
                              <td style={{ padding: "0 8px" }}>
                                <a href="https://instagram.com/thedeenai" target="_blank" style={{ display: "block" }}>
                                  <img
                                    src="https://img.icons8.com/ios-filled/50/9a4a00/instagram-new.png"
                                    alt="Instagram"
                                    width={24}
                                    height={24}
                                    style={imgStyle}
                                  />
                                </a>
                              </td>
                              <td style={{ padding: "0 8px" }}>
                                <a href="https://youtube.com/@the.deenai" target="_blank" style={{ display: "block" }}>
                                  <img
                                    src="https://img.icons8.com/ios-filled/50/9a4a00/youtube-play.png"
                                    alt="YouTube"
                                    width={24}
                                    height={24}
                                    style={imgStyle}
                                  />
                                </a>
                              </td>
                            </tr>
                          </table>

                          <p style={{ margin: "0 0 15px", fontSize: "12px", color: "#999999" }}>
                            All rights reserved © 2025
                          </p>

                          <p style={{ margin: "0 0 20px", fontSize: "13px", color: "#6b6b6b" }}>
                            <a href="#" style={{ color: "#6b6b6b", textDecoration: "none" }}>
                              Privacy Policy
                            </a>
                          </p>

                          <table cellPadding={0} cellSpacing={0} style={{ margin: "0 auto" }}>
                            <tr>
                              <td style={{ padding: "0 8px" }}>
                                <a href="#" target="_blank">
                                  <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/512px-Google_Play_Store_badge_EN.svg.png"
                                    alt="Get it on Google Play"
                                    height={40}
                                    style={imgStyle}
                                  />
                                </a>
                              </td>
                              <td style={{ padding: "0 8px" }}>
                                <a href="#" target="_blank">
                                  <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/512px-Download_on_the_App_Store_Badge.svg.png"
                                    alt="Download on the App Store"
                                    height={40}
                                    style={imgStyle}
                                  />
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
};

export default PasswordResetSuccessEmail;
