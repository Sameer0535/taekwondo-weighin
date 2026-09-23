"use client";

import React, { useState, useEffect } from "react";
import { Search, Scale, Menu, Pencil, Check, X } from "lucide-react";
import { GlobalSearchModal } from "./GlobalSearchModal";

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [championshipName, setChampionshipName] = useState(
    "National Taekwondo Weigh-In Championship"
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  // Load custom championship name from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("championship_title");
      if (saved) {
        setChampionshipName(saved);
      }
    }
  }, []);

  const handleStartEdit = () => {
    setTempName(championshipName);
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    const trimmed = tempName.trim();
    if (trimmed.length > 0) {
      setChampionshipName(trimmed);
      if (typeof window !== "undefined") {
        localStorage.setItem("championship_title", trimmed);
        window.dispatchEvent(
          new CustomEvent("championship_name_updated", { detail: trimmed })
        );
      }
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
  };

  return (
    <>
      <header className="header-bar h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
        {/* Left: Mobile hamburger & Active Championship Title with Edit Button */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex-shrink-0"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-[#0052FF] flex items-center justify-center font-black flex-shrink-0">
              <Scale size={18} />
            </span>

            {isEditingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                  autoFocus
                  className="px-2.5 py-1 text-sm font-black text-slate-900 border border-[#0052FF] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 min-w-[220px] sm:min-w-[320px]"
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  title="Save name"
                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                >
                  <Check size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  title="Cancel"
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight truncate leading-tight">
                  {championshipName}
                </span>
                <button
                  type="button"
                  onClick={handleStartEdit}
                  title="Edit championship name"
                  className="p-1 rounded-md text-slate-400 hover:text-[#0052FF] hover:bg-blue-50 transition-colors flex-shrink-0"
                >
                  <Pencil size={13} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Clean Search Bar (no Ctrl+K badge, no placeholder) */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 w-32 sm:w-52 h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-500 transition-all cursor-pointer"
            aria-label="Search"
            title="Search"
          >
            <Search size={16} className="text-slate-500 flex-shrink-0" />
          </button>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};
