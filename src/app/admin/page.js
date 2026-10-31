import { Suspense } from "react";
import AdminClient from "./AdminClient";

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="panel p-8 text-center animate-pulse text-[#8892b0]">Loading Admin Panel...</div>}>
      <AdminClient />
    </Suspense>
  );
}
