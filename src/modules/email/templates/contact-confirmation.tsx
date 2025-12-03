import React from 'react';

interface ContactConfirmationProps {
    name: string;
    message: string;
}

const ContactConfirmation: React.FC<ContactConfirmationProps> = ({
    name,
    message,
}) => {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>We received your message</title>
                <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f3f1;
          }
          .container {
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: #9a4a00;
            color: white;
            padding: 24px;
            text-align: center;
          }
          .content {
            padding: 32px 24px;
          }
          .message-box {
            background: #fbf9f8;
            padding: 16px;
            border-radius: 4px;
            border-left: 3px solid #9a4a00;
            margin: 20px 0;
          }
          .footer {
            padding: 20px 24px;
            background: #fafafa;
            border-top: 1px solid #e7e7e7;
            text-align: center;
            font-size: 13px;
            color: #6b6b6b;
          }
        `}</style>
            </head>
            <body>
                <div className="container">
                    <div className="header">
                        <h2 style={{ margin: 0 }}>Message Received</h2>
                    </div>
                    <div className="content">
                        <p>Hi {name},</p>
                        <p>
                            Thank you for reaching out to Deen AI. We've received your message
                            and our team will get back to you as soon as possible.
                        </p>
                        <div className="message-box">
                            <strong style={{ color: '#9a4a00' }}>Your message:</strong>
                            <p style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>{message}</p>
                        </div>
                        <p>
                            We typically respond within 24-48 hours. If your matter is urgent,
                            please email us directly at support@deenai.com.
                        </p>
                        <p style={{ marginTop: 24 }}>
                            Best regards,<br />
                            The Deen AI Team
                        </p>
                    </div>
                    <div className="footer">
                        © 2025 Deen AI. All rights reserved.
                    </div>
                </div>
            </body>
        </html>
    );
};

export default ContactConfirmation;
