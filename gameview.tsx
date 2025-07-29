import GameList from "./gamelist";

export function GameView() {
  return (
    <div className="p-6 bg-[#131312] rounded-xl shadow-md mt-4 overflow-hidden">
      <h3 className="text-xl font-semibold pb-2">Games</h3>
      <p className="text-xs text-[#E3E3E3]">Connect, engage & earn more with every click.</p>
      <div className="mt-2 -mx-4 md:-mx-4 lg:mx-0"> {/* Helps scroll touch full width */}
        <GameList />
      </div>
    </div>
  );
}
