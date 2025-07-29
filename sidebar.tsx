import { useLocation, Link } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import { getPhotourl } from "./navbar";

export default function SideBar() {
  const location = useLocation();
  const { user, authenticated } = usePrivy();
  const photourl = authenticated ? getPhotourl(user) : "/assets/frogdp.svg";
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  return (
    <>
      {/* Hamburger Button */}

      <button
        className="fixed top-6 left-6 z-50  p-2 rounded-md text-white bg-["
        onClick={toggleDrawer}
      >
        <img src="/assets/avitusLogo.svg" className="w-6 h-6" />
      </button>

      {/* Backdrop */}
      {!drawerOpen && (
        <button
          onClick={toggleDrawer}
          className="fixed top-50 z-40 p-2 rounded-md bg-[#FFDA341A] bg-opacity-50 transition-transform duration-200 hover:scale-130"
          aria-label="Open Sidebar"
        >
          <img
            src="/assets/toggleicon.svg"
            alt="open drawer"
            className=""
            style={{ transform: "rotate(180deg)" }}
          />
        </button>
      )}

      {/* Backdrop */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 backdrop-blur-sm bg-opacity-40"
            onClick={toggleDrawer}
          />
          <button
            onClick={toggleDrawer}
            className="fixed top-50 left-55 z-70 p-2 rounded-md bg-[#FFDA341A] bg-opacity-50 transition-transform duration-200 hover:scale-130"
            aria-label="Open Sidebar"
          >
            <img src="/assets/toggleicon.svg" alt="open drawer" className="" />
          </button>
        </>
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-[250px] z-50 bg-[#0d0d0d] transition-transform duration-300 transform ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        } shadow-[0_0_30px_rgba(0,0,0,0.7)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 h-full  ">
          <div className="flex items-center gap-2 mb-6">
            <img src="/assets/avitusLogo.svg" className="w-6 h-6" />
            {/* <span className="text-white font-semibold text-lg">Avitus</span> */}
          </div>
          <div className="flex flex-col justify-between h-[calc(100vh-96px)] text-[16px] gap-4 text-[#979797] font-medium">
            {/* Logo */}

            {/* Navigation */}
            <div>
              <Link to="/" onClick={toggleDrawer}>
                <div
                  className={`flex items-center gap-3 pl-4 py-3 rounded-2xl cursor-pointer ${
                    location.pathname === "/" ? "bg-[#141414]" : ""
                  }`}
                >
                  <img
                    src={
                      location.pathname === "/"
                        ? "/assets/homegradient.svg"
                        : "/assets/home1.svg"
                    }
                    className="w-5 h-5"
                  />
                  <p
                    className={`${
                      location.pathname === "/"
                        ? "bg-gradient-to-r from-[#FFD013] via-[#FFA00B] to-[#FF6200] bg-clip-text text-transparent"
                        : ""
                    }`}
                  >
                    Wagboard
                  </p>
                </div>
              </Link>

              <Link to="/activity" onClick={toggleDrawer}>
                <div
                  className={`flex items-center gap-3 pl-4 py-3 rounded-2xl cursor-pointer ${
                    location.pathname.startsWith("/activity")
                      ? "bg-[#141414]"
                      : ""
                  }`}
                >
                  <img
                    src={
                      location.pathname.startsWith("/activity")
                        ? "/assets/exploregradient.svg"
                        : "/assets/lightning-01.svg"
                    }
                    className="w-5 h-5"
                  />
                  <p
                    className={`${
                      location.pathname.startsWith("/activity")
                        ? "bg-gradient-to-r from-[#FFD013] via-[#FFA00B] to-[#FF6200] bg-clip-text text-transparent"
                        : ""
                    }`}
                  >
                    Activity
                  </p>
                </div>
              </Link>
              {/* <div className="flex justify-end z-70">
              <button onClick={toggleDrawer}>
                <img src="/assets/toggleicon.svg" />
              </button>
            </div> */}
            </div>

            {/* Bottom Section */}
            <div>
              <Link to="/profile" onClick={toggleDrawer}>
                <div
                  className={`flex items-center gap-3 pl-4 py-3 rounded-2xl cursor-pointer ${
                    location.pathname === "/profile" ? "bg-[#141414]" : ""
                  }`}
                >
                  <img
                    src={photourl}
                    className="rounded-full h-[25px] w-[25px]"
                  />
                  <p
                    className={`${
                      location.pathname === "/profile"
                        ? "bg-gradient-to-r from-[#FFD013] via-[#FFA00B] to-[#FF6200] bg-clip-text text-transparent"
                        : ""
                    }`}
                  >
                    Profile
                  </p>
                </div>
              </Link>

              <Link to="/faq" onClick={toggleDrawer}>
                <div
                  className={`flex items-center gap-3 pl-4 py-3 rounded-2xl cursor-pointer ${
                    location.pathname === "/faq" ? "bg-[#141414]" : ""
                  }`}
                >
                  <img
                    src={
                      location.pathname === "/faq"
                        ? "/assets/faqgradient.svg"
                        : "/assets/faq.svg"
                    }
                    className="w-5 h-5"
                  />
                  <p
                    className={`${
                      location.pathname === "/faq"
                        ? "bg-gradient-to-r from-[#FFD013] via-[#FFA00B] to-[#FF6200] bg-clip-text text-transparent"
                        : ""
                    }`}
                  >
                    FAQ
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
