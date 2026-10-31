"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trophy, MapPin, Star } from "lucide-react";

export default function ScorecardClient() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/matches/${id}?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-20 text-center animate-pulse text-[#8892b0]">Loading Match Data...</div>;
  if (!data || !data.match) return <div className="p-20 text-center text-crimson">Match not found.</div>;

  const { match, innings } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up pb-20">
      <Link href="/matches" className="inline-flex items-center text-[#8892b0] hover:text-white transition">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to All Matches
      </Link>

      {/* Match Header */}
      <div className="panel p-8 bg-grad-live relative overflow-hidden border border-white/10 text-center space-y-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#10ff9f_0%,transparent_50%)] opacity-20 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex justify-center items-center gap-4 text-3xl font-black mb-2">
            <span className="text-white">{match.teamA?.name}</span>
            <span className="text-white/40 text-xl">vs</span>
            <span className="text-white">{match.teamB?.name}</span>
          </div>
          <p className="text-sm text-[#8892b0] flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4" /> {match.venue} • Match #{match.matchNo}
          </p>
          
          {match.status === "completed" && (
            <div className="mt-6 inline-block bg-white/5 border border-emerald-neon/30 px-6 py-3 rounded-xl shadow-glow">
              <p className="text-xl font-bold text-emerald-neon">{match.result}</p>
            </div>
          )}
          {match.manOfTheMatch && (
            <div className="mt-4 flex items-center justify-center gap-2 text-gold font-bold">
              <Star className="w-5 h-5" /> Man of the Match: {match.manOfTheMatch}
            </div>
          )}
        </div>
      </div>

      {/* Innings Data */}
      {innings.map((inn, index) => {
        const battingTeam = index === 0 ? match.teamA : match.teamB;
        return (
          <div key={inn._id} className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-2xl font-black text-white">{battingTeam?.name} Innings</h3>
              <span className="text-xl font-black text-emerald-neon">
                {inn.totalRuns}/{inn.wickets} <span className="text-sm text-white/50">({Math.floor(inn.totalLegalBalls / 6)}.{inn.totalLegalBalls % 6} Ov)</span>
              </span>
            </div>

            {/* Batting Table */}
            <div className="panel overflow-hidden border border-white/5">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-[#8892b0] font-bold">
                  <tr>
                    <th className="text-left p-3">Batter</th>
                    <th className="text-left p-3">Dismissal</th>
                    <th className="text-center p-3">R</th>
                    <th className="text-center p-3">B</th>
                    <th className="text-center p-3">4s</th>
                    <th className="text-center p-3">6s</th>
                    <th className="text-center p-3">SR</th>
                  </tr>
                </thead>
                <tbody>
                  {inn.batters?.map((b, i) => (
                    <tr key={i} className={`border-t border-white/5 hover:bg-white/5 ${b.out ? 'text-white/50' : 'text-white'}`}>
                      <td className="p-3 font-bold">{b.name}</td>
                      <td className="p-3 text-xs italic">{b.out ? "Out" : "Not Out"}</td>
                      <td className="p-3 text-center font-black text-gold">{b.runs}</td>
                      <td className="p-3 text-center">{b.balls}</td>
                      <td className="p-3 text-center">{b.fours}</td>
                      <td className="p-3 text-center">{b.sixes}</td>
                      <td className="p-3 text-center font-mono">{b.balls ? ((b.runs / b.balls) * 100).toFixed(1) : "0.0"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bowling Table */}
            <div className="panel overflow-hidden border border-white/5">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-[#8892b0] font-bold">
                  <tr>
                    <th className="text-left p-3">Bowler</th>
                    <th className="text-center p-3">O</th>
                    <th className="text-center p-3">R</th>
                    <th className="text-center p-3">W</th>
                    <th className="text-center p-3">ECO</th>
                  </tr>
                </thead>
                <tbody>
                  {inn.bowlers?.map((b, i) => (
                    <tr key={i} className="border-t border-white/5 hover:bg-white/5 text-white/80">
                      <td className="p-3 font-bold text-electric">{b.name}</td>
                      <td className="p-3 text-center font-mono">{Math.floor(b.legalBalls / 6)}.{b.legalBalls % 6}</td>
                      <td className="p-3 text-center">{b.runs}</td>
                      <td className="p-3 text-center font-black text-emerald-neon">{b.wickets}</td>
                      <td className="p-3 text-center font-mono text-gold">{b.legalBalls ? (b.runs / (b.legalBalls / 6)).toFixed(2) : "0.00"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
