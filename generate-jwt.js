#!/usr/bin/env node

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === 'secret') {
  // Generate secure JWT secret
  const secret = crypto.randomBytes(64).toString('hex');
  console.log('\n🔐 Generated secure JWT secret:');
  console.log(secret);
  console.log('\n📝 Add this to your .env file:');
  console.log(`JWT_SECRET=${secret}`);
} else if (command === 'token') {
  // Generate JWT token
  const userId = args.find(arg => arg.startsWith('--userId='))?.split('=')[1] || 'test-user-id';
  const email = args.find(arg => arg.startsWith('--email='))?.split('=')[1] || 'test@example.com';
  const expiresIn = args.find(arg => arg.startsWith('--expiresIn='))?.split('=')[1] || '6M';
  const secret = args.find(arg => arg.startsWith('--secret='))?.split('=')[1] || 'your_secret_key';

  const payload = {
    sub: userId,
    email: email,
    iat: Math.floor(Date.now() / 1000),
  };

  const token = jwt.sign(payload, secret, { expiresIn });

  console.log('\n🎫 Generated JWT Token:');
  console.log(token);
  console.log('\n📋 Token Details:');
  console.log(`User ID: ${userId}`);
  console.log(`Email: ${email}`);
  console.log(`Expires In: ${expiresIn}`);
  console.log(`Secret: ${secret}`);
  console.log('\n🔍 Decode at: https://jwt.io');
} else {
  console.log('\n🚀 JWT Generator for DeenAI');
  console.log('\nUsage:');
  console.log('  node generate-jwt.js secret                           # Generate secure JWT secret');
  console.log('  node generate-jwt.js token [options]                  # Generate JWT token');
  console.log('\nToken Options:');
  console.log('  --userId=<id>        User ID (default: test-user-id)');
  console.log('  --email=<email>      Email (default: test@example.com)');
  console.log('  --expiresIn=<time>   Expiration (default: 6M)');
  console.log('  --secret=<secret>    JWT secret (default: your_secret_key)');
  console.log('\nExamples:');
  console.log('  node generate-jwt.js secret');
  console.log('  node generate-jwt.js token --userId=123 --email=user@test.com --expiresIn=1y');
}