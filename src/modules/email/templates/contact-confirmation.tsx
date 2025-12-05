import React from 'react';

interface ContactConfirmationProps {
    name: string;
    message: string;
}

const imgStyle = {
  display: "block",
  border: 0,
  outline: "none",
  textDecoration: "none",
  ["-ms-interpolation-mode" as any]: "bicubic",
};

const ContactConfirmation: React.FC<ContactConfirmationProps> = ({
    name,
    message,
}) => {
    return (
        <html lang="en">
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>We received your message - Deen AI</title>
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
                    <tbody>
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
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: "40px" }}>
                                                {/* Logo */}
                                                <table width="100%" cellPadding={0} cellSpacing={0}>
                                                    <tbody>
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
                                                    </tbody>
                                                </table>

                                                {/* Inner White Card */}
                                                <table
                                                    width="100%"
                                                    cellPadding={0}
                                                    cellSpacing={0}
                                                    style={{ backgroundColor: "#ffffff", borderRadius: "20px" }}
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td style={{ padding: "30px" }}>
                                                                {/* Illustration */}
                                                                <table width="100%" cellPadding={0} cellSpacing={0}>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td style={{ paddingBottom: "20px" }}>
                                                                                <img
                                                                                    src="https://res.cloudinary.com/djbkecpu7/image/upload/v1763639371/hello_bfbbz2.png"
                                                                                    alt="Message Received"
                                                                                    width="120"
                                                                                    style={imgStyle}
                                                                                />
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>

                                                                {/* Header */}
                                                                <h1
                                                                    style={{
                                                                        margin: "0 0 20px",
                                                                        fontSize: "28px",
                                                                        fontWeight: 600,
                                                                        color: "#333333",
                                                                        lineHeight: 1.3,
                                                                    }}
                                                                >
                                                                    Message Received!
                                                                </h1>

                                                                {/* Greeting */}
                                                                <p
                                                                    style={{
                                                                        margin: "0 0 16px",
                                                                        fontSize: "15px",
                                                                        lineHeight: 1.6,
                                                                        color: "#333",
                                                                    }}
                                                                >
                                                                    Hi <span style={{ fontWeight: 600 }}>{name},</span>
                                                                </p>

                                                                {/* Main message */}
                                                                <p
                                                                    style={{
                                                                        margin: "0 0 24px",
                                                                        fontSize: "15px",
                                                                        lineHeight: 1.6,
                                                                        color: "#6b6b6b",
                                                                    }}
                                                                >
                                                                    Thank you for reaching out to Deen AI. We've received your message
                                                                    and our team will get back to you as soon as possible.
                                                                </p>

                                                                {/* Message box */}
                                                                <table width="100%" cellPadding={0} cellSpacing={0}>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td
                                                                                style={{
                                                                                    backgroundColor: "#fbf9f8",
                                                                                    borderRadius: "8px",
                                                                                    borderLeft: "3px solid #9a4a00",
                                                                                    padding: "16px",
                                                                                    margin: "20px 0",
                                                                                }}
                                                                            >
                                                                                <p
                                                                                    style={{
                                                                                        margin: "0 0 8px",
                                                                                        fontSize: "14px",
                                                                                        fontWeight: 600,
                                                                                        color: "#9a4a00",
                                                                                    }}
                                                                                >
                                                                                    Your message:
                                                                                </p>
                                                                                <p
                                                                                    style={{
                                                                                        margin: 0,
                                                                                        fontSize: "14px",
                                                                                        lineHeight: 1.6,
                                                                                        color: "#333",
                                                                                        whiteSpace: "pre-wrap",
                                                                                    }}
                                                                                >
                                                                                    {message}
                                                                                </p>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>

                                                                {/* Response time */}
                                                                <p
                                                                    style={{
                                                                        margin: "24px 0 16px",
                                                                        fontSize: "15px",
                                                                        lineHeight: 1.6,
                                                                        color: "#6b6b6b",
                                                                    }}
                                                                >
                                                                    We typically respond within 24-48 hours. If your matter is urgent,
                                                                    please email us directly at{" "}
                                                                    <a
                                                                        href="mailto:support@deenai.com"
                                                                        style={{ color: "#9a4a00", textDecoration: "none" }}
                                                                    >
                                                                        support@deenai.com
                                                                    </a>
                                                                    .
                                                                </p>

                                                                {/* Closing */}
                                                                <p
                                                                    style={{
                                                                        margin: "24px 0 0",
                                                                        fontSize: "15px",
                                                                        color: "#6b6b6b",
                                                                    }}
                                                                >
                                                                    Thanks for reaching out!<br />
                                                                    — The Deen AI Team
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>

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
                                                    <tbody>
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
                                                                    <tbody>
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
                                                                    </tbody>
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
                                                                    <tbody>
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

export default ContactConfirmation;
