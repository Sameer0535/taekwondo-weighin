"use client";

import React from "react";
import { Delete, RotateCcw } from "lucide-react";

interface TouchKeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  disabled?: boolean;
}

export const TouchKeypad: React.FC<TouchKeypadProps> = ({
  onDigit,
  onBackspace,
  onClear,
  disabled = false,
}) => {
  const keys = [
    "1", "2", "3",
    "4", "5", "6",
    "7", "8", "9",
    ".", "0",
  ];

  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-xs mx-auto select-none">
      {keys.map((k) => (
        <button
          key={k}
          type="button"
          disabled={disabled}
          onClick={() => onDigit(k)}
          className="h-13 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-800 text-xl font-black font-mono border border-slate-200 shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {k}
        </button>
      ))}

      {/* Backspace Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={onBackspace}
        aria-label="Backspace"
        className="h-13 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 shadow-sm active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <Delete size={20} />
      </button>

      {/* Full Clear Row */}
      <div className="col-span-3 pt-1">
        <button
          type="button"
          disabled={disabled}
          onClick={onClear}
          className="w-full h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider border border-slate-200 active:scale-98 transition-all flex items-center justify-center gap-1.5"
        >
          <RotateCcw size={14} />
          Clear Weight
        </button>
      </div>
    </div>
  );
};
