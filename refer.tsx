import { useState } from 'react';
import { useUserStore } from '@/helpers/userStore';
import { ReferralShareCard } from './ ReferralShareCard';
import { useIsUserConnected } from '@/helpers/userauth';

export function Refer() {
  const [showModal, setShowModal] = useState(false);

  const isLoggedIn = useIsUserConnected();

  const handleCloseModal = () => setShowModal(false);
  const handleOpenModal = () => setShowModal(true);

  return (
    <>
      {/* Referral Box */}
      <div
        className="relative bg-[#141414] md:w-full 2xl:max-w-[600px] rounded-2xl shadow-lg p-6 flex flex-col gap-4 text-white bg-no-repeat bg-right-top bg-[length:160px] xl:bg-[length:150px] 2xl:bg-[length:170px]"
        style={{ backgroundImage: "url('/assets/refercoin.svg')" }}
      >
        {/* Header */}
        <div className="flex justify-between items-start pb-10">
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold">Refer and Earn 200 AVTS!</h3>
            <p className="text-xs text-[#979797] flex flex-wrap items-center gap-1 md:max-w-[150px] 2xl:max-w-none">
              You and your WAGGER will be rewarded
            </p>
          </div>
        </div>

        {isLoggedIn ? (
          <Ref handleOpenModal={handleOpenModal} />
        ) : (
          <LoggedOutCard />
        )}
      </div>

      {/* 🔥 Share Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-6 rounded-2xl relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-white text-xl hover:text-gray-300"
            >
              ✕
            </button>
            <ReferralShareCard />
          </div>
        </div>
      )}
    </>
  );
}
function Ref({ handleOpenModal }: { handleOpenModal: () => void }) {
  const userData = useUserStore((state) => state.userData);
  const referData = useUserStore((state) => state.referData);

  return (
    <>
      {/* Stats */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 bg-[#1A19184D] border border-[#FFD7001A] rounded-xl w-full py-2 px-4 backdrop-blur-sm">
          <img
            src="/assets/avituscoin.svg"
            className="w-6 h-6 rounded-full shadow-[0_0_7px_2px_rgba(255,223,0,0.6)]"
          />
          <div>
            <div className="text-lg xl:text-xl font-semibold mt-1">
              {referData?.referralPoints}
            </div>
            <span className="text-xs xl:text-sm text-[#979797] font-medium">
              Total rewards
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#1A19184D] border border-[#FFD7001A] rounded-xl py-2 px-4 w-full backdrop-blur-sm">
          <img src="/assets/referrals.svg" className="w-5 h-5" />
          <div>
            <div className="text-lg xl:text-xl font-semibold mt-1">
              {referData?.referralCount}
            </div>
            <span className="text-xs xl:text-sm text-[#979797] font-medium">
              Your referrals
            </span>
          </div>
        </div>
      </div>

      {/* Referral Code */}
      <div className="flex flex-col gap-2 mt-4">
        <p className="font-medium">Your referral code</p>
        <div className="bg-[#141414] border border-[#222220] border-2 px-4 py-1 rounded-xl flex justify-between items-center mt-2">
          <span className="text-sm bg-gradient-to-r from-[#FFD013] via-[#FFA00B] to-[#FF6200] bg-clip-text text-transparent font-medium tracking-wide">
            {userData?.referralCode ?? 'AVITUS'}
          </span>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#222220] hover:opacity-90 transition-all cursor-pointer"
          >
            {/* Share Icon */}
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
            Share
          </button>
        </div>
      </div>
    </>
  );
}
function LoggedOutCard() {
  return (
    <div className="flex flex-col items-center  gap-4 bg-[#1A19184D] backdrop-blur-sm rounded-xl border border-[#FFD7001A] text-sm text-center text-[#999] py-6">
      <h3 className='text-xl font-semibold bg-gradient-to-r from-[#FFD013]  to-[#FF6200] bg-clip-text text-transparent'>Share the Fun. Earn Rewards</h3>
      <p className='bg-gradient-to-r from-[#FFD013]  to-[#FF6200] bg-clip-text text-transparent font-medium'>Invite friends and get rewarded for every successful referral!</p>
      <button className='flex flex-row items-center rounded-md gap-4 text-lg font-medium justify-center text-[#2D2D2A] py-2 w-[40%] bg-gradient-to-r from-[#FFD013]  to-[#FF6200]'>
        Refer & earn
        <img src="/assets/stars.svg" className='w-5 h-5'/>
      </button>
    </div>
  );
}
