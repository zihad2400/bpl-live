import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { ArrowLeft, Target, Activity, Award } from "lucide-react";

async function PlayerProfile({ params }) {
  const { id } = await params;
  await connection();
  
  // ⚡ API থেকে ডাইনামিক স্ট্যাটস নিয়ে আসা
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/players/${id}`, { cache: 'no-store' });
  const { player, stats, recentMatches } = await res.json();

  if (!player) return <div className="text-center p-10">Player not found</div>;
  const s = stats || {};

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Link href="/players" className="inline-flex items-center text-[#8892b0] hover:text-white transition">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Players
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: Profile Image & Basic */}
        <div className="panel p-6 flex flex-col items-center text-center bg-[#0f1530] border border-white/10 shadow-lg">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-white/5 mb-4 shadow-[0_0_20px_rgba(16,255,159,0.2)] border-4 border-[#1e2749]">
            {player.photo ? (
              <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full avatar-placeholder text-4xl">{player.name?.[0] || "?"}</div>
            )}
          </div>
          <h1 className="text-3xl font-black text-white">{player.name}</h1>
          
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-royal text-white uppercase border border-magenta/50">{player.role}</span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-white border border-white/20">#{player.jerseyNumber || "-"}</span>
          </div>
          
          {player.teamId && (
            <Link href={`/teams/${player.teamId._id}`} className="mt-6 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition border border-white/10 w-full justify-center group">
              <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ background: player.teamId.primaryColor }} />
              <span className="font-bold text-white group-hover:text-emerald-neon transition">{player.teamId.name}</span>
            </Link>
          )}

          <div className="w-full mt-6 space-y-3 text-sm">
            <div className="flex justify-between border-b border-white/5 pb-2 items-center">
              <span className="text-[#8892b0]">Batting</span> 
              <span className="text-white font-bold">{player.battingStyle || "N/A"}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2 items-center">
              <span className="text-[#8892b0]">Bowling</span> 
              <span className="text-white font-bold">{player.bowlingStyle || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Right: Career Stats */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-gold" /> Career Statistics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="panel relative overflow-hidden p-6 border border-gold/40 shadow-[0_0_20px_rgba(251,191,36,0.1)]">
              <div className="absolute inset-0 bg-grad-batting opacity-20" />
              <div className="absolute inset-0 bg-[#0a0e27]/60" />
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-gold mb-5 flex items-center gap-2 uppercase tracking-widest"><Activity className="w-4 h-4"/> Batting</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center"><span className="text-white/60 text-sm">Matches</span><span className="font-bold text-white">{s.matches || 0}</span></div>
                  <div className="flex justify-between items-center"><span className="text-white/60 text-sm">Runs</span><span className="font-black text-gold text-2xl">{s.runs || 0}</span></div>
                  <div className="flex justify-between items-center"><span className="text-white/60 text-sm">Highest Score</span><span className="font-bold text-white">{s.highestScore || 0}</span></div>
                  <div className="flex justify-between items-center"><span className="text-white/60 text-sm">Balls Faced</span><span className="font-bold text-white">{s.balls || 0}</span></div>
                  <div className="flex justify-between items-center"><span className="text-white/60 text-sm">4s / 6s</span><span className="font-bold text-white">{s.fours || 0} / {s.sixes || 0}</span></div>
                  <div className="flex justify-between items-center"><span className="text-white/60 text-sm">Strike Rate</span><span className="font-bold text-emerald-neon bg-emerald-neon/10 px-2 py-0.5 rounded">{s.balls ? ((s.runs / s.balls) * 100).toFixed(2) : "0.00"}</span></div>
                </div>
              </div>
            </div>

            <div className="panel relative overflow-hidden p-6 border border-electric/40 shadow-[0_0_20px_rgba(0,212,255,0.1)]">
              <div className="absolute inset-0 bg-grad-bowling opacity-20" />
              <div className="absolute inset-0 bg-[#0a0e27]/60" />
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-electric mb-5 flex items-center gap-2 uppercase tracking-widest"><Target className="w-4 h-4"/> Bowling</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center"><span className="text-white/60 text-sm">Wickets</span><span className="font-black text-electric text-2xl">{s.wickets || 0}</span></div>
                  <div className="flex justify-between items-center"><span className="text-white/60 text-sm">Runs Conceded</span><span className="font-bold text-white">{s.runsConceded || 0}</span></div>
                  <div className="flex justify-between items-center"><span className="text-white/60 text-sm">Balls Bowled</span><span className="font-bold text-white">{s.ballsBowled || 0}</span></div>
                  <div className="flex justify-between items-center"><span className="text-white/60 text-sm">Overs</span><span className="font-bold text-white">{s.ballsBowled ? `${Math.floor(s.ballsBowled / 6)}.${s.ballsBowled % 6}` : "0.0"}</span></div>
                  <div className="flex justify-between items-center"><span className="text-white/60 text-sm">Economy</span><span className="font-bold text-emerald-neon bg-emerald-neon/10 px-2 py-0.5 rounded">{s.ballsBowled ? (s.runsConceded / (s.ballsBowled / 6)).toFixed(2) : "0.00"}</span></div>
                </div>
              </div>
            </div>
            
          </div>

          {/* Recent Matches */}
          <div className="mt-6">
            <h3 className="text-lg font-bold text-white mb-3">Recent Matches</h3>
            <div className="space-y-2">
              {recentMatches?.map(m => (
                <Link key={m._id} href={`/live/${m._id}`} className="block panel p-3 hover:bg-white/5 transition flex justify-between text-sm">
                  <span className="text-white/80">{m.teamA?.shortName} vs {m.teamB?.shortName}</span>
                  <span className="text-emerald-neon font-bold">{m.result || m.status}</span>
                </Link>
              ))}
              {recentMatches?.length === 0 && <span className="text-white/40 text-sm">No matches played yet.</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlayerPage({ params }) {
  return (
    <Suspense fallback={<div className="p-10 text-center animate-pulse text-[#8892b0]">Loading Profile...</div>}>
      <PlayerProfile params={params} />
    </Suspense>
  );
}
