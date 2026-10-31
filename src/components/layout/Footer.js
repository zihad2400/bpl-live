"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, MapPin, Phone, Shield, Zap, Loader2, CheckCircle2 } from "lucide-react";

const FacebookIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const TwitterIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

const InstagramIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const YoutubeIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2.5 7.1C2.5 5.6 3.6 4.5 5.1 4.5h13.8c1.5 0 2.6 1.1 2.6 2.6v9.8c0 1.5-1.1 2.6-2.6 2.6H5.1c-1.5 0-2.6-1.1-2.6-2.6V7.1z"/>
    <path d="m10 15 5-3-5-3z"/>
  </svg>
);

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (data.success) {
        setStatus("success");
        setEmail("");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("idle");
      }
    } catch (err) {
      setStatus("idle");
    }
  };

  return (
    <footer className="relative mt-20 border-t border-white/10 bg-[#070b19]">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-neon to-transparent opacity-50" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 md:pt-16 pb-6 md:pb-8">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 mb-10 md:mb-16">
          
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4 text-center md:text-left flex flex-col items-center md:items-start mb-4 md:mb-0">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-grad-live grid place-items-center font-black text-emerald-neon shadow-glow text-lg md:text-xl">
                B
              </div>
              <span className="font-black text-xl md:text-2xl tracking-tight text-white">
                BPL <span className="text-emerald-neon">LIVE</span>
              </span>
            </Link>
            <p className="text-[#8892b0] text-xs md:text-sm leading-relaxed max-w-xs md:max-w-none">
              The ultimate premium cricket league management and real-time scoring platform. Experience ball-by-ball action like never before.
            </p>
            <div className="flex gap-2 md:gap-3 justify-center md:justify-start">
              {[FacebookIcon, TwitterIcon, InstagramIcon, YoutubeIcon].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#8892b0] hover:text-emerald-neon hover:border-emerald-neon hover:shadow-glow transition-all duration-300">
                  <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 text-center md:text-left">
            <h3 className="text-white font-bold text-xs md:text-lg mb-3 md:mb-5 flex items-center justify-center md:justify-start gap-1">
              <Zap className="w-3 h-3 md:w-4 md:h-4 text-gold" /> Quick Links
            </h3>
            <ul className="space-y-2 md:space-y-3 text-[11px] md:text-sm text-[#8892b0]">
              {[
                { label: "Live Matches", href: "/live" },
                { label: "Match Schedule", href: "/matches" },
                { label: "Points Table", href: "/points-table" },
                { label: "All Teams", href: "/teams" },
                { label: "Player Profiles", href: "/players" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-cyan-400 inline-block transition-transform duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tournament */}
          <div className="col-span-1 text-center md:text-left">
            <h3 className="text-white font-bold text-xs md:text-lg mb-3 md:mb-5 flex items-center justify-center md:justify-start gap-1">
              <Shield className="w-3 h-3 md:w-4 md:h-4 text-royal" /> Tournament
            </h3>
            <ul className="space-y-2 md:space-y-3 text-[11px] md:text-sm text-[#8892b0]">
              {[
                { label: "Orange Cap", href: "/stats/orange-cap" },
                { label: "Purple Cap", href: "/stats/purple-cap" },
                { label: "Tournament Stats", href: "/stats/tournament" },
                { label: "Match Archives", href: "/matches/archives" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-magenta inline-block transition-transform duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us (Now takes 2 cols on mobile) */}
          <div className="col-span-2 md:col-span-1 text-center md:text-left mt-4 md:mt-0">
            <h3 className="text-white font-bold text-xs md:text-lg mb-3 md:mb-5 flex items-center justify-center md:justify-start gap-1">
              <Mail className="w-3 h-3 md:w-4 md:h-4 text-emerald-neon" /> Contact Us
            </h3>
            <ul className="space-y-2 md:space-y-3 text-[11px] md:text-sm text-[#8892b0] mb-4 md:mb-6 flex flex-col items-center md:items-start">
              <li className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 text-center md:text-left">
                <MapPin className="w-3 h-3 md:w-4 md:h-4 text-crimson shrink-0 hidden md:block" />
                <span>Mirpur, Dhaka</span>
              </li>
              <li className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-1">
                <Phone className="w-3 h-3 md:w-4 md:h-4 text-electric shrink-0 hidden md:block" />
                <span>+880 1234 567890</span>
              </li>
              <li className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-1">
                <Mail className="w-3 h-3 md:w-4 md:h-4 text-gold shrink-0 hidden md:block" />
                <span className="truncate max-w-[120px] md:max-w-none">support@bpllive.com</span>
              </li>
            </ul>
            
            {/* ⚡ NEW PREMIUM NEWSLETTER DESIGN ⚡ */}
            <div className="w-full max-w-[280px] mx-auto md:mx-0 mt-2">
              <form 
                onSubmit={handleSubscribe} 
                className="flex flex-col sm:flex-row p-1.5 bg-white/5 border border-white/10 rounded-2xl shadow-[0_0_20px_rgba(16,255,159,0.05)] focus-within:border-emerald-neon/50 focus-within:shadow-[0_0_20px_rgba(16,255,159,0.15)] transition-all"
              >
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address" 
                  required
                  disabled={status === "loading" || status === "success"}
                  className="bg-transparent px-3 py-2.5 text-xs md:text-sm text-white w-full outline-none placeholder:text-[#8892b0]"
                />
                <button 
                  type="submit"
                  disabled={status === "loading" || status === "success"}
                  className={`${
                    status === "success" ? "bg-green-500" : "bg-emerald-neon hover:bg-cyan-400"
                  } text-black font-black px-4 py-2.5 mt-1.5 sm:mt-0 rounded-xl transition-all duration-300 text-xs md:text-sm shrink-0 flex items-center justify-center w-full sm:w-auto min-w-[80px]`}
                >
                  {status === "loading" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : status === "success" ? (
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Done</span>
                  ) : (
                    "Join"
                  )}
                </button>
              </form>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 md:pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] md:text-xs text-[#8892b0] text-center md:text-left">
          <p>© 2026 BPL LIVE. All rights reserved.</p>
          <div className="flex gap-4 md:gap-6">
            <Link href="#" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
