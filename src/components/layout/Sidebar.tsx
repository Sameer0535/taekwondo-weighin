"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserPlus,
  Scale,
  CheckCircle2,
  Clock,
  XCircle,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  // Navigation order as requested:
  // Dashboard -> Add Competitor -> Weigh-in -> Passed -> Pending/Hold -> Rejected -> Print Passed
  const navItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      activeExact: true,
    },
    {
      label: "Add Competitor",
      href: "/participants",
      icon: UserPlus,
    },
    {
      label: "Weigh-In Console",
      href: "/weigh-in",
      icon: Scale,
      highlight: true,
    },
    {
      label: "Passed",
      href: "/passed",
      icon: CheckCircle2,
      badgeColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Pending / Hold",
      href: "/pending",
      icon: Clock,
      badgeColor: "text-amber-700 bg-amber-50 border-amber-200",
    },
    {
      label: "Rejected",
      href: "/rejected",
      icon: XCircle,
      badgeColor: "text-rose-700 bg-rose-50 border-rose-200",
    },
    {
      label: "Print Passed",
      href: "/print",
      icon: Printer,
    },
  ];

  return (
    <aside className="sidebar w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col select-none shadow-sm overflow-hidden z-20 self-stretch sticky top-0 max-h-screen">
      {/* Brand Header with Kyorix Official Logo */}
      <div className="px-3 py-4 border-b border-slate-100 flex flex-col items-center text-center bg-white flex-shrink-0">
        <Link href="/" className="block relative w-full h-[68px] transition-opacity hover:opacity-95">
          <Image
            src="/kyorix-logo.jpg"
            alt="Kyorix Sport Technology"
            fill
            className="object-contain object-center"
            priority
          />
        </Link>
        <div className="mt-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 text-[#0052FF] border border-blue-100">
            <ShieldCheck size={10} /> Official Weigh-In System
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-hidden">
        {navItems.map((item) => {
          const isActive = item.activeExact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 group",
                isActive
                  ? item.highlight
                    ? "bg-[#0052FF] text-white shadow-md shadow-blue-500/25"
                    : "bg-blue-50 text-[#0052FF] border-l-4 border-[#0052FF]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              )}
            >
              <Icon
                size={18}
                className={cn(
                  "transition-colors",
                  isActive
                    ? item.highlight
                      ? "text-white"
                      : "text-[#0052FF]"
                    : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
