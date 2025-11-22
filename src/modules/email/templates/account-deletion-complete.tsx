import React from "react";

interface AccountDeletionEmailProps {
  name: string;
}

const AccountDeletionEmail: React.FC<AccountDeletionEmailProps> = ({ name }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Account Deleted Successfully - Deen AI</title>
        <style>{`
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f3f1;
          }
          a {
            color: #9a4a00;
            text-decoration: none;
          }
        `}</style>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#f5f3f1", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: "#f5f3f1", padding: "40px 20px" }}>
          <tr>
            <td align="center">
              <table width="600" cellPadding={0} cellSpacing={0} style={{ maxWidth: "600px", backgroundColor: "#fafafa", borderRadius: "16px", overflow: "hidden" }}>
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
                            style={{ display: "block", border: 0, outline: "none", textDecoration: "none" }}
                          />
                        </td>
                      </tr>
                    </table>

                    {/* Illustration */}
                    <table width="100%" cellPadding={0} cellSpacing={0}>
                      <tr>
                        <td style={{ paddingBottom: "20px" }} align="center">
                          <img
                            src="https://res.cloudinary.com/djbkecpu7/image/upload/v1763639371/hello_bfbbz2.png"
                            alt="Account Deleted"
                            width={120}
                            style={{ display: "block", border: 0, outline: "none", textDecoration: "none" }}
                          />
                        </td>
                      </tr>
                    </table>

                    {/* Main Heading */}
                    <h1 style={{ margin: "0 0 16px", fontSize: "32px", fontWeight: 600, color: "#333", lineHeight: 1.2, textAlign: "center" }}>
                      Account Deleted Successfully
                    </h1>

                    {/* Subtitle */}
                    <p style={{ margin: "0 0 24px", fontSize: "15px", lineHeight: 1.6, color: "#6b6b6b", textAlign: "center" }}>
                      Account Deletion Confirmation
                    </p>

                    {/* Greeting */}
                    <p style={{ margin: "0 0 16px", fontSize: "15px", lineHeight: 1.6, color: "#333", textAlign: "center" }}>
                      Hi <strong>{name}</strong>,
                    </p>

                    {/* Body Text */}
                    <p style={{ margin: "0 0 24px", fontSize: "15px", lineHeight: 1.6, color: "#6b6b6b", textAlign: "center" }}>
                      Your account has now been permanently deleted. All your data linked to this account has been removed from our system.
                    </p>

                    {/* Security Warning */}
                    <p style={{ margin: "0 0 24px", fontSize: "15px", lineHeight: 1.6, color: "#6b6b6b", textAlign: "center" }}>
                      If this wasn't you, please contact our support team at{" "}
                      <a href="mailto:support@deenai.com">support@deenai.com</a> immediately.
                    </p>

                    {/* Please Note Section */}
                    <table width="100%" cellPadding={0} cellSpacing={0} style={{ margin: "32px 0" }}>
                      <tr>
                        <td>
                          <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 600, color: "#9a4a00" }}>
                            Please Note:
                          </h3>
                          <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "15px", lineHeight: 1.4, color: "#6b6b6b" }}>
                            <li>All your personal data has been removed</li>
                            <li>You no longer have access to your account</li>
                            <li>This action cannot be undone</li>
                          </ul>
                        </td>
                      </tr>
                    </table>

                    {/* Help Text */}
                    <p style={{ margin: "0 0 24px", fontSize: "14px", lineHeight: 1.6, color: "#6b6b6b", textAlign: "center" }}>
                      If you need any help, please feel free to contact us at{" "}
                      <a href="mailto:email@deenai.com">email@deenai.com</a>
                    </p>

                    {/* Signature */}
                    <p style={{ margin: "24px 0 0", fontSize: "15px", color: "#6b6b6b", textAlign: "center" }}>
                      Thank you for being with us,<br />— The Deen AI Team
                    </p>
                  </td>
                </tr>
              </table>

              {/* Footer Section */}
              <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginTop: "40px", paddingTop: "30px", borderTop: "1px solid #e7e7e7" }}>
                <tr>
                  <td align="center">
                    {/* Footer Logo */}
                    <img
                      src="https://res.cloudinary.com/djbkecpu7/image/upload/v1763639598/logo_2_bvfhp5.png"
                      alt="Deen AI"
                      width={140}
                      style={{ display: "block", margin: "0 auto 20px", border: 0, outline: "none", textDecoration: "none" }}
                    />

                    {/* Social Icons */}
                    <table cellPadding={0} cellSpacing={0} style={{ margin: "0 auto 20px" }}>
                      <tr>
                        <td style={{ padding: "0 8px" }}>
                          <a href="https://x.com/thedeenai" target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>
                            <img src="https://img.icons8.com/ios-filled/50/9a4a00/twitterx--v1.png" alt="X" width={24} height={24} style={{ display: "block" }} />
                          </a>
                        </td>
                        <td style={{ padding: "0 8px" }}>
                          <a href="https://instagram.com/thedeenai" target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>
                            <img src="https://img.icons8.com/ios-filled/50/9a4a00/instagram-new.png" alt="Instagram" width={24} height={24} style={{ display: "block" }} />
                          </a>
                        </td>
                        <td style={{ padding: "0 8px" }}>
                          <a href="https://youtube.com/@the.deenai" target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>
                            <img src="https://img.icons8.com/ios-filled/50/9a4a00/youtube-play.png" alt="YouTube" width={24} height={24} style={{ display: "block" }} />
                          </a>
                        </td>
                      </tr>
                    </table>

                    {/* Copyright */}
                    <p style={{ margin: "0 0 15px", fontSize: "12px", color: "#999999" }}>All rights reserved © 2025</p>

                    {/* Footer Links */}
                    <p style={{ margin: "0 0 20px", fontSize: "13px", color: "#6b6b6b" }}>
                      <a href="#">Privacy Policy</a>
                    </p>
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

export default AccountDeletionEmail;
