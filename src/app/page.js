import { Suspense } from "react";
import Link from "next/link";
import { Radio, Trophy, Users, TrendingUp, Zap, MapPin, PlayCircle } from "lucide-react";
import { connectDB } from "@/lib/mongodb";
import Match from "@/models/Match";
import Team from "@/models/Team";
import Player from "@/models/Player";
import Delivery from "@/models/Delivery";
import Innings from "@/models/Innings";
import Tournament from "@/models/Tournament";

// ============================================================
// STATIC HERO
// ============================================================
function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-grad-hero border border-white/10 p-6 md:p-12 flex flex-col-reverse md:flex-row items-center justify-between shadow-2xl min-h-[500px]">
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_70%_30%,#10ff9f_0%,transparent_50%)] pointer-events-none" />
      
      {/* LEFT SIDE TEXT */}
      <div className="relative z-20 max-w-xl w-full text-center md:text-left mt-6 md:mt-0">
        <span className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full bg-emerald-neon/10 border border-emerald-neon/30 text-emerald-neon shadow-[0_0_15px_rgba(16,255,159,0.3)]">
          <Radio className="w-3 h-3 animate-pulse" /> LIVE CRICKET
        </span>
        <h1 className="mt-4 text-4xl md:text-6xl font-black tracking-tight leading-tight">
          Every Ball. <span className="bg-clip-text text-transparent bg-grad-batting">Every Run.</span><br />Live.
        </h1>
        <p className="mt-4 text-[#8892b0] text-sm md:text-lg">
          Premium cricket league management & real-time scoring. Ball-by-ball accuracy, gorgeous live dashboards, professional analytics.
        </p>
        <div className="mt-6 md:mt-8 flex justify-center md:justify-start gap-4">
          <Link href="/live" className="btn-grad bg-gradient-to-r from-emerald-neon to-cyan-400 text-black font-black shadow-[0_0_20px_rgba(16,255,159,0.4)] hover:scale-105 transition px-6 py-3 rounded-lg">
            Watch Live
          </Link>
          <Link href="/scorer" className="btn-grad bg-gradient-to-r from-royal to-magenta font-black shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:scale-105 transition px-6 py-3 rounded-lg text-white">
            Open Scorer
          </Link>
        </div>
      </div>

      {/* RIGHT SIDE IMAGE */}
      <div className="relative z-10 w-full md:w-1/2 flex items-center justify-center">
        <div className="absolute w-[280px] h-[280px] md:w-[450px] md:h-[450px] border border-emerald-neon/20 rounded-full animate-radar pointer-events-none" />
        <div className="absolute w-[220px] h-[220px] md:w-[350px] md:h-[350px] border border-dashed border-magenta/30 rounded-full animate-radar pointer-events-none" style={{ animationDirection: 'reverse' }} />
        <div className="absolute w-40 h-40 md:w-80 md:h-80 bg-emerald-neon/20 rounded-full blur-[80px] md:blur-[100px] animate-pulse pointer-events-none" />

        <div className="relative z-20 w-[240px] h-[240px] md:w-[350px] md:h-[350px] lg:w-[420px] lg:h-[420px] p-3 md:p-4 rounded-[2.5rem] bg-white/5 backdrop-blur-md border border-white/10 animate-float-ball group hover:scale-105 transition-transform duration-500">
          <div className="w-full h-full overflow-hidden rounded-[2rem] relative flex items-center justify-center bg-black/20">
            <img 
              src="/images/hero-collage.png" 
              alt="Premium Cricket Gear" 
              className="w-full h-full object-cover object-top scale-[1.15] drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] relative z-10"
            />
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-magenta rounded-full blur-xl opacity-40 animate-pulse pointer-events-none" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-emerald-neon rounded-full blur-xl opacity-30 animate-pulse pointer-events-none" />
        </div>
      </div>
    </section>
  );
}

// ============================================================
// DYNAMIC LIVE MATCHES (Data Fetch Wrapper)
// ============================================================
async function LiveMatchesWrapper() {
  "use cache";
  await connectDB();
  try {
    const matches = await Match.find({ status: "live" })
      .populate("teamA", "name shortName primaryColor logo")
      .populate("teamB", "name shortName primaryColor logo")
      .sort({ date: -1 })
      .limit(4)
      .lean();

    if (matches.length === 0) {
      return (
        <div className="panel p-8 text-center text-[#8892b0] border border-white/5">
          No live match right now. Open <Link href="/scorer" className="text-emerald-neon underline">Scorer</Link> to start one.
        </div>
      );
    }

    const matchIds = matches.map(m => m._id);
    const allInnings = await Innings.find({ matchId: { $in: matchIds } }).lean();

    const matchesWithScores = matches.map(match => {
      const matchInnings = allInnings.filter(i => i.matchId.toString() === match._id.toString());
      return { ...match, innings: matchInnings };
    });

    return (
      <div className="grid md:grid-cols-2 gap-6">
        {matchesWithScores.map((m) => (
          <LiveMatchCard key={m._id} match={m} />
        ))}
      </div>
    );
  } catch (e) {
    console.error(e);
    return <div className="panel p-8 text-center text-crimson">⚠️ Database connection error.</div>;
  }
}

function LiveMatchCard({ match }) {
  const inn1 = match.innings.find(i => i.inningsNumber === 1);
  const inn2 = match.innings.find(i => i.inningsNumber === 2);
  
  const teamA = match.teamA;
  const teamB = match.teamB;

  const isTeamABatting = (inn1 && inn1.battingTeam.toString() === teamA._id.toString()) || (inn2 && inn2.battingTeam.toString() === teamA._id.toString());
  const isTeamBBatting = (inn1 && inn1.battingTeam.toString() === teamB._id.toString()) || (inn2 && inn2.battingTeam.toString() === teamB._id.toString());

  const getTeamStats = (teamId) => {
    const inn = match.innings.find(i => i.battingTeam.toString() === teamId.toString());
    if (!inn) return { score: "—", overs: "" };
    return { 
      score: `${inn.totalRuns}/${inn.wickets}`, 
      overs: `${Math.floor(inn.totalLegalBalls / 6)}.${inn.totalLegalBalls % 6}` 
    };
  };

  const statsA = getTeamStats(teamA._id);
  const statsB = getTeamStats(teamB._id);

  const cardGradient = `linear-gradient(135deg, ${teamA.primaryColor || '#10ff9f'}25 0%, #0a0e27 60%)`;

  return (
    <Link href={`/live/${match._id}`} className="block group relative overflow-hidden rounded-2xl border border-white/10 hover:border-emerald-neon/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,255,159,0.15)] bg-[#0f1530]">
      <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500" style={{ background: cardGradient }} />
      <div className="relative p-5">
        <div className="flex items-center justify-between mb-5">
          <span className="text-[10px] font-black tracking-wider text-emerald-neon flex items-center gap-1.5 bg-emerald-neon/10 px-2.5 py-1 rounded-full border border-emerald-neon/20 uppercase">
            <span className="live-dot !w-1.5 !h-1.5" /> Live Match
          </span>
          <span className="text-xs text-[#8892b0] flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5" /> {match.venue || "Stadium"}
          </span>
        </div>

        <div className="space-y-4">
          <div className={`flex items-center justify-between ${isTeamABatting ? '' : 'opacity-70'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 border border-white/10 p-0.5 shadow-sm">
                {teamA?.logo ? (
                  <img src={teamA.logo} alt={teamA.shortName} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full rounded-full grid place-items-center font-black text-black text-sm" style={{ background: teamA?.primaryColor }}>
                    {teamA?.shortName?.[0]}
                  </div>
                )}
              </div>
              <div>
                <div className="font-bold text-white text-[15px] group-hover:text-emerald-neon transition-colors">{teamA?.name}</div>
                {isTeamABatting && <div className="text-[10px] text-emerald-neon font-bold uppercase tracking-widest animate-pulse">● Batting</div>}
              </div>
            </div>
            <div className="text-right">
              <div className={`font-black text-xl ${isTeamABatting ? 'text-gold' : 'text-white'}`}>
                {statsA.score}
              </div>
              {statsA.overs && <div className="text-[11px] text-[#8892b0] font-medium">{statsA.overs} overs</div>}
            </div>
          </div>

          <div className="w-full h-px bg-white/10" />

          <div className={`flex items-center justify-between ${isTeamBBatting ? '' : 'opacity-70'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 border border-white/10 p-0.5 shadow-sm">
                {teamB?.logo ? (
                  <img src={teamB.logo} alt={teamB.shortName} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full rounded-full grid place-items-center font-black text-black text-sm" style={{ background: teamB?.primaryColor }}>
                    {teamB?.shortName?.[0]}
                  </div>
                )}
              </div>
              <div>
                <div className="font-bold text-white text-[15px] group-hover:text-emerald-neon transition-colors">{teamB?.name}</div>
                {isTeamBBatting && <div className="text-[10px] text-emerald-neon font-bold uppercase tracking-widest animate-pulse">● Batting</div>}
              </div>
            </div>
            <div className="text-right">
              <div className={`font-black text-xl ${isTeamBBatting ? 'text-gold' : 'text-white'}`}>
                {statsB.score}
              </div>
              {statsB.overs && <div className="text-[11px] text-[#8892b0] font-medium">{statsB.overs} overs</div>}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-white/50 font-medium">Match #{match.matchNo}</span>
          <span className="text-xs font-bold text-emerald-neon flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <PlayCircle className="w-4 h-4" /> Watch Scoreboard
          </span>
        </div>
      </div>
    </Link>
  );
}

// ============================================================
// DYNAMIC STATS (Data Fetch Wrapper)
// ============================================================
async function DynamicStatsWrapper() {
  "use cache";
  await connectDB();

  const [tournamentCount, teamCount, playerCount, deliveryCount] = await Promise.all([
    Tournament.countDocuments(),
    Team.countDocuments(),
    Player.countDocuments(),
    Delivery.countDocuments(),
  ]);

  const stats = [
    { icon: Trophy, label: "Tournaments", val: tournamentCount.toLocaleString(), grad: "from-royal to-magenta" },
    { icon: Users, label: "Teams", val: teamCount.toLocaleString(), grad: "from-electric to-royal" },
    { icon: TrendingUp, label: "Players", val: playerCount.toLocaleString(), grad: "from-orange-500 to-gold" },
    { icon: Zap, label: "Deliveries Scored", val: deliveryCount.toLocaleString(), grad: "from-crimson to-magenta" },
  ];

  return (
    <section className="grid md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className={`panel p-5 bg-gradient-to-br ${s.grad} bg-opacity-10 border border-white/5`}>
          <s.icon className="w-6 h-6 text-white/80 mb-2" />
          <div className="text-3xl font-black">{s.val}</div>
          <div className="text-sm text-white/70">{s.label}</div>
        </div>
      ))}
    </section>
  );
}

function StatsSkeleton() {
  return (
    <section className="grid md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="panel p-5 h-28 animate-pulse bg-white/5" />
      ))}
    </section>
  );
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default function Home() {
  return (
    <div className="space-y-10 animate-slide-up">
      <Hero />

      <section>
        <div className="flex items-center gap-3 mb-5">
          <span className="live-dot" />
          <h2 className="text-2xl font-black">Live Matches</h2>
        </div>
        {/* Live Matches ke Suspense diye wrap kora hoyeche */}
        <Suspense fallback={<div className="panel p-8 h-64 animate-pulse bg-white/5" />}>
          <LiveMatchesWrapper />
        </Suspense>
      </section>

      {/* Stats ke Suspense diye wrap kora hoyeche */}
      <Suspense fallback={<StatsSkeleton />}>
        <DynamicStatsWrapper />
      </Suspense>
    </div>
  );
}
