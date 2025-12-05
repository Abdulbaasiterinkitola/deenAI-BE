import React from 'react';

interface ContactNotificationProps {
    name: string;
    email: string;
    message: string;
}

const imgStyle = {
  display: "block",
  border: 0,
  outline: "none",
  textDecoration: "none",
  ["-ms-interpolation-mode" as any]: "bicubic",
};

const ContactNotification: React.FC<ContactNotificationProps> = ({
    name,
    email,
    message,
}) => {
    return (
        <html lang="en">
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>New Contact Form Submission - Deen AI</title>
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
                                                                {/* Header */}
                                                                <h1
                                                                    style={{
                                                                        margin: "0 0 20px",
                                                                        fontSize: "28px",
                                                                        fontWeight: 600,
                                                                        color: "#9a4a00",
                                                                        lineHeight: 1.3,
                                                                    }}
                                                                >
                                                                    🔔 New Contact Form Submission
                                                                </h1>

                                                                <p
                                                                    style={{
                                                                        margin: "0 0 24px",
                                                                        fontSize: "15px",
                                                                        lineHeight: 1.6,
                                                                        color: "#6b6b6b",
                                                                    }}
                                                                >
                                                                    A new contact form has been submitted on the Deen AI website.
                                                                </p>

                                                                {/* Contact Details */}
                                                                <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: "24px" }}>
                                                                    <tbody>
                                                                        {/* Name Field */}
                                                                        <tr>
                                                                            <td
                                                                                style={{
                                                                                    padding: "12px 0",
                                                                                    borderBottom: "1px solid #f0f0f0",
                                                                                }}
                                                                            >
                                                                                <table width="100%" cellPadding={0} cellSpacing={0}>
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td width="80" style={{ verticalAlign: "top" }}>
                                                                                                <p
                                                                                                    style={{
                                                                                                        margin: 0,
                                                                                                        fontSize: "14px",
                                                                                                        fontWeight: 600,
                                                                                                        color: "#9a4a00",
                                                                                                    }}
                                                                                                >
                                                                                                    Name:
                                                                                                </p>
                                                                                            </td>
                                                                                            <td>
                                                                                                <p
                                                                                                    style={{
                                                                                                        margin: 0,
                                                                                                        fontSize: "15px",
                                                                                                        color: "#333",
                                                                                                        fontWeight: 500,
                                                                                                    }}
                                                                                                >
                                                                                                    {name}
                                                                                                </p>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                            </td>
                                                                        </tr>

                                                                        {/* Email Field */}
                                                                        <tr>
                                                                            <td
                                                                                style={{
                                                                                    padding: "12px 0",
                                                                                    borderBottom: "1px solid #f0f0f0",
                                                                                }}
                                                                            >
                                                                                <table width="100%" cellPadding={0} cellSpacing={0}>
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td width="80" style={{ verticalAlign: "top" }}>
                                                                                                <p
                                                                                                    style={{
                                                                                                        margin: 0,
                                                                                                        fontSize: "14px",
                                                                                                        fontWeight: 600,
                                                                                                        color: "#9a4a00",
                                                                                                    }}
                                                                                                >
                                                                                                    Email:
                                                                                                </p>
                                                                                            </td>
                                                                                            <td>
                                                                                                <p
                                                                                                    style={{
                                                                                                        margin: 0,
                                                                                                        fontSize: "15px",
                                                                                                        color: "#333",
                                                                                                    }}
                                                                                                >
                                                                                                    <a
                                                                                                        href={`mailto:${email}`}
                                                                                                        style={{
                                                                                                            color: "#9a4a00",
                                                                                                            textDecoration: "none",
                                                                                                            fontWeight: 500,
                                                                                                        }}
                                                                                                    >
                                                                                                        {email}
                                                                                                    </a>
                                                                                                </p>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                            </td>
                                                                        </tr>

                                                                        {/* Message Field */}
                                                                        <tr>
                                                                            <td style={{ padding: "12px 0" }}>
                                                                                <p
                                                                                    style={{
                                                                                        margin: "0 0 8px",
                                                                                        fontSize: "14px",
                                                                                        fontWeight: 600,
                                                                                        color: "#9a4a00",
                                                                                    }}
                                                                                >
                                                                                    Message:
                                                                                </p>
                                                                                <table width="100%" cellPadding={0} cellSpacing={0}>
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td
                                                                                                style={{
                                                                                                    backgroundColor: "#fbf9f8",
                                                                                                    borderRadius: "8px",
                                                                                                    borderLeft: "3px solid #9a4a00",
                                                                                                    padding: "16px",
                                                                                                }}
                                                                                            >
                                                                                                <p
                                                                                                    style={{
                                                                                                        margin: 0,
                                                                                                        fontSize: "15px",
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
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>

                                                                {/* Action Button */}
                                                                <table width="100%" cellPadding={0} cellSpacing={0}>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td align="center" style={{ padding: "20px 0" }}>
                                                                                <a
                                                                                    href={`mailto:${email}?subject=Re: Your message to Deen AI&body=Hi ${name},%0D%0A%0D%0AThank you for contacting Deen AI.%0D%0A%0D%0A`}
                                                                                    style={{
                                                                                        display: "inline-block",
                                                                                        backgroundColor: "#9a4a00",
                                                                                        color: "#ffffff",
                                                                                        padding: "12px 24px",
                                                                                        borderRadius: "8px",
                                                                                        textDecoration: "none",
                                                                                        fontSize: "15px",
                                                                                        fontWeight: 600,
                                                                                    }}
                                                                                >
                                                                                    📧 Reply to {name}
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>

                                                                <p
                                                                    style={{
                                                                        margin: "16px 0 0",
                                                                        fontSize: "13px",
                                                                        color: "#999",
                                                                        textAlign: "center",
                                                                    }}
                                                                >
                                                                    This email was automatically generated from the Deen AI contact form.
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

                                                                <p
                                                                    style={{
                                                                        margin: "20px 0 15px",
                                                                        fontSize: "12px",
                                                                        color: "#999999",
                                                                    }}
                                                                >
                                                                    All rights reserved © 2025
                                                                </p>
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

export default ContactNotification;
