import React from 'react';

interface WelcomeEmailProps {
  name: string;
  supportEmail?: string;
}

const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  name,
  supportEmail = 'buddy.deenai@gmail.com',
}) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Welcome to Deen AI</title>
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
              className="bg-[#fafafa] rounded-2xl px-8 sm:px-14 py-12 shadow-sm"
              role="main"
            >
              <div className="text-center mb-8">
                <img
                  src="https://res.cloudinary.com/dauiwma0j/image/upload/v1763533670/Frame_2147225762_aguoyo.svg"
                  alt="Deen AI Logo"
                  className="w-[180px] h-auto mx-auto"
                />
              </div>
              <div className="bg-white p-5 rounded-3xl">
                <div className="text-center mb-7">
                  <img
                    src="https://res.cloudinary.com/dauiwma0j/image/upload/v1763534286/hello_s31dgb.svg"
                    alt="Welcome illustration"
                    onError="this.style.display='none'"
                    className="w-[180px] h-auto mx-auto"
                  />
                </div>

                <h1
                  className="text-[28px] font-semibold leading-snug mb-2 text-left text-[#333]"
                >
                  Welcome <span className="font-bold text-[#1a1a1a]">{name},</span>
                </h1>

                <p
                  className="text-[#6b6b6b] text-[15px] leading-relaxed mb-6 text-left"
                >
                  Welcome to Deen AI! Your account has been successfully created,
                  and you're all set to get started.
                </p>

                <div className="my-7">
                  <h3 className="font-semibold text-base text-[#9a4a00] mb-4 text-left">
                    Next steps:
                  </h3>
                  <ul className="space-y-3 list-none p-0 m-0">
                    <li
                      className="flex gap-3 items-start text-[#333] text-[15px] leading-normal"
                    >
                      <span
                        className="min-w-[20px] h-5 inline-flex items-center justify-center text-[#4a9b5c] flex-shrink-0 font-semibold text-base"
                      >✓</span>
                      <span>Open the Deen AI app</span>
                    </li>
                    <li
                      className="flex gap-3 items-start text-[#333] text-[15px] leading-normal"
                    >
                      <span
                        className="min-w-[20px] h-5 inline-flex items-center justify-center text-[#4a9b5c] flex-shrink-0 font-semibold text-base"
                      >✓</span>
                      <span>Log in with your new account</span>
                    </li>
                    <li
                      className="flex gap-3 items-start text-[#333] text-[15px] leading-normal"
                    >
                      <span
                        className="min-w-[20px] h-5 inline-flex items-center justify-center text-[#4a9b5c] flex-shrink-0 font-semibold text-base"
                      >✓</span>
                      <span>Start using your personalized tools and features</span>
                    </li>
                  </ul>
                </div>
              </div>
              <p className="text-[#6b6b6b] text-sm leading-relaxed mt-6 mb-2 text-left">
                If you ever need help, reach us anytime at
                <a
                  href={`mailto:${supportEmail}`}
                  className="text-[#9a4a00] no-underline hover:underline"
                >{supportEmail}</a>
              </p>

              <p className="text-[#6b6b6b] text-[15px] leading-relaxed my-4 text-left">
                Thanks for joining Deen AI — we're excited to have you onboard!
              </p>

              <p className="text-[#6b6b6b] text-[15px] mt-3 mb-0 text-left">
                — The Deen AI Team
              </p>

              <div className="mt-12 text-center pt-7 border-t border-[#e7e7e7]">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <img
                    src="https://res.cloudinary.com/dauiwma0j/image/upload/v1763533505/Logo_icon_exo0rq.svg"
                    alt="Deen AI"
                    className="w-[140px] h-auto"
                  />
                </div>

                <div className="flex gap-3 justify-center items-center my-4">
                  <a
                    href="https://x.com/thedeenai"
                    aria-label="x"
                    target="_blank"
                    className="inline-flex w-9 h-9 rounded-full items-center justify-center bg-transparent no-underline transition-transform hover:scale-110"
                  >
                    <img
                      src="https://ottoman.emerj.net/icons/x.svg"
                      alt="X"
                      className="w-5 h-5 object-contain"
                    />
                  </a>
                  <a
                    href="https://instagram.com/thedeenai"
                    aria-label="instagram"
                    target="_blank"
                    className="inline-flex w-9 h-9 rounded-full items-center justify-center bg-transparent no-underline transition-transform hover:scale-110"
                  >
                    <img
                      src="https://ottoman.emerj.net/icons/insta.svg"
                      alt="Instagram"
                      className="w-5 h-5 object-contain"
                    />
                  </a>
                  <a
                    href="https://youtube.com/@thedeenai"
                    aria-label="youtube"
                    target="_blank"
                    className="inline-flex w-9 h-9 rounded-full items-center justify-center bg-transparent no-underline transition-transform hover:scale-110"
                  >
                    <img
                      src="https://ottoman.emerj.net/icons/yt.svg"
                      alt="YouTube"
                      className="w-5 h-5 object-contain"
                    />
                  </a>
                </div>

                <div className="text-xs text-[#999] mt-4 leading-normal">
                  All rights reserved &copy; 2025
                </div>

                <div className="flex gap-4 justify-center my-3 text-[13px]">
                  <a href="#" className="text-[#6b6b6b] no-underline hover:underline"
                  >Privacy Policy</a>
                  <span className="text-[#6b6b6b]">-</span>
                  <a href="#" className="text-[#9a4a00] no-underline hover:underline"
                  >Unsubscribe</a>
                </div>

                <div className="flex gap-3 justify-center my-5 mt-5 mb-4">
                  <a href="#" target="_blank">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                      alt="Get it on Google Play"
                      className="h-10 w-auto"
                    />
                  </a>
                  <a href="#" target="_blank">
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

export default WelcomeEmail;
