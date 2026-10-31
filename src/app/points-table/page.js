import { Suspense } from "react";
import { connection } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Match from "@/models/Match";
import Innings from "@/models/Innings";
import Team from "@/models/Team";

async function buildStandings() {
  await connection();
  await connectDB();
  const teams = await Team.find().lean();
  const matches = await Match.find({ status: "completed" }).lean();

  const s = {};
  teams.forEach(t => {
    s[t._id.toString()] = {
      team: t, played: 0, won: 0, lost: 0, nr: 0, points: 0,
      runsFor: 0, ballsFaced: 0, runsAgainst: 0, ballsBowled: 0,
    };
  });

  for (const m of matches) {
    const inns = await Innings.find({ matchId: m._id }).sort({ inningsNumber: 1 }).lean();
    if (inns.length < 2) continue;
    const i1 = inns[0], i2 = inns[1];
    const teamA = s[m.teamA.toString()], teamB = s[m.teamB.toString()];
    if (!teamA || !teamB) continue;

    teamA.played++; teamB.played++;
    teamA.runsFor += i1.totalRuns; teamA.ballsFaced += i1.totalLegalBalls;
    teamA.runsAgainst += i2.totalRuns; teamA.ballsBowled += i2.totalLegalBalls;
    teamB.runsFor += i2.totalRuns; teamB.ballsFaced += i2.totalLegalBalls;
    teamB.runsAgainst += i1.totalRuns; teamB.ballsBowled += i1.totalLegalBalls;

    if (i1.totalRuns > i2.totalRuns) { teamA.won++; teamA.points += 2; teamB.lost++; }
    else if (i2.totalRuns > i1.totalRuns) { teamB.won++; teamB.points += 2; teamA.lost++; }
  }

  return Object.values(s).map(x => {
    const ff = x.ballsFaced > 0 ? x.ballsFaced : 120;
    const bb = x.ballsBowled > 0 ? x.ballsBowled : 120;
    const nrr = x.played > 0 ? (x.runsFor / (ff / 6)) - (x.runsAgainst / (bb / 6)) : 0;
    return { ...x, nrr: +nrr.toFixed(3) };
  }).sort((a, b) => b.points - a.points || b.nrr - a.nrr);
}

async function PointsTable() {
  const standings = await buildStandings();
  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-royal to-magenta text-white">
            <tr>
              <th className="text-left p-3">#</th>
              <th className="text-left p-3">Team</th>
              <th className="text-center p-3">P</th>
              <th className="text-center p-3">W</th>
              <th className="text-center p-3">L</th>
              <th className="text-center p-3">Pts</th>
              <th className="text-center p-3">NRR</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, idx) => (
              <tr key={row.team._id} className="border-t border-[#1e2749] hover:bg-white/5">
                <td className="p-3 font-bold text-white/60">{idx + 1}</td>
                <td className="p-3 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md grid place-items-center font-black text-xs text-black" style={{ background: row.team.primaryColor || "#10ff9f" }}>
                    {row.team.shortName?.[0]}
                  </div>
                  <span className="font-bold">{row.team.name}</span>
                </td>
                <td className="p-3 text-center">{row.played}</td>
                <td className="p-3 text-center text-emerald-neon font-bold">{row.won}</td>
                <td className="p-3 text-center text-crimson">{row.lost}</td>
                <td className="p-3 text-center font-black text-gold">{row.points}</td>
                <td className={`p-3 text-center font-mono ${row.nrr >= 0 ? "text-emerald-neon" : "text-crimson"}`}>
                  {row.nrr > 0 ? "+" : ""}{row.nrr}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PointsTablePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">Points Table</h1>
      <Suspense fallback={<div className="panel p-8 text-center text-[#8892b0] animate-pulse">Calculating standings...</div>}>
        <PointsTable />
      </Suspense>
    </div>
  );
}
