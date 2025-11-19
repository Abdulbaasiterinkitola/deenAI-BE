// src/components/emails/OtpEmail.tsx
import React from 'react';

interface OtpEmailProps {
  otp: string;
  name: string;
  expiryMinutes?: number;
  supportEmail?: string;
}

const OtpEmail: React.FC<OtpEmailProps> = ({
  otp,
  name,
  expiryMinutes = 10,
  supportEmail = 'security@deenai.com',
}) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Verification Code - Deen AI</title>
        <style>
          {`
            body { font-family: 'Inter', sans-serif; background:#f5f3f1; color:#333; margin:0; padding:0;}
            .card { background:#fff; padding:48px 56px; border-radius:16px; max-width:680px; margin:auto; box-shadow:0 2px 8px rgba(0,0,0,0.04);}
            h1 { font-weight:600; font-size:28px; text-align:center; margin-bottom:16px;}
            .code-box { background: #fff; border:2px solid #9a4a00; border-radius:12px; padding:24px 32px; text-align:center; margin:16px auto; font-size:42px; font-weight:700; letter-spacing:8px; color:#9a4a00; font-family:'Courier New', monospace;}
            .expiry-text { color:#d9534f; font-size:14px; margin-top:16px; font-weight:600; text-align:center;}
            a { color:#9a4a00; text-decoration:none; }
          `}
        </style>
      </head>
      <body>
        <div className="card">
          <h1>Hello {name},</h1>
          <p style={{ textAlign: 'center' }}>
            We received a request to verify your identity. Please use the code below to complete the verification process.
          </p>

          <div className="code-box">{otp}</div>
          <p className="expiry-text">This code expires in {expiryMinutes} minutes</p>

          <div style={{ background:'#fff9e6', borderLeft:'4px solid #ffc107', padding:'16px 20px', borderRadius:'4px', marginTop:'24px'}}>
            <p style={{margin:0, fontSize:'14px', color:'#856404'}}>
              <strong>Security reminder:</strong> Never share this code with anyone. Deen AI staff will never ask you for this code.
            </p>
          </div>

          <p style={{textAlign:'center', marginTop:'24px'}}>
            If you didn't request this code, contact us immediately at <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
          </p>

          <p style={{textAlign:'center', marginTop:'16px'}}>The Deen AI Team</p>
        </div>
      </body>
    </html>
  );
};

export default OtpEmail;
