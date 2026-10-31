"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Menu, X } from "lucide-react";

const LINKS = [
  { label: "Home",    href: "/" },
  { label: "Live",    href: "/live" },
  { label: "Matches", href: "/matches" },
  { label: "Teams",   href: "/teams" },
  { label: "Players", href: "/players" },
  { label: "Points",  href: "/points-table" },
];

const ACTIVE_GRAD = {
  "/":             "from-emerald-neon to-cyan-400",
  "/live":         "from-crimson to-magenta",
  "/matches":      "from-electric to-royal",
  "/teams":        "from-royal to-magenta",
  "/players":      "from-orange-500 to-gold",
  "/points-table": "from-emerald-neon to-electric",
  "/scorer":       "from-gold to-orange-500",
  "/admin":        "from-magenta to-royal",
};

function isActiveHref(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Nav() {
  const pathname = usePathname() || "/";
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // ⚡ মোবাইল মেনু স্টেট

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [...LINKS];
  if (mounted && user && (user.role === "superadmin" || user.role === "admin")) {
    navLinks.push({ label: "Scorer", href: "/scorer" });
    navLinks.push({ label: "Admin", href: "/admin" });
  }

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xl bg-midnight/70 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-grad-live grid place-items-center font-black text-emerald-neon shadow-glow">
            B
          </div>
          <span className="font-black text-xl tracking-tight hidden sm:block">
            BPL <span className="text-emerald-neon">LIVE</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex gap-1 text-sm">
          {navLinks.map(({ label, href }) => {
            const active = isActiveHref(pathname, href);
            const grad = ACTIVE_GRAD[href] || "from-emerald-neon to-cyan-400";
            return (
              <Link
                key={href}
                href={href}
                className={
                  active
                    ? `px-3 py-2 rounded-lg font-bold text-black bg-gradient-to-r ${grad} shadow-glow transition`
                    : "px-3 py-2 rounded-lg text-[#8892b0] hover:text-white hover:bg-white/5 transition font-medium"
                }
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Auth & Mobile Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          {!mounted ? (
            <div className="w-24 h-9 bg-white/5 border border-white/10 rounded-full animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2 bg-[#1a2341]/80 border border-white/10 rounded-full p-1 pr-2 shadow-lg backdrop-blur-md hover:border-white/20 transition-colors">
              <div className="w-8 h-8 rounded-full avatar-placeholder text-sm shadow-inner">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="hidden md:flex flex-col pr-2">
                <span className="text-[13px] font-black text-white leading-tight">{user.name}</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-neon bg-emerald-neon/10 px-1.5 py-0.5 rounded w-fit mt-0.5 leading-none border border-emerald-neon/20">{user.role}</span>
              </div>
              <div className="w-px h-6 bg-white/10 hidden md:block mx-1" />
              <button onClick={logout} className="w-8 h-8 rounded-full bg-crimson/10 text-crimson hover:bg-crimson hover:text-white transition-all duration-300 flex items-center justify-center group">
                <LogOut className="w-4 h-4 group-hover:scale-110 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn-grad bg-grad-team text-sm font-bold hidden sm:block">
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button 
            className="lg:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav (Dropdown) */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-[#0a0e27] border-b border-white/10 px-4 py-4 flex flex-col gap-2 shadow-2xl animate-slide-up">
          {navLinks.map(({ label, href }) => {
            const active = isActiveHref(pathname, href);
            const grad = ACTIVE_GRAD[href] || "from-emerald-neon to-cyan-400";
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={
                  active
                    ? `px-4 py-3 rounded-xl font-bold text-black bg-gradient-to-r ${grad} shadow-glow`
                    : "px-4 py-3 rounded-xl text-[#8892b0] hover:text-white hover:bg-white/5 font-medium"
                }
              >
                {label}
              </Link>
            );
          })}
          {!user && (
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn-grad bg-grad-team mt-2 text-center">
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
