"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MapPin, Trophy } from "lucide-react";

export default function LiveScoreboardClient() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const r = await fetch(`/api/matches/${id}`, { cache: "no-store" });
        const d = await r.json();
        if (!stop) setData(d);
      } catch (e) {
        if (!stop) setError(e.message);
      }
    };
    load();
    const t = setInterval(load, 2000);
    return () => { stop = true; clearInterval(t); };
  }, [id]);

  if (error) return <div className="panel p-6 text-crimson">Error: {error}</div>;
  if (!data) return <Skeleton />;

  // ⚡ currentOverDeliveries ব্যবহার করা হচ্ছে
  const { match, innings, currentOverDeliveries } = data;
  const current = innings[innings.length - 1];
  const previous = innings.length > 1 ? innings[0] : null;
  const target = previous ? previous.totalRuns + 1 : null;
  const need = (target && current) ? Math.max(0, target - current.totalRuns) : null;
  const maxOvers = match?.overs || 20;
  const ballsLeft = (maxOvers * 6) - (current?.totalLegalBalls || 0);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full bg-crimson/20 border border-crimson/50 text-crimson">
          <span className="live-dot" /> LIVE
        </span>
        <span className="text-sm text-[#8892b0] flex items-center gap-1">
          <MapPin className="w-4 h-4" /> {match.venue}
        </span>
        <span className="text-sm text-[#8892b0]">Match #{match.matchNo}</span>
        <Link href={`/scorecard/${id}`} className="ml-auto text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition border border-white/10 flex items-center gap-2">
          Full Scorecard →
        </Link>
        <span className="text-sm text-[#8892b0]">{maxOvers} Overs Match</span>
      </div>

      {/* BIG SCOREBOARD */}
      <div className="relative overflow-hidden rounded-3xl bg-grad-live border border-white/10 p-6 md:p-10">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_80%_20%,#10ff9f_0%,transparent_50%)]" />
        <div className="relative space-y-4">
          {innings.map((inn, idx) => {
            const battingTeam = idx === 0 ? match.teamA : match.teamB;
            const isCurrent = inn === current;
            return (
              <div key={inn._id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl grid place-items-center font-black text-black shadow-glow"
                    style={{ backgroundColor: battingTeam?.primaryColor || "#10ff9f" }}
                  >
                    {battingTeam?.shortName?.[0]}
                  </div>
                  <div>
                    <div className="text-lg font-bold flex items-center gap-2 text-white">
                      {battingTeam?.name}
                      {isCurrent && match.status === "live" && <span className="live-dot" />}
                    </div>
                    <div className="text-xs text-white/50">
                      {inn.oversText} overs
                      {inn.status === "completed" && " • Innings complete"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-4xl md:text-5xl font-black ${isCurrent ? "text-emerald-neon" : "text-white"}`}>
                    {inn.totalRuns}<span className="text-2xl text-white/60">/{inn.wickets}</span>
                  </div>
                  <div className="text-xs text-white/50">RR {inn.runRate}</div>
                </div>
              </div>
            );
          })}
        </div>

        {target && current && (
          <div className="relative mt-6 pt-4 border-t border-white/20 grid grid-cols-3 gap-3 text-center">
            <div><div className="text-xs text-white/50 uppercase font-bold">Target</div><div className="text-xl font-black text-white">{target}</div></div>
            <div><div className="text-xs text-white/50 uppercase font-bold">Need</div><div className="text-xl font-black text-gold">{need} <span className="text-xs">runs</span></div></div>
            <div><div className="text-xs text-white/50 uppercase font-bold">Balls Left</div><div className="text-xl font-black text-electric">{ballsLeft}</div></div>
          </div>
        )}
      </div>

      {match.status === "completed" && (
        <div className="panel p-6 bg-gradient-to-br from-emerald-neon/10 to-royal/10 border border-emerald-neon/30 animate-slide-up">
          <h3 className="text-2xl font-black text-gold mb-4 flex items-center gap-2"><Trophy className="w-6 h-6" /> Match Summary</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-black/30 p-4 rounded-xl border border-white/10">
              <div className="text-xs text-white/50 uppercase font-bold">Man of the Match</div>
              <div className="text-xl font-black text-emerald-neon mt-1">{match.manOfTheMatch || "N/A"}</div>
            </div>
            <div className="bg-black/30 p-4 rounded-xl border border-white/10">
              <div className="text-xs text-white/50 uppercase font-bold">Top Batter</div>
              <div className="text-xl font-black text-gold mt-1">{match.topBatter || "N/A"}</div>
            </div>
            <div className="bg-black/30 p-4 rounded-xl border border-white/10">
              <div className="text-xs text-white/50 uppercase font-bold">Top Bowler</div>
              <div className="text-xl font-black text-electric mt-1">{match.topBowler || "N/A"}</div>
            </div>
          </div>
          <div className="mt-4 text-center text-lg font-bold text-white">
            {match.result}
          </div>
        </div>
      )}

      {current && match.status === "live" && (
        <div className="grid md:grid-cols-3 gap-4">
          
          {/* BATTING CARD */}
          <div className="panel relative overflow-hidden p-5 border border-white/10">
            <div className="absolute inset-0 bg-grad-batting opacity-20" />
            <div className="absolute inset-0 bg-[#0a0e27]/60" />
            <div className="relative z-10">
              <div className="text-xs uppercase text-gold font-bold tracking-widest mb-3">Batting</div>
              {current.batters?.slice(0, 2).map((b, i) => (
                <div key={i} className={`flex justify-between items-center py-1.5 ${b.out ? 'opacity-50 line-through' : ''}`}>
                  <span className="font-bold text-sm text-white">{b.name} {!b.out && i === 0 && "🏏"}</span>
                  <span className="text-sm text-white">
                    <b className="text-gold">{b.runs}</b> <span className="text-white/60">({b.balls})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* BOWLING CARD */}
          <div className="panel relative overflow-hidden p-5 border border-white/10">
            <div className="absolute inset-0 bg-grad-bowling opacity-20" />
            <div className="absolute inset-0 bg-[#0a0e27]/60" />
            <div className="relative z-10">
              <div className="text-xs uppercase text-electric font-bold tracking-widest mb-3">Bowling</div>
              {current.bowlers?.slice(0, 1).map((b, i) => (
                <div key={i} className="flex justify-between items-center py-1.5">
                  <span className="font-bold text-sm text-white">{b.name}</span>
                  <span className="text-sm text-white">
                    <b className="text-electric">{b.overs}</b> - {b.runs} - <b className="text-emerald-neon">{b.wickets}</b>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* THIS OVER CARD */}
          <div className="panel p-5 border border-white/10">
            <div className="text-xs uppercase text-white/60 font-bold mb-3 tracking-widest">This Over</div>
            <div className="flex gap-1.5 flex-wrap">
              {/* ⚡ currentOverDeliveries ব্যবহার করা হচ্ছে */}
              {currentOverDeliveries?.map((d, i) => (
                <span key={i} className={`ball ${
                  d.isWicket ? "!bg-crimson !text-white" :
                  d.runs === 6 ? "!bg-magenta !text-white" :
                  d.runs === 4 ? "!bg-gold !text-black" :
                  d.extraType ? "!bg-electric !text-black" : ""
                }`}>
                  {d.isWicket ? "W" : d.extraType === "wide" ? "wd" : d.extraType === "noball" ? "nb" : d.runs}
                </span>
              ))}
              {(!currentOverDeliveries || currentOverDeliveries.length === 0) && (
                <span className="text-xs text-white/40">No deliveries yet</span>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
      <div className="h-64 bg-white/5 rounded-3xl animate-pulse" />
      <div className="grid md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );
}
