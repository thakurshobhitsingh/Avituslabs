import { useUserStore } from "@/helpers/userStore";
import { usePrivy } from "@privy-io/react-auth";

type LinkSocialsProps = {
  displayName: string;
  photourl: string;
  isDiscordConnected: boolean;
  isTwitterConnected: boolean;
  onLinkDiscord: () => void;
  onLinkTwitter: () => void;
  canLinkDiscord: boolean;
  canLinkTwitter: boolean;
};

export function LinkSocials({
  photourl,
  isDiscordConnected,
  isTwitterConnected,
  onLinkDiscord,
  onLinkTwitter,
  canLinkDiscord,
  canLinkTwitter,
}: LinkSocialsProps) {
  const userData = useUserStore((state) => state.userData);
  const { unlinkDiscord, unlinkTwitter, user } = usePrivy();

  return (
    <div className="bg-[#141414] rounded-xl shadow-md p-6 w-[600px]">
      <h3 className="text-lg font-semibold items-start mb-4">Link your Socials</h3>
      <div className="flex flex-col gap-4">
        <div className="bg-[#1A1918] flex justify-between items-center p-6 rounded-xl shadow-md">
          <div className="flex gap-4 items-center">
            <img
              src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/66e3d80db9971f10a9757c99_Symbol.svg"
              className="rounded-full h-10 w-10"
            />
            <div>
              <p className="text-sm font-medium">Discord</p>
              <p className="text-[#8A8A8A] text-xs">
                {isDiscordConnected ? userData?.discordUsername : "username"}
              </p>
            </div>
          </div>
          <button
            onClick={async () => {
              if (isDiscordConnected && user?.discord?.subject) {
                try {
                  // console.log(user?.discord?.username);
                  await unlinkDiscord(user?.discord?.subject);
                } catch (error) {
                  // console.error("Error unlinking Discord:", error);
                }
              } else {
                onLinkDiscord();
              }
            }}
            className={`rounded-md shadow-md px-6 py-2 text-sm transition-colors duration-200 ${
              isDiscordConnected
                ? "bg-[#222220] text-white hover:bg-[#333330] hover:text-gray-200"
                : canLinkDiscord
                ? "bg-[#FFDA341A] text-[#FF9000] hover:bg-[#FFDA3450] hover:text-[#FFA500]"
                : "bg-[#2A2A2A] text-[#666666] cursor-not-allowed hover:bg-[#2A2A2A] hover:text-[#666666]"
            }`}
          >
            {isDiscordConnected ? "Unlink" : canLinkDiscord ? "Link" : "Already Linked"}
          </button>
        </div>

        <div className="bg-[#1A1918] flex justify-between items-center p-6 rounded-xl shadow-md">
          <div className="flex gap-4 items-center">
            <img
              src={isTwitterConnected ? photourl : "/assets/x.svg"}
              className="rounded-full h-10 w-10"
            />
            <div>
              <p className="text-sm font-medium">Twitter</p>
              <p className="text-[#8A8A8A] text-xs">
                {isTwitterConnected ? userData?.twitterUsername : "username"}
              </p>
            </div>
          </div>
          <button
            onClick={async () => {
              if (isTwitterConnected && user?.twitter?.subject) {
                try {
                  // console.log(user?.twitter?.subject);
                  await unlinkTwitter(user?.twitter?.subject);
                } catch (error) {
                  // console.error("Error unlinking Twitter:", error);
                }
              } else {
                onLinkTwitter();
              }
            }}
            className={`rounded-md shadow-md px-6 py-2 text-sm transition-colors duration-200 ${
              isTwitterConnected
                ? "bg-[#222220] text-white hover:bg-[#333330] hover:text-gray-200"
                : canLinkTwitter
                ? "bg-[#FFDA341A] text-[#FF9000] hover:bg-[#FFDA3450] hover:text-[#FFA500]"
                : "bg-[#2A2A2A] text-[#666666] cursor-not-allowed hover:bg-[#2A2A2A] hover:text-[#666666]"
            }`}
          >
            {isTwitterConnected ? "Unlink" : canLinkTwitter ? "Link" : "Already Linked"}
          </button>
        </div>
      </div>
    </div>
  );
}