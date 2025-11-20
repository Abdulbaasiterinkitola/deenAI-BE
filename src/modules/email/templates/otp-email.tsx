import React from 'react';

interface OtpEmailProps {
  name: string;
  otp: string;
  expiryMinutes?: number;
}

const OtpEmail: React.FC<OtpEmailProps> = ({ name, otp, expiryMinutes = 10 }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Password Reset - Deen AI</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          {`
            html,
            body {
              font-family: Nunito, system-ui, -apple-system, "Segoe UI", Roboto,
                "Helvetica Neue", Arial, sans-serif;
            }
          `}
        </style>
      </head>
      <body className="min-h-screen bg-[#f5f3f1] antialiased">
        <div className="min-h-screen flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[680px]">
            <div
              className="bg-white rounded-2xl px-8 sm:px-14 py-12 shadow-sm"
              role="main"
            >
              <div className="text-center mb-8">
                <img
                  src="https://res.cloudinary.com/djbkecpu7/image/upload/v1763639598/logo_2_bvfhp5.png"
                  alt="Deen AI Logo"
                  className="w-[180px] h-auto mx-auto"
                />
              </div>

              <div className="text-left mb-8">
                <img
                  src="https://res.cloudinary.com/djbkecpu7/image/upload/v1763639129/otp_oj7pge.png"
                  alt="Password Reset illustration"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  className="w-[180px] h-auto"
                />
              </div>

              <h1
                className="text-[32px] sm:text-[36px] font-semibold leading-tight mb-4 text-left text-[#333]"
              >
                Forgot Password
              </h1>

              <p className="text-[#6b6b6b] text-[15px] leading-relaxed mb-6 text-left">
                Your Deen AI Password Reset Code
              </p>

              <p className="text-[#333] text-[15px] leading-relaxed mb-4 text-left">
                Hi <span className="font-semibold">{name},</span>
              </p>

              <p className="text-[#6b6b6b] text-[15px] leading-relaxed mb-6 text-left">
                We received a request to reset your password for Deen AI.<br />
                To continue, please enter the verification code below in the app:
              </p>

              <div className="my-8">
                <h3 className="font-semibold text-base text-[#9a4a00] mb-4 text-left">
                  Your Reset Code:
                </h3>

                <div className="bg-[#f8f8f8] rounded-xl py-8 px-6 my-6">
                  <div className="text-center">
                    <div
                      className="text-[48px] sm:text-[56px] font-bold text-[#9a4a00] tracking-[0.15em] font-mono"
                    >
                      {otp}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[#6b6b6b] text-[14px] leading-relaxed mb-6 text-left">
                This code will expire in
                <span className="text-[#9a4a00] font-semibold"> {expiryMinutes}</span> minutes.
              </p>

              <p className="text-[#6b6b6b] text-[14px] leading-relaxed mb-4 text-left">
                If you didn't request this, you can safely ignore the message.<br />
                Welcome to Deen AI!
              </p>

              <p className="text-[#6b6b6b] text-[15px] mt-6 mb-0 text-left">
                &mdash; The Deen AI Team
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

export default OtpEmail;