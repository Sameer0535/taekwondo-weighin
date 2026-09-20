"use client";

import React from "react";
import Image from "next/image";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0B1B3D] border-t border-[#162a54] py-3.5 px-6 sm:px-10 print:hidden select-none z-30">
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-16 sm:w-20 h-10 sm:h-12 rounded-lg bg-white p-1 flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-sm">
            <Image
              src="/footer-logo.jpg"
              alt="Kyorix"
              fill
              className="object-contain p-0.5"
              priority
            />
          </div>
          <span className="font-medium text-[#CBD5E1] text-xs sm:text-sm tracking-wider uppercase">
            KYORIX SPORT TECHNOLOGY
          </span>
        </div>

        {/* Center: Official Motto */}
        <div className="flex items-center text-center">
          <span className="font-medium text-[#CBD5E1] text-xs sm:text-sm tracking-widest uppercase">
            COMPETE • CONNECT • ELEVATE
          </span>
        </div>

        {/* Right: Copyright */}
        <div className="flex items-center text-[#94A3B8] text-xs font-normal">
          <span>© {new Date().getFullYear()} Kyorix Sport Technology. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};


