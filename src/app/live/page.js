import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Match from "@/models/Match";
import Team from "@/models/Team";

async function LiveMatchesList() {
  await connection();
  await connectDB();
  
  // ⚡ কঠোরভাবে শুধু live ম্যাচ ফিল্টার করা হলো
  const matches = await Match.find({ status: "live" })
    .populate("teamA", "name shortName primaryColor")
    .populate("teamB", "name shortName primaryColor")
    .lean();

  if (matches.length === 0) {
    return (
      <div className="panel p-8 text-center text-[#8892b0]">
        No live matches currently. Go to <Link href="/scorer" className="text-emerald-neon underline">Scorer</Link> to start a match.
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {matches.map(m => (
        <Link key={m._id} href={`/live/${m._id}`} className="panel p-5 bg-grad-live hover:shadow-glow transition">
          <div className="text-xs text-emerald-neon mb-3 font-bold flex items-center gap-2">
            <span className="live-dot" /> LIVE • {m.venue || "Stadium"}
          </div>
          {[m.teamA, m.teamB].map((t, i) => (
            <div key={i} className="flex justify-between items-center py-1">
              <span className="font-bold">{t?.name || "TBA"}</span>
              <span className="text-white/40">—</span>
            </div>
          ))}
        </Link>
      ))}
    </div>
  );
}

export default function LiveMatchesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="live-dot" />
        <h1 className="text-3xl font-black">Live Matches</h1>
      </div>
      <Suspense fallback={<div className="panel p-8 text-center text-[#8892b0] animate-pulse">Loading live matches...</div>}>
        <LiveMatchesList />
      </Suspense>
    </div>
  );
}
