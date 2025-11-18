import React from 'react';
import { Html, Head, Preview, Body } from '@react-email/components';

interface WelcomeEmailProps {
  name: string;
}

const WelcomeEmail = ({ name }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to Deen AI</Preview>
    <Body style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#fbf9f8', margin: 0, padding: 0 }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ background: '#fff', border: '1px solid #e7d7cc', borderRadius: 20, padding: '48px 56px', textAlign: 'center' }}>
          <img src="https://ottoman.emerj.net/icons/logo-svg.svg" alt="Deen AI Logo" style={{ width: 200 }} />
          <h1 style={{ fontSize: 34, fontWeight: 700, color: '#1f1f1f' }}>Welcome to Your Spiritual Journey</h1>
          <p style={{ color: '#6b6b6b', maxWidth: 760, margin: '0 auto 20px', fontSize: 15, lineHeight: 1.6 }}>
            Thank you for joining the Deen AI waitlist, {name}. Your interest means a lot…
          </p>
          {/* Optional feature list here */}
        </div>
      </div>
    </Body>
  </Html>
);

export default WelcomeEmail;
