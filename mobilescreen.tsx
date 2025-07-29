import { Waitilist } from "./waitlist";

export default function ScreenSizeBlocker() {
  return (
    <div>
      {/* <Waitilist/> */}
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center text-white text-center px-4">
        <div>
          <h1 className="text-2xl font-semibold mb-2">
            Coming soon on Mobile devices
          </h1>
          <p className="text-lg">
            This site is only available on laptop screens right now.
          </p>
        </div>
      </div>
    </div>
  );
}
