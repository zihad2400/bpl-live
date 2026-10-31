import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import Player from "@/models/Player";
import { Shield, ArrowLeft } from "lucide-react";

async function TeamDetails({ params }) {
  const { id } = await params;
  await connection();
  await connectDB();
  
  const team = await Team.findById(id).lean();
  if (!team) return <div className="text-center p-10">Team not found</div>;

  const players = await Player.find({ teamId: id }).lean();
  const categories = ["batsman", "bowler", "allrounder", "keeper"];

  return (
    <div className="space-y-8">
      <Link href="/teams" className="inline-flex items-center text-[#8892b0] hover:text-white transition">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Teams
      </Link>

      <div className="panel p-8 bg-grad-team relative overflow-hidden flex items-center gap-6">
        <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at 10% 20%, ${team.primaryColor} 0%, transparent 60%)` }} />
        
        {/* Big Logo */}
        {team.logo ? (
          <img src={team.logo} alt={team.name} className="w-24 h-24 object-contain drop-shadow-2xl relative z-10" />
        ) : (
          <div className="w-24 h-24 rounded-2xl grid place-items-center text-4xl font-black text-black shadow-glow avatar-placeholder relative z-10" style={{ background: team.primaryColor }}>
            {team.shortName?.[0]}
          </div>
        )}

        <div className="relative z-10">
          <h1 className="text-4xl font-black">{team.name}</h1>
          <p className="text-lg text-white/60">{team.shortName}</p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-black mb-4 flex items-center gap-2"><Shield className="text-emerald-neon" /> Team Squad</h2>
        <div className="space-y-6">
          {categories.map(cat => {
            const catPlayers = players.filter(p => p.role === cat);
            if (catPlayers.length === 0) return null;
            
            return (
              <div key={cat}>
                <h3 className="text-sm font-bold text-[#8892b0] uppercase tracking-widest mb-3 border-b border-white/10 pb-2">{cat}s</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {catPlayers.map(p => (
                    <Link key={p._id} href={`/players/${p._id}`} className="panel p-4 hover:border-emerald-neon transition flex flex-col items-center text-center group">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 mb-3 border-2 border-transparent group-hover:border-emerald-neon transition">
                        {p.photo ? <img src={p.photo} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full avatar-placeholder text-2xl">{p.name?.[0] || "?"}</div>}
                      </div>
                      <div className="font-bold">{p.name}</div>
                      <div className="text-xs text-[#8892b0]">#{p.jerseyNumber || "-"}</div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
          {players.length === 0 && <div className="text-[#8892b0]">No players in this team yet.</div>}
        </div>
      </div>
    </div>
  );
}

export default function TeamPage({ params }) {
  return (
    <Suspense fallback={<div className="p-10 text-center animate-pulse text-[#8892b0]">Loading Team...</div>}>
      <TeamDetails params={params} />
    </Suspense>
  );
}
