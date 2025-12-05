import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

function generateKeys() {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
        },
    });

    const privateKeyPath = path.join(process.cwd(), 'google-play-private.key');
    fs.writeFileSync(privateKeyPath, privateKey);
    console.log(`Private key saved to: ${privateKeyPath}`);

    const publicKeyBase64 = Buffer.from(publicKey).toString('base64');
    const publicKeyPath = path.join(process.cwd(), 'google-play-public.key.txt');
    fs.writeFileSync(publicKeyPath, publicKeyBase64);
    console.log(`Public key saved to: ${publicKeyPath}`);
}

generateKeys();
