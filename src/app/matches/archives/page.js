import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ArchivesData from "./ArchivesData";
import AutoRefresh from "@/components/layout/AutoRefresh";

async function ArchivesWrapper() {
  return (
    <div className="w-full">
      <AutoRefresh />
      <h1 className="text-3xl md:text-4xl font-bold mb-2">Match Archives</h1>
      <p className="text-slate-400 text-sm md:text-base mb-6">All completed matches of the season.</p>
      <ArchivesData />
    </div>
  );
}

export default function ArchivesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-6 text-sm md:text-base">
          <ArrowLeft size={18} /> Back to Home
        </Link>

        <Suspense fallback={<div className="animate-pulse bg-slate-800 h-40 rounded-xl w-full"></div>}>
          <ArchivesWrapper />
        </Suspense>
      </div>
    </div>
  );
}
