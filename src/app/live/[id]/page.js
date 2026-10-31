import { Suspense } from "react";
import LiveScoreboardClient from "./LiveScoreboardClient";

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
      <div className="h-64 bg-white/5 rounded-3xl animate-pulse" />
      <div className="grid md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function LiveMatchPage() {
  return (
    <Suspense fallback={<Skeleton />}>
      <LiveScoreboardClient />
    </Suspense>
  );
}
