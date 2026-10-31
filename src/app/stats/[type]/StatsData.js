import { connectDB } from "@/lib/mongodb";
import Player from "@/models/Player";
import Match from "@/models/Match";
import Team from "@/models/Team";

export default async function StatsData({ type }) {
  "use cache";
  await connectDB();

  // ==========================================
  // 1. ORANGE CAP
  // ==========================================
  if (type === "orange-cap") {
    const players = await Player.find().sort({ "stats.runs": -1 }).limit(20).populate("teamId", "name").lean();
    if (players.length === 0) return <p className="text-slate-500 text-center py-10">No data available yet.</p>;

    return (
      <div className="w-full">
        <div className="block md:hidden text-xs text-slate-500 text-right mb-1 pr-2 animate-pulse">Scroll right to see more →</div>
        <div className="w-full overflow-x-auto rounded-xl border border-slate-800 shadow-lg">
          <table className="w-full text-left min-w-[100%] md:min-w-[500px]">
            <thead className="bg-slate-900 text-slate-400 text-xs uppercase">
              <tr>
                <th className="p-3 w-10">#</th>
                <th className="p-3">Player</th>
                <th className="p-3 hidden sm:table-cell">Team</th>
                <th className="p-3 text-right">Runs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {players.map((p, i) => (
                <tr key={p._id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-3 text-slate-500 font-bold">{i + 1}</td>
                  <td className="p-3 font-semibold whitespace-nowrap">{p.name}</td>
                  <td className="p-3 text-slate-400 hidden sm:table-cell">{p.teamId?.name || "—"}</td>
                  <td className="p-3 text-right font-bold text-emerald-400 text-base">{p.stats?.runs || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. PURPLE CAP
  // ==========================================
  if (type === "purple-cap") {
    const players = await Player.find().sort({ "stats.wickets": -1 }).limit(20).populate("teamId", "name").lean();
    if (players.length === 0) return <p className="text-slate-500 text-center py-10">No data available yet.</p>;

    return (
      <div className="w-full">
        <div className="block md:hidden text-xs text-slate-500 text-right mb-1 pr-2 animate-pulse">Scroll right to see more →</div>
        <div className="w-full overflow-x-auto rounded-xl border border-slate-800 shadow-lg">
          <table className="w-full text-left min-w-[100%] md:min-w-[500px]">
            <thead className="bg-slate-900 text-slate-400 text-xs uppercase">
              <tr>
                <th className="p-3 w-10">#</th>
                <th className="p-3">Player</th>
                <th className="p-3 hidden sm:table-cell">Team</th>
                <th className="p-3 text-right">Wkts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {players.map((p, i) => (
                <tr key={p._id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-3 text-slate-500 font-bold">{i + 1}</td>
                  <td className="p-3 font-semibold whitespace-nowrap">{p.name}</td>
                  <td className="p-3 text-slate-400 hidden sm:table-cell">{p.teamId?.name || "—"}</td>
                  <td className="p-3 text-right font-bold text-purple-400 text-base">{p.stats?.wickets || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. TOURNAMENT STATS
  // ==========================================
  if (type === "tournament") {
    const topRunScorers = await Player.find().sort({ "stats.runs": -1 }).limit(5).populate("teamId", "name").lean();
    const topWicketTakers = await Player.find().sort({ "stats.wickets": -1 }).limit(5).populate("teamId", "name").lean();
    const totalTeams = await Team.countDocuments();
    const totalMatches = await Match.countDocuments();

    return (
      <div className="space-y-6 w-full">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
            <p className="text-slate-400 text-xs mb-1">Total Teams</p>
            <p className="text-2xl font-bold text-white">{totalTeams}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
            <p className="text-slate-400 text-xs mb-1">Total Matches</p>
            <p className="text-2xl font-bold text-white">{totalMatches}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center col-span-2 md:col-span-1">
            <p className="text-slate-400 text-xs mb-1">Status</p>
            <p className="text-xl font-bold text-emerald-400">Ongoing</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Top Run Scorers */}
          <div className="w-full">
            <h3 className="text-lg font-bold mb-3 text-orange-400">🧢 Top Run Scorers</h3>
            <div className="w-full overflow-x-auto rounded-xl border border-slate-800 shadow-lg">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-slate-400 text-xs">
                  <tr><th className="p-3">Player</th><th className="p-3 text-right">Runs</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {topRunScorers.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-900/50">
                      <td className="p-3 font-semibold max-w-[120px] sm:max-w-[200px] truncate">
                        {p.name} <span className="text-[10px] text-slate-500 font-normal">({p.teamId?.name || "—"})</span>
                      </td>
                      <td className="p-3 text-right font-bold text-orange-400">{p.stats?.runs || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Wicket Takers */}
          <div className="w-full">
            <h3 className="text-lg font-bold mb-3 text-purple-400">🧢 Top Wicket Takers</h3>
            <div className="w-full overflow-x-auto rounded-xl border border-slate-800 shadow-lg">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-slate-400 text-xs">
                  <tr><th className="p-3">Player</th><th className="p-3 text-right">Wkts</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {topWicketTakers.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-900/50">
                      <td className="p-3 font-semibold max-w-[120px] sm:max-w-[200px] truncate">
                        {p.name} <span className="text-[10px] text-slate-500 font-normal">({p.teamId?.name || "—"})</span>
                      </td>
                      <td className="p-3 text-right font-bold text-purple-400">{p.stats?.wickets || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <p className="text-slate-500 text-center py-10">Invalid Stats Type.</p>;
}
