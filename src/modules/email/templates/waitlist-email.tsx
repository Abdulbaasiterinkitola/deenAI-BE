// src/components/emails/WelcomeEmail.tsx
import React from 'react';

interface WelcomeEmailProps {
  name: string;
  supportEmail?: string;
}

const WaitlistEmail: React.FC<WelcomeEmailProps> = ({
  name,
  supportEmail = 'email@deenai.com',
}) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Welcome to Deen AI</title>

        <style>
          {`
            body {
              font-family: 'Inter', sans-serif;
              background: #f5f3f1;
              color: #333;
              margin: 0;
              padding: 0;
            }

            .card {
              background: #fff;
              padding: 48px 56px;
              border-radius: 16px;
              max-width: 680px;
              margin: auto;
              box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            }

            h1 {
              font-weight: 600;
              font-size: 28px;
              margin: 0 0 12px;
              text-align: left;
            }

            .steps-title {
              color: #9a4a00;
              font-weight: 600;
              margin-top: 24px;
              margin-bottom: 16px;
            }

            .steps-list {
              list-style: none;
              margin: 0;
              padding: 0;
            }

            .steps-list li {
              display: flex;
              gap: 12px;
              font-size: 15px;
              color: #333;
              margin-bottom: 8px;
            }

            .check {
              color: #4a9b5c;
              font-weight: 700;
            }

            a {
              color: #9a4a00;
              text-decoration: none;
            }

            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
              color: #777;
              font-size: 13px;
            }
          `}
        </style>
      </head>

      <body>
        <div className="card">

          <h1>Welcome <strong>{name}</strong>,</h1>

          <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#6b6b6b' }}>
            Welcome to DeenAI! Your account has been successfully created, and you're all set to get started.
          </p>

          <h3 className="steps-title">Next steps:</h3>

          <ul className="steps-list">
            <li><span className="check">✓</span>Open the DeenAI app</li>
            <li><span className="check">✓</span>Log in with your new account</li>
            <li><span className="check">✓</span>Start using all your personalized tools and features</li>
          </ul>

          <p style={{ marginTop: '24px', fontSize: '14px', color: '#6b6b6b' }}>
            Need help? Contact us anytime at 
            <a href={`mailto:${supportEmail}`}> {supportEmail}</a>.
          </p>

          <p style={{ fontSize: '15px', marginTop: '24px', color: '#6b6b6b' }}>
            Thanks for joining Deen AI — we're excited to have you onboard!
          </p>

          <p style={{ fontSize: '15px', marginTop: '12px', color: '#6b6b6b' }}>
            The Deen AI Team
          </p>

          <div className="footer">
            © {new Date().getFullYear()} Deen AI — All rights reserved
          </div>

        </div>
      </body>
    </html>
  );
};

export default WaitlistEmail;
