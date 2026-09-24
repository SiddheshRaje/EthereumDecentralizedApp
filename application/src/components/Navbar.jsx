import React from "react";
import { Link } from "react-router-dom";
import { HiMenuAlt4 } from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";

import logo from "../../images/cognitensor.png";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { title: "Exchange", to: "/exchange" },
  { title: "Wallets", to: "/" },
];

const NavBarItem = ({ mobile = false, onNavigate, title, to }) => (
  <li className={mobile ? "w-full" : "mx-4"}>
    <Link
      to={to}
      onClick={onNavigate}
      className={
        mobile
          ? "block min-h-[48px] w-full rounded-lg px-4 py-3 text-left text-base hover:bg-white/10"
          : "inline-flex min-h-[44px] items-center"
      }
    >
      {title}
    </Link>
  </li>
);

const AuthLinks = ({ mobile = false, onNavigate }) => {
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    if (onNavigate) onNavigate();
  };

  if (currentUser) {
    return (
      <>
        <li className={mobile ? "w-full px-4 py-3 text-sm text-gray-300" : "mx-4 text-sm text-gray-300"}>
          Hi,
          {" "}
          {currentUser.name}
        </li>
        <li className={mobile ? "mt-2 w-full" : "mx-4"}>
          <button
            type="button"
            onClick={handleLogout}
            className={mobile
              ? "min-h-[48px] w-full rounded-full bg-[#2952e3] px-6 py-3 font-semibold hover:bg-[#2546bd]"
              : "min-h-[44px] rounded-full bg-[#2952e3] px-7 py-2 hover:bg-[#2546bd]"}
          >
            Logout
          </button>
        </li>
      </>
    );
  }

  return (
    <>
      <li className={mobile ? "w-full" : "mx-4"}>
        <Link
          to="/signup"
          onClick={onNavigate}
          className={mobile
            ? "block min-h-[48px] w-full rounded-lg px-4 py-3 text-left hover:bg-white/10"
            : "inline-flex min-h-[44px] items-center"}
        >
          Sign Up
        </Link>
      </li>
      <li className={mobile ? "mt-2 w-full" : "mx-4"}>
        <Link
          to="/login"
          onClick={onNavigate}
          className={mobile
            ? "flex min-h-[48px] w-full items-center justify-center rounded-full bg-[#2952e3] px-6 py-3 font-semibold hover:bg-[#2546bd]"
            : "inline-flex min-h-[44px] items-center rounded-full bg-[#2952e3] px-7 py-2 hover:bg-[#2546bd]"}
        >
          Login
        </Link>
      </li>
    </>
  );
};

const Navbar = () => {
  const [toggleMenu, setToggleMenu] = React.useState(false);
  const closeMenu = () => setToggleMenu(false);

  return (
    <nav className="relative z-30 w-full px-5 pb-[11px] pt-4 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Cognitensor home" className="w-28 cursor-pointer sm:w-32" />
        </Link>

        <ul className="hidden list-none flex-row items-center justify-end text-white md:flex">
          {NAV_LINKS.map((item) => (
            <NavBarItem key={item.title} {...item} />
          ))}
          <AuthLinks />
        </ul>

        <button
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={toggleMenu}
          onClick={() => setToggleMenu(true)}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-white hover:bg-white/10 md:hidden"
        >
          <HiMenuAlt4 aria-hidden="true" fontSize={28} />
        </button>

        {toggleMenu && (
          <>
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={closeMenu}
              className="fixed inset-0 z-40 cursor-default bg-black/60 md:hidden"
            />
            <div className="blue-glassmorphism animate-slide-in fixed bottom-0 right-0 top-0 z-50 flex w-[85vw] max-w-xs flex-col p-5 text-white shadow-2xl md:hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-semibold">Menu</span>
                <button
                  type="button"
                  aria-label="Close navigation menu"
                  onClick={closeMenu}
                  className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white/10"
                >
                  <AiOutlineClose aria-hidden="true" fontSize={25} />
                </button>
              </div>

              <ul className="mt-5 flex w-full list-none flex-col">
                {NAV_LINKS.map((item) => (
                  <NavBarItem key={item.title} {...item} mobile onNavigate={closeMenu} />
                ))}
                <AuthLinks mobile onNavigate={closeMenu} />
              </ul>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
