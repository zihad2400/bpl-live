import Link from "next/link";
import { Mail, MapPin, Phone, Shield, Zap } from "lucide-react";

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
  return (
    <footer className="relative mt-20 border-t border-white/10 bg-[#070b19]">
      {/* Neon Top Gradient Border */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-neon to-transparent opacity-50" />

      <div className="max-w-7xl mx-auto px-4 pt-10 md:pt-16 pb-6 md:pb-8">
        {/* ⚡ মোবাইলে গ্রিড gap ছোট করা হয়েছে */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12 mb-10 md:mb-16">
          
          {/* Column 1: Brand & Socials (মোবাইলে ২ কলাম জুড়ে থাকবে) */}
          <div className="col-span-2 lg:col-span-1 space-y-4 md:space-y-5">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-grad-live grid place-items-center font-black text-emerald-neon shadow-glow text-lg md:text-xl">
                B
              </div>
              <span className="font-black text-xl md:text-2xl tracking-tight">
                BPL <span className="text-emerald-neon">LIVE</span>
              </span>
            </Link>
            <p className="text-[#8892b0] text-xs md:text-sm leading-relaxed">
              The ultimate premium cricket league management and real-time scoring platform. Experience ball-by-ball action like never before.
            </p>
            <div className="flex gap-2 md:gap-3 pt-1 md:pt-2">
              {[FacebookIcon, TwitterIcon, InstagramIcon, YoutubeIcon].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#8892b0] hover:text-emerald-neon hover:border-emerald-neon hover:shadow-glow transition-all duration-300">
                  <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-bold text-sm md:text-lg mb-3 md:mb-5 flex items-center gap-1.5 md:gap-2">
              <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-gold" /> Quick Links
            </h3>
            <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-[#8892b0]">
              {[
                { label: "Live Matches", href: "/live" },
                { label: "Match Schedule", href: "/matches" },
                { label: "Points Table", href: "/points-table" },
                { label: "All Teams", href: "/teams" },
                { label: "Player Profiles", href: "/players" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-cyan-400 hover:translate-x-1 inline-block transition-transform duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Tournament */}
          <div>
            <h3 className="text-white font-bold text-sm md:text-lg mb-3 md:mb-5 flex items-center gap-1.5 md:gap-2">
              <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-royal" /> Tournament
            </h3>
            <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-[#8892b0]">
              {[
                { label: "Orange Cap", href: "/statistics" },
                { label: "Purple Cap", href: "/statistics" },
                { label: "Tournament Stats", href: "/statistics" },
                { label: "Match Archives", href: "/matches" },
                { label: "Admin Dashboard", href: "/admin" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-magenta hover:translate-x-1 inline-block transition-transform duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Newsletter (মোবাইলে ২ কলাম জুড়ে থাকবে) */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-white font-bold text-sm md:text-lg mb-3 md:mb-5 flex items-center gap-1.5 md:gap-2">
              <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-neon" /> Contact Us
            </h3>
            <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-[#8892b0] mb-4 md:mb-6">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 mt-0.5 text-crimson shrink-0" />
                <span>Sher-e-Bangla National Stadium, Mirpur, Dhaka</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 text-electric shrink-0" />
                <span>+880 1234 567890</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 text-gold shrink-0" />
                <span>support@bpllive.com</span>
              </li>
            </ul>
            
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-white/5 border border-white/10 rounded-l-xl px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm text-white w-full outline-none focus:border-emerald-neon transition"
              />
              <button className="bg-emerald-neon text-black font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-r-xl hover:bg-cyan-400 transition-colors text-xs md:text-sm">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 md:pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4 text-[10px] md:text-xs text-[#8892b0]">
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
