import { useRef, useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface GameCardProps {
  title: string;
  desc: string;
  image: string;
  logo: string;
}

const PartnerCard = ({ title, desc, image, logo }: GameCardProps) => {
  return (
    <div className="relative rounded-xl overflow-hidden border border-[#222220] bg-[#111111] shadow-md w-full p-4 flex flex-col h-full">
      <div className="relative h-[140px] flex-shrink-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover rounded-xl"
        />
        <div className="absolute inset-0 bg-black/50 flex rounded-xl items-center justify-center">
          <img src={logo} alt={`${title} logo`} />
        </div>
      </div>

      <div className="text-white flex flex-col flex-grow">
        <h3 className="text-[#E3E3E3] text-md font-medium">{title}</h3>
        <p className="text-[#8A8A8A] text-sm my-4">{desc}</p>

       
        <Link
          to=""
          className="flex items-center gap-1 text-sm hover:underline cursor-pointer mt-auto"
        >
          Visit partner <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default function PartnerList() {
  const games = [
    {
      title: "Warpgate",
      desc: "WarpGate is spearheading a transformative movement where decentralized finance meets bold innovation. Built on the Movement Labs ecosystem, WarpGate offers permissionless and seamless trading solutions tailored to empower builders, degens, and communities.",
      image: "/assets/wargate.png",
      logo: "/assets/wrapGatelogo.svg",
    },
    {
      title: "Route-X",
      desc: "RouteX is the main aggregator on Movement, designed to optimize liquidity and make trading more efficient. By combining swaps and the ClobX Central Limit Order Book (CLOB) system, RouteX offers traders the best prices with minimal slippage. Our Fabric Web Liquidity Aggregation scans the entire blockchain to identify and liquidate risky positions, enhancing overall liquidity and security.",
      image: "/assets/routex.png",
      logo: "/assets/routexlogo.svg",
    },
    {
      title: "BRKT",
      desc: "BRKT extends prediction markets through the addition of bracket based predictions, supporting competitions with up to 256 participants, tailor made to be the go-to platform for yearly tournaments like the NCAA Men's Basketball Tournament, NFL Finals, esports finals, and other bracket style tournaments while offering binary prediction markets across politics, sports, news, and culture.",
      image: "/assets/brkt.png",
      logo: "/assets/brktlogo.svg",
    },
    {
      title: "Warpgate",
      desc: "WarpGate is spearheading a transformative movement where decentralized finance meets bold innovation. Built on the Movement Labs ecosystem, WarpGate offers permissionless and seamless trading solutions tailored to empower builders, degens, and communities.",
      image: "/assets/wargate.png",
      logo: "/assets/wrapGatelogo.svg",
    },
    {
      title: "Route-X",
      desc: "RouteX is the main aggregator on Movement, designed to optimize liquidity and make trading more efficient. By combining swaps and the ClobX Central Limit Order Book (CLOB) system, RouteX offers traders the best prices with minimal slippage. Our Fabric Web Liquidity Aggregation scans the entire blockchain to identify and liquidate risky positions, enhancing overall liquidity and security.",
      image: "/assets/routex.png",
      logo: "/assets/routexlogo.svg",
    },
    {
      title: "BRKT",
      desc: "BRKT extends prediction markets through the addition of bracket based predictions, supporting competitions with up to 256 participants, tailor made to be the go-to platform for yearly tournaments like the NCAA Men's Basketball Tournament, NFL Finals, esports finals, and other bracket style tournaments while offering binary prediction markets across politics, sports, news, and culture.",
      image: "/assets/brkt.png",
      logo: "/assets/brktlogo.svg",
    },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const childWidth =
      el.firstChild instanceof HTMLElement ? el.firstChild.offsetWidth : 1;
    const index = Math.round(el.scrollLeft / childWidth);
    setActiveIndex(index);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative w-full">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-2 md:px-4
    [&::-webkit-scrollbar]:h-2
    [&::-webkit-scrollbar-track]:bg-[#1C1C1B]
    [&::-webkit-scrollbar-thumb]:bg-[#242424]
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-track]:rounded-full"
      >
        {games.map((game, idx) => (
          <div
            key={idx}
            className="snap-center flex-shrink-0 w-[85%] sm:w-[65%] md:w-[45%] lg:w-[30%]"
          >
            <PartnerCard {...game} />
          </div>
        ))}
      </div>

      
      <div className="flex justify-center mt-4 gap-1 md:hidden">
        {games.map((_, idx) => (
          <span
            key={idx}
            className={`h-1.5 w-1.5 rounded-full transition-all ${
              activeIndex === idx
                ? "bg-white scale-110"
                : "bg-gray-500 opacity-60"
            }`}
          ></span>
        ))}
      </div>
    </div>
  );
}
