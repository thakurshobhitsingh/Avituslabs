import { submitQuest } from "@/helpers/userauth";
import { useTaskStore } from "@/helpers/userStore";
import { useState, useRef, useEffect } from "react";

type QuestCardProps = {
  username: string;
};

export function QuestCard({ username }: QuestCardProps) {
  const [questType, setQuestType] = useState("");
  const [link, setLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { fetchTasksFromServer } = useTaskStore();
  const questOptions = [
    "Tweet & Memes",
    "Art & Graphics",
    "Threads & Articles",
    "Others",
  ];

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = async () => {
    if (!questType || !link || !username) {
      setError("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      await submitQuest(username, questType, link);
      setSuccess(true);
      setQuestType("");
      setLink("");
      await fetchTasksFromServer(username);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full  rounded-xl p-6 bg-[#1414141A] backdrop-blur-lg shadow-lg flex flex-col gap-5 border border-[#FFD7001A]">
      <div className="flex flex-col gap-1">
        <label className="text-sm text-[#979797] font-medium">Quest type</label>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            className="w-full bg-[#1A1918] text-white text-sm p-3 rounded-md border border-[#2D2D2A] focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-200 text-left flex justify-between items-center cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>{questType || "Select quest type"}</span>
            <svg
              className={`w-5 h-5 text-[#979797] transform transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {isDropdownOpen && (
            <div className="absolute w-full mt-1 bg-[#1A1918] rounded-md border border-[#2D2D2A] shadow-lg z-10">
              {questOptions.map((type) => (
                <div
                  key={type}
                  className="relative flex items-center justify-between px-4 py-2 text-white text-sm cursor-pointer hover:bg-[#2D2D2A] transition-colors duration-200"
                  onClick={() => {
                    setQuestType(type);
                    setIsDropdownOpen(false);
                  }}
                >
                  <span>{type}</span>
                  {questType === type && (
                    <span className="text-green-500 text-lg">✓</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-[#979797] font-medium">
          Contribution Link
        </label>
        <input
          type="url"
          className="bg-[#141414] text-white text-sm p-3 rounded-md border border-[#2D2D2A]"
          placeholder="https://..."
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-fit bg-gradient-to-r from-[#FFD013] via-[#FFA00B] to-[#FF6200] text-[#2D2D2A] py-2 px-6 rounded-md font-medium hover:opacity-90 transition-opacity"
      >
        {submitting ? "Submitting..." : "Submit"}
      </button>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {success && (
        <p className="bg-gradient-to-r from-[#FFD013] via-[#FFA00B] to-[#FF6200] bg-clip-text text-transparent text-sm mt-2">Submitted successfully!</p>
      )}
    </div>
  );
}