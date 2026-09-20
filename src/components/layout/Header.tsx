"use client";

import React, { useState } from "react";
import { Search, Scale, ShieldCheck, Menu } from "lucide-react";
import { GlobalSearchModal } from "./GlobalSearchModal";

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="header-bar h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
        {/* Left: Mobile hamburger & Active Tournament Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-[#0052FF] flex items-center justify-center font-black">
              <Scale size={18} />
            </span>
            <div>
              <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight block leading-tight">
                National Taekwondo Weigh-In Championship
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Olympic Grade Division Management
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Search & Station Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-600 text-xs font-semibold transition-colors"
          >
            <Search size={14} className="text-slate-500" />
            <span className="hidden sm:inline">Search athlete by name, academy...</span>
            <span className="sm:hidden">Search</span>
            <kbd className="hidden md:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-300 rounded text-slate-600 font-bold">
              Ctrl+K
            </kbd>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200">
            <ShieldCheck size={16} className="text-[#0052FF]" />
            <span className="text-xs font-black text-[#0052FF]">Mat 1 • Certified</span>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};
