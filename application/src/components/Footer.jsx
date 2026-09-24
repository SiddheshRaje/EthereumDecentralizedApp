import React from "react";

const Footer = () => (
  <footer className="gradient-bg-footer w-full px-5 pb-8 pt-10 sm:px-8 lg:px-12">
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between">
      <div className="h-[0.25px] w-full bg-gray-400" />

      <div className="mt-4 flex w-full flex-col items-center justify-between gap-2 sm:flex-row">
        <p className="text-center text-xs text-gray-300 sm:text-left">Decentralized App</p>
        <p className="text-center text-xs text-gray-300 sm:text-right">Hardhat Localhost</p>
      </div>
    </div>
  </footer>
);

export default Footer;
