"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    // Protiti 10 second por por page ta auto refresh hobe
    // (Jodi tumi na chao, ei file ta delete kore dite paro)
    const interval = setInterval(() => {
      router.refresh();
    }, 10000); // 10000 ms = 10 seconds

    return () => clearInterval(interval);
  }, [router]);

  return null;
}
