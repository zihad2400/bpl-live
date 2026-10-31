import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Player from "@/models/Player";
import Team from "@/models/Team";

async function PlayersList() {
  await connection();
  await connectDB();
  const players = await Player.find().populate("teamId", "name shortName primaryColor").lean();
  
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {players.map(p => (
        <Link key={p._id} href={`/players/${p._id}`} className="panel p-5 hover:border-emerald-neon transition flex items-center gap-4 group">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 shrink-0 border-2 border-transparent group-hover:border-emerald-neon transition">
            {p.photo ? (
              <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full avatar-placeholder text-2xl">{p.name?.[0] || "?"}</div>
            )}
          </div>
          <div>
            <div className="font-bold text-lg group-hover:text-emerald-neon transition">{p.name}</div>
            <div className="text-xs text-emerald-neon uppercase font-bold mb-1">{p.role}</div>
            <div className="text-xs text-[#8892b0]">{p.teamId?.name || "Free agent"}</div>
          </div>
        </Link>
      ))}
      {players.length === 0 && <div className="panel p-8 text-center text-[#8892b0] md:col-span-3">No players yet.</div>}
    </div>
  );
}

export default function PlayersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">Players</h1>
      <Suspense fallback={<div className="panel p-8 text-center text-[#8892b0] animate-pulse">Loading players...</div>}>
        <PlayersList />
      </Suspense>
    </div>
  );
}
