"use client";

import React, { useState, useEffect } from "react";
import { Participant, Status } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { TouchKeypad } from "./TouchKeypad";
import { getAllowedTransitions, validateTransition, validateWeight } from "@/lib/state-machine";
import { CheckCircle2, Clock, XCircle, ArrowRight, ShieldAlert, Award, Search } from "lucide-react";

interface ActiveAthleteCardProps {
  athlete: Participant | null;
  onRecordDecision: (status: Status, weight: number, notes?: string) => Promise<void>;
  onNextAthlete: () => void;
  hasUnresolvedAthletes: boolean;
  isLoading?: boolean;
}

export const ActiveAthleteCard: React.FC<ActiveAthleteCardProps> = ({
  athlete,
  onRecordDecision,
  onNextAthlete,
  hasUnresolvedAthletes,
  isLoading = false,
}) => {
  const [weightStr, setWeightStr] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (athlete?.currentWeight) {
      // Use clean string representation without unnecessary trailing zeros
      setWeightStr(String(athlete.currentWeight));
    } else {
      setWeightStr("");
    }
    setNotes("");
    setErrorBanner(null);
    // Focus scale input on athlete change
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [athlete?.id, athlete?.currentWeight]);

  const currentStatus = (athlete?.currentStatus || "PENDING") as Status;
  const isPassed = currentStatus === "PASSED";
  const allowedStatuses = getAllowedTransitions(currentStatus);

  // Global keyboard listener so typing on laptop keyboard works immediately
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!athlete || isPassed) return;

      const activeTag = (document.activeElement?.tagName || "").toLowerCase();
      // If user is typing in notes input or another text field (except weight input), ignore
      if (activeTag === "textarea" || (activeTag === "input" && document.activeElement !== inputRef.current)) {
        return;
      }

      if ((e.key >= "0" && e.key <= "9") || e.key === ".") {
        if (document.activeElement !== inputRef.current) {
          inputRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [athlete, isPassed]);

  if (!athlete) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[380px]">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0052FF] flex items-center justify-center mb-4 border border-blue-100">
          <Search size={30} />
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Select Competitor to Weigh In</h3>
        <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
          Search for an athlete using the search bar above or choose a competitor from the category list on the right to load their details and record official weight.
        </p>
      </div>
    );
  }

  // Handle direct typing in the scale input box
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isPassed) return;
    setErrorBanner(null);
    const val = e.target.value;

    if (val === "") {
      setWeightStr("");
      return;
    }

    // Allow numbers and at most one decimal point with up to 2 decimal places
    if (/^\d*\.?\d{0,2}$/.test(val)) {
      if (val.length <= 6) {
        setWeightStr(val);
      }
    }
  };

  const handleDigit = (digit: string) => {
    if (isPassed) return;
    setErrorBanner(null);

    // If starting fresh or 0
    if (weightStr === "0" || weightStr === "00.00" || weightStr === "0.00") {
      if (digit === ".") {
        setWeightStr("0.");
      } else {
        setWeightStr(digit);
      }
      inputRef.current?.focus();
      return;
    }

    if (digit === ".") {
      if (weightStr.includes(".")) return;
      setWeightStr((prev) => (prev ? prev + "." : "0."));
      inputRef.current?.focus();
      return;
    }

    if (weightStr.includes(".")) {
      const [intPart, decPart] = weightStr.split(".");
      if (decPart && decPart.length >= 2) {
        // If already 2 decimal places, replace the last decimal digit so clicking keypad is responsive
        setWeightStr(`${intPart}.${decPart[0]}${digit}`);
        inputRef.current?.focus();
        return;
      }
    }

    if (weightStr.length >= 6) return;

    setWeightStr((prev) => prev + digit);
    inputRef.current?.focus();
  };

  const handleBackspace = () => {
    if (isPassed) return;
    setErrorBanner(null);
    setWeightStr((prev) => prev.slice(0, -1));
    inputRef.current?.focus();
  };

  const handleClear = () => {
    if (isPassed) return;
    setErrorBanner(null);
    setWeightStr("");
    inputRef.current?.focus();
  };

  const handleStep = (delta: number) => {
    if (isPassed) return;
    setErrorBanner(null);
    const current = parseFloat(weightStr) || 50.0;
    const nextVal = Math.round((current + delta) * 100) / 100;
    if (nextVal > 0 && nextVal < 250) {
      setWeightStr(nextVal.toFixed(2));
    }
    inputRef.current?.focus();
  };

  const handleSubmitDecision = async (targetStatus: Status) => {
    setErrorBanner(null);

    const validation = validateTransition(currentStatus, targetStatus, weightStr);
    if (!validation.allowed) {
      setErrorBanner(validation.error || "Invalid weigh-in submission.");
      return;
    }

    const weightCheck = validateWeight(weightStr);
    if (!weightCheck.valid || weightCheck.parsedWeight === undefined) {
      setErrorBanner(weightCheck.error || "Invalid weight entered.");
      return;
    }

    try {
      await onRecordDecision(targetStatus, weightCheck.parsedWeight, notes);
    } catch (err: any) {
      setErrorBanner(err.message || "Failed to save weigh-in decision.");
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
      {/* Active Athlete Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <StatusBadge status={athlete.currentStatus} size="sm" />
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {athlete.athleteName}
            </h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-xs font-black text-[#0052FF]">
              <span>{athlete.division}</span>
              <span className="text-blue-300">•</span>
              <span>{athlete.weightCategory}</span>
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            {athlete.academyName}
          </p>
        </div>

        <div>
          <Button
            variant="outline"
            size="md"
            onClick={onNextAthlete}
            className="w-full sm:w-auto font-bold gap-2 text-slate-700 hover:text-slate-900"
            title="Advance to next unresolved athlete in category"
          >
            <span>Next Athlete</span>
            <ArrowRight size={15} />
          </Button>
        </div>
      </div>

      {errorBanner && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <ShieldAlert size={16} className="text-rose-600 flex-shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Main Weigh-In Console: Weight Input + Keypad */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left: Weight Display & Keypad */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
            Official Measured Weight (KG)
          </p>

          {/* Scale Display with Direct Laptop Keyboard Input */}
          <div
            onClick={() => inputRef.current?.focus()}
            className="w-full max-w-xs bg-slate-900 border-2 border-slate-800 focus-within:border-blue-500 rounded-2xl p-4 shadow-md text-center mb-3 cursor-text transition-colors"
          >
            <div className="flex items-center justify-center gap-2">
              <input
                ref={inputRef}
                type="text"
                inputMode="decimal"
                value={weightStr}
                disabled={isPassed}
                onChange={handleInputChange}
                placeholder="00.00"
                className="w-36 sm:w-44 bg-transparent text-center text-4xl sm:text-5xl font-black font-mono tracking-tight text-white placeholder-slate-600 focus:outline-none caret-blue-400"
              />
              <span className="text-xl sm:text-2xl font-bold text-blue-400 select-none">KG</span>
            </div>
          </div>

          {/* Steppers */}
          <div className="flex items-center gap-2 mb-3.5 w-full max-w-xs justify-between">
            <button
              type="button"
              disabled={isPassed}
              onClick={() => handleStep(-0.5)}
              className="flex-1 py-1.5 text-xs font-bold font-mono rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 active:scale-95 disabled:opacity-40"
            >
              -0.5
            </button>
            <button
              type="button"
              disabled={isPassed}
              onClick={() => handleStep(-0.1)}
              className="flex-1 py-1.5 text-xs font-bold font-mono rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 active:scale-95 disabled:opacity-40"
            >
              -0.1
            </button>
            <button
              type="button"
              disabled={isPassed}
              onClick={() => handleStep(0.1)}
              className="flex-1 py-1.5 text-xs font-bold font-mono rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 active:scale-95 disabled:opacity-40"
            >
              +0.1
            </button>
            <button
              type="button"
              disabled={isPassed}
              onClick={() => handleStep(0.5)}
              className="flex-1 py-1.5 text-xs font-bold font-mono rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 active:scale-95 disabled:opacity-40"
            >
              +0.5
            </button>
          </div>

          <TouchKeypad
            onDigit={handleDigit}
            onBackspace={handleBackspace}
            onClear={handleClear}
            disabled={isPassed || isLoading}
          />
        </div>

        {/* Right: State Machine Action Controls & Notes */}
        <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-6">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
              Official Status Decision
            </p>

            {isPassed ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <CheckCircle2 size={36} className="mx-auto text-emerald-600 mb-2" />
                <h4 className="text-base font-black text-emerald-800 uppercase tracking-wide">
                  Weigh-In Certified (PASSED)
                </h4>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  Official weight of {athlete.currentWeight?.toFixed(2)} KG is verified. Action buttons are locked per tournament rules.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* PASS Action Button */}
                {allowedStatuses.includes("PASSED") && (
                  <button
                    type="button"
                    disabled={isLoading || !weightStr}
                    onClick={() => handleSubmitDecision("PASSED")}
                    className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-base tracking-wider uppercase shadow-md shadow-emerald-600/25 flex items-center justify-center gap-3 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 size={22} />
                    <span>PASS</span>
                  </button>
                )}

                {/* HOLD Action Button */}
                {allowedStatuses.includes("HOLD") && (
                  <button
                    type="button"
                    disabled={isLoading || !weightStr}
                    onClick={() => handleSubmitDecision("HOLD")}
                    className="w-full h-13 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-black text-sm tracking-wider uppercase shadow-md shadow-amber-500/25 flex items-center justify-center gap-2.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Clock size={19} />
                    <span>HOLD</span>
                  </button>
                )}

                {/* REJECT Action Button */}
                {allowedStatuses.includes("REJECTED") && (
                  <button
                    type="button"
                    disabled={isLoading || !weightStr}
                    onClick={() => handleSubmitDecision("REJECTED")}
                    className="w-full h-12 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-98 text-white font-bold text-xs tracking-wider uppercase shadow-md shadow-rose-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <XCircle size={18} />
                    <span>REJECT</span>
                  </button>
                )}
              </div>
            )}

            {!isPassed && (
              <div className="mt-5">
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Marshal Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 30-min grace period for re-weigh"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                />
              </div>
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100">
            <Button
              variant="primary"
              size="lg"
              onClick={onNextAthlete}
              className="w-full h-12 text-sm font-bold gap-2 bg-[#0052FF] hover:bg-[#0045D8] rounded-xl"
            >
              <span>Advance to Next Competitor</span>
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
