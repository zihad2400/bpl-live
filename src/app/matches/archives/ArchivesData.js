import { connectDB } from "@/lib/mongodb";
import Match from "@/models/Match";
import Link from "next/link";

export default async function ArchivesData() {
  "use cache";
  await connectDB();
  
  const matches = await Match.find({ status: "completed" })
    .sort({ createdAt: -1 })
    .populate("teamA", "name")
    .populate("teamB", "name")
    .lean();

  if (matches.length === 0) {
    return <p className="text-slate-500 text-center py-10">No archived matches yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
      {matches.map((m) => (
        <Link
          key={m._id}
          href={`/matches/${m._id}`}
          className="block p-4 md:p-5 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-emerald-500/50 transition shadow-lg"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="w-full">
              <h3 className="font-semibold text-base md:text-lg truncate">
                {m.teamA?.name || "Team A"} vs {m.teamB?.name || "Team B"}
              </h3>
              <p className="text-xs md:text-sm text-slate-400">
                {new Date(m.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <span className="text-emerald-400 text-xs md:text-sm font-medium shrink-0 mt-2 sm:mt-0">View Details →</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
