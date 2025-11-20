import React from 'react';

interface AccountDeletionCompleteEmailProps {
  name: string;
}

const AccountDeletionCompleteEmail: React.FC<
  AccountDeletionCompleteEmailProps
> = ({ name }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Account Deleted - Deen AI</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
        <script src="https://cdn.tailwindcss.com"></script>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
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
              {/* Logo Header */}
              <div className="text-center mb-8">
                <img
                  src="https://res.cloudinary.com/dauiwma0j/image/upload/v1763533670/Frame_2147225762_aguoyo.svg"
                  alt="Deen AI Logo"
                  className="w-[180px] h-auto mx-auto"
                />
              </div>

              {/* Illustration */}
              <div className="text-center mb-8">
                <div className="w-[180px] h-[180px] mx-auto flex items-center justify-center">
                  <i className="fas fa-user-minus text-[80px] text-[#9a4a00]"></i>
                </div>
              </div>

              {/* Main Heading */}
              <h1 className="text-[28px] sm:text-[32px] font-semibold leading-tight mb-4 text-center text-[#333]">
                Account Successfully Deleted
              </h1>

              {/* Subtitle */}
              <p className="text-[#6b6b6b] text-[15px] leading-relaxed mb-6 text-center">
                Your Deen AI account has been permanently removed
              </p>

              {/* Greeting */}
              <p className="text-[#333] text-[15px] leading-relaxed mb-4 text-center">
                Hi <span className="font-semibold">{name},</span>
              </p>

              {/* Main Message */}
              <p className="text-[#6b6b6b] text-[15px] leading-relaxed mb-6 text-center">
                We're writing to confirm that your Deen AI account has been
                successfully deleted. All your personal data, reflections, and
                preferences have been permanently removed from our systems.
              </p>

              {/* Info Box */}
              <div className="bg-[#fff3e0] border-l-4 border-[#ff9800] rounded-lg p-6 my-8">
                <h3 className="font-semibold text-base text-[#e65100] mb-3 flex items-center">
                  <i className="fas fa-info-circle mr-2"></i>
                  What this means:
                </h3>
                <ul className="space-y-2 text-[#5d4037] text-[14px] ml-4">
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-[#ff9800] mr-2 mt-1"></i>
                    <span>Your account has been permanently deactivated</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-[#ff9800] mr-2 mt-1"></i>
                    <span>All your personal data has been deleted</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-[#ff9800] mr-2 mt-1"></i>
                    <span>Your saved reflections and progress are gone</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-[#ff9800] mr-2 mt-1"></i>
                    <span>You will no longer receive emails from us</span>
                  </li>
                </ul>
              </div>

              {/* Changed Mind Section */}
              <div className="my-8 text-center">
                <h3 className="font-semibold text-base text-[#9a4a00] mb-4">
                  Changed your mind?
                </h3>
                <p className="text-[#6b6b6b] text-[15px] leading-relaxed mb-4">
                  If you'd like to return to Deen AI, you're always welcome to
                  create a new account. However, please note that we cannot
                  restore your previous data.
                </p>
                <a
                  href="https://deenai.com/signup"
                  className="inline-block bg-[#9a4a00] text-white font-semibold px-8 py-3 rounded-lg hover:bg-[#7a3a00] transition-colors no-underline"
                  style={{ textDecoration: 'none' }}
                >
                  Create New Account
                </a>
              </div>

              {/* Feedback Section */}
              <div className="bg-[#f8f8f8] rounded-xl p-6 my-8 text-center">
                <h3 className="font-semibold text-base text-[#333] mb-3">
                  <i className="fas fa-heart mr-2 text-[#9a4a00]"></i>
                  We'd Love Your Feedback
                </h3>
                <p className="text-[#6b6b6b] text-[14px] leading-relaxed mb-4">
                  Your opinion matters to us. If you have a moment, please let
                  us know why you decided to leave and how we can improve.
                </p>
                <a
                  href="mailto:buddy.deenai@gmail.com"
                  className="text-[#9a4a00] font-semibold hover:underline"
                  style={{ textDecoration: 'none' }}
                >
                  Share Your Feedback
                </a>
              </div>

              {/* Closing Message */}
              <p className="text-[#6b6b6b] text-[15px] leading-relaxed mb-4 text-center">
                Thank you for being part of the Deen AI community. We're sorry
                to see you go, but we wish you all the best in your spiritual
                journey.
              </p>

              <p className="text-[#6b6b6b] text-[15px] leading-relaxed mb-6 text-center">
                May peace and blessings be upon you.
              </p>

              {/* Signature */}
              <p className="text-[#6b6b6b] text-[15px] mt-8 mb-0 text-center">
                &mdash; The Deen AI Team
              </p>

              {/* Footer */}
              <div className="mt-12 pt-8 border-t border-[#e7e7e7]">
                <div className="text-center mb-4">
                  <img
                    src="https://res.cloudinary.com/dauiwma0j/image/upload/v1763533670/Frame_2147225762_aguoyo.svg"
                    alt="Deen AI"
                    className="w-[140px] h-auto mx-auto opacity-60"
                  />
                </div>

                {/* Social Links */}
                <div className="flex justify-center gap-4 mb-4">
                  <a
                    href="https://www.facebook.com/thedeenai"
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-facebook text-[20px] text-[#6b6b6b]"></i>
                  </a>
                  <a
                    href="https://x.com/thedeenai"
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-x-twitter text-[20px] text-[#6b6b6b]"></i>
                  </a>
                  <a
                    href="https://instagram.com/thedeenai"
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-instagram text-[20px] text-[#6b6b6b]"></i>
                  </a>
                  <a
                    href="https://youtube.com/@thedeenai"
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-youtube text-[20px] text-[#6b6b6b]"></i>
                  </a>
                  <a
                    href="https://www.linkedin.com/company/thedeenai"
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-linkedin text-[20px] text-[#6b6b6b]"></i>
                  </a>
                </div>

                <p className="text-[#999] text-[12px] text-center mb-3">
                  All rights reserved © 2025
                </p>

                <div className="flex justify-center gap-4 text-[13px] mb-5">
                  <a
                    href="https://deenai.com/privacy"
                    className="text-[#6b6b6b] hover:underline"
                    style={{ textDecoration: 'none' }}
                  >
                    Privacy Policy
                  </a>
                  <span className="text-[#999]">•</span>
                  <a
                    href="mailto:buddy.deenai@gmail.com"
                    className="text-[#6b6b6b] hover:underline"
                    style={{ textDecoration: 'none' }}
                  >
                    Contact Support
                  </a>
                </div>

                {/* App Badges */}
                <div className="flex justify-center gap-3 mb-4">
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                      alt="Get it on Google Play"
                      className="h-10 w-auto"
                    />
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                      alt="Download on the App Store"
                      className="h-10 w-auto"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

export default AccountDeletionCompleteEmail;
