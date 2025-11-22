import React from "react";

interface WelcomeEmailProps {
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

const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  name,
  supportEmail = "email@deenai.com",
}) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome to Deen AI</title>
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
                            width="180"
                            style={imgStyle}
                          />
                        </td>
                      </tr>
                    </table>

                    {/* Card */}
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
                                  alt="Welcome"
                                  width="120"
                                  style={imgStyle}
                                />
                              </td>
                            </tr>
                          </table>

                          {/* Welcome Header */}
                          <h1
                            style={{
                              margin: "0 0 20px",
                              fontSize: "28px",
                              fontWeight: 600,
                              color: "#333333",
                              lineHeight: 1.3,
                            }}
                          >
                            Welcome{" "}
                            <span
                              style={{ fontWeight: 700, color: "#1a1a1a" }}
                            >
                              {name},
                            </span>
                          </h1>

                          {/* Text */}
                          <p
                            style={{
                              margin: "0 0 30px",
                              fontSize: "15px",
                              lineHeight: 1.6,
                              color: "#6b6b6b",
                            }}
                          >
                            Welcome to Deen AI! Your account has been
                            successfully created, and you're all set to get
                            started.
                          </p>

                          {/* Next steps */}
                          <h3
                            style={{
                              margin: "0 0 15px",
                              fontSize: "16px",
                              fontWeight: 600,
                              color: "#9a4a00",
                            }}
                          >
                            Next steps:
                          </h3>

                          {/* Step 1 */}
                          <table
                            width="100%"
                            cellPadding={0}
                            cellSpacing={0}
                            style={{ marginBottom: "12px" }}
                          >
                            <tr>
                              <td width="25" valign="top" style={{ paddingTop: "2px" }}>
                                <span
                                  style={{
                                    display: "inline-block",
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    color: "#4a9b5c",
                                  }}
                                >
                                  ✓
                                </span>
                              </td>
                              <td
                                style={{
                                  fontSize: "15px",
                                  lineHeight: 1.4,
                                  color: "#333333",
                                }}
                              >
                                Open the Deen AI app
                              </td>
                            </tr>
                          </table>

                          {/* Step 2 */}
                          <table
                            width="100%"
                            cellPadding={0}
                            cellSpacing={0}
                            style={{ marginBottom: "12px" }}
                          >
                            <tr>
                              <td width="25" valign="top" style={{ paddingTop: "2px" }}>
                                <span
                                  style={{
                                    display: "inline-block",
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    color: "#4a9b5c",
                                  }}
                                >
                                  ✓
                                </span>
                              </td>
                              <td
                                style={{
                                  fontSize: "15px",
                                  lineHeight: 1.4,
                                  color: "#333333",
                                }}
                              >
                                Log in with your new account
                              </td>
                            </tr>
                          </table>

                          {/* Step 3 */}
                          <table
                            width="100%"
                            cellPadding={0}
                            cellSpacing={0}
                            style={{ marginBottom: "12px" }}
                          >
                            <tr>
                              <td width="25" valign="top" style={{ paddingTop: "2px" }}>
                                <span
                                  style={{
                                    display: "inline-block",
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    color: "#4a9b5c",
                                  }}
                                >
                                  ✓
                                </span>
                              </td>
                              <td
                                style={{
                                  fontSize: "15px",
                                  lineHeight: 1.4,
                                  color: "#333333",
                                }}
                              >
                                Start using your personalized tools and features
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    {/* Support */}
                    <p
                      style={{
                        margin: "25px 0 15px",
                        fontSize: "14px",
                        lineHeight: 1.6,
                        color: "#6b6b6b",
                      }}
                    >
                      If you ever need help, reach us anytime at{" "}
                      <a
                        href={`mailto:${supportEmail}`}
                        style={{ color: "#9a4a00", textDecoration: "none" }}
                      >
                        {supportEmail}
                      </a>
                    </p>

                    {/* Thanks */}
                    <p
                      style={{
                        margin: "0 0 15px",
                        fontSize: "15px",
                        lineHeight: 1.6,
                        color: "#6b6b6b",
                      }}
                    >
                      Thanks for joining Deen AI — we're excited to have you
                      onboard!
                    </p>

                    {/* Signature */}
                    <p
                      style={{
                        margin: 0,
                        fontSize: "15px",
                        color: "#6b6b6b",
                      }}
                    >
                      — The Deen AI Team
                    </p>

                    {/* Footer */}
                    <table
                      width="100%"
                      cellPadding={0}
                      cellSpacing={0}
                      style={{
                        marginTop: "40px",
                        paddingTop: "30px",
                        borderTop: "1px solid #e7e7e7",
                      }}
                    >
                      <tr>
                        <td align="center">
                          <img
                            src="https://res.cloudinary.com/djbkecpu7/image/upload/v1763639598/logo_2_bvfhp5.png"
                            alt="Deen AI"
                            width="140"
                            style={imgStyle}
                          />

                          {/* Social icons */}
                          <table
                            cellPadding={0}
                            cellSpacing={0}
                            style={{ margin: "0 auto 20px" }}
                          >
                            <tr>
                              <td style={{ padding: "0 8px" }}>
                                <a
                                  href="https://x.com/thedeenai"
                                  target="_blank"
                                  style={{ display: "block" }}
                                >
                                  <img
                                    src="https://img.icons8.com/ios-filled/50/9a4a00/twitterx--v1.png"
                                    alt="X"
                                    width="24"
                                    height="24"
                                    style={imgStyle}
                                  />
                                </a>
                              </td>

                              <td style={{ padding: "0 8px" }}>
                                <a
                                  href="https://instagram.com/thedeenai"
                                  target="_blank"
                                  style={{ display: "block" }}
                                >
                                  <img
                                    src="https://img.icons8.com/ios-filled/50/9a4a00/instagram-new.png"
                                    alt="Instagram"
                                    width="24"
                                    height="24"
                                    style={imgStyle}
                                  />
                                </a>
                              </td>

                              <td style={{ padding: "0 8px" }}>
                                <a
                                  href="https://youtube.com/@the.deenai"
                                  target="_blank"
                                  style={{ display: "block" }}
                                >
                                  <img
                                    src="https://img.icons8.com/ios-filled/50/9a4a00/youtube-play.png"
                                    alt="YouTube"
                                    width="24"
                                    height="24"
                                    style={imgStyle}
                                  />
                                </a>
                              </td>
                            </tr>
                          </table>

                          <p
                            style={{
                              margin: "0 0 15px",
                              fontSize: "12px",
                              color: "#999999",
                            }}
                          >
                            All rights reserved © 2025
                          </p>

                          <p
                            style={{
                              margin: "0 0 20px",
                              fontSize: "13px",
                              color: "#6b6b6b",
                            }}
                          >
                            <a
                              href="#"
                              style={{
                                color: "#6b6b6b",
                                textDecoration: "none",
                              }}
                            >
                              Privacy Policy
                            </a>
                          </p>

                          {/* App badges */}
                          <table
                            cellPadding={0}
                            cellSpacing={0}
                            style={{ margin: "0 auto" }}
                          >
                            <tr>
                              <td style={{ padding: "0 8px" }}>
                                <a href="#" target="_blank">
                                  <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/512px-Google_Play_Store_badge_EN.svg.png"
                                    alt="Get it on Google Play"
                                    height="40"
                                    style={imgStyle}
                                  />
                                </a>
                              </td>

                              <td style={{ padding: "0 8px" }}>
                                <a href="#" target="_blank">
                                  <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/512px-Download_on_the_App_Store_Badge.svg.png"
                                    alt="Download on the App Store"
                                    height="40"
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

export default WelcomeEmail;
