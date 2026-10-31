import { Suspense } from "react";
import ScorecardClient from "./ScorecardClient";

export default function ScorecardPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center animate-pulse text-[#8892b0]">Loading Scorecard...</div>}>
      <ScorecardClient />
    </Suspense>
  );
}
