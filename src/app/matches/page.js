import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Match from "@/models/Match";
import Team from "@/models/Team";

const statusStyle = {
  live: "bg-crimson/20 text-crimson border-crimson/50",
  upcoming: "bg-electric/20 text-electric border-electric/50",
  completed: "bg-emerald-neon/20 text-emerald-neon border-emerald-neon/50",
  abandoned: "bg-white/10 text-white/50 border-white/20",
};

async function MatchesList() {
  await connection();
  await connectDB();
  const matches = await Match.find()
    .populate("teamA", "name shortName primaryColor")
    .populate("teamB", "name shortName primaryColor")
    .sort({ date: -1 })
    .lean();

  return (
    <div className="space-y-3">
      {matches.map(m => {
        const dateStr = m.date ? new Date(m.date).toISOString().split('T')[0] : "TBA";
        return (
          <Link key={m._id} href={`/scorecard/${m._id}`} className="panel p-4 flex items-center justify-between hover:bg-white/5 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl grid place-items-center font-black text-black" style={{ background: m.teamA?.primaryColor || "#10ff9f" }}>
                {m.teamA?.shortName?.[0]}
              </div>
              <div>
                <div className="font-bold">{m.teamA?.name}</div>
                <div className="text-xs text-[#8892b0]">vs {m.teamB?.name}</div>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xs font-bold px-2 py-1 rounded-full border uppercase ${statusStyle[m.status]}`}>
                {m.status}
              </span>
              <div className="text-xs text-[#8892b0] mt-1">{dateStr}</div>
            </div>
          </Link>
        );
      })}
      {matches.length === 0 && <div className="panel p-8 text-center text-[#8892b0]">No matches yet.</div>}
    </div>
  );
}

export default function MatchesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">All Matches</h1>
      <Suspense fallback={<div className="panel p-8 text-center text-[#8892b0] animate-pulse">Loading matches...</div>}>
        <MatchesList />
      </Suspense>
    </div>
  );
}
