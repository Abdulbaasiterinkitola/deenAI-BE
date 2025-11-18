import React from 'react';
import { Html, Head, Preview, Body } from '@react-email/components';

interface AccountWelcomeProps {
  name: string;
}

const AccountWelcomeEmail = ({ name }: AccountWelcomeProps) => (
  <Html>
    <Head />
    <Preview>Welcome to Deen AI</Preview>
    <Body style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f5f3f1', margin: 0, padding: 0 }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '48px 56px', textAlign: 'center' }}>
          <img src="https://ottoman.emerj.net/icons/logo-svg.svg" alt="Deen AI Logo" style={{ width: 180 }} />
          <h1 style={{ fontSize: 28 }}>Welcome <span style={{ fontWeight: 700 }}>{name}</span></h1>
          <p style={{ color: '#6b6b6b', fontSize: 15 }}>Your account is ready to use!</p>
          {/* Steps / instructions can go here */}
        </div>
      </div>
    </Body>
  </Html>
);

export default AccountWelcomeEmail;
