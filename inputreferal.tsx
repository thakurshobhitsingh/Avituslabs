import { useUserStore } from "@/helpers/userStore";
import { useEffect } from "react";

type ReferralInputProps = {
    onClose: () => void;
    onSubmit: () => void;
    referralCode: string;
    setReferralCode: (value: string) => void;
  };
  export default function ReferralInput({
        onClose,
        onSubmit,
        referralCode,
        setReferralCode,
      }: ReferralInputProps) {


    useEffect(() => {
  const storedCode = useUserStore.getState().referralCode;
  if (!referralCode && storedCode) {
    setReferralCode(storedCode);
  }
}, []);
    return (
      <div className="fixed inset-0 bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-150">
        <div
          className="bg-[#1A1918] border border-[#FFD7001A] p-6 rounded-lg w-[500px] bg-no-repeat bg-right-top bg-[length:100px]"
          style={{ backgroundImage: "url('/assets/avitusfrog.svg')" }}
        >
          <h2 className="text-white text-xl font-bold">Enter Referral Code</h2>
          <p className="text-[#979797] text-sm mb-10">
            Don't have referral code? Enter: <span className="text-white">AVITUS</span>
          </p>
          <input
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            className="w-full px-3 py-2 mb-4 rounded-md bg-[#222220] text-white 
             border border-[#444] focus:outline-none focus:ring-2 
             focus:ring-yellow-500 focus:border-yellow-500 transition duration-200"
            placeholder="Referral Code (optional)"
          />
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 hover:bg-[#333330] text-white bg-[#222220] rounded-md shadow-md ">
              Skip
            </button>
            <button onClick={onSubmit} className="px-4 py-2 hover:bg-[#333330] text-white bg-[#222220] rounded-md shadow-md ">
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  
  