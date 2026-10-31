import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";

async function TeamsList() {
  await connection();
  await connectDB();
  const teams = await Team.find().lean();
  
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {teams.map(t => (
        <Link key={t._id} href={`/teams/${t._id}`} className="panel p-5 bg-grad-team hover:shadow-glow-purple hover:border-royal transition group flex flex-col items-center text-center">
          
          {/* Logo or Animated Fallback */}
          {t.logo ? (
            <img src={t.logo} alt={t.name} className="w-16 h-16 object-contain mb-3 drop-shadow-lg group-hover:scale-110 transition" />
          ) : (
            <div className="w-16 h-16 rounded-2xl grid place-items-center font-black text-2xl text-black mb-3 avatar-placeholder shadow-glow" style={{ background: t.primaryColor || "#7c3aed" }}>
              {t.shortName?.[0] || "?"}
            </div>
          )}

          <div className="font-bold text-lg group-hover:text-emerald-neon transition">{t.name}</div>
          <div className="text-sm text-[#8892b0]">{t.shortName}</div>
        </Link>
      ))}
      {teams.length === 0 && <div className="panel p-8 text-center text-[#8892b0] col-span-4">No teams yet.</div>}
    </div>
  );
}

export default function TeamsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">Teams</h1>
      <Suspense fallback={<div className="panel p-8 text-center text-[#8892b0] animate-pulse">Loading teams...</div>}>
        <TeamsList />
      </Suspense>
    </div>
  );
}
