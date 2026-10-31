import { Suspense } from "react";
import { connection } from "next/server";
import { Flame, Droplets, Activity, Zap, Trophy } from "lucide-react";

async function StatisticsData() {
  await connection();
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/statistics`, { cache: 'no-store' });
  const data = await res.json();

  if (data.error) return <div className="text-crimson text-center p-10">Error loading stats: {data.error}</div>;

  return (
    <div className="space-y-8 animate-slide-up">
      
      {/* ⚡ ORANGE CAP (Top Run Scorers) */}
      <div className="panel p-6 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/30">
        <h2 className="text-2xl font-black text-gold flex items-center gap-2 mb-6">
          <Flame className="w-6 h-6" /> Orange Cap <span className="text-sm text-white/50 font-normal">(Most Runs)</span>
        </h2>
        <div className="space-y-3">
          {data.orangeCap?.map((p, i) => (
            <div key={p.name} className="flex items-center justify-between bg-black/30 p-3 rounded-xl border border-white/5 hover:bg-white/5 transition">
              <div className="flex items-center gap-4">
                <span className="text-xl font-black text-white/30 w-6">{i + 1}</span>
                <span className="font-bold text-white text-lg">{p.name}</span>
              </div>
              <div className="flex gap-6 text-sm font-mono">
                <span className="text-gold font-bold text-xl">{p.runs} <span className="text-xs text-white/50">Runs</span></span>
                <span className="text-white/70">{p.balls} <span className="text-xs">Balls</span></span>
                <span className="text-white/70">{p.fours} <span className="text-xs">4s</span></span>
                <span className="text-white/70">{p.sixes} <span className="text-xs">6s</span></span>
              </div>
            </div>
          ))}
          {data.orangeCap?.length === 0 && <div className="text-white/40 text-sm">No data available yet.</div>}
        </div>
      </div>

      {/* ⚡ PURPLE CAP (Top Wicket Takers) */}
      <div className="panel p-6 bg-gradient-to-br from-royal/20 to-transparent border-royal/30">
        <h2 className="text-2xl font-black text-electric flex items-center gap-2 mb-6">
          <Droplets className="w-6 h-6" /> Purple Cap <span className="text-sm text-white/50 font-normal">(Most Wickets)</span>
        </h2>
        <div className="space-y-3">
          {data.purpleCap?.map((p, i) => (
            <div key={p.name} className="flex items-center justify-between bg-black/30 p-3 rounded-xl border border-white/5 hover:bg-white/5 transition">
              <div className="flex items-center gap-4">
                <span className="text-xl font-black text-white/30 w-6">{i + 1}</span>
                <span className="font-bold text-white text-lg">{p.name}</span>
              </div>
              <div className="flex gap-6 text-sm font-mono">
                <span className="text-electric font-bold text-xl">{p.wickets} <span className="text-xs text-white/50">Wkts</span></span>
                <span className="text-white/70">{p.runsConceded} <span className="text-xs">Runs</span></span>
                <span className="text-white/70">{p.legalBallsBowled ? (p.legalBallsBowled / 6).toFixed(1) : 0} <span className="text-xs">Overs</span></span>
              </div>
            </div>
          ))}
          {data.purpleCap?.length === 0 && <div className="text-white/40 text-sm">No data available yet.</div>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ⚡ MOST SIXES */}
        <div className="panel p-6 bg-gradient-to-br from-magenta/10 to-transparent border-magenta/30">
          <h2 className="text-xl font-black text-magenta flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5" /> Most Sixes
          </h2>
          <div className="space-y-2">
            {data.mostSixes?.map((p, i) => (
              <div key={p.name} className="flex justify-between items-center bg-black/20 p-2 rounded-lg">
                <span className="font-bold">{i + 1}. {p.name}</span>
                <span className="font-black text-magenta">{p.sixes}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ⚡ BEST STRIKE RATE */}
        <div className="panel p-6 bg-gradient-to-br from-emerald-neon/10 to-transparent border-emerald-neon/30">
          <h2 className="text-xl font-black text-emerald-neon flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5" /> Best Strike Rate
          </h2>
          <div className="space-y-2">
            {data.bestStrikeRate?.map((p, i) => (
              <div key={p.name} className="flex justify-between items-center bg-black/20 p-2 rounded-lg">
                <span className="font-bold">{i + 1}. {p.name}</span>
                <span className="font-black text-emerald-neon">{p.strikeRate.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

export default function StatisticsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold to-magenta flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 text-gold" /> Tournament Statistics
        </h1>
        <p className="text-[#8892b0] mt-2">Top performers of the league based on live data.</p>
      </div>

      <Suspense fallback={<div className="p-20 text-center animate-pulse text-[#8892b0]">Loading statistics...</div>}>
        <StatisticsData />
      </Suspense>
    </div>
  );
}
