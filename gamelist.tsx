import { usePlayersOnlineStore } from "@/helpers/userStore";
import { Link } from "react-router-dom";


interface GameCardProps {
  title: string;
  label: string;
  image: string;
  isActive: boolean;
}

const GameCard = ({ title, label, image, isActive }: GameCardProps) => {
const CardContent = (
  <div className="relative rounded-xl overflow-hidden bg-[#1C1C1B] w-full md:h-40 xl:h-full group">
    <img
      src={image}
      alt={title || "Game image"}
      className="object-cover w-full md:h-full xl:h-50"
    />

    {/* Show dark overlay if inactive */}
    {/* {!isActive && <div className="absolute inset-0 bg-black/60 z-10" />} */}

    {/* Show play overlay only on hover and only if active */}
    {isActive && (
      <div className="absolute inset-0 z-10 bg-transparent group-hover:bg-[rgba(36,29,2,0.6)] transition-all duration-300 flex items-center justify-center">
        <img
          src="/assets/play.svg"
          alt="Play"
          className="w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />
      </div>
    )}

    {/* Label */}
    <div className="absolute inset-0 p-4 flex flex-col items-end justify-end z-20">
      <span className="mt-1 bg-[#FFDA341A] text-xs text-[#FF9000] px-3 py-1 rounded-full border border-[#FF9000]">
        {label}
      </span>
    </div>
  </div>
);


  return isActive ? <Link to="/activity/crash">{CardContent}</Link> : CardContent;
};

export default function GameList() {
  const { playersOnline } = usePlayersOnlineStore();
  // const handlePlayersOnline = (key: string, count: string) => {
  //   // We'll keep this for socket updates if needed in the future
  //   console.log("key: ", key, "count: ", count);
  // };
  const games = [
    {
      title: "AVITUS CRASH",
      label: `${playersOnline['crash'] || 0} players online`,
      image: "/assets/thumbcrash.svg",
      isActive: true,
    },
    {
      title: "Coming Soon",
      label: "Coming soon!",
      image: "/assets/comingsoon.svg",
      isActive: false,
    },
    {
      title: "Coming Soon",
      label: "Coming soon!",
      image: "/assets/comingsoon.svg",
      isActive: false,
    },
  ];

  return (
    <div className="flex gap-4 mt-6 overflow-x-auto px-1 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-[#1C1C1B] [&::-webkit-scrollbar-thumb]:bg-[#242424] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full">
      {games.map((game, idx) => (
        <div key={idx} className="shrink-0 md:w-50 xl:w-100 mb-4"> 
          <GameCard {...game} />
        </div>
      ))}
    </div>
  );
}
