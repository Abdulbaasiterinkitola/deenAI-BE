// src/components/emails/WelcomeEmail.tsx
import React from 'react';

interface WelcomeEmailProps {
  name: string;
  appUrl?: string;
  supportEmail?: string;
}

const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  name,
  appUrl = '#',
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
            body { font-family: 'Inter', sans-serif; background: #f5f3f1; color: #333; margin:0; padding:0;}
            .card { background: #fff; padding: 48px 56px; border-radius: 16px; max-width: 680px; margin: auto; box-shadow:0 2px 8px rgba(0,0,0,0.04);}
            h1 { font-weight: 600; font-size:28px; margin-bottom:8px;}
            .steps-list { list-style:none; padding:0; margin:0; }
            .steps-list li { display:flex; gap:12px; align-items:flex-start; font-size:15px; line-height:1.5;}
            .check { color:#4a9b5c; font-weight:600; margin-right:4px;}
            a { color:#9a4a00; text-decoration:none;}
          `}
        </style>
      </head>
      <body>
        <div className="card">
          <h1>Welcome <strong>{name}</strong>,</h1>
          <p>Welcome to DeenAI! Your account has been successfully created, and you're all set to get started.</p>

          <h3>Next steps:</h3>
          <ul className="steps-list">
            <li><span className="check">✓</span> Open the Deen AI app</li>
            <li><span className="check">✓</span> Log in with your new account</li>
            <li><span className="check">✓</span> Start using your personalized tools and features</li>
          </ul>

          <p>If you ever need help, reach us anytime at <a href={`mailto:${supportEmail}`}>{supportEmail}</a></p>
          <p>Thanks for joining Deen AI — we're excited to have you onboard!</p>
          <p>The Deen AI Team</p>
        </div>
      </body>
    </html>
  );
};

export default WelcomeEmail;
