"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Lock, Mail, User, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      
      setUser(data.user);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md panel p-8 bg-grad-live border border-emerald-neon/30 shadow-glow">
        <h1 className="text-3xl font-black mb-2 text-center">Create Account</h1>
        <p className="text-center text-[#8892b0] mb-8 text-sm">Join the BPL LIVE community</p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-crimson/20 border border-crimson/50 text-crimson text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div>
            <label className="text-xs text-white/50 font-bold block mb-1">Full Name</label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input type="text" autoComplete="off" required value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="w-full bg-[#0a0e27] border border-white/10 p-3 pl-10 rounded-xl text-white outline-none focus:border-emerald-neon" />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/50 font-bold block mb-1">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input type="email" autoComplete="new-email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-[#0a0e27] border border-white/10 p-3 pl-10 rounded-xl text-white outline-none focus:border-emerald-neon" />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/50 font-bold block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input type={showPassword ? "text" : "password"} autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#0a0e27] border border-white/10 p-3 pl-10 pr-10 rounded-xl text-white outline-none focus:border-emerald-neon" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full btn-grad bg-gradient-to-r from-emerald-neon to-cyan-400 text-black py-3 mt-2 disabled:opacity-50 font-bold">
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-[#8892b0] mt-6">
          Already have an account? <Link href="/login" className="text-royal hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
