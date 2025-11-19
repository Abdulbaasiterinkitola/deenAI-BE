import React from 'react';

interface PasswordResetSuccessEmailProps {
  name: string;
}

const PasswordResetSuccessEmail: React.FC<PasswordResetSuccessEmailProps> = ({ name }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Password Reset Successful - Deen AI</title>
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
                  src="https://res.cloudinary.com/dauiwma0j/image/upload/v1763533670/Frame_2147225762_aguoyo.svg"
                  alt="Deen AI Logo"
                  className="w-[180px] h-auto mx-auto"
                />
              </div>

              <div className="text-left mb-8">
                <img
                  src="https://res.cloudinary.com/dauiwma0j/image/upload/v1763534286/hello_s31dgb.svg"
                  alt="Password reset success illustration"
                  onError="this.style.display='none'"
                  className="w-[180px] h-auto"
                />
              </div>

              <h1
                className="text-[32px] sm:text-[36px] font-semibold leading-tight mb-4 text-left text-[#333]"
              >
                Password Reset Successful
              </h1>

              <p className="text-[#6b6b6b] text-[15px] leading-relaxed mb-6 text-left">
                Your Deen AI Password Has Been Changed
              </p>

              <p className="text-[#333] text-[15px] leading-relaxed mb-4 text-left">
                Hi <span className="font-semibold">{name},</span>
              </p>

              <p className="text-[#6b6b6b] text-[15px] leading-relaxed mb-6 text-left">
                This is a confirmation that your password for your Deen AI account
                has been successfully reset. You can now log in to your account with
                your new password.
              </p>

              <p className="text-[#6b6b6b] text-[15px] leading-relaxed mb-6 text-left">
                If you made this change, no further action is required. You can
                continue using Deen AI with your new password.
              </p>

              <div className="my-8">
                <h3 className="font-semibold text-base text-[#9a4a00] mb-4 text-left">
                  Didn't reset your password?
                </h3>
                <p
                  className="text-[#6b6b6b] text-[15px] leading-relaxed mb-4 text-left"
                >
                  If you didn't make this change, your account may have been
                  compromised. Please contact our support team immediately at
                  <a
                    href="mailto:buddy.deenai@gmail.com"
                    className="text-[#9a4a00] no-underline hover:underline"
                  > buddy.deenai@gmail.com</a>
                </p>
              </div>

              <p className="text-[#6b6b6b] text-[15px] leading-relaxed mb-6 text-left">
                Thank you for keeping your account secure.
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

export default PasswordResetSuccessEmail;