import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { useUserStore } from "@/helpers/userStore";
import { useIsMobile } from "@/hooks/use-isMobile";
import { Skeleton } from "./ui/skeleton";

interface ReferralShareCardProps {
  referralCodeFromProps?: string;
}

export function ReferralShareCard({referralCodeFromProps}:ReferralShareCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const userData = useUserStore((state) => state.userData);
  const [copied, setCopied] = useState(false);
   const isMobile = useIsMobile();
    const referralCode = isMobile
    ? referralCodeFromProps ?? "AVITUS"
    : userData?.referralCode ?? "AVITUS";
    const shareText =`Join the wagers with Avitus Waitlist  @avituslabsxyz
Get 200 Avitus tokens

✅ Go to http://portal.avituslabs.xyz/${referralCode}
  • Enter your Email
  • Connect your X Account
  • Check 200 Avitus points`;
  // const shareText = `Use my referral code and get 200 Avitus points! 🔥\nJoin now: https://portal.avituslabs.xyz/${referralCode}`;

  const handleDownload = async () => {
    if (!ref.current) return;
    const dataUrl = await toPng(ref.current);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "avitus-referral.png";
    link.click();
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleShareOnTwitter = () => {
    const tweet = encodeURIComponent(shareText);
    window.open(`https://twitter.com/intent/tweet?text=${tweet}`, "_blank");
  };

  return (
    <div className="flex flex-col items-center gap-6 px-4 sm:px-6">
      {/* Share Card Image */}
      <div
        ref={ref}
        className="bg-[#141414] border border-[#333] p-6 sm:p-8 rounded-2xl lg:w-[120%] sm:max-w-lg text-white shadow-lg relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <div className="w-full sm:w-3/4">
            <p className="text-lg sm:text-xl font-semibold leading-tight text-center sm:text-left">
              Use my referral code and get
              <span className="text-yellow-400"> 200 Avitus points</span>
            </p>
            <div className="mt-4 text-lg flex bg-[#1a1a1a] px-4 py-2 rounded-xl text-center items-center justify-between border border-[#333] tracking-wide">
              {referralCode==="AVITUS"?(
                <Skeleton className="h-4 w-40 rounded-md" />
              ):(
                              <span>
                {referralCode}
              </span>
              )}
              <div className="relative">
                <span 
                  onClick={copyText}
                  className="cursor-pointer hover:opacity-50 transition-opacity relative group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <g clipPath="url(#clip0)">
                      <path
                        d="M3.32813 10.0026C2.70687 10.0026 2.39624 10.0026 2.15121 9.90111C1.82451 9.76579 1.56494 9.50622 1.42962 9.17952C1.32812 8.93449 1.32812 8.62386 1.32812 8.0026V3.46927C1.32812 2.72253 1.32812 2.34917 1.47345 2.06395C1.60128 1.81307 1.80525 1.60909 2.05614 1.48126C2.34135 1.33594 2.71472 1.33594 3.46146 1.33594H7.99479C8.61605 1.33594 8.92667 1.33594 9.1717 1.43743C9.49841 1.57276 9.75797 1.83232 9.8933 2.15903C9.99479 2.40405 9.99479 2.71468 9.99479 3.33594M8.12813 14.6693H12.5281C13.2749 14.6693 13.6482 14.6693 13.9334 14.5239C14.1843 14.3961 14.3883 14.1921 14.5161 13.9413C14.6615 13.656 14.6615 13.2827 14.6615 12.5359V8.13594C14.6615 7.3892 14.6615 7.01583 14.5161 6.73062C14.3883 6.47973 14.1843 6.27576 13.9334 6.14793C13.6482 6.0026 13.2749 6.0026 12.5281 6.0026H8.12813C7.38139 6.0026 7.00802 6.0026 6.7228 6.14793C6.47192 6.27576 6.26795 6.47973 6.14012 6.73062C5.99479 7.01583 5.99479 7.3892 5.99479 8.13594V12.5359C5.99479 13.2827 5.99479 13.656 6.14012 13.9413C6.26795 14.1921 6.47192 14.3961 6.7228 14.5239C7.00802 14.6693 7.38139 14.6693 8.12813 14.6693Z"
                        stroke="#E3E3E3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0">
                        <rect width="16" height="16" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </span>
                {/* Tooltip - Always visible on mobile, hover on desktop */}
                <span className={`absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap
                  ${copied ? 'opacity-100' : 'opacity-0 sm:group-hover:opacity-100'} 
                  transition-opacity duration-200`}>
                  {copied ? 'Copied!' : ''}
                </span>
              </div>
            </div>
            {referralCode === "AVITUS" ?(
              <Skeleton className="h-7 w-40 rounded-md" />
            ):(

            <p className="text-xs sm:text-sm text-gray-400 mt-2 text-center sm:text-left break-words">
              portal.avituslabs.xyz/{referralCode}
            </p>
            )}
          </div>
          <img
            src="/assets/froghoodie.png"
            alt="Frog Mascot"
            className="w-[70px] sm:w-[80px] drop-shadow-xl"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-md sm:max-w-lg">
        <button
          onClick={handleShareOnTwitter}
          className="bg-black border-[#333] border-2 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
        >
          <img src="/assets/x.svg" className="w-[15px] h-[15px]" />
          Share on X
        </button>

        <button
          onClick={handleDownload}
          className="bg-yellow-400 text-black font-semibold py-2 px-6 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
        >
          Download Image
        </button>
      </div>
    </div>
  );
}
