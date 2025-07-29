import { useEffect, useState, ChangeEvent } from "react";
import { WaitlistLogin } from "./waitlistLogin";
import { usePrivy } from "@privy-io/react-auth";

// const url = "http://localhost:3000";
const url = "https://porback.avituslabs.xyz";

export function Waitilist() {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showLogin, setShowLogin] = useState(false);

  const { ready, authenticated, user } = usePrivy();

  // Prevent scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // If authenticated and Twitter is a linked account, show login modal directly
  useEffect(() => {
    if (ready && authenticated) {
      const hasTwitter = user?.linkedAccounts?.some(
        (account) => account.type === "twitter_oauth"
      );
      if (hasTwitter) {
        setShowLogin(true);
      }
    }
  }, [ready, authenticated, user]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNotify = async () => {
    if (!email) {
      setError("Please enter an email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    try {
      const res = await fetch(`${url}/waitlist/waitlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setShowLogin(true);
      } else {
        const data = await res.json();
        if (data?.error.toLowerCase() === "already joined") {
          setShowLogin(true)
        }
        setError(data?.error || "Failed to join the waitlist. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please check your internet connection and try again.");
    }
  };

  // const checkForWaitlist = async () => {
  //   if (!email) {
  //     setError("Please enter an email address");
  //     return;
  //   }

  //   if (!validateEmail(email)) {
  //     setError("Please enter a valid email address");
  //     return;
  //   }

  //   setError("");
  //   try {
  //     const res = await fetch(`${url}/waitlist/getwaitlist`, {
  //       method: "GET",
  //     });
  //     const data = await res.json();

  //     const existingUser = data?.waitlist.find(
  //       (u: any) => u.email.toLowerCase() === email.toLowerCase()
  //     );
      
  //     if (existingUser) {
  //       setError("Email already registered.");
  //     } else {
  //       setShowLogin(true)
  //     }
  //   } catch (e) {
  //     console.log("error: ", e);
  //     setError("Something went wrong. Please check your internet connection and try again.");
  //   }

  // }

  // Show loading state until Privy is ready
  if (!ready) return null;

  // Show WaitlistLogin if already authenticated and linked with Twitter
  if (showLogin) {
    return <WaitlistLogin referralPoints={0} />;
  }

  // Else show email collection form
  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center backdrop-blur-lg">
      <div className="bg-[#0d0d0d] p-6 rounded-2xl shadow-xl w-[90%] max-w-md text-white">
        <h2 className="text-2xl font-semibold mb-4 text-center">Join the Waitlist</h2>

        <div className="flex justify-center my-4">
          <img src="/assets/avitusLogo.svg" className="h-10 w-10" alt="Logo" />
        </div>

        <div className="space-y-2">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setEmail(e.target.value);
              setError("");
            }}
            className={`w-full px-4 py-2 rounded-lg bg-[#1a1a1a] text-white placeholder-gray-400 border ${
              error ? "border-red-500" : "border-gray-600"
            } focus:outline-none focus:ring-2 ${
              error ? "focus:ring-red-500" : "focus:ring-[#FFA00B]"
            }`}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <button
          onClick={handleNotify}
          className="mt-4 w-full py-2 text-[#080808] bg-gradient-to-r from-[#FFD013] via-[#FFA00B] to-[#FF6200] rounded-lg font-medium cursor-pointer hover:opacity-70"
        >
          Notify Me
        </button>
      </div>
    </div>
  );
}
