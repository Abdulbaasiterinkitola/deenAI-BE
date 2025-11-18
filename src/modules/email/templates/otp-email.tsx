import React from 'react';
import { Html, Head, Preview, Body } from '@react-email/components';

interface OtpEmailProps {
  name: string;
  otp: string;
  expiryMinutes?: number;
}

const OtpEmail = ({ name, otp, expiryMinutes = 10 }: OtpEmailProps) => (
  <Html>
    <Head />
    <Preview>Your Deen AI Verification Code</Preview>
    <Body style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f5f3f1', padding: '0', margin: '0' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px', boxSizing: 'border-box' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '48px 56px', textAlign: 'center' }}>
          <img src="https://ottoman.emerj.net/icons/logo-svg.svg" alt="Deen AI Logo" style={{ width: 180 }} />
          <h1 style={{ color: '#333', margin: '32px 0 16px' }}>Your Verification Code</h1>
          <p style={{ color: '#6b6b6b', fontSize: 15, lineHeight: 1.6 }}>
            Hi {name}, we received a request to verify your identity. Use the code below to continue.
          </p>
          <div style={{ margin: '32px 0' }}>
            <div style={{ fontSize: 14, color: '#6b6b6b', fontWeight: 600, textTransform: 'uppercase' }}>Verification Code</div>
            <div style={{
              background: 'linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%)',
              border: '2px solid #9a4a00',
              borderRadius: 12,
              padding: '24px 32px',
              maxWidth: 320,
              margin: '16px auto',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              fontSize: 42,
              fontWeight: 700,
              letterSpacing: 8,
              color: '#9a4a00',
              fontFamily: '"Courier New", monospace'
            }}>
              {otp}
            </div>
            <p style={{ color: '#d9534f', fontSize: 14, fontWeight: 600, marginTop: 16 }}>
              This code expires in {expiryMinutes} minutes
            </p>
          </div>
          <div style={{ background: '#fff9e6', borderLeft: '4px solid #ffc107', padding: '16px 20px', borderRadius: 4 }}>
            <p style={{ margin: 0, fontSize: 14, color: '#856404' }}>
              <strong>Security reminder:</strong> Never share this code. Deen AI staff will never ask for it.
            </p>
          </div>
          <p style={{ color: '#6b6b6b', fontSize: 14, lineHeight: 1.6, margin: '24px 0' }}>
            If you didn’t request this code, secure your account immediately or contact <a href="mailto:security@deenai.com" style={{ color: '#9a4a00', textDecoration: 'none' }}>security@deenai.com</a>.
          </p>
          <p style={{ color: '#6b6b6b', fontSize: 15, lineHeight: 1.6 }}>Thanks, The Deen AI Team</p>
        </div>
      </div>
    </Body>
  </Html>
);

export default OtpEmail;
