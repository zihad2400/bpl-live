import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import StatsData from "./StatsData";
import AutoRefresh from "@/components/layout/AutoRefresh";

async function StatsWrapper({ params }) {
  const { type } = await params;

  let title = "";
  let desc = "";

  if (type === "orange-cap") {
    title = "Orange Cap";
    desc = "Highest run scorers of the tournament.";
  } else if (type === "purple-cap") {
    title = "Purple Cap";
    desc = "Highest wicket takers of the tournament.";
  } else if (type === "tournament") {
    title = "Tournament Stats";
    desc = "Full tournament statistics and overview.";
  }

  return (
    <div className="w-full">
      <AutoRefresh />
      <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
      <p className="text-slate-400 text-sm md:text-base mb-6">{desc}</p>
      <StatsData type={type} />
    </div>
  );
}

export default function StatsPage({ params }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-6 text-sm md:text-base">
          <ArrowLeft size={18} /> Back to Home
        </Link>

        <Suspense fallback={<div className="animate-pulse bg-slate-800 h-64 rounded-xl w-full"></div>}>
          <StatsWrapper params={params} />
        </Suspense>
      </div>
    </div>
  );
}
